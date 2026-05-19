"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"

type CoverLetter = {
  id: string
  company: string | null
  role: string | null
  job_description: string | null
  letter: string | null
  created_at: string
}

export default function CoverLetterPage() {
  const [company, setCompany] = useState("")
  const [role, setRole] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [letter, setLetter] = useState("")
  const [history, setHistory] = useState<CoverLetter[]>([])
  const [message, setMessage] = useState("")
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    loadHistory()
  }, [])

  async function loadHistory() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data, error } = await supabase
      .from("cover_letters")
      .select("id, company, role, job_description, letter, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5)

    if (error) {
      setMessage(error.message)
      return
    }

    setHistory(data || [])
  }

  async function generateCoverLetter() {
  try {
    setGenerating(true)
    setMessage("Generating AI cover letter...")

    const res = await fetch(
      "/api/ai/cover-letter",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          company,
          role,
          jobDescription,
        }),
      }
    )

    const data = await res.json()

    if (!res.ok) {
      setMessage(
        data.error ||
          "AI generation failed."
      )

      return
    }

    setLetter(data.letter || "")
    setMessage(
      "AI cover letter generated."
    )
  } catch (error) {
    console.error(error)

    setMessage(
      "AI cover letter failed."
    )
  } finally {
    setGenerating(false)
  }
}


  async function saveCoverLetter() {
    setSaving(true)
    setMessage("Saving cover letter...")

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setMessage("You must be logged in.")
      setSaving(false)
      return
    }

    const { error } = await supabase.from("cover_letters").insert({
      user_id: user.id,
      company,
      role,
      job_description: jobDescription,
      letter,
      updated_at: new Date().toISOString(),
    })

    setSaving(false)

    if (error) {
      setMessage(error.message)
      return
    }

    setMessage("Cover letter saved.")
    await loadHistory()
  }

  return (
    <>
      <h1 className="text-4xl font-bold">Cover Letter Builder</h1>

      <p className="mt-2 text-slate-400">
        Create and save targeted cover letters for specific companies and roles.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-6 text-2xl font-bold">Letter Details</h2>

          <div className="space-y-4">
            <input
              className="w-full rounded-xl border border-white/10 bg-black/30 p-3 outline-none"
              placeholder="Company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />

            <input
              className="w-full rounded-xl border border-white/10 bg-black/30 p-3 outline-none"
              placeholder="Target role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />

            <textarea
              className="min-h-32 w-full rounded-xl border border-white/10 bg-black/30 p-3 outline-none"
              placeholder="Paste job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />

            <textarea
              className="min-h-72 w-full rounded-xl border border-white/10 bg-black/30 p-3 outline-none"
              placeholder="Write or paste cover letter here..."
              value={letter}
              onChange={(e) => setLetter(e.target.value)}
            />

            <Button
              className="w-full"
              onClick={generateCoverLetter}
              disabled={generating}
            >
              {generating
              ? "Generating..."
              : "Generate AI Cover Letter"}
            </Button>


            <Button
              className="w-full"
              onClick={saveCoverLetter}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Cover Letter"}
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
            <h2 className="mb-6 text-2xl font-bold">Live Preview</h2>

            <div className="rounded-2xl bg-white p-6 text-black">
              <p className="whitespace-pre-line text-sm leading-6 text-slate-800">
                {letter ||
                  `Dear Hiring Manager,

I am excited to apply for the ${role || "target role"} position at ${
                    company || "your company"
                  }.

Your cover letter preview will appear here.`}
              </p>
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 text-2xl font-bold">Saved Cover Letters</h2>

            {history.length === 0 ? (
              <p className="text-sm text-slate-400">
                No cover letters saved yet.
              </p>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-white/10 bg-white/5 p-4"
                  >
                    <p className="font-semibold">
                      {item.role || "Untitled Role"}
                    </p>

                    <p className="text-sm text-slate-400">
                      {item.company || "No company"} •{" "}
                      {new Date(item.created_at).toLocaleString()}
                    </p>

                    <Button
                      className="mt-4 w-full"
                      onClick={() => {
                        setCompany(item.company || "")
                        setRole(item.role || "")
                        setJobDescription(item.job_description || "")
                        setLetter(item.letter || "")
                        setMessage("Loaded saved cover letter.")
                      }}
                    >
                      Load Letter
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