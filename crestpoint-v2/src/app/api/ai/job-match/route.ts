import OpenAI from "openai"
import { NextResponse } from "next/server"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const {
      resumeSummary,
      resumeExperience,
      resumeSkills,
      company,
      role,
      jobDescription,
    } = await req.json()

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",

      messages: [
        {
          role: "system",
          content:
            "You are an expert recruiter and ATS evaluator.",
        },

        {
          role: "user",
          content: `
Analyze this resume against the job.

Return ONLY valid JSON:
{
  "matchScore": 0-100,
  "feedback": "...",
  "missingSkills": "...",
  "recommendedImprovements": "..."
}

Rules:
- Be honest.
- Do not inflate scores.
- Do not invent experience.
- Give recruiter-style evaluation.

Company:
${company}

Role:
${role}

Job Description:
${jobDescription}

Resume Summary:
${resumeSummary}

Resume Experience:
${resumeExperience}

Resume Skills:
${resumeSkills}
          `,
        },
      ],

      temperature: 0.4,
    })

    const raw =
      response.choices[0]?.message?.content || "{}"

    const cleaned = raw
      .replace(/```json|```/g, "")
      .trim()

    const parsed = JSON.parse(cleaned)

    return NextResponse.json(parsed)
  } catch (error: any) {
    return NextResponse.json(
      {
        error:
          error.message ||
          "Job match analysis failed.",
      },
      { status: 500 }
    )
  }
}