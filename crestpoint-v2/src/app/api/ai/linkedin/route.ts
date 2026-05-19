import OpenAI from "openai"
import { NextResponse } from "next/server"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { headline, about, experience, skills } = await req.json()

    if (!headline && !about && !experience && !skills) {
      return NextResponse.json(
        { error: "Enter LinkedIn profile content first." },
        { status: 400 }
      )
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a professional LinkedIn profile strategist. Improve clarity, keywords, positioning, and recruiter appeal without inventing facts.",
        },
        {
          role: "user",
          content: `
Optimize this LinkedIn profile.

Rules:
- Do not invent jobs, degrees, certifications, employers, or metrics.
- Improve recruiter visibility.
- Improve keyword density naturally.
- Return organized sections:
1. Optimized Headline
2. Optimized About
3. Experience Positioning
4. Skills Recommendations

Headline:
${headline}

About:
${about}

Experience:
${experience}

Skills:
${skills}
          `,
        },
      ],
      temperature: 0.6,
    })

    return NextResponse.json({
      output: response.choices[0]?.message?.content || "",
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "LinkedIn optimization failed." },
      { status: 500 }
    )
  }
}
