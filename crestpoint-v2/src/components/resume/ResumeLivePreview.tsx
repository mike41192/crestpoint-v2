"use client"

import { Card } from "@/components/ui/Card"

export function ResumeLivePreview({
  resume,
}: any) {
  return (
    <Card>
      <h2 className="mb-6 text-2xl font-bold">
        Live Resume Preview
      </h2>

      <div
        className={`rounded-2xl bg-white p-10 text-black shadow-2xl ${resume.densityClass}`}
      >
        <div className="text-center">
          <h1 className="text-5xl font-black tracking-wide">
            {resume.fullName || "YOUR NAME"}
          </h1>

          <p className="mt-4 text-xl font-semibold">
            {resume.targetRole ||
              "Professional Title"}
          </p>

          <p className="mt-4 text-sm text-slate-700">
            {resume.location}{" "}
            {resume.location && " | "}
            {resume.email}{" "}
            {resume.email && " | "}
            {resume.phone}{" "}
            {resume.phone && " | "}
            {resume.linkedin}
          </p>
        </div>

        {resume.visibleSections.summary && (
          <section>
            <h2 className="border-b pb-2 text-2xl font-bold">
              PROFESSIONAL SUMMARY
            </h2>

            <div className="mt-4 space-y-3">
              {resume.renderLines(
                resume.summary,
                "Professional summary preview..."
              )}
            </div>
          </section>
        )}

        {resume.visibleSections.experience && (
          <section>
            <h2 className="border-b pb-2 text-2xl font-bold">
              WORK EXPERIENCE
            </h2>

            <div className="mt-4 space-y-3">
              {resume.renderLines(
                resume.experience,
                "Work experience preview..."
              )}
            </div>
          </section>
        )}

        {resume.visibleSections.education && (
          <section>
            <h2 className="border-b pb-2 text-2xl font-bold">
              EDUCATION
            </h2>

            <div className="mt-4 space-y-3">
              {resume.renderLines(
                resume.education,
                "Education preview..."
              )}
            </div>
          </section>
        )}

        {resume.visibleSections.skills && (
          <section>
            <h2 className="border-b pb-2 text-2xl font-bold">
              SKILLS
            </h2>

            <div className="mt-4 space-y-3">
              {resume.renderLines(
                resume.skills,
                "Skills preview..."
              )}
            </div>
          </section>
        )}

        {resume.visibleSections.certifications && (
          <section>
            <h2 className="border-b pb-2 text-2xl font-bold">
              CERTIFICATIONS
            </h2>

            <div className="mt-4 space-y-3">
              {resume.renderLines(
                resume.certifications,
                "Certifications preview..."
              )}
            </div>
          </section>
        )}
      </div>
    </Card>
  )
}