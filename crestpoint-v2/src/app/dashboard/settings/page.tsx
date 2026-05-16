"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"

export default function SettingsPage() {
  const [settingsId, setSettingsId] = useState<string | null>(null)
  const [brandName, setBrandName] = useState("Crestpoint")
  const [primaryColor, setPrimaryColor] = useState("#7C3AED")
  const [accentColor, setAccentColor] = useState("#22D3EE")
  const [radius, setRadius] = useState("16")
  const [motion, setMotion] = useState(true)
  const [message, setMessage] = useState("")

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()

    if (error) {
      setMessage(error.message)
      return
    }

    if (data) {
      setSettingsId(data.id)
      setBrandName(data.brand_name || "Crestpoint")
      setPrimaryColor(data.primary_color || "#7C3AED")
      setAccentColor(data.accent_color || "#22D3EE")
      setRadius(data.border_radius || "16")
      setMotion(Boolean(data.motion_enabled))
    }
  }

  async function saveSettings() {
    setMessage("Saving...")

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setMessage("You must be logged in to save settings.")
      return
    }

    const payload = {
      user_id: user.id,
      brand_name: brandName,
      primary_color: primaryColor,
      accent_color: accentColor,
      border_radius: radius,
      motion_enabled: motion,
      updated_at: new Date().toISOString(),
    }

    const query = settingsId
      ? supabase
          .from("user_settings")
          .update(payload)
          .eq("id", settingsId)
          .select()
          .single()
      : supabase
          .from("user_settings")
          .insert(payload)
          .select()
          .single()

    const { data, error } = await query

    if (error) {
      setMessage(error.message)
      return
    }

    setSettingsId(data.id)
    setMessage("Design settings saved.")
  }

  return (
    <>
      <h1 className="text-4xl font-bold">Settings</h1>

      <p className="mt-2 text-slate-400">
        Control branding, design preferences, and future module settings.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-6 text-2xl font-bold">Brand Controls</h2>

          <div className="space-y-5">
            <input
              className="w-full rounded-xl border border-white/10 bg-black/30 p-3 outline-none"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
            />

            <input
              type="color"
              className="h-12 w-full cursor-pointer rounded-xl border border-white/10 bg-black/30 p-2"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
            />

            <input
              type="color"
              className="h-12 w-full cursor-pointer rounded-xl border border-white/10 bg-black/30 p-2"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
            />

            <input
              type="range"
              min="4"
              max="32"
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              className="w-full"
            />

            <p className="text-sm text-slate-500">{radius}px radius</p>

            <label className="flex items-center gap-3 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={motion}
                onChange={(e) => setMotion(e.target.checked)}
              />
              Enable interface animations
            </label>

            <Button className="w-full" onClick={saveSettings}>
              Save Design Settings
            </Button>

            {message && (
              <p className="text-sm text-slate-400">{message}</p>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="mb-6 text-2xl font-bold">Live Preview</h2>

          <div
            className="border border-white/10 p-6"
            style={{
              borderRadius: `${radius}px`,
              background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
            }}
          >
            <h3 className="text-3xl font-bold text-black">{brandName}</h3>

            <p className="mt-2 max-w-md text-black/70">
              Your saved design settings will become the base style system for the app.
            </p>

            <button
              className="mt-6 bg-black px-5 py-3 font-semibold text-white"
              style={{ borderRadius: `${radius}px` }}
            >
              Preview Button
            </button>
          </div>
        </Card>
      </div>
    </>
  )
}