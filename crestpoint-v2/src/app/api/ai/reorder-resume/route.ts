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
      industryMode,
    } = await req.json()

    if (!targetRole) {
      return NextResponse.json(
        { error: "Target role is required." },
        { status: 400 }
      )
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert resume strategist. Reorder and refine resume sections honestly without inventing facts.",
        },
        {
          role: "user",
          content: `
Return ONLY valid JSON:
{
  "summary": "...",
  "experience": "...",
  "skills": "...",
  "recommendedOrder": ["summary", "skills", "experience"],
  "reasoning": "short explanation"
}

Rules:
- Do not invent experience, tools, metrics, employers, dates, or certifications.
- Improve order and emphasis for the target role.
- Use the industry mode to prioritize what recruiters expect.
- Keep content truthful.

Industry mode:
${industryMode}

Target role:
${targetRole}

Job description:
${jobDescription}

Summary:
${summary}

Experience:
${experience}

Skills:
${skills}
          `,
        },
      ],
      temperature: 0.4,
    })

    const raw = response.choices[0]?.message?.content || "{}"
    const cleaned = raw.replace(/```json|```/g, "").trim()
    const parsed = JSON.parse(cleaned)

    return NextResponse.json(parsed)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Resume reorder failed." },
      { status: 500 }
    )
  }
}