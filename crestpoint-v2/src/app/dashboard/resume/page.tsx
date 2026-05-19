"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import mammoth from "mammoth"

import { supabase } from "@/lib/supabase/client"

import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"

import { exportResumePdf } from "@/lib/resume/exportPdf"
import { exportResumeDocx } from "@/lib/resume/exportDocx"

import {
  resumeTemplates,
  type ResumeTemplate,
} from "@/lib/resume/templates"

import {
  resumeColorThemes,
  resumeFontThemes,
  type ResumeColorTheme,
  type ResumeFontTheme,
} from "@/lib/resume/themes"

import {
  calculateJobMatch,
  detectSkillGaps,
  getIndustrySuggestions,
  type IndustryMode,
} from "@/lib/resume/intelligence"

export default function ResumeBuilderPage() {
  const [resumeId, setResumeId] = useState<string | null>(null)
  const [versions, setVersions] = useState<any[]>([])
  const [plan, setPlan] = useState("free")

  const [template, setTemplate] = useState<ResumeTemplate>("classic")
  const [colorTheme, setColorTheme] = useState<ResumeColorTheme>("slate")
  const [fontTheme, setFontTheme] = useState<ResumeFontTheme>("modern")
  const [industryMode, setIndustryMode] = useState<IndustryMode>("general")

  const [fullName, setFullName] = useState("")
  const [targetRole, setTargetRole] = useState("")
  const [summary, setSummary] = useState("")
  const [experience, setExperience] = useState("")
  const [skills, setSkills] = useState("")

  const [importedResume, setImportedResume] = useState("")
  const [jobDescription, setJobDescription] = useState("")

  const [matchScore, setMatchScore] = useState<number | null>(null)
  const [matchedKeywords, setMatchedKeywords] = useState<string[]>([])
  const [missingKeywords, setMissingKeywords] = useState<string[]>([])
  const [skillGaps, setSkillGaps] = useState<string[]>([])
  const [reorderReasoning, setReorderReasoning] = useState("")

  const [status, setStatus] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const [quantifying, setQuantifying] = useState(false)
  const [tailoring, setTailoring] = useState(false)
  const [reorderLoading, setReorderLoading] = useState(false)
  const [importingFile, setImportingFile] = useState(false)

  useEffect(() => {
    async function loadResume() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("plan")
        .eq("user_id", user.id)
        .maybeSingle()

      setPlan(subscription?.plan || "free")

      await loadVersions(user.id)

      const { data, error } = await supabase
        .from("resumes")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) {
        setStatus(error.message)
        return
      }

      if (data) {
        setResumeId(data.id)
        setFullName(data.full_name || "")
        setTargetRole(data.target_role || "")
        setSummary(data.summary || "")
        setExperience(data.experience || "")
        setSkills(data.skills || "")
      }
    }

    loadResume()
  }, [])

  async function loadVersions(userId: string) {
    const { data } = await supabase
      .from("resume_versions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5)

    setVersions(data || [])
  }

  async function saveResume() {
    setStatus("Saving...")

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setStatus("You must be logged in.")
      return
    }

    const payload = {
      user_id: user.id,
      full_name: fullName,
      target_role: targetRole,
      summary,
      experience,
      skills,
      updated_at: new Date().toISOString(),
    }

    const query = resumeId
      ? supabase.from("resumes").update(payload).eq("id", resumeId).select().single()
      : supabase.from("resumes").insert(payload).select().single()

    const { data, error } = await query

    if (error) {
      setStatus(error.message)
      return
    }

    setResumeId(data.id)

    await supabase.from("resume_versions").insert({
      user_id: user.id,
      resume_id: data.id,
      full_name: fullName,
      target_role: targetRole,
      summary,
      experience,
      skills,
    })

    await loadVersions(user.id)

    setStatus("Resume saved successfully.")
  }

  async function rewriteWithAi() {
    setAiLoading(true)
    setStatus("Rewriting resume with AI...")

    try {
      const res = await fetch("/api/rewrite-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary,
          experience,
          skills,
          targetRole,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setStatus(data.error || "AI rewrite failed.")
        return
      }

      setSummary(data.summary || summary)
      setExperience(data.experience || experience)
      setSkills(data.skills || skills)
      setStatus("AI rewrite completed.")
    } catch (error) {
      console.error(error)
      setStatus("AI rewrite failed.")
    } finally {
      setAiLoading(false)
    }
  }

  async function quantifyExperience() {
    if (!experience) {
      setStatus("Enter experience content first.")
      return
    }

    try {
      setQuantifying(true)
      setStatus("Enhancing experience bullets...")

      const res = await fetch("/api/ai/quantify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ experience }),
      })

      const data = await res.json()

      if (!res.ok) {
        setStatus(data.error || "Bullet enhancement failed.")
        return
      }

      setExperience(data.improvedExperience || experience)
      setStatus("Experience bullets enhanced.")
    } catch (error) {
      console.error(error)
      setStatus("Bullet enhancement failed.")
    } finally {
      setQuantifying(false)
    }
  }

  function importResumeText() {
    if (!importedResume.trim()) {
      setStatus("Paste resume text first.")
      return
    }

    setSummary(importedResume)
    setStatus("Resume text imported into summary. You can now edit or tailor it.")
  }

  async function handleResumeFileUpload(file: File) {
    setImportingFile(true)
    setStatus("Importing resume file...")

    try {
      if (file.name.endsWith(".docx")) {
        const arrayBuffer = await file.arrayBuffer()
        const result = await mammoth.extractRawText({ arrayBuffer })

        setImportedResume(result.value)
        setSummary(result.value)
        setStatus("DOCX resume imported.")
        return
      }

      if (file.name.endsWith(".txt")) {
        const text = await file.text()

        setImportedResume(text)
        setSummary(text)
        setStatus("Text resume imported.")
        return
      }

     if (file.name.endsWith(".pdf")) {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/resume/parse-pdf", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        setStatus(data.error || "PDF import failed.")
      return
    }

    setImportedResume(data.text || "")
    setSummary(data.text || "")
    setStatus("PDF resume imported.")
      return
    }


      setStatus("Unsupported file type. Use DOCX or TXT for now.")
    } catch (error) {
      console.error(error)
      setStatus("Resume import failed.")
    } finally {
      setImportingFile(false)
    }
  }

  async function tailorResumeToJob() {
    if (!targetRole || !jobDescription) {
      setStatus("Enter a target role and job description first.")
      return
    }

    try {
      setTailoring(true)
      setStatus("Tailoring resume to job description...")

      const res = await fetch("/api/ai/tailor-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary,
          experience,
          skills,
          targetRole,
          jobDescription,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setStatus(data.error || "Resume tailoring failed.")
        return
      }

      setSummary(data.summary || summary)
      setExperience(data.experience || experience)
      setSkills(data.skills || skills)
      setStatus("Resume tailored to job description.")
    } catch (error) {
      console.error(error)
      setStatus("Resume tailoring failed.")
    } finally {
      setTailoring(false)
    }
  }

  function runResumeIntelligence() {
    const resumeText = `${summary}\n\n${experience}\n\n${skills}`

    if (!jobDescription.trim()) {
      setStatus("Paste a job description first.")
      return
    }

    const match = calculateJobMatch({
      resumeText,
      jobDescription,
    })

    const gaps = detectSkillGaps({
      resumeText,
      jobDescription,
    })

    setMatchScore(match.score)
    setMatchedKeywords(match.matched)
    setMissingKeywords(match.missing)
    setSkillGaps(gaps)
    setStatus("Resume intelligence analysis completed.")
  }

  async function reorderResumeSections() {
    if (!targetRole) {
      setStatus("Enter a target role first.")
      return
    }

    try {
      setReorderLoading(true)
      setStatus("Reordering resume sections with AI...")

      const res = await fetch("/api/ai/reorder-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary,
          experience,
          skills,
          targetRole,
          jobDescription,
          industryMode,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setStatus(data.error || "Section reordering failed.")
        return
      }

      setSummary(data.summary || summary)
      setExperience(data.experience || experience)
      setSkills(data.skills || skills)
      setReorderReasoning(data.reasoning || "")
      setStatus("Resume sections reordered and refined.")
    } catch (error) {
      console.error(error)
      setStatus("Section reordering failed.")
    } finally {
      setReorderLoading(false)
    }
  }

  function renderFormattedLines(text: string, fallback: string) {
    if (!text.trim()) {
      return <p>{fallback}</p>
    }

    return text
      .split(/\n+/)
      .filter((line) => line.trim())
      .map((line, index) => {
        const cleanLine = line.trim()
        const isBullet = cleanLine.startsWith("-") || cleanLine.startsWith("•")
        const looksLikeTitle =
          !isBullet &&
          cleanLine.length < 120 &&
          (cleanLine.includes("|") ||
            cleanLine.includes("—") ||
            cleanLine.includes(" - ") ||
            cleanLine.toLowerCase().includes("experience"))

        if (isBullet) {
          return (
            <p key={index} className="pl-5">
              • {cleanLine.replace(/^[-•]\s*/, "")}
            </p>
          )
        }

        if (looksLikeTitle) {
          return (
            <p key={index} className="mt-4 font-semibold text-slate-900">
              {cleanLine}
            </p>
          )
        }

        return (
          <p key={index} className="leading-7">
            {cleanLine}
          </p>
        )
      })
  }

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Resume Builder</h1>
        <p className="mt-2 text-slate-400">
          Build, import, tailor, analyze, style, and export ATS-friendly resumes.
        </p>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <h2 className="mb-6 text-2xl font-bold">Resume Details</h2>

          <div className="space-y-5">
            <input
              className="w-full rounded-xl border border-white/10 bg-black/30 p-4 outline-none"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />

            <input
              className="w-full rounded-xl border border-white/10 bg-black/30 p-4 outline-none"
              placeholder="Target role"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
            />

            <textarea
              className="min-h-40 w-full resize-y rounded-xl border border-white/10 bg-black/30 p-4 leading-7 outline-none"
              placeholder="Professional summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />

            <textarea
              className="min-h-64 w-full resize-y rounded-xl border border-white/10 bg-black/30 p-4 leading-7 outline-none"
              placeholder="Experience"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
            />

            <textarea
              className="min-h-32 w-full resize-y rounded-xl border border-white/10 bg-black/30 p-4 leading-7 outline-none"
              placeholder="Skills"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h3 className="mb-3 text-lg font-bold">File Import</h3>

              <input
                type="file"
                accept=".docx,.txt,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleResumeFileUpload(file)
                }}
                className="w-full rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-slate-300"
              />

              <p className="mt-2 text-xs text-slate-500">
                DOCX and TXT import are supported now. PDF text extraction will be upgraded next.
              </p>

              {importingFile && (
                <p className="mt-2 text-sm text-slate-400">Importing...</p>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h3 className="mb-3 text-lg font-bold">Resume Import</h3>

              <textarea
                className="min-h-48 w-full resize-y rounded-xl border border-white/10 bg-black/30 p-4 leading-7 outline-none"
                placeholder="Paste an existing resume here to import..."
                value={importedResume}
                onChange={(e) => setImportedResume(e.target.value)}
              />

              <Button className="mt-3 w-full" onClick={importResumeText}>
                Import Resume Text
              </Button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h3 className="mb-3 text-lg font-bold">Industry Mode</h3>

              <select
                value={industryMode}
                onChange={(e) => setIndustryMode(e.target.value as IndustryMode)}
                className="w-full rounded-xl border border-white/10 bg-black/30 p-3 text-white outline-none"
              >
                <option value="general">General</option>
                <option value="technology">Technology</option>
                <option value="healthcare">Healthcare</option>
                <option value="finance">Finance</option>
                <option value="sales">Sales</option>
                <option value="operations">Operations</option>
                <option value="executive">Executive</option>
              </select>

              <ul className="mt-3 space-y-1 text-sm text-slate-400">
                {getIndustrySuggestions(industryMode).map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h3 className="mb-3 text-lg font-bold">Job-Based Tailoring</h3>

              <textarea
                className="min-h-52 w-full resize-y rounded-xl border border-white/10 bg-black/30 p-4 leading-7 outline-none"
                placeholder="Paste target job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />

              <Button
                className="mt-3 w-full"
                onClick={tailorResumeToJob}
                disabled={tailoring}
              >
                {tailoring ? "Tailoring..." : "Tailor Resume To Job"}
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Button onClick={saveResume}>Save Draft</Button>

              <Button
                onClick={() =>
                  exportResumePdf({
                    fullName,
                    targetRole,
                    summary,
                    experience,
                    skills,
                    template,
                    colorTheme,
                    fontTheme,
                  })
                }
              >
                Export PDF
              </Button>

              <Button
                onClick={() =>
                  exportResumeDocx({
                    fullName,
                    targetRole,
                    summary,
                    experience,
                    skills,
                    template,
                    colorTheme,
                    fontTheme,
                  })
                }
              >
                Export DOCX
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Button onClick={rewriteWithAi} disabled={aiLoading}>
                {aiLoading ? "Rewriting..." : "Rewrite With AI"}
              </Button>

              <Button onClick={quantifyExperience} disabled={quantifying}>
                {quantifying ? "Enhancing..." : "Quantify Experience"}
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Button onClick={runResumeIntelligence}>Run Match Analysis</Button>

              <Button onClick={reorderResumeSections} disabled={reorderLoading}>
                {reorderLoading ? "Reordering..." : "AI Section Reorder"}
              </Button>
            </div>

            {status && (
              <p className="rounded-xl bg-white/5 p-3 text-sm text-slate-400">
                {status}
              </p>
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="mb-4">
              <label className="mb-2 block text-sm text-slate-400">
                Resume Template
              </label>

              <select
                value={template}
                onChange={(e) => {
                  const selected = resumeTemplates.find(
                    (item) => item.id === e.target.value
                  )

                  if (selected?.pro && plan !== "pro") {
                    setStatus("This is a Pro template. Upgrade in Billing to unlock it.")
                    return
                  }

                  setTemplate(e.target.value as ResumeTemplate)
                }}
                className="w-full rounded-xl border border-white/10 bg-black/30 p-3 text-white outline-none"
              >
                {resumeTemplates.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                    {item.pro ? " — Pro" : ""}
                  </option>
                ))}
              </select>

              <p className="mt-2 text-xs text-slate-500">Current plan: {plan}</p>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm text-slate-400">
                Accent Color
              </label>

              <div className="grid grid-cols-2 gap-3">
                {resumeColorThemes.map((theme) => {
                  const colorClass =
                    theme.id === "slate"
                      ? "bg-slate-700"
                      : theme.id === "cyan"
                        ? "bg-cyan-500"
                        : theme.id === "purple"
                          ? "bg-purple-600"
                          : "bg-emerald-500"

                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setColorTheme(theme.id as ResumeColorTheme)}
                      className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                        colorTheme === theme.id
                          ? "border-white bg-white/10"
                          : "border-white/10 bg-black/30 hover:bg-white/5"
                      }`}
                    >
                      <span className={`h-5 w-5 rounded-full ${colorClass}`} />
                      <span className="text-sm text-white">{theme.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm text-slate-400">
                Typography
              </label>

              <select
                value={fontTheme}
                onChange={(e) => setFontTheme(e.target.value as ResumeFontTheme)}
                className="w-full rounded-xl border border-white/10 bg-black/30 p-3 text-white outline-none"
              >
                {resumeFontThemes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <h2 className="mb-6 mt-6 text-2xl font-bold">Live Preview</h2>

            <div
              className={`max-h-[850px] overflow-y-auto rounded-2xl bg-white p-8 text-black transition-all ${
                colorTheme === "cyan" ? "border-cyan-500" : ""
              } ${colorTheme === "purple" ? "border-purple-600" : ""} ${
                colorTheme === "emerald" ? "border-emerald-500" : ""
              } ${fontTheme === "classic" ? "font-serif" : ""} ${
                fontTheme === "executive" ? "tracking-wide" : ""
              } ${template === "modern" ? "border-l-8" : ""} ${
                template === "executive" ? "border-t-8" : ""
              } ${template === "premiumSidebar" ? "border-l-[48px]" : ""} ${
                template === "premiumMinimal" ? "border shadow-xl" : ""
              }`}
            >
              <h1 className="text-3xl font-bold">{fullName || "Your Name"}</h1>

              <p className="mt-1 font-medium text-slate-700">
                {targetRole || "Target Role"}
              </p>

              <hr className="my-6" />

              <h3 className="border-b border-slate-200 pb-2 font-bold">
                Professional Summary
              </h3>

              <div className="mt-3 space-y-3 text-sm leading-7 text-slate-700">
                {renderFormattedLines(summary, "Your summary will appear here.")}
              </div>

              <h3 className="mt-8 border-b border-slate-200 pb-2 font-bold">
                Experience
              </h3>

              <div className="mt-3 space-y-3 text-sm leading-7 text-slate-700">
                {renderFormattedLines(experience, "Your experience will appear here.")}
              </div>

              <h3 className="mt-8 border-b border-slate-200 pb-2 font-bold">
                Skills
              </h3>

              <div className="mt-3 space-y-3 text-sm leading-7 text-slate-700">
                {renderFormattedLines(skills, "Your skills will appear here.")}
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="mb-6 text-2xl font-bold">Resume Intelligence</h2>

            {matchScore === null ? (
              <p className="text-sm text-slate-400">
                Run match analysis to see job fit, keyword heatmap, and skill gaps.
              </p>
            ) : (
              <div className="space-y-5">
                <div>
                  <p className="text-sm text-slate-400">Job Match Score</p>
                  <h3 className="text-5xl font-bold">{matchScore}/100</h3>
                </div>

                <div>
                  <h3 className="font-bold">Matched Keywords</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {matchedKeywords.map((word) => (
                      <span
                        key={word}
                        className="rounded-full bg-green-500/20 px-3 py-2 text-sm text-green-200"
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold">Missing Keywords / Heatmap Gaps</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {missingKeywords.map((word) => (
                      <span
                        key={word}
                        className="rounded-full bg-red-500/20 px-3 py-2 text-sm text-red-200"
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold">Skill Gap Detection</h3>
                  <ul className="mt-2 space-y-1 text-sm text-slate-400">
                    {skillGaps.map((gap) => (
                      <li key={gap}>• {gap}</li>
                    ))}
                  </ul>
                </div>

                {reorderReasoning && (
                  <div>
                    <h3 className="font-bold">AI Reorder Reasoning</h3>
                    <p className="mt-2 text-sm text-slate-400">
                      {reorderReasoning}
                    </p>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        <Card className="lg:col-span-2">
          <h2 className="mb-4 text-2xl font-bold">Resume Version History</h2>

          {versions.length === 0 ? (
            <p className="text-sm text-slate-400">No saved versions yet.</p>
          ) : (
            <div className="space-y-3">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className="rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                    <div>
                      <p className="font-semibold">
                        {version.full_name || "Untitled Resume"}
                      </p>

                      <p className="text-sm text-slate-400">
                        {version.target_role || "No target role"} •{" "}
                        {new Date(version.created_at).toLocaleString()}
                      </p>
                    </div>

                    <Button
                      onClick={() => {
                        setFullName(version.full_name || "")
                        setTargetRole(version.target_role || "")
                        setSummary(version.summary || "")
                        setExperience(version.experience || "")
                        setSkills(version.skills || "")
                        setStatus("Loaded previous resume version.")
                      }}
                    >
                      Restore
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </motion.div>
  )
}