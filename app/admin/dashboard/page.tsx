"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLocationForm from "@/components/AdminLocationForm";
import { Location, LocationInput, Suggestion } from "@/lib/types";

type Tab = "locations" | "suggestions";
type LocView = "list" | "add" | "edit";

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("locations");

  // Locations state
  const [locations, setLocations] = useState<Location[]>([]);
  const [locView, setLocView] = useState<LocView>("list");
  const [editing, setEditing] = useState<Location | null>(null);
  const [locSearch, setLocSearch] = useState("");
  const [locLoading, setLocLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Suggestions state
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [sugLoading, setSugLoading] = useState(false);
  const [sugFilter, setSugFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");

  const router = useRouter();

  async function loadLocations() {
    setLocLoading(true);
    const res = await fetch("/api/locations");
    setLocations(await res.json());
    setLocLoading(false);
  }

  async function loadSuggestions() {
    setSugLoading(true);
    const res = await fetch("/api/admin/suggestions");
    if (res.ok) setSuggestions(await res.json());
    setSugLoading(false);
  }

  useEffect(() => {
    loadLocations();
  }, []);

  useEffect(() => {
    if (tab === "suggestions" && suggestions.length === 0) loadSuggestions();
  }, [tab]);

  async function uploadPhoto(file: File): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    if (!res.ok) throw new Error("Photo upload failed");
    const { url } = await res.json();
    return url;
  }

  async function handleAdd(data: LocationInput, photoFile?: File) {
    if (photoFile) data.photo_url = await uploadPhoto(photoFile);
    const res = await fetch("/api/admin/locations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error ?? "Failed to add location");
    }
    await loadLocations();
    setLocView("list");
  }

  async function handleEdit(data: LocationInput, photoFile?: File) {
    if (!editing) return;
    if (photoFile) data.photo_url = await uploadPhoto(photoFile);
    const res = await fetch("/api/admin/locations", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editing.id, ...data }),
    });
    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error ?? "Failed to update location");
    }
    await loadLocations();
    setLocView("list");
    setEditing(null);
  }

  async function handleDelete(id: string) {
    setDeleteId(id);
    await fetch("/api/admin/locations", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setDeleteId(null);
    await loadLocations();
  }

  async function handleSuggestionStatus(id: string, status: "approved" | "rejected") {
    await fetch("/api/admin/suggestions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setSuggestions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
  }

  async function handleSuggestionDelete(id: string) {
    await fetch("/api/admin/suggestions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setSuggestions((prev) => prev.filter((s) => s.id !== id));
  }

  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin");
  }

  // ─── Location form views ────────────────────────────────────────────────────

  if (locView === "add") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button
          onClick={() => setLocView("list")}
          className="text-green-700 text-sm mb-4 hover:underline"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Add Location</h1>
        <AdminLocationForm onSave={handleAdd} onCancel={() => setLocView("list")} />
      </div>
    );
  }

  if (locView === "edit" && editing) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button
          onClick={() => { setLocView("list"); setEditing(null); }}
          className="text-green-700 text-sm mb-4 hover:underline"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Location</h1>
        <AdminLocationForm
          initial={editing}
          onSave={handleEdit}
          onCancel={() => { setLocView("list"); setEditing(null); }}
        />
      </div>
    );
  }

  // ─── Main dashboard ─────────────────────────────────────────────────────────

  const filteredLocs = locations.filter((l) =>
    l.name.toLowerCase().includes(locSearch.toLowerCase())
  );

  const pendingCount = suggestions.filter((s) => s.status === "pending").length;

  const filteredSuggestions =
    sugFilter === "all" ? suggestions : suggestions.filter((s) => s.status === sugFilter);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin</h1>
        <button
          onClick={handleLogout}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        <button
          onClick={() => setTab("locations")}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            tab === "locations"
              ? "border-green-700 text-green-700"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Locations ({locations.length})
        </button>
        <button
          onClick={() => setTab("suggestions")}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            tab === "suggestions"
              ? "border-green-700 text-green-700"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Suggestions
          {pendingCount > 0 && (
            <span className="bg-amber-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Locations tab ── */}
      {tab === "locations" && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-500 text-sm">{locations.length} total</p>
            <button
              onClick={() => setLocView("add")}
              className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800 transition-colors"
            >
              + Add Location
            </button>
          </div>

          <input
            type="search"
            placeholder="Search locations…"
            value={locSearch}
            onChange={(e) => setLocSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-green-600"
          />

          {locLoading ? (
            <p className="text-gray-500 text-sm">Loading…</p>
          ) : filteredLocs.length === 0 ? (
            <p className="text-gray-500 text-sm">No locations found.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Lat / Lng</th>
                    <th className="px-4 py-3 font-medium">Entry Fee</th>
                    <th className="px-4 py-3 font-medium">Photo</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredLocs.map((loc) => (
                    <tr key={loc.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{loc.name}</td>
                      <td className="px-4 py-3 text-gray-600">{loc.category}</td>
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                        {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{loc.entry_fee}</td>
                      <td className="px-4 py-3">
                        {loc.photo_url ? (
                          <img
                            src={loc.photo_url}
                            alt=""
                            className="w-10 h-10 object-cover rounded"
                          />
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setEditing(loc); setLocView("edit"); }}
                            className="text-green-700 hover:underline text-xs font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete "${loc.name}"?`)) handleDelete(loc.id);
                            }}
                            disabled={deleteId === loc.id}
                            className="text-red-600 hover:underline text-xs font-medium disabled:opacity-50"
                          >
                            {deleteId === loc.id ? "Deleting…" : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── Suggestions tab ── */}
      {tab === "suggestions" && (
        <>
          {/* Filter pills */}
          <div className="flex gap-2 mb-4">
            {(["pending", "approved", "rejected", "all"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setSugFilter(f)}
                className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                  sugFilter === f
                    ? "bg-green-700 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {f}
                {f === "pending" && pendingCount > 0 ? ` (${pendingCount})` : ""}
              </button>
            ))}
            <button
              onClick={loadSuggestions}
              className="ml-auto text-xs text-gray-400 hover:text-gray-600"
            >
              Refresh
            </button>
          </div>

          {sugLoading ? (
            <p className="text-gray-500 text-sm">Loading…</p>
          ) : filteredSuggestions.length === 0 ? (
            <p className="text-gray-500 text-sm">No suggestions.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredSuggestions.map((s) => (
                <div
                  key={s.id}
                  className="border border-gray-200 rounded-xl p-4 bg-white"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {s.location_name}
                        </h3>
                        {s.category && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                            {s.category}
                          </span>
                        )}
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            s.status === "pending"
                              ? "bg-amber-100 text-amber-800"
                              : s.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {s.status}
                        </span>
                      </div>
                      {s.location_details && (
                        <p className="text-xs text-gray-500 mb-1">
                          📍 {s.location_details}
                        </p>
                      )}
                      {s.description && (
                        <p className="text-sm text-gray-600 mb-1">{s.description}</p>
                      )}
                      {s.submitter_email && (
                        <p className="text-xs text-gray-400">
                          From: {s.submitter_email}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(s.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex flex-col gap-1.5 flex-shrink-0">
                      {s.status !== "approved" && (
                        <button
                          onClick={() => handleSuggestionStatus(s.id, "approved")}
                          className="text-xs bg-green-700 text-white px-3 py-1 rounded-lg hover:bg-green-800 transition-colors"
                        >
                          Approve
                        </button>
                      )}
                      {s.status !== "rejected" && (
                        <button
                          onClick={() => handleSuggestionStatus(s.id, "rejected")}
                          className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Reject
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (confirm("Delete this suggestion?"))
                            handleSuggestionDelete(s.id);
                        }}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
