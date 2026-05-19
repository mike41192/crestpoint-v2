"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { ensureSubscription } from "@/lib/billing/ensureSubscription"

export default function BillingPage() {
  const [plan, setPlan] = useState("free")
  const [credits, setCredits] = useState<number | null>(null)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [billingStatus, setBillingStatus] = useState("active")

  useEffect(() => {
    async function init() {
      const params = new URLSearchParams(window.location.search)
      const sessionId = params.get("session_id")

      if (sessionId) {
        setMessage("Confirming Stripe payment...")

        try {
          const res = await fetch("/api/stripe/confirm-checkout", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ sessionId }),
          })

          const text = await res.text()
          let data: any = {}

          try {
            data = JSON.parse(text)
          } catch {
            setMessage(
              "Confirm checkout route returned HTML instead of JSON."
            )
            window.history.replaceState({}, "", "/dashboard/billing")
            await loadBilling()
            return
          }

          if (!res.ok) {
            setMessage(data.error || "Payment confirmation failed.")
          } else {
            setMessage("Payment confirmed. Pro plan activated.")
          }

          window.history.replaceState({}, "", "/dashboard/billing")
        } catch (error) {
          console.error(error)
          setMessage("Payment confirmation request failed.")
        }
      }

      await loadBilling()
    }

    init()
  }, [])

  async function loadBilling() {
    try {
      setLoading(true)

      await ensureSubscription()

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        setMessage(userError.message)
        return
      }

      if (!user) {
        setMessage("You must be logged in.")
        return
      }

      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle()

      if (error) {
        setMessage(error.message)
        return
      }

      if (data) {
        setPlan(data.plan || "free")
        setCredits(data.ats_credits ?? 0)
        setBillingStatus(data.status || "active")
      }
    } catch (error) {
      console.error(error)
      setMessage("Billing failed to load.")
    } finally {
      setLoading(false)
    }
  }

  async function startCheckout() {
    try {
      setCheckoutLoading(true)
      setMessage("Opening Stripe checkout...")

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        setMessage(userError.message)
        return
      }

      if (!user || !user.email) {
        setMessage("You must be logged in to upgrade.")
        return
      }

      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage(data.error || "Could not start checkout.")
        return
      }

      if (!data.url) {
        setMessage("Stripe did not return a checkout URL.")
        return
      }

      window.location.href = data.url
    } catch (error) {
      console.error(error)
      setMessage("Stripe checkout failed.")
    } finally {
      setCheckoutLoading(false)
    }
  }

  async function openBillingPortal() {
    try {
      setCheckoutLoading(true)
      setMessage("Opening billing portal...")

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        setMessage(userError.message)
        return
      }

      if (!user) {
        setMessage("You must be logged in.")
        return
      }

      const res = await fetch("/api/stripe/create-portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage(data.error || "Could not open billing portal.")
        return
      }

      if (!data.url) {
        setMessage("Stripe did not return a portal URL.")
        return
      }

      window.location.href = data.url
    } catch (error) {
      console.error(error)
      setMessage("Billing portal failed.")
    } finally {
      setCheckoutLoading(false)
    }
  }

  if (loading) {
    return <div className="text-slate-400">Loading billing...</div>
  }

  return (
    <>
      <h1 className="text-4xl font-bold">Billing</h1>

      <p className="mt-2 text-slate-400">
        Manage your plan, ATS credits, and subscription settings.
      </p>

      {message && (
        <div className="mt-6 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm text-yellow-200">
          {message}
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-400">Current Plan</p>
          <h2 className="mt-2 text-4xl font-bold capitalize">{plan}</h2>
        </Card>

        <Card>
          <p className="text-sm text-slate-400">ATS Credits</p>
          <h2 className="mt-2 text-4xl font-bold">
            {credits === null ? "0" : credits}
          </h2>
        </Card>

        <Card>
          <p className="text-sm text-slate-400">Billing Status</p>
          <h2 className="mt-2 text-4xl font-bold capitalize">
            {billingStatus}
          </h2>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-2xl font-bold">Free Plan</h2>

          <p className="mt-3 text-slate-400">
            Includes limited ATS analysis credits for testing and early use.
          </p>

          <ul className="mt-5 space-y-2 text-sm text-slate-400">
            <li>• 5 ATS credits</li>
            <li>• Resume builder access</li>
            <li>• Job tracker access</li>
            <li>• Basic dashboard metrics</li>
          </ul>

          <Button className="mt-6 w-full" disabled>
            Current Plan
          </Button>
        </Card>

        <Card>
          <h2 className="text-2xl font-bold">Pro Plan</h2>

          <p className="mt-3 text-slate-400">
            Premium plan for higher limits, AI rewrites, advanced exports, and
            automation systems.
          </p>

          <ul className="mt-5 space-y-2 text-sm text-slate-400">
            <li>• Unlimited ATS credits</li>
            <li>• AI resume rewrite access</li>
            <li>• Premium resume exports</li>
            <li>• Advanced job tracking</li>
          </ul>

          <Button
            className="mt-6 w-full"
            onClick={startCheckout}
            disabled={checkoutLoading || plan === "pro"}
          >
            {plan === "pro"
              ? "Pro Active"
              : checkoutLoading
                ? "Opening..."
                : "Upgrade to Pro"}
          </Button>

          <Button
            className="mt-3 w-full"
            onClick={openBillingPortal}
            disabled={checkoutLoading || plan !== "pro"}
          >
            Manage Billing
          </Button>
        </Card>
      </div>
    </>
  )
}