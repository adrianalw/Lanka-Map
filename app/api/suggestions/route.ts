import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { location_name, category, description, location_details, submitter_email } = body;

  if (!location_name?.trim()) {
    return NextResponse.json({ error: "Location name is required" }, { status: 400 });
  }

  const { error } = await supabase.from("suggestions").insert({
    location_name: location_name.trim(),
    category: category || null,
    description: description || null,
    location_details: location_details || null,
    submitter_email: submitter_email || null,
    status: "pending",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
