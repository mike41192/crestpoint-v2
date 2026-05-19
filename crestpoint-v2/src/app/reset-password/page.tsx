"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  async function updatePassword() {
    setLoading(true)
    setMessage("")

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.")
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.updateUser({
      password,
    })

    setLoading(false)

    if (error) {
      setMessage(error.message)
      return
    }

    setMessage("Password updated successfully.")
    router.push("/dashboard")
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-white">
      <Card className="w-full max-w-md">
        <h1 className="text-3xl font-bold">Reset Password</h1>

        <p className="mt-2 text-sm text-slate-400">
          Enter a new password for your Crestpoint account.
        </p>

        <div className="mt-8 space-y-4">
          <input
            type="password"
            placeholder="New password"
            className="w-full rounded-xl border border-white/10 bg-black/30 p-3 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            className="w-full"
            onClick={updatePassword}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Password"}
          </Button>

          {message && (
            <p className="text-sm text-slate-400">{message}</p>
          )}
        </div>
      </Card>
    </main>
  )
}