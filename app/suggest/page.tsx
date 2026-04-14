"use client";

import { useState } from "react";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import { CATEGORIES } from "@/lib/types";
import { SuggestionInput } from "@/lib/types";

export default function SuggestPage() {
  const [form, setForm] = useState<SuggestionInput>({
    location_name: "",
    category: "",
    description: "",
    location_details: "",
    submitter_email: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState("");

  function set<K extends keyof SuggestionInput>(key: K, value: SuggestionInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Submission failed");
      }
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col min-h-screen">
        <SiteHeader />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="text-5xl mb-4">🙌</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank you!</h2>
            <p className="text-gray-600 mb-6">
              Your suggestion has been submitted and will be reviewed by our team.
            </p>
            <Link
              href="/"
              className="inline-block bg-green-700 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-800 transition-colors"
            >
              Back to Map
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 max-w-xl mx-auto w-full px-4 py-8">
        <div className="mb-6">
          <Link href="/" className="text-green-700 text-sm hover:underline">
            ← Back to Map
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-3">Suggest a Location</h1>
          <p className="text-gray-500 text-sm mt-1">
            Know a great spot we&apos;re missing? Let us know and we&apos;ll review it.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <p className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-100">
              {error}
            </p>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location Name <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={form.location_name}
              onChange={(e) => set("location_name", e.target.value)}
              placeholder="e.g. Ravana Falls"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 bg-white"
            >
              <option value="">Select a category…</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Where is it?
            </label>
            <input
              value={form.location_details}
              onChange={(e) => set("location_details", e.target.value)}
              placeholder="e.g. Near Ella, Southern Province, or GPS coordinates"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Tell us a bit about this place — what makes it worth visiting?"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Email <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="email"
              value={form.submitter_email}
              onChange={(e) => set("submitter_email", e.target.value)}
              placeholder="we'll let you know if it's added"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full bg-green-700 text-white rounded-xl py-3 text-sm font-semibold hover:bg-green-800 disabled:opacity-50 transition-colors mt-2"
          >
            {status === "sending" ? "Submitting…" : "Submit Suggestion"}
          </button>
        </form>
      </main>
    </div>
  );
}
