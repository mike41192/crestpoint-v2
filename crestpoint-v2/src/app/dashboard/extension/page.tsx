"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Card } from "@/components/ui/Card"

export default function ExtensionConnectPage() {
  const [userId, setUserId] = useState("")

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setUserId(user.id)
      }
    }

    loadUser()
  }, [])

  return (
    <>
      <h1 className="text-4xl font-bold">Extension Connection</h1>

      <p className="mt-2 text-slate-400">
        Keep this page open once so the browser extension can auto-detect your user ID.
      </p>

      <div className="mt-8">
        <Card>
          <h2 className="text-2xl font-bold">Your Crestpoint User ID</h2>

          <p
            id="crestpoint-user-id"
            className="mt-4 rounded-xl bg-black/30 p-4 text-sm text-cyan-300"
          >
            {userId || "Loading..."}
          </p>

          <p className="mt-4 text-sm text-slate-400">
            After this appears, reload the Edge extension. The popup should auto-fill your ID.
          </p>
        </Card>
      </div>
    </>
  )
}