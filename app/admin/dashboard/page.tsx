"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLocationForm from "@/components/AdminLocationForm";
import { Location, LocationInput } from "@/lib/types";

type View = "list" | "add" | "edit";

export default function AdminDashboard() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [view, setView] = useState<View>("list");
  const [editing, setEditing] = useState<Location | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const router = useRouter();

  async function load() {
    setLoading(true);
    const res = await fetch("/api/locations");
    const data = await res.json();
    setLocations(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function uploadPhoto(file: File): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    if (!res.ok) throw new Error("Photo upload failed");
    const { url } = await res.json();
    return url;
  }

  async function handleAdd(data: LocationInput, photoFile?: File) {
    if (photoFile) {
      data.photo_url = await uploadPhoto(photoFile);
    }
    const res = await fetch("/api/admin/locations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error ?? "Failed to add location");
    }
    await load();
    setView("list");
  }

  async function handleEdit(data: LocationInput, photoFile?: File) {
    if (!editing) return;
    if (photoFile) {
      data.photo_url = await uploadPhoto(photoFile);
    }
    const res = await fetch("/api/admin/locations", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editing.id, ...data }),
    });
    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error ?? "Failed to update location");
    }
    await load();
    setView("list");
    setEditing(null);
  }

  async function handleDelete(id: string) {
    setDeleteId(id);
    const res = await fetch("/api/admin/locations", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) alert("Failed to delete location");
    setDeleteId(null);
    await load();
  }

  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin");
  }

  const filtered = locations.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase())
  );

  if (view === "add") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button
          onClick={() => setView("list")}
          className="text-green-700 text-sm mb-4 hover:underline"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Add Location</h1>
        <AdminLocationForm onSave={handleAdd} onCancel={() => setView("list")} />
      </div>
    );
  }

  if (view === "edit" && editing) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button
          onClick={() => { setView("list"); setEditing(null); }}
          className="text-green-700 text-sm mb-4 hover:underline"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Location</h1>
        <AdminLocationForm
          initial={editing}
          onSave={handleEdit}
          onCancel={() => { setView("list"); setEditing(null); }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Locations</h1>
          <p className="text-gray-500 text-sm">{locations.length} total</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setView("add")}
            className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800 transition-colors"
          >
            + Add Location
          </button>
          <button
            onClick={handleLogout}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      <input
        type="search"
        placeholder="Search locations…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-green-600"
      />

      {loading ? (
        <p className="text-gray-500 text-sm">Loading…</p>
      ) : filtered.length === 0 ? (
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
              {filtered.map((loc) => (
                <tr key={loc.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {loc.name}
                  </td>
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
                        onClick={() => { setEditing(loc); setView("edit"); }}
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
    </div>
  );
}
