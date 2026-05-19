"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"

export default function LinkedInPage() {
  const [profileId, setProfileId] = useState<string | null>(null)
  const [headline, setHeadline] = useState("")
  const [about, setAbout] = useState("")
  const [experience, setExperience] = useState("")
  const [skills, setSkills] = useState("")
  const [output, setOutput] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data } = await supabase
      .from("linkedin_profiles")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (data) {
      setProfileId(data.id)
      setHeadline(data.headline || "")
      setAbout(data.about || "")
      setExperience(data.experience || "")
      setSkills(data.skills || "")
      setOutput(data.optimized_output || "")
    }
  }

  async function optimizeProfile() {
    setLoading(true)
    setMessage("Optimizing LinkedIn profile...")

    try {
      const res = await fetch("/api/ai/linkedin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          headline,
          about,
          experience,
          skills,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage(data.error || "Optimization failed.")
        return
      }

      setOutput(data.output || "")
      setMessage("LinkedIn profile optimized.")
    } catch (error) {
      console.error(error)
      setMessage("LinkedIn optimization failed.")
    } finally {
      setLoading(false)
    }
  }

  async function saveProfile() {
    setMessage("Saving LinkedIn profile...")

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setMessage("You must be logged in.")
      return
    }

    const payload = {
      user_id: user.id,
      headline,
      about,
      experience,
      skills,
      optimized_output: output,
      updated_at: new Date().toISOString(),
    }

    const query = profileId
      ? supabase
          .from("linkedin_profiles")
          .update(payload)
          .eq("id", profileId)
          .select()
          .single()
      : supabase
          .from("linkedin_profiles")
          .insert(payload)
          .select()
          .single()

    const { data, error } = await query

    if (error) {
      setMessage(error.message)
      return
    }

    setProfileId(data.id)
    setMessage("LinkedIn profile saved.")
  }

  return (
    <>
      <h1 className="text-4xl font-bold">LinkedIn Optimizer</h1>

      <p className="mt-2 text-slate-400">
        Improve your LinkedIn headline, about section, experience positioning,
        and recruiter keywords.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-6 text-2xl font-bold">Profile Input</h2>

          <div className="space-y-4">
            <input
              className="w-full rounded-xl border border-white/10 bg-black/30 p-3 outline-none"
              placeholder="Current LinkedIn headline"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
            />

            <textarea
              className="min-h-32 w-full rounded-xl border border-white/10 bg-black/30 p-3 outline-none"
              placeholder="Current About section"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
            />

            <textarea
              className="min-h-32 w-full rounded-xl border border-white/10 bg-black/30 p-3 outline-none"
              placeholder="Experience highlights"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
            />

            <textarea
              className="min-h-24 w-full rounded-xl border border-white/10 bg-black/30 p-3 outline-none"
              placeholder="Skills"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />

            <Button
              className="w-full"
              onClick={optimizeProfile}
              disabled={loading}
            >
              {loading ? "Optimizing..." : "Optimize With AI"}
            </Button>

            <Button className="w-full" onClick={saveProfile}>
              Save LinkedIn Profile
            </Button>

            {message && (
              <p className="rounded-xl bg-white/5 p-3 text-sm text-slate-400">
                {message}
              </p>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="mb-6 text-2xl font-bold">Optimized Output</h2>

          <div className="min-h-[500px] rounded-2xl bg-white p-6 text-black">
            <p className="whitespace-pre-line text-sm leading-6 text-slate-800">
              {output || "Your optimized LinkedIn profile output will appear here."}
            </p>
          </div>
        </Card>
      </div>
    </>
  )
}