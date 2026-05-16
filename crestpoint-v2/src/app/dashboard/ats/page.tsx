"use client"

import { useState } from "react"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import {
  scoreResume,
  AtsResult,
} from "@/lib/ats/scoreResume"

export default function AtsPage() {
  const [resumeText, setResumeText] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [result, setResult] = useState<AtsResult | null>(null)

  function runScore() {
    setResult(
      scoreResume({
        resumeText,
        jobDescription,
      })
    )
  }

  return (
    <>
      <h1 className="text-4xl font-bold">ATS Score</h1>

      <p className="mt-2 text-slate-400">
        Transparent resume scoring based on job-description keyword alignment and resume structure.
      </p>

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

          <Button className="mt-6 w-full" onClick={runScore}>
            Run ATS Analysis
          </Button>
        </Card>

        <Card>
          <h2 className="text-2xl font-bold">Analysis Results</h2>

          {!result && (
            <p className="mt-4 text-slate-400">
              Paste a resume and job description, then run the analysis.
            </p>
          )}

          {result && (
            <div className="mt-6 space-y-6">
              <div>
                <p className="text-sm text-slate-400">ATS Alignment Score</p>
                <h3 className="text-5xl font-bold">{result.score}/100</h3>
                <p className="mt-2 text-sm text-slate-500">
                  This is calculated from keyword alignment and structural checks.
                </p>
              </div>

              <div>
                <h3 className="font-bold">Structure Checks</h3>
                <div className="mt-3 space-y-2">
                  {result.checks.map((check) => (
                    <div
                      key={check.label}
                      className="rounded-xl bg-white/5 p-3 text-sm"
                    >
                      {check.passed ? "✅" : "⚠️"} {check.label}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold">Matched Keywords</h3>
                <p className="mt-2 text-sm text-slate-400">
                  {result.matchedKeywords.slice(0, 20).join(", ") || "None yet"}
                </p>
              </div>

              <div>
                <h3 className="font-bold">Missing Keywords</h3>
                <p className="mt-2 text-sm text-slate-400">
                  {result.missingKeywords.slice(0, 20).join(", ") || "None"}
                </p>
              </div>

              <div>
                <h3 className="font-bold">Recommendations</h3>
                <ul className="mt-2 space-y-2 text-sm text-slate-400">
                  {result.recommendations.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </Card>
      </div>
    </>
  )
}
