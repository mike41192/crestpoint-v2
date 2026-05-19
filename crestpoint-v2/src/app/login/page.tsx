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
  setMessage("Checking login...")

  try {
    const cleanEmail = email.trim().toLowerCase()

    if (!cleanEmail || !password) {
      setMessage("Email and password are required.")
      return
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.")
      return
    }

    if (mode === "signup") {
      setMessage("Creating account...")

      const { error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
      })

      if (error) {
        setMessage(error.message)
        return
      }

      setMessage("Account created. Switch to login and sign in.")
      setMode("login")
      return
    }

    setMessage("Signing in...")

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    })

    if (error) {
      setMessage(error.message)
      return
    }

    if (!data.session) {
      setMessage("No session was created. Turn Confirm Email OFF in Supabase dev settings.")
      return
    }

    setMessage("Login successful. Redirecting...")
    window.location.href = "/dashboard"
    
  } catch (err) {
    setMessage("Login failed. Check Supabase keys and browser console.")
    console.error(err)
  } finally {
    setLoading(false)
  }
}
  async function forgotPassword() {
    const cleanEmail = email.trim().toLowerCase()

    if (!cleanEmail) {
      setMessage("Enter your email first.")
      return
    }

    setLoading(true)
    setMessage("")

    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    setMessage("Password reset email sent.")
    setLoading(false)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-white">
      <Card className="w-full max-w-md">
        <h1 className="text-3xl font-bold">
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Access your Crestpoint dashboard.
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
            type="button"
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
              type="button"
              onClick={forgotPassword}
              disabled={loading}
              className="w-full text-sm text-slate-400 hover:text-white"
            >
              Forgot password?
            </button>
          )}

          {message && (
            <p className="rounded-xl bg-white/5 p-3 text-sm text-slate-300">
              {message}
            </p>
          )}
        </div>

        <div className="mt-6 border-t border-white/10 pt-5 text-center text-sm text-slate-400">
          {mode === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                type="button"
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
                type="button"
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
