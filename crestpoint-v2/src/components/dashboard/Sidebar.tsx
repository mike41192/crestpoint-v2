"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  Target,
  Briefcase,
  Settings,
  LogOut,
} from "lucide-react"
import { supabase } from "@/lib/supabase/client"

const items = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Resume Builder", href: "/dashboard/resume", icon: FileText },
  { label: "ATS Score", href: "/dashboard/ats", icon: Target },
  { label: "Job Tracker", href: "/dashboard/jobs", icon: Briefcase },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [email, setEmail] = useState("")

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      setEmail(user?.email || "Dev Preview")
    }

    loadUser()
  }, [])

  async function logout() {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <aside className="hidden h-screen w-72 flex-col border-r border-white/10 bg-black/30 p-6 md:flex">
      <div className="mb-10">
        <h1 className="text-2xl font-bold">Crestpoint</h1>
        <p className="text-sm text-slate-400">
          Career AI Command Center
        </p>
      </div>

      <nav className="flex-1 space-y-2">
        {items.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 transition ${
                active
                  ? "bg-white/10 text-white"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-white/10 pt-5">
        <p className="mb-4 truncate text-sm text-slate-400">
          {email}
        </p>

        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-red-300 transition hover:bg-red-500/10 hover:text-red-200"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  )
}