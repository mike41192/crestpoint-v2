"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { scoreResume, AtsResult } from "@/lib/ats/scoreResume"
import { extractKeywords } from "@/lib/ats/extractKeywords"
import { ensureSubscription } from "@/lib/billing/ensureSubscription" 
type SavedAnalysis = {
  id: string
  score: number
  resume_text: string
  job_description: string
  matched_keywords: string[] | null
  missing_keywords: string[] | null
  created_at: string
}

export default function AtsPage() {
  const [resumeText, setResumeText] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [result, setResult] = useState<AtsResult | null>(null)
  const [history, setHistory] = useState<SavedAnalysis[]>([])
  const [status, setStatus] = useState("")
  const [saving, setSaving] = useState(false)

  const [plan, setPlan] = useState("free")
  const [credits, setCredits] = useState<number | null>(null)

  const extractedKeywords = useMemo(() => {
    return extractKeywords(jobDescription)
  }, [jobDescription])

  useEffect(() => {
    async function init() {
      await ensureSubscription()
      await loadCredits()
      await loadHistory()
    }

    init()
  }, [])

  async function loadCredits() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data, error } = await supabase
      .from("subscriptions")
      .select("plan, ats_credits")
      .eq("user_id", user.id)
      .maybeSingle()

    if (error) {
      setStatus(error.message)
      return
    }

    if (data) {
      setPlan(data.plan || "free")
      setCredits(data.ats_credits ?? 0)
    }
  }

  async function loadHistory() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data, error } = await supabase
      .from("ats_analyses")
      .select("id, score, resume_text, job_description, matched_keywords, missing_keywords, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5)

    if (error) {
      setStatus(error.message)
      return
    }

    setHistory(data || [])
  }

  async function runScore() {
    if (!resumeText.trim() || !jobDescription.trim()) {
      setStatus("Paste both a resume and job description before running analysis.")
      return
    }

    setSaving(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setStatus("You must be logged in.")
        return
      }

      await ensureSubscription()

      const { data: subscription, error: subError } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle()

      if (subError) {
        setStatus(subError.message)
        return
      }

      if (!subscription) {
        setStatus("Subscription not initialized.")
        return
      }

      if (subscription.ats_credits <= 0) {
        setStatus("You have used all ATS credits for this month.")
        await loadCredits()
        return
      }

      setStatus("Running ATS analysis...")

      const analysis = scoreResume({
        resumeText,
        jobDescription,
      })

      setResult(analysis)

      const { error: analysisError } = await supabase
        .from("ats_analyses")
        .insert({
          user_id: user.id,
          resume_text: resumeText,
          job_description: jobDescription,
          score: analysis.score,
          matched_keywords: analysis.matchedKeywords,
          missing_keywords: analysis.missingKeywords,
        })

      if (analysisError) {
        setStatus(analysisError.message)
        return
      }

      const newCredits = subscription.ats_credits - 1

      const { error: creditError } = await supabase
        .from("subscriptions")
        .update({
          ats_credits: newCredits,
        })
        .eq("user_id", user.id)

      if (creditError) {
        setStatus(creditError.message)
        return
      }

      setCredits(newCredits)
      setPlan(subscription.plan || "free")
      setStatus(`ATS analysis saved. Remaining credits: ${newCredits}`)

      await loadHistory()
    } catch (error) {
      console.error(error)
      setStatus("ATS analysis failed.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <h1 className="text-4xl font-bold">ATS Score</h1>

      <p className="mt-2 text-slate-400">
        Analyze keyword alignment and resume structure against real job descriptions.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <p className="text-sm text-slate-400">Current Plan</p>
          <h2 className="mt-2 text-3xl font-bold capitalize">{plan}</h2>
        </Card>

        <Card>
          <p className="text-sm text-slate-400">ATS Credits Remaining</p>
          <h2 className="mt-2 text-3xl font-bold">
            {credits === null ? "Loading..." : credits}
          </h2>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-2xl font-bold">Resume Text</h2>

          <textarea
            className="min-h-64 w-full rounded-xl border border-white/10 bg-black/30 p-4 outline-none"
            placeholder="Paste resume text here..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
          />

          <h2 className="mb-4 mt-6 text-2xl font-bold">Job Description</h2>

          <textarea
            className="min-h-64 w-full rounded-xl border border-white/10 bg-black/30 p-4 outline-none"
            placeholder="Paste job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />

          <Button className="mt-6 w-full" onClick={runScore} disabled={saving}>
            {saving ? "Analyzing..." : "Run ATS Analysis"}
          </Button>

          {status && (
            <p className="mt-4 rounded-xl bg-white/5 p-3 text-sm text-slate-400">
              {status}
            </p>
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <h2 className="mb-4 text-2xl font-bold">Extracted Keywords</h2>

            {extractedKeywords.length === 0 ? (
              <p className="text-sm text-slate-400">
                Paste a job description to extract keywords.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {extractedKeywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded-full bg-cyan-500/20 px-3 py-2 text-sm text-cyan-200"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <h2 className="text-2xl font-bold">Analysis Results</h2>

            {!result && (
              <p className="mt-4 text-slate-400">
                Paste a resume and job description, then run analysis.
              </p>
            )}

            {result && (
              <div className="mt-6 space-y-4">
                <div>
                  <p className="text-sm text-slate-400">ATS Alignment Score</p>
                  <h3 className="text-5xl font-bold">{result.score}/100</h3>
                </div>

                <p className="text-sm text-green-300">
                  Matched: {result.matchedKeywords.join(", ") || "None"}
                </p>

                <p className="text-sm text-red-300">
                  Missing: {result.missingKeywords.join(", ") || "None"}
                </p>
              </div>
            )}
          </Card>

          <Card>
            <h2 className="text-2xl font-bold">Saved ATS History</h2>

            {history.length === 0 ? (
              <p className="mt-4 text-sm text-slate-400">
                No saved analyses yet.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">Score: {item.score}/100</p>
                      <p className="text-xs text-slate-500">
                        {new Date(item.created_at).toLocaleDateString()}

                        <Button
                          className="mt-4 w-full"
                           onClick={() => {
                            setResumeText(item.resume_text || "")
                             setJobDescription(item.job_description || "")
                             setStatus("Loaded saved ATS analysis.")
                            }}
                          >
                             Load Analysis
                          </Button>
                      </p>
                    </div>
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
