import OpenAI from "openai"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { userId, jobId } = await req.json()

    if (!userId || !jobId) {
      return NextResponse.json(
        { error: "Missing userId or jobId." },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: resume } = await supabase
      .from("resumes")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    const { data: job } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .eq("user_id", userId)
      .maybeSingle()

    if (!resume) {
      return NextResponse.json({ error: "No resume found." }, { status: 404 })
    }

    if (!job) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 })
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a professional career writer. Create truthful, job-specific application materials without inventing experience.",
        },
        {
          role: "user",
          content: `
Create a tailored cover letter and package notes.

Return ONLY valid JSON:
{
  "coverLetter": "...",
  "packageNotes": "..."
}

Rules:
- Do not invent facts, credentials, employers, metrics, or certifications.
- Use the user's actual resume content.
- Make the cover letter specific to this company and role.
- Keep it professional, concise, and recruiter-friendly.

Company:
${job.company || ""}

Role:
${job.role || ""}

Job description:
${job.notes || ""}

Resume:
Name: ${resume.full_name || ""}
Target role: ${resume.target_role || ""}
Summary: ${resume.summary || ""}
Experience: ${resume.experience || ""}
Skills: ${resume.skills || ""}
          `,
        },
      ],
      temperature: 0.55,
    })

    const raw = response.choices[0]?.message?.content || "{}"
    const cleaned = raw.replace(/```json|```/g, "").trim()
    const parsed = JSON.parse(cleaned)

    const { data: coverLetter, error: coverError } = await supabase
      .from("cover_letters")
      .insert({
        user_id: userId,
        job_id: jobId,
        company: job.company || "",
        role: job.role || "",
        job_description: job.notes || "",
        letter: parsed.coverLetter || "",
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (coverError) {
      return NextResponse.json({ error: coverError.message }, { status: 500 })
    }

    const { data: appPackage, error: packageError } = await supabase
      .from("application_packages")
      .insert({
        user_id: userId,
        job_id: jobId,
        resume_id: resume.id,
        cover_letter_id: coverLetter.id,
        package_notes: parsed.packageNotes || "",
      })
      .select()
      .single()

    if (packageError) {
      return NextResponse.json({ error: packageError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      coverLetter,
      package: appPackage,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Application package failed." },
      { status: 500 }
    )
  }
}
