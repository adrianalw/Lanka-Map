"use client";

import { useState } from "react";
import SiteHeader from "@/components/SiteHeader";

type FormState = "idle" | "sending" | "success" | "error";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      setState("success");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err: unknown) {
      setState("error");
      setErrorMsg(err instanceof Error ? err.message : "Unexpected error.");
    }
  }

  const subjects = [
    "General enquiry",
    "Report incorrect information",
    "Suggest a new location",
    "Photo submission",
    "Partnership / collaboration",
    "Other",
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <SiteHeader />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-10">
        {/* Hero */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Contact Us</h2>
          <p className="text-gray-600">
            Have a question, spotted an error, or want to suggest a new
            location? We'd love to hear from you.
          </p>
        </div>

        {/* Success state */}
        {state === "success" ? (
          <div className="bg-green-50 border border-green-200 rounded-xl px-6 py-8 text-center">
            <div className="text-4xl mb-3">✓</div>
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Message sent!
            </h3>
            <p className="text-green-700 text-sm mb-4">
              Thanks for reaching out. We'll get back to you as soon as
              possible.
            </p>
            <button
              onClick={() => setState("idle")}
              className="text-sm text-green-700 underline hover:text-green-900"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-gray-200 rounded-xl p-6 space-y-5"
          >
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Your name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Kasun Perera"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email address <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
              />
            </div>

            {/* Subject */}
            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Subject <span className="text-red-500">*</span>
              </label>
              <select
                id="subject"
                name="subject"
                required
                value={form.subject}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white"
              >
                <option value="">Select a subject…</option>
                {subjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Message */}
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                value={form.message}
                onChange={handleChange}
                placeholder="Tell us what's on your mind…"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent resize-none"
              />
            </div>

            {/* Error */}
            {state === "error" && (
              <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {errorMsg}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={state === "sending"}
              className="w-full bg-green-700 text-white font-semibold text-sm py-2.5 rounded-lg hover:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {state === "sending" ? "Sending…" : "Send Message"}
            </button>

            <p className="text-xs text-gray-400 text-center">
              We typically respond within 1–2 business days.
            </p>
          </form>
        )}

        {/* Direct contact */}
        <div className="mt-8 bg-gray-100 rounded-xl px-5 py-5">
          <h3 className="font-semibold text-gray-800 text-sm mb-1">
            Prefer email directly?
          </h3>
          <p className="text-gray-600 text-sm">
            You can also reach us at{" "}
            <a
              href="mailto:aalwishewa@gmail.com"
              className="text-green-700 font-medium underline hover:text-green-900"
            >
              aalwishewa@gmail.com
            </a>
          </p>
        </div>
      </main>

      <footer className="bg-gray-800 text-gray-400 text-xs text-center py-3">
        Map data © OpenStreetMap contributors · Built with ♥ for Sri Lanka
      </footer>
    </div>
  );
}
