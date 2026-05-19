import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { userId, company, role, jobUrl, jobDescription } = body

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    const { error } = await supabase.from("jobs").insert({
      user_id: userId,
      company,
      role,
      job_url: jobUrl,
      imported_from_url: jobUrl,
      notes: jobDescription,
      status: "saved",
      priority: "medium",
      source: "chrome-extension",
      updated_at: new Date().toISOString(),
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Job import failed." },
      { status: 500 }
    )
  }
}