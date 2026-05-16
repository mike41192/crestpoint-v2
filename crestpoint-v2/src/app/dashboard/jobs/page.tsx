"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"

type Job = {
  id: string
  company: string
  role: string
  status: string
  notes: string | null
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [company, setCompany] = useState("")
  const [role, setRole] = useState("")
  const [status, setStatus] = useState("Saved")
  const [notes, setNotes] = useState("")
  const [message, setMessage] = useState("")

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
      .select("id, company, role, status, notes")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      setMessage(error.message)
      return
    }

    setJobs(data || [])
  }

  async function addJob() {
    if (!company || !role) {
      setMessage("Company and role are required.")
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setMessage("You must be logged in to add jobs.")
      return
    }

    const { error } = await supabase.from("jobs").insert({
      user_id: user.id,
      company,
      role,
      status,
      notes,
    })

    if (error) {
      setMessage(error.message)
      return
    }

    setCompany("")
    setRole("")
    setStatus("Saved")
    setNotes("")
    setMessage("Job saved.")
    loadJobs()
  }

  async function deleteJob(id: string) {
    const { error } = await supabase
      .from("jobs")
      .delete()
      .eq("id", id)

    if (error) {
      setMessage(error.message)
      return
    }

    setMessage("Job deleted.")
    loadJobs()
  }

  return (
    <>
      <h1 className="text-4xl font-bold">Job Tracker</h1>

      <p className="mt-2 text-slate-400">
        Track real applications, statuses, and notes.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
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

            <select
              className="w-full rounded-xl border border-white/10 bg-black/30 p-3 outline-none"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option>Saved</option>
              <option>Applied</option>
              <option>Interviewing</option>
              <option>Offer</option>
              <option>Rejected</option>
            </select>

            <textarea
              className="min-h-28 w-full rounded-xl border border-white/10 bg-black/30 p-3 outline-none"
              placeholder="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <Button className="w-full" onClick={addJob}>
              Add Job
            </Button>

            {message && (
              <p className="text-sm text-slate-400">
                {message}
              </p>
            )}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="mb-6 text-2xl font-bold">Applications</h2>

          {jobs.length === 0 && (
            <p className="text-slate-400">No jobs tracked yet.</p>
          )}

          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <h3 className="text-xl font-bold">{job.role}</h3>
                    <p className="text-slate-400">{job.company}</p>
                  </div>

                  <span className="rounded-full bg-white/10 px-4 py-2 text-sm">
                    {job.status}
                  </span>
                </div>

                {job.notes && (
                  <p className="mt-4 text-sm text-slate-400">
                    {job.notes}
                  </p>
                )}

                <button
                  onClick={() => deleteJob(job.id)}
                  className="mt-4 text-sm text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  )
}