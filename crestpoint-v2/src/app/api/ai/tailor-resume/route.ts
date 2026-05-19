import OpenAI from "openai"
import { NextResponse } from "next/server"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const {
      summary,
      experience,
      skills,
      targetRole,
      jobDescription,
    } = await req.json()

    if (!jobDescription || !targetRole) {
      return NextResponse.json(
        { error: "Target role and job description are required." },
        { status: 400 }
      )
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert resume strategist. Tailor resumes honestly without inventing experience.",
        },
        {
          role: "user",
          content: `
Tailor this resume for the job description.

Return ONLY valid JSON:
{
  "summary": "...",
  "experience": "...",
  "skills": "..."
}

Rules:
- Do not invent companies, dates, degrees, certifications, metrics, tools, or responsibilities.
- Reorder and rephrase truthfully.
- Improve keyword alignment naturally.
- Preserve real user experience.
- Strengthen wording for the target role.
- Do not duplicate sections.

Target role:
${targetRole}

Job description:
${jobDescription}

Current summary:
${summary}

Current experience:
${experience}

Current skills:
${skills}
          `,
        },
      ],
      temperature: 0.5,
    })

    const raw = response.choices[0]?.message?.content || "{}"
    const cleaned = raw.replace(/```json|```/g, "").trim()
    const parsed = JSON.parse(cleaned)

    return NextResponse.json(parsed)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Resume tailoring failed." },
      { status: 500 }
    )
  }
}