import OpenAI from "openai"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: "career-coach",
  })
}

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY in .env.local" },
        { status: 500 }
      )
    }

    const body = await req.json()
    const {
      userMessage,
      resume,
      jobs,
      interviews,
      atsAnalyses,
      recentMessages,
    } = body

    if (!userMessage) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 }
      )
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You are Crestpoint Career Coach, a practical AI career advisor. Use the user's resume, jobs, interviews, ATS data, and prior messages when available. Do not invent credentials, experience, jobs, certifications, or facts.",
        },
        {
          role: "user",
          content: `
Career context:

Resume:
${JSON.stringify(resume || {}, null, 2)}

Jobs:
${JSON.stringify(jobs || [], null, 2)}

Interviews:
${JSON.stringify(interviews || [], null, 2)}

ATS analyses:
${JSON.stringify(atsAnalyses || [], null, 2)}

Recent messages:
${JSON.stringify(recentMessages || [], null, 2)}

User question:
${userMessage}
          `,
        },
      ],
      temperature: 0.55,
    })

    return NextResponse.json({
      reply: response.choices[0]?.message?.content || "No response generated.",
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error?.message || "Career coach failed.",
      },
      { status: 500 }
    )
  }
}