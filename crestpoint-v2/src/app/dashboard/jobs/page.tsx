"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"

type Job = {
  id: string
  company: string | null
  role: string | null
  status: string | null
  location: string | null
  salary: string | null
  job_url: string | null
  notes: string | null
  priority: string | null
  match_score: number | null
  match_feedback: string | null
  missing_skills: string | null
  recommended_improvements: string | null
}

const columns = ["saved", "applied", "interview", "offer", "rejected"]

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)

  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const [company, setCompany] = useState("")
  const [role, setRole] = useState("")
  const [location, setLocation] = useState("")
  const [salary, setSalary] = useState("")
  const [jobUrl, setJobUrl] = useState("")
  const [notes, setNotes] = useState("")
  const [jobDescription, setJobDescription] = useState("")

  useEffect(() => {
    loadJobs()
  }, [])

  async function loadJobs() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })

    if (error) {
      setMessage(error.message)
      return
    }

    setJobs(data || [])
  }

  async function saveJob() {
    setLoading(true)
    setMessage("Saving job...")

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setMessage("You must be logged in.")
      setLoading(false)
      return
    }

    const { data: resume } = await supabase
      .from("resumes")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    let matchScore = null
    let matchFeedback = ""
    let missingSkills = ""
    let recommendedImprovements = ""

    if (resume && jobDescription) {
      try {
        const res = await fetch("/api/ai/job-match", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            company,
            role,
            jobDescription,
            resumeSummary: resume.summary || "",
            resumeExperience: resume.experience || "",
            resumeSkills: resume.skills || "",
          }),
        })

        const data = await res.json()

        if (res.ok) {
          matchScore = data.matchScore ?? null
          matchFeedback = data.feedback || ""
          missingSkills = data.missingSkills || ""
          recommendedImprovements = data.recommendedImprovements || ""
        }
      } catch (error) {
        console.error(error)
      }
    }

    const { error } = await supabase.from("jobs").insert({
      user_id: user.id,
      company,
      role,
      location,
      salary,
      job_url: jobUrl,
      notes,
      status: "saved",
      priority: "medium",
      match_score: matchScore,
      match_feedback: matchFeedback,
      missing_skills: missingSkills,
      recommended_improvements: recommendedImprovements,
      updated_at: new Date().toISOString(),
    })

    setLoading(false)

    if (error) {
      setMessage(error.message)
      return
    }

    setCompany("")
    setRole("")
    setLocation("")
    setSalary("")
    setJobUrl("")
    setNotes("")
    setJobDescription("")

    setMessage("Job saved.")
    await loadJobs()
  }

  async function moveJob(id: string, nextStatus: string) {
    const { error } = await supabase
      .from("jobs")
      .update({
        status: nextStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      setMessage(error.message)
      return
    }

    await loadJobs()

    if (selectedJob?.id === id) {
      setSelectedJob({
        ...selectedJob,
        status: nextStatus,
      })
    }
  }

  async function deleteJob(id: string) {
    const { error } = await supabase.from("jobs").delete().eq("id", id)

    if (error) {
      setMessage(error.message)
      return
    }

    if (selectedJob?.id === id) {
      setSelectedJob(null)
    }

    await loadJobs()
  }

  return (
    <>
      <h1 className="text-4xl font-bold">AI Job Pipeline</h1>

      <p className="mt-2 text-slate-400">
        Track applications with AI job matching, recruiter-style scoring, and a
        cleaner Kanban workflow.
      </p>

      <div className="mt-8 grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <Card>
          <h2 className="mb-6 text-2xl font-bold">Add Job</h2>

          <div className="space-y-4">
            <input
              className="w-full rounded-xl border border-white/10 bg-black/30 p-3 outline-none"
              placeholder="Company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />

            <input
              className="w-full rounded-xl border border-white/10 bg-black/30 p-3 outline-none"
              placeholder="Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />

            <input
              className="w-full rounded-xl border border-white/10 bg-black/30 p-3 outline-none"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />

            <input
              className="w-full rounded-xl border border-white/10 bg-black/30 p-3 outline-none"
              placeholder="Salary"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
            />

            <input
              className="w-full rounded-xl border border-white/10 bg-black/30 p-3 outline-none"
              placeholder="Job URL"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
            />

            <textarea
              className="min-h-40 w-full resize-y rounded-xl border border-white/10 bg-black/30 p-4 leading-7 outline-none"
              placeholder="Job description for AI analysis..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />

            <textarea
              className="min-h-32 w-full resize-y rounded-xl border border-white/10 bg-black/30 p-4 leading-7 outline-none"
              placeholder="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <Button className="w-full" onClick={saveJob} disabled={loading}>
              {loading ? "Analyzing..." : "Save + Analyze Job"}
            </Button>

            {message && (
              <p className="rounded-xl bg-white/5 p-3 text-sm text-slate-400">
                {message}
              </p>
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <div className="grid gap-4 xl:grid-cols-5">
            {columns.map((column) => {
              const columnJobs = jobs.filter((job) => job.status === column)

              return (
                <div key={column}>
                  <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                    <h2 className="text-sm font-bold capitalize">{column}</h2>
                    <p className="text-xs text-slate-400">
                      {columnJobs.length} job{columnJobs.length === 1 ? "" : "s"}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {columnJobs.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-white/10 p-4 text-center text-xs text-slate-500">
                        Empty
                      </div>
                    ) : (
                      columnJobs.map((job) => (
                        <Card key={job.id}>
                          <div className="space-y-3">
                            <div>
                              <h3 className="line-clamp-2 font-bold">
                                {job.role || "Untitled Role"}
                              </h3>

                              <p className="line-clamp-1 text-sm text-slate-400">
                                {job.company || "Unknown company"}
                              </p>
                            </div>

                            {job.match_score !== null && (
                              <div className="rounded-xl bg-white/5 p-3">
                                <p className="text-xs text-slate-400">
                                  AI Match
                                </p>
                                <h3 className="text-2xl font-bold">
                                  {job.match_score}%
                                </h3>
                              </div>
                            )}

                            <select
                              value={job.status || "saved"}
                              onChange={(e) => moveJob(job.id, e.target.value)}
                              className="w-full rounded-xl border border-white/10 bg-black/30 p-2 text-sm outline-none"
                            >
                              <option value="saved">Saved</option>
                              <option value="applied">Applied</option>
                              <option value="interview">Interview</option>
                              <option value="offer">Offer</option>
                              <option value="rejected">Rejected</option>
                            </select>

                            <Button
                              className="w-full"
                              onClick={() => setSelectedJob(job)}
                            >
                              View Details
                            </Button>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {selectedJob && (
            <Card>
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                  <h2 className="text-2xl font-bold">
                    {selectedJob.role || "Untitled Role"}
                  </h2>

                  <p className="mt-1 text-slate-400">
                    {selectedJob.company || "Unknown company"}
                    {selectedJob.location ? ` • ${selectedJob.location}` : ""}
                  </p>

                  {selectedJob.salary && (
                    <p className="mt-2 text-sm text-slate-400">
                      Salary: {selectedJob.salary}
                    </p>
                  )}
                </div>

                <Button onClick={() => setSelectedJob(null)}>Close</Button>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <div className="rounded-xl bg-white/5 p-4">
                    <p className="text-sm text-slate-400">AI Match Score</p>
                    <h3 className="text-5xl font-bold">
                      {selectedJob.match_score ?? "--"}%
                    </h3>
                  </div>

                  <div>
                    <h3 className="font-bold">Pipeline Status</h3>

                    <select
                      value={selectedJob.status || "saved"}
                      onChange={(e) => moveJob(selectedJob.id, e.target.value)}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 p-3 text-sm outline-none"
                    >
                      <option value="saved">Saved</option>
                      <option value="applied">Applied</option>
                      <option value="interview">Interview</option>
                      <option value="offer">Offer</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  {selectedJob.job_url && (
                    <a
                      href={selectedJob.job_url}
                      target="_blank"
                      className="inline-block text-sm text-cyan-300 underline"
                    >
                      Open Job Posting
                    </a>
                  )}

                  <div>
                    <h3 className="font-bold">Notes</h3>
                    <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-400">
                      {selectedJob.notes || "No notes saved."}
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <h3 className="font-bold">Recruiter Feedback</h3>
                    <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-400">
                      {selectedJob.match_feedback || "No feedback generated."}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold text-red-300">Missing Skills</h3>
                    <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-400">
                      {selectedJob.missing_skills || "No missing skills listed."}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold text-cyan-300">
                      Recommendations
                    </h3>
                    <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-400">
                      {selectedJob.recommended_improvements ||
                        "No recommendations saved."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Button onClick={() => deleteJob(selectedJob.id)}>
                  Delete Job
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}