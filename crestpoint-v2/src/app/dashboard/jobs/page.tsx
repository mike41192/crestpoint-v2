"use client"

import { useEffect, useState } from "react"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core"

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
  source?: string | null
  imported_from_url?: string | null
}

const columns = ["saved", "applied", "interview", "offer", "rejected"]

function JobCard({
  job,
  onView,
}: {
  job: Job
  onView: (job: Job) => void
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: job.id,
      data: {
        job,
      },
    })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? "opacity-50" : ""}
      {...listeners}
      {...attributes}
    >
      <Card>
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
              <p className="text-xs text-slate-400">AI Match</p>
              <h3 className="text-2xl font-bold">{job.match_score}%</h3>
            </div>
          )}

          <Button
            className="w-full"
            onClick={(event: any) => {
              event.stopPropagation()
              onView(job)
            }}
          >
            View Details
          </Button>
        </div>
      </Card>
    </div>
  )
}

function KanbanColumn({
  column,
  jobs,
  onView,
}: {
  column: string
  jobs: Job[]
  onView: (job: Job) => void
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column,
  })

  return (
    <div className="w-[360px] shrink-0">
      <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-3 text-center">
        <h2 className="text-sm font-bold capitalize">{column}</h2>

        <p className="text-xs text-slate-400">
          {jobs.length} job{jobs.length === 1 ? "" : "s"}
        </p>
      </div>

      <div
        ref={setNodeRef}
        className={`min-h-40 space-y-4 rounded-2xl border border-dashed p-3 transition ${
          isOver
            ? "border-cyan-400 bg-cyan-400/10"
            : "border-white/10 bg-black/10"
        }`}
      >
        {jobs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 p-4 text-center text-xs text-slate-500">
            Drop jobs here
          </div>
        ) : (
          jobs.map((job) => (
            <JobCard key={job.id} job={job} onView={onView} />
          ))
        )}
      </div>
    </div>
  )
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [activeJob, setActiveJob] = useState<Job | null>(null)

  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const [company, setCompany] = useState("")
  const [role, setRole] = useState("")
  const [location, setLocation] = useState("")
  const [salary, setSalary] = useState("")
  const [jobUrl, setJobUrl] = useState("")
  const [notes, setNotes] = useState("")
  const [jobDescription, setJobDescription] = useState("")

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

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
      source: "manual",
      imported_from_url: jobUrl,
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
    const previousJobs = jobs

    setJobs((current) =>
      current.map((job) =>
        job.id === id
          ? {
              ...job,
              status: nextStatus,
            }
          : job
      )
    )

    if (selectedJob?.id === id) {
      setSelectedJob({
        ...selectedJob,
        status: nextStatus,
      })
    }

    const { error } = await supabase
      .from("jobs")
      .update({
        status: nextStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      setJobs(previousJobs)
      setMessage(error.message)
      return
    }

    setMessage(`Moved job to ${nextStatus}.`)
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

  function handleDragStart(event: DragStartEvent) {
    const job = event.active.data.current?.job as Job | undefined
    setActiveJob(job || null)
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    setActiveJob(null)

    if (!over) return

    const jobId = String(active.id)
    const nextStatus = String(over.id)

    if (!columns.includes(nextStatus)) return

    const job = jobs.find((item) => item.id === jobId)

    if (!job || job.status === nextStatus) return

    await moveJob(jobId, nextStatus)
  }

  return (
    <>
      <h1 className="text-4xl font-bold">AI Job Pipeline</h1>

      <p className="mt-2 text-slate-400">
        Track applications with drag-and-drop Kanban, AI job matching,
        recruiter-style scoring, and cleaner workflow management.
      </p>

      <div className="mt-8 grid gap-6">
        <Card>
          <h2 className="mb-6 text-2xl font-bold">Add Job</h2>

          <div className="grid gap-4 lg:grid-cols-2">
            <input
              className="rounded-xl border border-white/10 bg-black/30 p-3 outline-none"
              placeholder="Company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />

            <input
              className="rounded-xl border border-white/10 bg-black/30 p-3 outline-none"
              placeholder="Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />

            <input
              className="rounded-xl border border-white/10 bg-black/30 p-3 outline-none"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />

            <input
              className="rounded-xl border border-white/10 bg-black/30 p-3 outline-none"
              placeholder="Salary"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
            />
          </div>

          <input
            className="mt-4 w-full rounded-xl border border-white/10 bg-black/30 p-3 outline-none"
            placeholder="Job URL"
            value={jobUrl}
            onChange={(e) => setJobUrl(e.target.value)}
          />

          <textarea
            className="mt-4 min-h-40 w-full resize-y rounded-xl border border-white/10 bg-black/30 p-4 leading-7 outline-none"
            placeholder="Job description for AI analysis..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />

          <textarea
            className="mt-4 min-h-32 w-full resize-y rounded-xl border border-white/10 bg-black/30 p-4 leading-7 outline-none"
            placeholder="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="mt-4">
            <Button className="w-full" onClick={saveJob} disabled={loading}>
              {loading ? "Analyzing..." : "Save + Analyze Job"}
            </Button>
          </div>

          {message && (
            <p className="mt-4 rounded-xl bg-white/5 p-3 text-sm text-slate-400">
              {message}
            </p>
          )}
        </Card>

        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="overflow-x-auto pb-4">
            <div className="flex min-w-max gap-4">
              {columns.map((column) => (
                <KanbanColumn
                  key={column}
                  column={column}
                  jobs={jobs.filter((job) => job.status === column)}
                  onView={setSelectedJob}
                />
              ))}
            </div>
          </div>

          <DragOverlay>
            {activeJob ? (
              <div className="w-56 rounded-2xl border border-cyan-400/40 bg-slate-950 p-4 shadow-2xl">
                <h3 className="line-clamp-2 font-bold">
                  {activeJob.role || "Untitled Role"}
                </h3>

                <p className="line-clamp-1 text-sm text-slate-400">
                  {activeJob.company || "Unknown company"}
                </p>

                {activeJob.match_score !== null && (
                  <div className="mt-3 rounded-xl bg-white/5 p-3">
                    <p className="text-xs text-slate-400">AI Match</p>

                    <h3 className="text-2xl font-bold">
                      {activeJob.match_score}%
                    </h3>
                  </div>
                )}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {selectedJob && (
          <Card>
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <h2 className="text-2xl font-bold">
                  {selectedJob.role || "Untitled Role"}
                </h2>

                <p className="mt-1 text-slate-400">
                  {selectedJob.company || "Unknown company"}
                  {selectedJob.location
                    ? ` • ${selectedJob.location}`
                    : ""}
                </p>

                {selectedJob.salary && (
                  <p className="mt-2 text-sm text-slate-400">
                    Salary: {selectedJob.salary}
                  </p>
                )}
              </div>

              <Button onClick={() => setSelectedJob(null)}>
                Close
              </Button>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-sm text-slate-400">
                    AI Match Score
                  </p>

                  <h3 className="text-5xl font-bold">
                    {selectedJob.match_score ?? "--"}%
                  </h3>
                </div>

                <div>
                  <h3 className="font-bold">Pipeline Status</h3>

                  <select
                    value={selectedJob.status || "saved"}
                    onChange={(e) =>
                      moveJob(selectedJob.id, e.target.value)
                    }
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
                  <h3 className="font-bold">
                    Recruiter Feedback
                  </h3>

                  <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-400">
                    {selectedJob.match_feedback ||
                      "No feedback generated."}
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-red-300">
                    Missing Skills
                  </h3>

                  <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-400">
                    {selectedJob.missing_skills ||
                      "No missing skills listed."}
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
    </>
  )
}