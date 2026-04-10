import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "How-To Guide — Lanka Map",
  description:
    "Learn how to use Lanka Map to explore tourist locations across Sri Lanka.",
};

const steps = [
  {
    number: "01",
    title: "Open the Map",
    description:
      "Navigate to the home page. The map loads centred on Sri Lanka with all 157 locations shown as coloured markers. The total location count is displayed in the top-right corner of the header.",
  },
  {
    number: "02",
    title: "Filter by Category",
    description:
      "Use the category filter bar below the header to narrow down locations. Tap any category pill — Beach, Temple, Wildlife, Hiking, Waterfall, Historical, Viewpoint, Museum, Garden, or Other — to show only that type. Tap again to clear the filter and see everything.",
  },
  {
    number: "03",
    title: "Navigate the Map",
    description:
      "Pinch to zoom on mobile or scroll on desktop. Clusters of nearby markers appear as numbered circles — tap or click a cluster to zoom in and separate individual markers. Use two fingers to pan on mobile.",
  },
  {
    number: "04",
    title: "View Location Details",
    description:
      "Tap or click any marker on the map to open the Location Detail panel on the right. The panel shows a photo (if available), the location's full description, entry fee, and opening hours.",
  },
  {
    number: "05",
    title: "Get Directions",
    description:
      'Inside the Location Detail panel, tap the "Get Directions" button to open Google Maps in a new tab with the exact coordinates pre-loaded. You can then navigate using your phone\'s GPS.',
  },
  {
    number: "06",
    title: "Close the Panel",
    description:
      "Tap the × button at the top of the detail panel, or click anywhere on the map backdrop to close it and return to browsing.",
  },
];

const tips = [
  {
    icon: "🕐",
    title: "Best time to visit",
    body: "Check the opening hours in the detail panel before heading out. National parks typically open at 6:00am and close by 6:00pm.",
  },
  {
    icon: "💰",
    title: "Entry fees",
    body: 'Fees listed are for foreign adult visitors in Sri Lankan Rupees (LKR). Many sacred temples are free but welcome donations. Locations marked "Free" have no mandatory charge.',
  },
  {
    icon: "🗺️",
    title: "Plan your route",
    body: "Use the category filter to build a mental itinerary. For example, filter Waterfalls to see which ones are near each other in the hill country, then switch to Hiking for nearby treks.",
  },
  {
    icon: "📡",
    title: "Offline use",
    body: "Mobile data can be patchy in rural areas. Before leaving a connection zone, open the locations you plan to visit and keep the browser tab open — the detail info will remain readable.",
  },
  {
    icon: "📸",
    title: "Photos",
    body: "Not all locations have photos yet. If you visit a spot and take a great photo, contact us — we'd love to add it.",
  },
];

const categories = [
  { name: "Beach", emoji: "🏖️", desc: "Coastline, surf spots, and snorkelling bays" },
  { name: "Temple", emoji: "🛕", desc: "Buddhist temples, Hindu kovils, and sacred sites" },
  { name: "Wildlife", emoji: "🐘", desc: "National parks, nature reserves, and sanctuaries" },
  { name: "Hiking", emoji: "🥾", desc: "Mountain trails, peak climbs, and forest walks" },
  { name: "Waterfall", emoji: "💧", desc: "Cascades, plunge pools, and scenic falls" },
  { name: "Historical", emoji: "🏛️", desc: "Ancient ruins, fortresses, and UNESCO sites" },
  { name: "Viewpoint", emoji: "🔭", desc: "Scenic overlooks, cliff edges, and panoramas" },
  { name: "Museum", emoji: "🏺", desc: "Cultural museums and heritage collections" },
  { name: "Garden", emoji: "🌿", desc: "Botanical gardens, parks, and green spaces" },
  { name: "Other", emoji: "📍", desc: "Landmarks, markets, and unique experiences" },
];

export default function HowToPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <SiteHeader />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10">
        {/* Hero */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            How to Use Lanka Map
          </h2>
          <p className="text-gray-600 text-lg">
            Lanka Map makes it easy to discover 157 tourist locations across Sri
            Lanka. Follow the steps below to get the most out of the app.
          </p>
        </div>

        {/* Steps */}
        <section className="mb-12">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">
            Step-by-Step Guide
          </h3>
          <div className="space-y-6">
            {steps.map((step) => (
              <div key={step.number} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-700 text-white flex items-center justify-center font-bold text-sm">
                  {step.number}
                </div>
                <div className="pt-1">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {step.title}
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Categories */}
        <section className="mb-12">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Location Categories
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categories.map((cat) => (
              <div
                key={cat.name}
                className="flex items-start gap-3 bg-white rounded-lg border border-gray-200 px-4 py-3"
              >
                <span className="text-2xl">{cat.emoji}</span>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{cat.name}</p>
                  <p className="text-gray-500 text-xs">{cat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tips */}
        <section className="mb-12">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Useful Tips
          </h3>
          <div className="space-y-4">
            {tips.map((tip) => (
              <div
                key={tip.title}
                className="bg-white border border-gray-200 rounded-lg px-4 py-4 flex gap-3"
              >
                <span className="text-xl flex-shrink-0">{tip.icon}</span>
                <div>
                  <p className="font-medium text-gray-900 text-sm mb-1">
                    {tip.title}
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {tip.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Frequently Asked Questions
          </h3>
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-4">
              <p className="font-medium text-gray-900 text-sm mb-1">
                Are all entry fees up to date?
              </p>
              <p className="text-gray-600 text-sm">
                We update fees as often as possible but they can change. Always
                carry some extra cash and verify at the entrance gate.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-4">
              <p className="font-medium text-gray-900 text-sm mb-1">
                Can I suggest a missing location?
              </p>
              <p className="text-gray-600 text-sm">
                Absolutely — head to the{" "}
                <a href="/contact" className="text-green-700 underline">
                  Contact page
                </a>{" "}
                and let us know the name, category, and coordinates.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-4">
              <p className="font-medium text-gray-900 text-sm mb-1">
                Does the map work without internet?
              </p>
              <p className="text-gray-600 text-sm">
                The map tiles require an internet connection to load. However,
                if you have already opened a location's detail panel, that
                information will stay visible even if your connection drops.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-4">
              <p className="font-medium text-gray-900 text-sm mb-1">
                How do I report incorrect information?
              </p>
              <p className="text-gray-600 text-sm">
                Use the{" "}
                <a href="/contact" className="text-green-700 underline">
                  Contact page
                </a>{" "}
                to report any inaccurate entry fees, hours, or descriptions and
                we will update the database.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="bg-green-700 text-white rounded-xl px-6 py-6 text-center">
          <p className="text-lg font-semibold mb-2">Ready to explore?</p>
          <p className="text-green-200 text-sm mb-4">
            Jump back to the map and start discovering Sri Lanka.
          </p>
          <a
            href="/"
            className="inline-block bg-white text-green-800 font-semibold text-sm px-6 py-2 rounded-lg hover:bg-green-50 transition-colors"
          >
            Open the Map
          </a>
        </div>
      </main>

      <footer className="bg-gray-800 text-gray-400 text-xs text-center py-3">
        Map data © OpenStreetMap contributors · Built with ♥ for Sri Lanka
      </footer>
    </div>
  );
}
