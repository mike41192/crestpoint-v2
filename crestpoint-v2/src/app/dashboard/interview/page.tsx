"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"

type InterviewSession = {
  id: string
  target_role: string | null
  interview_type: string | null
  difficulty: string | null
  question: string | null
  answer: string | null
  feedback: string | null
  improved_answer: string | null
  follow_up_question: string | null
  improvement_plan: string | null
  score: number | null
  readiness_score: number | null
  created_at: string
}

export default function InterviewPage() {
  const [targetRole, setTargetRole] = useState("")
  const [interviewType, setInterviewType] = useState("behavioral")
  const [difficulty, setDifficulty] = useState("standard")

  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [feedback, setFeedback] = useState("")
  const [improvedAnswer, setImprovedAnswer] = useState("")
  const [followUpQuestion, setFollowUpQuestion] = useState("")
  const [improvementPlan, setImprovementPlan] = useState("")

  const [score, setScore] = useState<number | null>(null)
  const [readinessScore, setReadinessScore] = useState<number | null>(null)

  const [history, setHistory] = useState<InterviewSession[]>([])
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadHistory()
  }, [])

  async function loadHistory() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data, error } = await supabase
      .from("interview_sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(8)

    if (error) {
      setMessage(error.message)
      return
    }

    setHistory(data || [])
  }

  async function generateQuestion() {
    setLoading(true)
    setMessage("Generating interview question...")
    setFeedback("")
    setImprovedAnswer("")
    setFollowUpQuestion("")
    setImprovementPlan("")
    setScore(null)
    setReadinessScore(null)

    try {
      const res = await fetch("/api/ai/interview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetRole,
          interviewType,
          difficulty,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage(data.error || "Question generation failed.")
        return
      }

      setQuestion(data.question || "")
      setAnswer("")
      setMessage("Question generated.")
    } catch (error) {
      console.error(error)
      setMessage("Question generation failed.")
    } finally {
      setLoading(false)
    }
  }

  async function evaluateAnswer() {
    if (!question || !answer) {
      setMessage("Generate a question and enter an answer first.")
      return
    }

    setLoading(true)
    setMessage("Evaluating answer...")

    try {
      const res = await fetch("/api/ai/interview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetRole,
          interviewType,
          difficulty,
          currentQuestion: question,
          answer,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage(data.error || "Answer evaluation failed.")
        return
      }

      setScore(data.score ?? null)
      setReadinessScore(data.readinessScore ?? null)
      setFeedback(data.feedback || "")
      setImprovedAnswer(data.improvedAnswer || "")
      setFollowUpQuestion(data.followUpQuestion || "")
      setImprovementPlan(data.improvementPlan || "")
      setMessage("Answer evaluated.")

      await saveSession(data)
    } catch (error) {
      console.error(error)
      setMessage("Answer evaluation failed.")
    } finally {
      setLoading(false)
    }
  }

  async function useFollowUpQuestion() {
    if (!followUpQuestion) return

    setQuestion(followUpQuestion)
    setAnswer("")
    setFeedback("")
    setImprovedAnswer("")
    setFollowUpQuestion("")
    setImprovementPlan("")
    setScore(null)
    setReadinessScore(null)
    setMessage("Follow-up question loaded.")
  }

  async function saveSession(data: any) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    await supabase.from("interview_sessions").insert({
      user_id: user.id,
      target_role: targetRole,
      interview_type: interviewType,
      difficulty,
      question,
      answer,
      feedback: data.feedback || "",
      improved_answer: data.improvedAnswer || "",
      follow_up_question: data.followUpQuestion || "",
      improvement_plan: data.improvementPlan || "",
      score: data.score ?? null,
      readiness_score: data.readinessScore ?? null,
    })

    await loadHistory()
  }

  function loadSession(item: InterviewSession) {
    setTargetRole(item.target_role || "")
    setInterviewType(item.interview_type || "behavioral")
    setDifficulty(item.difficulty || "standard")
    setQuestion(item.question || "")
    setAnswer(item.answer || "")
    setFeedback(item.feedback || "")
    setImprovedAnswer(item.improved_answer || "")
    setFollowUpQuestion(item.follow_up_question || "")
    setImprovementPlan(item.improvement_plan || "")
    setScore(item.score)
    setReadinessScore(item.readiness_score)
    setMessage("Saved interview loaded.")
  }

  return (
    <>
      <h1 className="text-4xl font-bold">Interview Simulator</h1>

      <p className="mt-2 text-slate-400">
        Practice role-specific interviews with STAR coaching, follow-up
        questions, readiness scoring, and saved session restore.
      </p>

      <div className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <h2 className="mb-6 text-2xl font-bold">Practice Setup</h2>

          <div className="space-y-4">
            <input
              className="w-full rounded-xl border border-white/10 bg-black/30 p-3 outline-none"
              placeholder="Target role"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
            />

            <select
              className="w-full rounded-xl border border-white/10 bg-black/30 p-3 outline-none"
              value={interviewType}
              onChange={(e) => setInterviewType(e.target.value)}
            >
              <option value="behavioral">Behavioral</option>
              <option value="technical">Technical</option>
              <option value="leadership">Leadership</option>
              <option value="case">Case Interview</option>
            </select>

            <select
              className="w-full rounded-xl border border-white/10 bg-black/30 p-3 outline-none"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="beginner">Beginner</option>
              <option value="standard">Standard</option>
              <option value="executive">Executive</option>
            </select>

            <Button
              className="w-full"
              onClick={generateQuestion}
              disabled={loading}
            >
              {loading ? "Working..." : "Generate Question"}
            </Button>

            {question && (
              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-sm text-slate-400">Question</p>
                <p className="mt-2 leading-7 font-medium">{question}</p>
              </div>
            )}

            <textarea
              className="min-h-52 w-full resize-y rounded-xl border border-white/10 bg-black/30 p-4 leading-7 outline-none"
              placeholder="Type your interview answer here..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />

            <Button
              className="w-full"
              onClick={evaluateAnswer}
              disabled={loading}
            >
              {loading ? "Working..." : "Evaluate Answer"}
            </Button>

            {message && (
              <p className="rounded-xl bg-white/5 p-3 text-sm text-slate-400">
                {message}
              </p>
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <h2 className="mb-6 text-2xl font-bold">AI Feedback</h2>

            {score === null && !feedback ? (
              <p className="text-slate-400">
                Your score, readiness level, follow-up question, and coaching
                plan will appear after evaluation.
              </p>
            ) : (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-white/5 p-4">
                    <p className="text-sm text-slate-400">Answer Score</p>
                    <h3 className="text-5xl font-bold">{score}/100</h3>
                  </div>

                  <div className="rounded-xl bg-white/5 p-4">
                    <p className="text-sm text-slate-400">Readiness Score</p>
                    <h3 className="text-5xl font-bold">
                      {readinessScore}/100
                    </h3>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold">Recruiter Feedback</h3>
                  <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-400">
                    {feedback}
                  </p>
                </div>

                <div>
                  <h3 className="font-bold">Improved STAR Answer</h3>
                  <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-400">
                    {improvedAnswer}
                  </p>
                </div>

                <div>
                  <h3 className="font-bold">Improvement Plan</h3>
                  <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-400">
                    {improvementPlan}
                  </p>
                </div>

                {followUpQuestion && (
                  <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4">
                    <h3 className="font-bold text-cyan-200">
                      AI Follow-Up Question
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-slate-300">
                      {followUpQuestion}
                    </p>

                    <Button className="mt-4 w-full" onClick={useFollowUpQuestion}>
                      Practice Follow-Up
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Card>

          <Card>
            <h2 className="mb-4 text-2xl font-bold">Recent Practice</h2>

            {history.length === 0 ? (
              <p className="text-sm text-slate-400">
                No interview practice saved yet.
              </p>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-white/10 bg-white/5 p-4"
                  >
                    <p className="font-semibold">
                      {item.target_role || "Untitled Role"}
                    </p>

                    <p className="text-sm text-slate-400">
                      {item.interview_type || "Interview"} •{" "}
                      {item.difficulty || "standard"} • Score:{" "}
                      {item.score ?? "--"}/100
                    </p>

                    <p className="mt-2 text-xs text-slate-500">
                      {new Date(item.created_at).toLocaleString()}
                    </p>

                    <Button className="mt-4 w-full" onClick={() => loadSession(item)}>
                      Load Session
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  )
}