import OpenAI from "openai"
import { NextResponse } from "next/server"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const {
      targetRole,
      interviewType,
      difficulty,
      answer,
      currentQuestion,
    } = await req.json()

    if (!targetRole) {
      return NextResponse.json(
        { error: "Target role is required." },
        { status: 400 }
      )
    }

    if (!answer) {
      const response = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a realistic hiring manager. Generate one interview question.",
          },
          {
            role: "user",
            content: `
Generate one ${difficulty || "standard"} ${interviewType} interview question for a ${targetRole} role.

Return only the question.
            `,
          },
        ],
        temperature: 0.7,
      })

      return NextResponse.json({
        question: response.choices[0]?.message?.content || "",
      })
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a recruiter, interview coach, and STAR-method expert. Score honestly and give practical coaching.",
        },
        {
          role: "user",
          content: `
Evaluate this interview answer.

Return ONLY valid JSON:
{
  "score": 0-100,
  "readinessScore": 0-100,
  "feedback": "...",
  "improvedAnswer": "...",
  "followUpQuestion": "...",
  "improvementPlan": "..."
}

Target role:
${targetRole}

Interview type:
${interviewType}

Difficulty:
${difficulty}

Question:
${currentQuestion}

Candidate answer:
${answer}

Rules:
- Be honest.
- Do not inflate scores.
- Use STAR coaching where relevant.
- Improved answer must stay truthful.
- Give a practical improvement plan.
          `,
        },
      ],
      temperature: 0.45,
    })

    const raw = response.choices[0]?.message?.content || "{}"
    const cleaned = raw.replace(/```json|```/g, "").trim()
    const parsed = JSON.parse(cleaned)

    return NextResponse.json(parsed)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Interview AI failed." },
      { status: 500 }
    )
  }
}