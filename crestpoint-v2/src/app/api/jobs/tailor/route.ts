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

    const { data: resume, error: resumeError } = await supabase
      .from("resumes")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (resumeError) {
      return NextResponse.json({ error: resumeError.message }, { status: 500 })
    }

    if (!resume) {
      return NextResponse.json(
        { error: "No resume found to tailor." },
        { status: 404 }
      )
    }

    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .eq("user_id", userId)
      .maybeSingle()

    if (jobError) {
      return NextResponse.json({ error: jobError.message }, { status: 500 })
    }

    if (!job) {
      return NextResponse.json(
        { error: "Job not found." },
        { status: 404 }
      )
    }

    const jobDescription = job.notes || ""

    if (!jobDescription) {
      return NextResponse.json(
        { error: "This job has no description/notes to tailor from." },
        { status: 400 }
      )
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert resume strategist. Tailor resumes honestly without inventing experience, credentials, companies, metrics, or tools.",
        },
        {
          role: "user",
          content: `
Tailor this resume to the selected job.

Return ONLY valid JSON:
{
  "summary": "...",
  "experience": "...",
  "skills": "..."
}

Rules:
- Do not invent facts.
- Preserve the user's real background.
- Improve keyword alignment naturally.
- Improve recruiter clarity.
- Do not duplicate experience.
- Keep it ATS-friendly.

Job company:
${job.company || ""}

Job role:
${job.role || ""}

Job description:
${jobDescription}

Current resume summary:
${resume.summary || ""}

Current resume experience:
${resume.experience || ""}

Current resume skills:
${resume.skills || ""}
          `,
        },
      ],
      temperature: 0.45,
    })

    const raw = response.choices[0]?.message?.content || "{}"
    const cleaned = raw.replace(/```json|```/g, "").trim()
    const parsed = JSON.parse(cleaned)

    const { data: updatedResume, error: updateError } = await supabase
      .from("resumes")
      .update({
        summary: parsed.summary || resume.summary,
        experience: parsed.experience || resume.experience,
        skills: parsed.skills || resume.skills,
        target_role: job.role || resume.target_role,
        updated_at: new Date().toISOString(),
      })
      .eq("id", resume.id)
      .eq("user_id", userId)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    await supabase.from("resume_versions").insert({
      user_id: userId,
      resume_id: resume.id,
      full_name: resume.full_name,
      target_role: job.role || resume.target_role,
      summary: parsed.summary || resume.summary,
      experience: parsed.experience || resume.experience,
      skills: parsed.skills || resume.skills,
    })

    await supabase
      .from("jobs")
      .update({
        recommended_improvements:
          "Tailored resume version generated from this job posting.",
        updated_at: new Date().toISOString(),
      })
      .eq("id", jobId)
      .eq("user_id", userId)

    return NextResponse.json({
      success: true,
      resume: updatedResume,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Job tailoring failed." },
      { status: 500 }
    )
  }
}