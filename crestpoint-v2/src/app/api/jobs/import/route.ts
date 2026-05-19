import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(req: Request) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json(
        { error: "Missing NEXT_PUBLIC_SUPABASE_URL" },
        { status: 500, headers: corsHeaders }
      )
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: "Missing SUPABASE_SERVICE_ROLE_KEY" },
        { status: 500, headers: corsHeaders }
      )
    }

    const body = await req.json()

    const {
      userId,
      company,
      role,
      location,
      jobUrl,
      jobDescription,
      source,
    } = body

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400, headers: corsHeaders }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { error } = await supabase.from("jobs").insert({
      user_id: userId,
      company: company || "",
      role: role || "Imported Job",
      location: location || "",
      job_url: jobUrl || "",
      imported_from_url: jobUrl || "",
      notes: jobDescription || "",
      status: "saved",
      priority: "medium",
      source: source || "extension",
      updated_at: new Date().toISOString(),
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500, headers: corsHeaders }
      )
    }

    return NextResponse.json(
      { success: true },
      { headers: corsHeaders }
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Job import failed." },
      { status: 500, headers: corsHeaders }
    )
  }
}