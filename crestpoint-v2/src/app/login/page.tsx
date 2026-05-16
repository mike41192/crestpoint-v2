"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"

export default function LoginPage() {
  const router = useRouter()

  const [mode, setMode] = useState<"login" | "signup">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    setMessage("")

    if (!email || !password) {
      setMessage("Email and password are required.")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.")
      setLoading(false)
      return
    }

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })

      setLoading(false)

      if (error) {
        setMessage(error.message)
        return
      }

      setMessage("Account created. You can now log in.")
      setMode("login")
      return
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      setMessage(error.message)
      return
    }

    router.push("/dashboard")
  }

  async function handleMagicLink() {
    setLoading(true)
    setMessage("")

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    })

    setLoading(false)

    if (error) {
      if (error.message.toLowerCase().includes("rate limit")) {
        setMessage("Too many login emails sent. Please wait and try again.")
        return
      }

      setMessage(error.message)
      return
    }

    setMessage("Magic link sent. Check your email.")
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-white">
      <Card className="w-full max-w-md">
        <h1 className="text-3xl font-bold">
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Access your Crestpoint career command center.
        </p>

        <div className="mt-8 space-y-4">
          <input
            type="email"
            placeholder="Email address"
            className="w-full rounded-xl border border-white/10 bg-black/30 p-3 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-xl border border-white/10 bg-black/30 p-3 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? "Processing..."
              : mode === "login"
                ? "Login"
                : "Create Account"}
          </Button>

          {mode === "login" && (
            <button
              onClick={handleMagicLink}
              disabled={loading || !email}
              className="w-full rounded-xl border border-white/10 px-5 py-3 text-sm text-slate-300 transition hover:bg-white/10"
            >
              Send Magic Link Instead
            </button>
          )}

          {message && (
            <p className="text-sm text-slate-400">
              {message}
            </p>
          )}
        </div>

        <div className="mt-6 border-t border-white/10 pt-5 text-center text-sm text-slate-400">
          {mode === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                onClick={() => {
                  setMode("signup")
                  setMessage("")
                }}
                className="text-cyan-300 hover:text-cyan-200"
              >
                Create one
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => {
                  setMode("login")
                  setMessage("")
                }}
                className="text-cyan-300 hover:text-cyan-200"
              >
                Login
              </button>
            </>
          )}
        </div>
      </Card>
    </main>
  )
}