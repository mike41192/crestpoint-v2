import OpenAI from "openai"
import { NextResponse } from "next/server"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { experience } = await req.json()

    if (!experience) {
      return NextResponse.json(
        {
          error: "Experience content is required.",
        },
        { status: 400 }
      )
    }

    const response =
      await openai.chat.completions.create({
        model: "gpt-4.1-mini",

        messages: [
          {
            role: "system",
            content:
              "You are an elite executive resume writer specializing in quantified, ATS-friendly bullet points.",
          },

          {
            role: "user",
            content: `
Rewrite and improve these resume experience bullets.

Rules:
- Improve wording and professionalism.
- Add measurable business impact ONLY if implied by the existing content.
- NEVER invent fake numbers, employers, certifications, technologies, or achievements.
- If metrics are not known, use qualitative impact wording instead.
- Use strong action verbs.
- Keep everything truthful.
- Return only the rewritten bullet section.

Experience:
${experience}
            `,
          },
        ],

        temperature: 0.6,
      })

    return NextResponse.json({
      improvedExperience:
        response.choices[0]?.message?.content || "",
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        error:
          error.message ||
          "Quantification AI failed.",
      },
      { status: 500 }
    )
  }
}