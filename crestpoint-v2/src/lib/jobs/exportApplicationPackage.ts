import jsPDF from "jspdf"

type PackageExportProps = {
  job: {
    company?: string | null
    role?: string | null
    location?: string | null
    job_url?: string | null
    notes?: string | null
    match_score?: number | null
    match_feedback?: string | null
    missing_skills?: string | null
    recommended_improvements?: string | null
  }
  resume?: {
    full_name?: string | null
    target_role?: string | null
    location?: string | null
    email?: string | null
    phone?: string | null
    linkedin?: string | null
    summary?: string | null
    experience?: string | null
    education?: string | null
    skills?: string | null
    certifications?: string | null
  } | null
  coverLetter?: {
    letter?: string | null
  } | null
}

function safeName(value: string) {
  return value
    .replace(/[^a-z0-9-.]+/gi, "-")
    .replace(/-+/g, "-")
    .toLowerCase()
}

function createDoc() {
  const doc = new jsPDF("p", "mm", "letter")
  const margin = 18
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const usableWidth = pageWidth - margin * 2

  let y = 22

  function checkSpace(space = 14) {
    if (y + space > pageHeight - margin) {
      doc.addPage()
      y = 22
    }
  }

  function heading(text?: string | null, size = 18) {
    if (!text) return

    checkSpace(14)

    doc.setFont("helvetica", "bold")
    doc.setFontSize(size)
    doc.text(text, margin, y)

    y += 9
  }

  function centeredHeading(text?: string | null, size = 30) {
    if (!text) return

    checkSpace(16)

    doc.setFont("helvetica", "bold")
    doc.setFontSize(size)

    doc.text(text.toUpperCase(), pageWidth / 2, y, {
      align: "center",
    })

    y += 12
  }

  function centeredSubheading(text?: string | null, size = 12) {
    if (!text) return

    checkSpace(10)

    doc.setFont("helvetica", "bold")
    doc.setFontSize(size)

    doc.text(text, pageWidth / 2, y, {
      align: "center",
    })

    y += 9
  }

  function centeredText(text?: string | null, size = 10) {
    if (!text) return

    checkSpace(10)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(size)

    const lines = doc.splitTextToSize(text, usableWidth)

    lines.forEach((line: string) => {
      checkSpace(7)
      doc.text(line, pageWidth / 2, y, {
        align: "center",
      })
      y += 5.5
    })

    y += 5
  }

  function sectionTitle(text: string) {
    checkSpace(16)

    doc.setFont("helvetica", "bold")
    doc.setFontSize(16)
    doc.text(text.toUpperCase(), margin, y)

    y += 3

    doc.setDrawColor(90)
    doc.line(margin, y, pageWidth - margin, y)

    y += 7
  }

  function paragraph(text?: string | null, fontSize = 10.5) {
    if (!text) return

    doc.setFont("helvetica", "normal")
    doc.setFontSize(fontSize)

    const lines = doc.splitTextToSize(text, usableWidth)

    lines.forEach((line: string) => {
      checkSpace(7)
      doc.text(line, margin, y)
      y += 5.6
    })

    y += 6
  }

  function resumeSection(title: string, content?: string | null) {
    if (!content) return

    sectionTitle(title)
    paragraph(content)
  }

  return {
    doc,
    heading,
    centeredHeading,
    centeredSubheading,
    centeredText,
    sectionTitle,
    paragraph,
    resumeSection,
  }
}

export function exportApplicationPackage({
  job,
  resume,
  coverLetter,
}: PackageExportProps) {
  const baseName = safeName(
    `${job.company || "company"}-${job.role || "application"}`
  )

  const jobDoc = createDoc()
  jobDoc.heading(job.role || "Imported Job", 20)
  jobDoc.paragraph(
    `${job.company || ""}${job.location ? ` • ${job.location}` : ""}`
  )
  jobDoc.paragraph(job.job_url || "")
  jobDoc.paragraph(job.notes || "")
  jobDoc.doc.save(`${baseName}-job-details.pdf`)

  const resumeDoc = createDoc()

  resumeDoc.centeredHeading(resume?.full_name || "Your Name", 30)
  resumeDoc.centeredSubheading(resume?.target_role || job.role || "", 12)

  resumeDoc.centeredText(
    [
      resume?.location,
      resume?.email,
      resume?.phone,
      resume?.linkedin,
    ]
      .filter(Boolean)
      .join(" | "),
    10
  )

  resumeDoc.resumeSection("Professional Summary", resume?.summary)
  resumeDoc.resumeSection("Work Experience", resume?.experience)
  resumeDoc.resumeSection("Education", resume?.education)
  resumeDoc.resumeSection("Skills", resume?.skills)
  resumeDoc.resumeSection("Certifications", resume?.certifications)

  resumeDoc.doc.save(`${baseName}-resume.pdf`)

  const coverDoc = createDoc()
  coverDoc.paragraph(
    coverLetter?.letter || "No cover letter generated for this job yet.",
    11
  )
  coverDoc.doc.save(`${baseName}-cover-letter.pdf`)

  const matchDoc = createDoc()
  matchDoc.heading(`${job.match_score ?? "--"}% Match`, 20)
  matchDoc.paragraph(job.match_feedback)
  matchDoc.paragraph(job.missing_skills)
  matchDoc.paragraph(job.recommended_improvements)
  matchDoc.doc.save(`${baseName}-match-notes.pdf`)
}