import OpenAI from "openai"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY in .env.local" },
        { status: 500 }
      )
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const { summary, experience, skills, targetRole } = await req.json()

    if (!targetRole) {
      return NextResponse.json(
        { error: "Target role is required." },
        { status: 400 }
      )
    }

    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: `
Rewrite these resume sections for the target role.

Return ONLY valid JSON with this exact shape:
{
  "summary": "...",
  "experience": "...",
  "skills": "..."
}

Rules:
- Do not duplicate sections.
- Do not copy the experience into the summary.
- Do not invent jobs, companies, dates, degrees, certifications, or metrics.
- Keep the user's experience truthful.
- Improve clarity, action verbs, ATS alignment, and professionalism.

Target role:
${targetRole}

Current summary:
${summary}

Current experience:
${experience}

Current skills:
${skills}
      `,
    })

    const raw = response.output_text.trim()
    const cleaned = raw.replace(/```json|```/g, "").trim()
    const parsed = JSON.parse(cleaned)

    return NextResponse.json(parsed)
  } catch (error: any) {
    console.error("AI rewrite error:", error)

    return NextResponse.json(
      {
        error: error?.message || "AI rewrite failed.",
      },
      { status: 500 }
    )
  }
}