import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/auth";

function unauth() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function POST(req: NextRequest) {
  if (!isAuthenticated(req)) return unauth();

  const body = await req.json();
  const { name, category, lat, lng, description, entry_fee, hours, photo_url } = body;

  const { data, error } = await supabaseAdmin()
    .from("locations")
    .insert({ name, category, lat, lng, description, entry_fee, hours, photo_url })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function PUT(req: NextRequest) {
  if (!isAuthenticated(req)) return unauth();

  const body = await req.json();
  const { id, name, category, lat, lng, description, entry_fee, hours, photo_url } = body;

  const { data, error } = await supabaseAdmin()
    .from("locations")
    .update({ name, category, lat, lng, description, entry_fee, hours, photo_url })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  if (!isAuthenticated(req)) return unauth();

  const { id } = await req.json();

  const { error } = await supabaseAdmin()
    .from("locations")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
