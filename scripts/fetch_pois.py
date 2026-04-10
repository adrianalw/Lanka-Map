#!/usr/bin/env python3
"""
Lanka Map POI Fetcher
======================
Pipeline: SLTDA → OpenStreetMap (Overpass API) → [Google Places enrichment] → pois.json

Usage:
  python scripts/fetch_pois.py
  python scripts/fetch_pois.py --google-key AIza...   # enrich with Google Places
  python scripts/fetch_pois.py --out scripts/pois.json

Requires:
  pip install requests

The output JSON is consumed by scripts/import_pois.ts to upsert into Supabase.
"""

import json
import time
import argparse
import sys
from typing import Optional

try:
    import requests
except ImportError:
    print("ERROR: 'requests' not installed. Run: pip install requests")
    sys.exit(1)

# ── Sri Lanka bounding box (south, west, north, east) ────────────────────────
SL_BBOX = (5.85, 79.50, 9.90, 81.90)

OVERPASS_URLS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
]
GOOGLE_PLACES_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
GOOGLE_DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json"

# ── OSM tag → our category ────────────────────────────────────────────────────
CATEGORY_MAP = {
    # tourism tags
    "museum":         "Museum",
    "viewpoint":      "Viewpoint",
    "zoo":            "Other",
    "aquarium":       "Other",
    "theme_park":     "Other",
    "gallery":        "Museum",
    "artwork":        "Other",
    # historic tags
    "castle":         "Historical",
    "fort":           "Historical",
    "ruins":          "Historical",
    "archaeological_site": "Historical",
    "monument":       "Historical",
    "memorial":       "Historical",
    "boundary_stone": "Historical",
    "building":       "Historical",
    "manor":          "Historical",
    # religion
    "place_of_worship": "Temple",
    # nature / leisure
    "nature_reserve": "Wildlife",
    "national_park":  "Wildlife",
    "wildlife_hide":  "Wildlife",
    "waterfall":      "Waterfall",
    "beach":          "Beach",
    "garden":         "Garden",
    "park":           "Garden",
    # sport / activity
    "surfing":        "Beach",
    "climbing":       "Hiking",
    "hiking":         "Hiking",
}

# ── Overpass QL queries (split into small focused queries to avoid timeouts) ──
QUERIES = {
    "tourism_attractions": """
[out:json][timeout:60];
(
  node["tourism"~"attraction|museum|viewpoint|zoo|aquarium|gallery"]["name"]({bb});
  way["tourism"~"attraction|museum|viewpoint|zoo"]["name"]({bb});
  relation["tourism"~"attraction|museum"]["name"]({bb});
);
out center tags;
""",
    "historic": """
[out:json][timeout:60];
(
  node["historic"]["name"]({bb});
  way["historic"]["name"]({bb});
  relation["historic"]["name"]({bb});
);
out center tags;
""",
    "worship_notable": """
[out:json][timeout:60];
(
  node["amenity"="place_of_worship"]["wikidata"]["name"]({bb});
  way["amenity"="place_of_worship"]["wikidata"]["name"]({bb});
  node["amenity"="place_of_worship"]["wikipedia"]["name"]({bb});
  way["amenity"="place_of_worship"]["wikipedia"]["name"]({bb});
  node["amenity"="place_of_worship"]["tourism"]["name"]({bb});
  way["amenity"="place_of_worship"]["tourism"]["name"]({bb});
);
out center tags;
""",
    "protected_areas": """
[out:json][timeout:60];
(
  way["leisure"="nature_reserve"]["name"]({bb});
  relation["leisure"="nature_reserve"]["name"]({bb});
  way["boundary"="national_park"]["name"]({bb});
  relation["boundary"="national_park"]["name"]({bb});
  way["boundary"="protected_area"]["protect_class"~"^(1|2|3|4)$"]["name"]({bb});
  relation["boundary"="protected_area"]["protect_class"~"^(1|2|3|4)$"]["name"]({bb});
);
out center tags;
""",
    "beaches": """
[out:json][timeout:60];
(
  node["natural"="beach"]["name"]({bb});
  way["natural"="beach"]["name"]({bb});
);
out center tags;
""",
    "waterfalls": """
[out:json][timeout:60];
(
  node["waterway"="waterfall"]["name"]({bb});
  node["natural"="waterfall"]["name"]({bb});
  way["waterway"="waterfall"]["name"]({bb});
);
out center tags;
""",
    "gardens_parks": """
[out:json][timeout:60];
(
  way["leisure"="garden"]["name"]({bb});
  relation["leisure"="garden"]["name"]({bb});
  node["leisure"="garden"]["wikidata"]["name"]({bb});
  way["leisure"="park"]["wikidata"]["name"]({bb});
  relation["leisure"="park"]["wikidata"]["name"]({bb});
);
out center tags;
""",
}


def run_query(query: str, bbox: tuple, label: str, retries: int = 3) -> list[dict]:
    s, w, n, e = bbox
    filled = query.replace("{bb}", f"{s},{w},{n},{e}").strip()

    for url in OVERPASS_URLS:
        for attempt in range(retries):
            try:
                resp = requests.post(url, data={"data": filled}, timeout=70)
                if resp.status_code == 429:
                    print(f"    Rate limited on {url}, waiting 30s…")
                    time.sleep(30)
                    continue
                resp.raise_for_status()
                elements = resp.json().get("elements", [])
                print(f"  ✓ [{label}] {len(elements)} elements from {url.split('/')[2]}")
                return elements
            except requests.exceptions.Timeout:
                print(f"    Timeout (attempt {attempt + 1}) on {url}")
                if attempt < retries - 1:
                    time.sleep(15)
            except Exception as e:
                print(f"    Error on {url}: {e}")
                break
        time.sleep(5)  # pause before trying next mirror

    print(f"  ✗ [{label}] all mirrors failed")
    return []


def fetch_overpass(bbox: tuple) -> list[dict]:
    all_elements: list[dict] = []
    for label, query in QUERIES.items():
        elements = run_query(query, bbox, label)
        all_elements.extend(elements)
        time.sleep(3)  # polite delay between queries
    print(f"\n  Total raw elements: {len(all_elements)}")
    return all_elements


# ── Coordinate extraction ─────────────────────────────────────────────────────
def get_coords(element: dict) -> Optional[tuple[float, float]]:
    """Return (lat, lng) for node or way/relation with center."""
    if element.get("type") == "node":
        return element.get("lat"), element.get("lon")
    center = element.get("center")
    if center:
        return center.get("lat"), center.get("lon")
    return None, None


# ── Category detection ────────────────────────────────────────────────────────
def detect_category(tags: dict) -> str:
    tourism = tags.get("tourism", "")
    historic = tags.get("historic", "")
    natural = tags.get("natural", "")
    waterway = tags.get("waterway", "")
    leisure = tags.get("leisure", "")
    amenity = tags.get("amenity", "")
    boundary = tags.get("boundary", "")
    protect_class = tags.get("protect_class", "")
    religion = tags.get("religion", "")

    if waterway == "waterfall" or natural == "waterfall":
        return "Waterfall"
    if natural == "beach":
        return "Beach"
    if boundary in ("national_park", "protected_area") or leisure == "nature_reserve":
        return "Wildlife"
    if amenity == "place_of_worship":
        return "Temple"
    if historic:
        return CATEGORY_MAP.get(historic, "Historical")
    if tourism:
        cat = CATEGORY_MAP.get(tourism, "")
        if cat:
            return cat
    if leisure in ("garden", "park"):
        return CATEGORY_MAP.get(leisure, "Garden")
    return "Other"


# ── Notability filter ─────────────────────────────────────────────────────────
def is_notable(tags: dict) -> bool:
    """Keep only places that are likely notable tourist attractions."""
    # Has a Wikipedia or Wikidata entry → definitely notable
    if tags.get("wikipedia") or tags.get("wikidata"):
        return True
    # Has a tourism=attraction or museum tag → keep
    if tags.get("tourism") in ("attraction", "museum", "viewpoint", "zoo"):
        return True
    # National parks / nature reserves → always notable
    if tags.get("boundary") in ("national_park", "protected_area"):
        return True
    if tags.get("leisure") == "nature_reserve":
        return True
    # Historic sites → keep if they have a name (already filtered upstream)
    if tags.get("historic"):
        return True
    # Waterfalls, beaches → keep if named
    if tags.get("natural") in ("waterfall", "beach"):
        return True
    if tags.get("waterway") == "waterfall":
        return True
    # Places of worship — only keep major ones (with wikipedia or wikidata or tourism tag)
    if tags.get("amenity") == "place_of_worship":
        return bool(tags.get("wikipedia") or tags.get("wikidata") or tags.get("tourism"))
    # Gardens / parks — only notable ones
    if tags.get("leisure") in ("garden", "park"):
        return bool(tags.get("wikipedia") or tags.get("wikidata"))
    return False


# ── Deduplicate by proximity ──────────────────────────────────────────────────
def deduplicate(pois: list[dict], radius_deg: float = 0.003) -> list[dict]:
    """Remove near-duplicate entries (same category within ~300m)."""
    seen = []
    deduped = []
    for poi in pois:
        lat, lng = poi["lat"], poi["lng"]
        cat = poi["category"]
        duplicate = False
        for s_lat, s_lng, s_cat in seen:
            if s_cat == cat and abs(lat - s_lat) < radius_deg and abs(lng - s_lng) < radius_deg:
                duplicate = True
                break
        if not duplicate:
            seen.append((lat, lng, cat))
            deduped.append(poi)
    return deduped


# ── Google Places enrichment ──────────────────────────────────────────────────
def enrich_with_google(poi: dict, api_key: str) -> dict:
    """Add description, hours, and entry fee using Google Places API."""
    try:
        # Find place
        search_resp = requests.get(GOOGLE_PLACES_URL, params={
            "location": f"{poi['lat']},{poi['lng']}",
            "radius": 200,
            "keyword": poi["name"],
            "key": api_key,
        }, timeout=10).json()

        results = search_resp.get("results", [])
        if not results:
            return poi

        place_id = results[0]["place_id"]

        # Get details
        details_resp = requests.get(GOOGLE_DETAILS_URL, params={
            "place_id": place_id,
            "fields": "name,editorial_summary,opening_hours,price_level,formatted_address",
            "key": api_key,
        }, timeout=10).json()

        result = details_resp.get("result", {})

        # Update fields if available
        summary = result.get("editorial_summary", {}).get("overview", "")
        if summary and not poi.get("description"):
            poi["description"] = summary

        hours_periods = result.get("opening_hours", {}).get("weekday_text", [])
        if hours_periods and poi.get("hours") == "Open daily":
            poi["hours"] = "; ".join(hours_periods[:2])  # First 2 days as sample

        time.sleep(0.1)  # Rate limiting

    except Exception as e:
        pass  # Silently skip enrichment failures

    return poi


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="Fetch Sri Lanka tourist POIs")
    parser.add_argument("--google-key", help="Google Places API key for enrichment")
    parser.add_argument("--out", default="scripts/pois.json", help="Output JSON file path")
    parser.add_argument("--min-name-len", type=int, default=3, help="Minimum name length")
    args = parser.parse_args()

    print("━━━ Lanka Map POI Fetcher ━━━")
    print(f"  Source:  OpenStreetMap (Overpass API)")
    print(f"  Region:  Sri Lanka ({SL_BBOX})")
    print(f"  Enrich:  {'Google Places ✓' if args.google_key else 'No (pass --google-key to enable)'}")
    print(f"  Output:  {args.out}")
    print()

    # 1. Fetch from Overpass
    print("Step 1: Fetching POIs from OpenStreetMap…")
    elements = fetch_overpass(SL_BBOX)

    if not elements:
        print("No elements returned. Check your internet connection or try again.")
        sys.exit(1)

    # 2. Parse and filter
    print("\nStep 2: Parsing and filtering…")
    pois = []
    skipped_no_coords = 0
    skipped_not_notable = 0
    skipped_no_name = 0

    for el in elements:
        tags = el.get("tags", {})
        name = tags.get("name") or tags.get("name:en") or ""

        if not name or len(name) < args.min_name_len:
            skipped_no_name += 1
            continue

        if not is_notable(tags):
            skipped_not_notable += 1
            continue

        lat, lng = get_coords(el)
        if lat is None or lng is None:
            skipped_no_coords += 1
            continue

        category = detect_category(tags)

        # Build description from available tags
        description_parts = []
        if tags.get("description"):
            description_parts.append(tags["description"])
        elif tags.get("description:en"):
            description_parts.append(tags["description:en"])

        poi = {
            "name": name,
            "category": category,
            "lat": round(lat, 6),
            "lng": round(lng, 6),
            "description": description_parts[0] if description_parts else "",
            "entry_fee": "Free",
            "hours": "Open daily",
            "osm_id": f"{el['type']}/{el['id']}",
            "wikipedia": tags.get("wikipedia", ""),
            "wikidata": tags.get("wikidata", ""),
        }

        pois.append(poi)

    print(f"  Parsed:           {len(pois)} notable POIs")
    print(f"  Skipped (no name):     {skipped_no_name}")
    print(f"  Skipped (not notable): {skipped_not_notable}")
    print(f"  Skipped (no coords):   {skipped_no_coords}")

    # 3. Deduplicate
    print("\nStep 3: Deduplicating…")
    before = len(pois)
    pois = deduplicate(pois)
    print(f"  Removed {before - len(pois)} near-duplicates → {len(pois)} unique POIs")

    # 4. Sort by category then name
    pois.sort(key=lambda p: (p["category"], p["name"]))

    # 5. Optional Google Places enrichment
    if args.google_key:
        print(f"\nStep 4: Enriching {len(pois)} POIs with Google Places…")
        for i, poi in enumerate(pois):
            if i % 50 == 0:
                print(f"  {i}/{len(pois)}…")
            pois[i] = enrich_with_google(poi, args.google_key)
        print(f"  ✓ Enrichment complete")
    else:
        print("\nStep 4: Skipping Google Places enrichment (no API key provided)")

    # 6. Write output
    print(f"\nStep 5: Writing {len(pois)} POIs to {args.out}…")
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(pois, f, ensure_ascii=False, indent=2)
    print(f"  ✓ Saved to {args.out}")

    # 7. Summary
    print("\n━━━ Summary by Category ━━━")
    from collections import Counter
    counts = Counter(p["category"] for p in pois)
    for cat, count in sorted(counts.items()):
        print(f"  {cat:<15} {count}")
    print(f"  {'TOTAL':<15} {len(pois)}")
    print("\nNext step: run  npm run seed:pois  to import into Supabase")


if __name__ == "__main__":
    main()
