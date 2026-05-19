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
  Menu,
  X,
  CreditCard,
  Mail,
  LinkIcon,
  Mic,
  Bot,
} from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { label } from "framer-motion/client"

const items = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Resume Builder", href: "/dashboard/resume", icon: FileText },
  { label: "ATS Score", href: "/dashboard/ats", icon: Target },
  { label: "Job Tracker", href: "/dashboard/jobs", icon: Briefcase },
  { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { label: "Cover Letters", href: "/dashboard/cover-letters", icon: Mail },
  { label: "LinkedIn", href: "/dashboard/linkedin", icon: LinkIcon },
  { label: "Interview Simulator", href: "/dashboard/interview", icon: Mic},
  { label: "Career Coach", href: "/dashboard/coach", icon: Bot} ,
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [open, setOpen] = useState(false)

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

  const NavContent = (
    <>
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
              onClick={() => setOpen(false)}
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
    </>
  )

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-50 rounded-xl border border-white/10 bg-black/70 p-3 text-white backdrop-blur md:hidden"
      >
        <Menu size={20} />
      </button>

      <aside className="hidden h-screen w-72 flex-col border-r border-white/10 bg-black/30 p-6 md:flex">
        {NavContent}
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setOpen(false)}
          />

          <aside className="relative flex h-full w-80 max-w-[85vw] flex-col border-r border-white/10 bg-background p-6 shadow-2xl">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 rounded-xl border border-white/10 p-2 text-slate-300"
            >
              <X size={18} />
            </button>

            {NavContent}
          </aside>
        </div>
      )}
    </>
  )
}