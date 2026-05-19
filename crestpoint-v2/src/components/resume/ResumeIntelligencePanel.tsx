"use client"

import { Card } from "@/components/ui/Card"

export function ResumeIntelligencePanel({
  resume,
}: any) {
  return (
    <Card>
      <h2 className="mb-6 text-2xl font-bold">
        Resume Intelligence
      </h2>

      <div className="space-y-6">
        <div className="rounded-2xl bg-black/20 p-5">
          <p className="text-sm text-slate-400">
            ATS Match Score
          </p>

          <h3 className="mt-2 text-5xl font-black text-cyan-400">
            {resume.matchScore ?? "--"}%
          </h3>
        </div>

        <div>
          <h3 className="mb-3 text-lg font-bold text-emerald-400">
            Matched Keywords
          </h3>

          <div className="flex flex-wrap gap-2">
            {resume.matchedKeywords?.map(
              (item: string) => (
                <span
                  key={item}
                  className="rounded-full bg-emerald-500/20 px-3 py-1 text-sm text-emerald-300"
                >
                  {item}
                </span>
              )
            )}
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-lg font-bold text-red-400">
            Missing Keywords
          </h3>

          <div className="flex flex-wrap gap-2">
            {resume.missingKeywords?.map(
              (item: string) => (
                <span
                  key={item}
                  className="rounded-full bg-red-500/20 px-3 py-1 text-sm text-red-300"
                >
                  {item}
                </span>
              )
            )}
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-lg font-bold text-yellow-400">
            Skill Gaps
          </h3>

          <div className="flex flex-wrap gap-2">
            {resume.skillGaps?.map(
              (item: string) => (
                <span
                  key={item}
                  className="rounded-full bg-yellow-500/20 px-3 py-1 text-sm text-yellow-300"
                >
                  {item}
                </span>
              )
            )}
          </div>
        </div>

        {resume.reorderReasoning && (
          <div className="rounded-2xl bg-white/5 p-4">
            <h3 className="mb-3 text-lg font-bold">
              AI Optimization Notes
            </h3>

            <p className="leading-7 text-slate-300">
              {resume.reorderReasoning}
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}