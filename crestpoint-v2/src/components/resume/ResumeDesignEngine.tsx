"use client"

import {
  resumeTemplates,
  resumeAccents,
  resumeDensities,
} from "@/lib/resume/templates"

import type {
  ResumeAccent,
  ResumeDensity,
  ResumeSectionKey,
  ResumeTemplate,
} from "@/lib/resume/templates"

import { Card } from "@/components/ui/Card"

export function ResumeDesignEngine({
  resume,
}: any) {
  return (
    <Card>
      <h2 className="mb-4 text-2xl font-bold">
        Resume Design Engine
      </h2>

      <div className="space-y-5">
        <div>
          <h3 className="mb-3 font-bold">
            Template
          </h3>

          <div className="grid gap-3">
            {resumeTemplates.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  resume.setTemplate(
                    item.id as ResumeTemplate
                  )
                }
                className={`rounded-2xl border p-4 text-left transition ${
                  resume.template === item.id
                    ? "border-cyan-400 bg-cyan-400/10"
                    : "border-white/10 bg-black/20 hover:bg-white/5"
                }`}
              >
                <h4 className="font-bold">
                  {item.name}
                </h4>

                <p className="mt-1 text-sm text-slate-400">
                  {item.description}
                </p>

                <p className="mt-2 text-xs text-cyan-300">
                  {item.bestFor}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-3 font-bold">
            Accent Color
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {resumeAccents.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  resume.setAccent(
                    item.id as ResumeAccent
                  )
                }
                className={`flex items-center gap-3 rounded-xl border p-3 text-left ${
                  resume.accent === item.id
                    ? "border-white bg-white/10"
                    : "border-white/10 bg-black/20"
                }`}
              >
                <span
                  className={`h-5 w-5 rounded-full ${item.bg}`}
                />

                <span className="text-sm">
                  {item.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-3 font-bold">
            Spacing Density
          </h3>

          <div className="grid grid-cols-3 gap-3">
            {resumeDensities.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  resume.setDensity(
                    item.id as ResumeDensity
                  )
                }
                className={`rounded-xl border p-3 text-sm ${
                  resume.density === item.id
                    ? "border-cyan-400 bg-cyan-400/10"
                    : "border-white/10 bg-black/20"
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-3 font-bold">
            Visible Sections
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {(
              Object.keys(
                resume.visibleSections
              ) as ResumeSectionKey[]
            ).map((section) => (
              <button
                key={section}
                type="button"
                onClick={() =>
                  resume.toggleSection(section)
                }
                className={`rounded-xl border p-3 text-left text-sm capitalize ${
                  resume.visibleSections[
                    section
                  ]
                    ? "border-emerald-400 bg-emerald-400/10 text-emerald-200"
                    : "border-white/10 bg-black/20 text-slate-500"
                }`}
              >
                {resume.visibleSections[
                  section
                ]
                  ? "Shown"
                  : "Hidden"}{" "}
                — {section}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}