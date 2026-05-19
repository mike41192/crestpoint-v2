"use client"

import { useEffect } from "react"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { ensureSubscription } from "@/lib/billing/ensureSubscription" 

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    ensureSubscription()
  }, [])

  return (
    <main className="flex min-h-screen bg-background text-white">
      <Sidebar />

      <section className="flex-1 p-6 pt-20 md:p-10">
        {children}
      </section>
    </main>
  )
}