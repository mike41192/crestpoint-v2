"use client"

import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { getIndustrySuggestions } from "@/lib/resume/intelligence"

export function ResumeEditor({ resume }: any) {
  return (
    <Card>
      <h2 className="mb-6 text-2xl font-bold">
        Resume Details
      </h2>

      <div className="space-y-5">
        <input
          className="w-full rounded-xl border border-white/10 bg-black/30 p-4 outline-none"
          placeholder="Full name"
          value={resume.fullName}
          onChange={(e) =>
            resume.setFullName(e.target.value)
          }
        />

        <input
          className="w-full rounded-xl border border-white/10 bg-black/30 p-4 outline-none"
          placeholder="Target role / specialty line"
          value={resume.targetRole}
          onChange={(e) =>
            resume.setTargetRole(e.target.value)
          }
        />

        <div className="grid gap-3 md:grid-cols-2">
          <input
            className="rounded-xl border border-white/10 bg-black/30 p-4 outline-none"
            placeholder="Location"
            value={resume.location}
            onChange={(e) =>
              resume.setLocation(e.target.value)
            }
          />

          <input
            className="rounded-xl border border-white/10 bg-black/30 p-4 outline-none"
            placeholder="Email"
            value={resume.email}
            onChange={(e) =>
              resume.setEmail(e.target.value)
            }
          />

          <input
            className="rounded-xl border border-white/10 bg-black/30 p-4 outline-none"
            placeholder="Phone"
            value={resume.phone}
            onChange={(e) =>
              resume.setPhone(e.target.value)
            }
          />

          <input
            className="rounded-xl border border-white/10 bg-black/30 p-4 outline-none"
            placeholder="LinkedIn URL"
            value={resume.linkedin}
            onChange={(e) =>
              resume.setLinkedin(e.target.value)
            }
          />
        </div>

        <textarea
          className="min-h-40 w-full resize-y rounded-xl border border-white/10 bg-black/30 p-4 leading-7 outline-none"
          placeholder="Professional summary"
          value={resume.summary}
          onChange={(e) =>
            resume.setSummary(e.target.value)
          }
        />

        <textarea
          className="min-h-64 w-full resize-y rounded-xl border border-white/10 bg-black/30 p-4 leading-7 outline-none"
          placeholder="Work experience"
          value={resume.experience}
          onChange={(e) =>
            resume.setExperience(e.target.value)
          }
        />

        <textarea
          className="min-h-32 w-full resize-y rounded-xl border border-white/10 bg-black/30 p-4 leading-7 outline-none"
          placeholder="Education"
          value={resume.education}
          onChange={(e) =>
            resume.setEducation(e.target.value)
          }
        />

        <textarea
          className="min-h-32 w-full resize-y rounded-xl border border-white/10 bg-black/30 p-4 leading-7 outline-none"
          placeholder="Skills"
          value={resume.skills}
          onChange={(e) =>
            resume.setSkills(e.target.value)
          }
        />

        <textarea
          className="min-h-32 w-full resize-y rounded-xl border border-white/10 bg-black/30 p-4 leading-7 outline-none"
          placeholder="Certifications"
          value={resume.certifications}
          onChange={(e) =>
            resume.setCertifications(e.target.value)
          }
        />

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h3 className="mb-3 text-lg font-bold">
            File Import
          </h3>

          <input
            type="file"
            accept=".docx,.txt,.pdf"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                resume.handleResumeFileUpload(file)
              }
            }}
            className="w-full rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-slate-300"
          />

          {resume.importingFile && (
            <p className="mt-2 text-sm text-slate-400">
              Importing...
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h3 className="mb-3 text-lg font-bold">
            Resume Import
          </h3>

          <textarea
            className="min-h-48 w-full resize-y rounded-xl border border-white/10 bg-black/30 p-4 leading-7 outline-none"
            placeholder="Paste existing resume text here..."
            value={resume.importedResume}
            onChange={(e) =>
              resume.setImportedResume(e.target.value)
            }
          />

          <Button
            className="mt-3 w-full"
            onClick={resume.importResumeText}
          >
            Import Resume Text
          </Button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h3 className="mb-3 text-lg font-bold">
            Industry Mode
          </h3>

          <select
            value={resume.industryMode}
            onChange={(e) =>
              resume.setIndustryMode(e.target.value)
            }
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
            {getIndustrySuggestions(
              resume.industryMode
            ).map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h3 className="mb-3 text-lg font-bold">
            Job-Based Tailoring
          </h3>

          <textarea
            className="min-h-52 w-full resize-y rounded-xl border border-white/10 bg-black/30 p-4 leading-7 outline-none"
            placeholder="Paste target job description here..."
            value={resume.jobDescription}
            onChange={(e) =>
              resume.setJobDescription(e.target.value)
            }
          />

          <Button
            className="mt-3 w-full"
            onClick={resume.tailorResumeToJob}
            disabled={resume.tailoring}
          >
            {resume.tailoring
              ? "Tailoring..."
              : "Tailor Resume To Job"}
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Button onClick={resume.saveResume}>
            Save Draft
          </Button>

          <Button onClick={resume.exportPdf}>
            Export PDF
          </Button>

          <Button
            onClick={resume.rewriteWithAi}
            disabled={resume.aiLoading}
          >
            {resume.aiLoading
              ? "Rewriting..."
              : "Rewrite With AI"}
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Button
            onClick={resume.quantifyExperience}
            disabled={resume.quantifying}
          >
            {resume.quantifying
              ? "Enhancing..."
              : "Quantify Experience"}
          </Button>

          <Button
            onClick={resume.runResumeIntelligence}
          >
            Run Match Analysis
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-1">
          <Button
            onClick={resume.reorderResumeSections}
            disabled={resume.reorderLoading}
          >
            {resume.reorderLoading
              ? "Reordering..."
              : "AI Section Reorder"}
          </Button>
        </div>

        {resume.status && (
          <p className="rounded-xl bg-white/5 p-3 text-sm text-slate-400">
            {resume.status}
          </p>
        )}
      </div>
    </Card>
  )
}