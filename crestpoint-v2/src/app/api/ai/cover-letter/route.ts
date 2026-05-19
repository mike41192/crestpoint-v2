import OpenAI from "openai"
import { NextResponse } from "next/server"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const {
      company,
      role,
      jobDescription,
    } = await req.json()

    if (!role || !jobDescription) {
      return NextResponse.json(
        {
          error:
            "Role and job description are required.",
        },
        { status: 400 }
      )
    }

    const prompt = `
You are a professional executive resume and career writer.

Write a modern, ATS-friendly, professional cover letter.

Company:
${company || "Unknown Company"}

Role:
${role}

Job Description:
${jobDescription}

Requirements:
- Strong professional tone
- Personalized
- Modern formatting
- Concise but impactful
- No placeholders
- No fake information
- Around 300-500 words
`

    const response =
      await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a world-class professional career writer.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
      })

    const letter =
      response.choices[0]?.message?.content

    return NextResponse.json({
      letter,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        error:
          error.message ||
          "AI generation failed.",
      },
      { status: 500 }
    )
  }
}
