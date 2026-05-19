"use client"

import { motion } from "framer-motion"

import { useResumeBuilder } from "@/hooks/useResumeBuilder"
import { ResumeEditor } from "@/components/resume/ResumeEditor"
import { ResumeDesignEngine } from "@/components/resume/ResumeDesignEngine"
import { ResumeLivePreview } from "@/components/resume/ResumeLivePreview"
import { ResumeIntelligencePanel } from "@/components/resume/ResumeIntelligencePanel"
import { ResumeVersionHistory } from "@/components/resume/ResumeVersionHistory"

export default function ResumeBuilderPage() {
  const resume = useResumeBuilder()

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Resume Builder</h1>

        <p className="mt-2 text-slate-400">
          Build, import, tailor, analyze, style, and export professional resumes.
        </p>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <ResumeEditor resume={resume} />

        <div className="space-y-6">
          <ResumeDesignEngine resume={resume} />
          <ResumeLivePreview resume={resume} />
          <ResumeIntelligencePanel resume={resume} />
        </div>

        <ResumeVersionHistory resume={resume} />
      </div>
    </motion.div>
  )
}
