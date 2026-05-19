"use client"

import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"

export function ResumeVersionHistory({
  resume,
}: any) {
  return (
    <Card className="xl:col-span-2">
      <h2 className="mb-6 text-2xl font-bold">
        Resume Version History
      </h2>

      <div className="space-y-4">
        {resume.versions?.length === 0 && (
          <p className="text-slate-400">
            No saved versions yet.
          </p>
        )}

        {resume.versions?.map((version: any) => (
          <div
            key={version.id}
            className="flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 p-5 md:flex-row md:items-center"
          >
            <div>
              <h3 className="text-lg font-bold">
                {version.target_role ||
                  "Untitled Resume"}
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                {new Date(
                  version.created_at
                ).toLocaleString()}
              </p>
            </div>

            <Button
              onClick={() =>
                resume.restoreVersion(version)
              }
            >
              Restore Version
            </Button>
          </div>
        ))}
      </div>
    </Card>
  )
}