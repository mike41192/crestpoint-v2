"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"

type CoachMessage = {
  id: string
  role: string
  content: string
  created_at: string
}

export default function CareerCoachPage() {
  const [messages, setMessages] = useState<CoachMessage[]>([])
  const [input, setInput] = useState("")
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadMessages()
  }, [])

  async function loadMessages() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data, error } = await supabase
      .from("career_coach_messages")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(30)

    if (error) {
      setStatus(error.message)
      return
    }

    setMessages(data || [])
  }

  async function loadCareerContext(userId: string) {
    const { data: resume } = await supabase
      .from("resumes")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    const { data: jobs } = await supabase
      .from("jobs")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(8)

    const { data: interviews } = await supabase
      .from("interview_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5)

    const { data: atsAnalyses } = await supabase
      .from("ats_analyses")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5)

    return {
      resume,
      jobs: jobs || [],
      interviews: interviews || [],
      atsAnalyses: atsAnalyses || [],
    }
  }

  async function sendMessage() {
    const cleanInput = input.trim()

    if (!cleanInput) return

    setLoading(true)
    setStatus("Career Coach is thinking...")

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setStatus("You must be logged in.")
      setLoading(false)
      return
    }

    const userInsert = await supabase
      .from("career_coach_messages")
      .insert({
        user_id: user.id,
        role: "user",
        content: cleanInput,
      })
      .select()
      .single()

    if (userInsert.error) {
      setStatus(userInsert.error.message)
      setLoading(false)
      return
    }

    setMessages((prev) => [...prev, userInsert.data])
    setInput("")

    try {
      const context = await loadCareerContext(user.id)

      const res = await fetch("/api/ai/career-coach", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userMessage: cleanInput,
          ...context,
          recentMessages: messages.slice(-10),
        }),
      })

      const text = await res.text()

        let data: any = {}

        try {
            data = JSON.parse(text)
        } catch {
          setStatus(
            "Career coach API route is returning HTML instead of JSON. Verify src/app/api/ai/career-coach/route.ts exists, then restart npm run dev."
          )

         setLoading(false)
          return
        }

      if (!res.ok) {
        setStatus(data.error || "Career coach failed.")
        setLoading(false)
        return
      }

      const assistantInsert = await supabase
        .from("career_coach_messages")
        .insert({
          user_id: user.id,
          role: "assistant",
          content: data.reply || "",
        })
        .select()
        .single()

      if (assistantInsert.error) {
        setStatus(assistantInsert.error.message)
        setLoading(false)
        return
      }

      setMessages((prev) => [...prev, assistantInsert.data])
      setStatus("Career Coach response saved.")
    } catch (error) {
      console.error(error)
      setStatus("Career coach failed.")
    } finally {
      setLoading(false)
    }
  }

  async function clearChat() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { error } = await supabase
      .from("career_coach_messages")
      .delete()
      .eq("user_id", user.id)

    if (error) {
      setStatus(error.message)
      return
    }

    setMessages([])
    setStatus("Coach history cleared.")
  }

  return (
    <>
      <h1 className="text-4xl font-bold">AI Career Coach</h1>

      <p className="mt-2 text-slate-400">
        Ask for career strategy using your resume, jobs, ATS history, and
        interview practice.
      </p>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.35fr]">
        <Card>
          <div className="flex min-h-[600px] flex-col">
            <div className="flex-1 space-y-4 overflow-y-auto rounded-2xl border border-white/10 bg-black/20 p-4">
              {messages.length === 0 ? (
                <div className="rounded-xl bg-white/5 p-4 text-sm text-slate-400">
                  Try asking: “What jobs should I focus on based on my resume?”
                  or “How can I improve my interview readiness?”
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`rounded-2xl p-4 text-sm leading-7 ${
                      message.role === "user"
                        ? "ml-auto max-w-[85%] bg-cyan-500/20 text-cyan-50"
                        : "mr-auto max-w-[90%] bg-white/5 text-slate-300"
                    }`}
                  >
                    <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">
                      {message.role === "user" ? "You" : "Career Coach"}
                    </p>

                    <p className="whitespace-pre-line">{message.content}</p>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 space-y-3">
              <textarea
                className="min-h-28 w-full resize-y rounded-xl border border-white/10 bg-black/30 p-4 leading-7 outline-none"
                placeholder="Ask your career coach anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />

              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <Button onClick={sendMessage} disabled={loading}>
                  {loading ? "Thinking..." : "Send Message"}
                </Button>

                <Button onClick={clearChat} disabled={loading}>
                  Clear Chat
                </Button>
              </div>

              {status && (
                <p className="rounded-xl bg-white/5 p-3 text-sm text-slate-400">
                  {status}
                </p>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-2xl font-bold">Suggested Prompts</h2>

          <div className="mt-5 space-y-3">
            {[
              "What are my strongest job targets right now?",
              "Which jobs in my pipeline should I prioritize?",
              "How can I improve my resume for higher-paying roles?",
              "What interview weaknesses should I work on?",
              "Create a 7-day job search plan for me.",
              "What should I do next to improve my ATS score?",
            ].map((prompt) => (
              <button
                key={prompt}
                onClick={() => setInput(prompt)}
                className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-left text-sm text-slate-300 transition hover:bg-white/10"
              >
                {prompt}
              </button>
            ))}
          </div>
        </Card>
      </div>
    </>
  )
}