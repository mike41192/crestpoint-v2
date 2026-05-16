import { Sidebar } from "@/components/dashboard/Sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="flex min-h-screen bg-background text-white">
      <Sidebar />

      <section className="flex-1 p-6 md:p-10">
        {children}
      </section>
    </main>
  )
}