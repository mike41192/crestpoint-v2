"use client"

import { useEffect, useState } from "react"
import mammoth from "mammoth"

import { supabase } from "@/lib/supabase/client"
import { exportResumePdf } from "@/lib/resume/exportPdf"

import {
  resumeAccents,
  defaultVisibleSections,
  type ResumeAccent,
  type ResumeDensity,
  type ResumeSectionKey,
  type ResumeTemplate,
} from "@/lib/resume/templates"

import {
  calculateJobMatch,
  detectSkillGaps,
  type IndustryMode,
} from "@/lib/resume/intelligence"

export function useResumeBuilder() {
  const [resumeId, setResumeId] = useState<string | null>(null)
  const [versions, setVersions] = useState<any[]>([])

  const [template, setTemplate] = useState<ResumeTemplate>("professional")
  const [accent, setAccent] = useState<ResumeAccent>("slate")
  const [density, setDensity] = useState<ResumeDensity>("standard")
  const [visibleSections, setVisibleSections] =
    useState<Record<ResumeSectionKey, boolean>>(defaultVisibleSections)

  const [industryMode, setIndustryMode] = useState<IndustryMode>("general")

  const [fullName, setFullName] = useState("")
  const [targetRole, setTargetRole] = useState("")
  const [location, setLocation] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [linkedin, setLinkedin] = useState("")

  const [summary, setSummary] = useState("")
  const [experience, setExperience] = useState("")
  const [education, setEducation] = useState("")
  const [skills, setSkills] = useState("")
  const [certifications, setCertifications] = useState("")

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

  const selectedAccent =
    resumeAccents.find((item) => item.id === accent) || resumeAccents[0]

  const densityClass =
    density === "compact"
      ? "space-y-4 text-sm leading-6"
      : density === "spacious"
        ? "space-y-10 text-base leading-8"
        : "space-y-8 text-sm leading-7"

  useEffect(() => {
    loadResume()
  }, [])

  function toggleSection(section: ResumeSectionKey) {
    setVisibleSections((current) => ({
      ...current,
      [section]: !current[section],
    }))
  }

  async function loadResume() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

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
      setLocation(data.location || "")
      setEmail(data.email || "")
      setPhone(data.phone || "")
      setLinkedin(data.linkedin || "")
      setSummary(data.summary || "")
      setExperience(data.experience || "")
      setEducation(data.education || "")
      setSkills(data.skills || "")
      setCertifications(data.certifications || "")
    }
  }

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
      location,
      email,
      phone,
      linkedin,
      summary,
      experience,
      education,
      skills,
      certifications,
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

      setStatus("Unsupported file type. Use DOCX, TXT, or PDF.")
    } catch {
      setStatus("Resume import failed.")
    } finally {
      setImportingFile(false)
    }
  }

  function importResumeText() {
    if (!importedResume.trim()) {
      setStatus("Paste resume text first.")
      return
    }

    setSummary(importedResume)
    setStatus("Resume text imported into summary.")
  }

  async function rewriteWithAi() {
    setAiLoading(true)
    setStatus("Rewriting resume with AI...")

    try {
      const res = await fetch("/api/rewrite-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary, experience, skills, targetRole }),
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
    } catch {
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

    setQuantifying(true)
    setStatus("Enhancing experience bullets...")

    try {
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
    } catch {
      setStatus("Bullet enhancement failed.")
    } finally {
      setQuantifying(false)
    }
  }

  async function tailorResumeToJob() {
    if (!targetRole || !jobDescription) {
      setStatus("Enter a target role and job description first.")
      return
    }

    setTailoring(true)
    setStatus("Tailoring resume to job description...")

    try {
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
    } catch {
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

    const match = calculateJobMatch({ resumeText, jobDescription })
    const gaps = detectSkillGaps({ resumeText, jobDescription })

    setMatchScore(match.score)
    setMatchedKeywords(match.matched)
    setMissingKeywords(match.missing)
    setSkillGaps(gaps)
    setStatus("Resume intelligence analysis completed.")
  }

  async function reorderResumeSections() {
    setReorderLoading(true)
    setStatus("Reordering resume sections with AI...")

    try {
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
    } catch {
      setStatus("Section reordering failed.")
    } finally {
      setReorderLoading(false)
    }
  }

  function exportPdf() {
    exportResumePdf({
      full_name: fullName,
      target_role: targetRole,
      location,
      email,
      phone,
      linkedin,
      summary,
      experience,
      education,
      skills,
      certifications,
      template,
      accent,
      density,
      visibleSections,
    } as any)
  }

  function restoreVersion(version: any) {
    setFullName(version.full_name || "")
    setTargetRole(version.target_role || "")
    setSummary(version.summary || "")
    setExperience(version.experience || "")
    setSkills(version.skills || "")
    setStatus("Loaded previous resume version.")
  }

  function renderLines(text: string, fallback: string) {
    if (!text.trim()) return <p>{fallback}</p>

    return text
      .split(/\n+/)
      .filter((line) => line.trim())
      .map((line, index) => {
        const clean = line.trim()
        const isBullet = clean.startsWith("-") || clean.startsWith("•")

        if (isBullet) {
          return (
            <p key={index} className="pl-5">
              • {clean.replace(/^[-•]\s*/, "")}
            </p>
          )
        }

        return (
          <p key={index} className="leading-7">
            {clean}
          </p>
        )
      })
  }

  return {
    resumeId,
    versions,

    template,
    accent,
    density,
    visibleSections,
    industryMode,

    fullName,
    targetRole,
    location,
    email,
    phone,
    linkedin,
    summary,
    experience,
    education,
    skills,
    certifications,
    importedResume,
    jobDescription,

    matchScore,
    matchedKeywords,
    missingKeywords,
    skillGaps,
    reorderReasoning,

    status,
    aiLoading,
    quantifying,
    tailoring,
    reorderLoading,
    importingFile,

    selectedAccent,
    densityClass,

    setTemplate,
    setAccent,
    setDensity,
    setIndustryMode,

    setFullName,
    setTargetRole,
    setLocation,
    setEmail,
    setPhone,
    setLinkedin,

    setSummary,
    setExperience,
    setEducation,
    setSkills,
    setCertifications,

    setImportedResume,
    setJobDescription,

    saveResume,
    handleResumeFileUpload,
    importResumeText,
    rewriteWithAi,
    quantifyExperience,
    tailorResumeToJob,
    runResumeIntelligence,
    reorderResumeSections,
    exportPdf,
    toggleSection,
    restoreVersion,
    renderLines,
  }
}