import jsPDF from "jspdf"
import { ResumeTemplate } from "./templates"

type ResumeExportData = {
  full_name?: string | null
  target_role?: string | null
  email?: string | null
  phone?: string | null
  location?: string | null
  linkedin?: string | null

  summary?: string | null
  experience?: string | null
  education?: string | null
  skills?: string | null
  certifications?: string | null

  template?: ResumeTemplate
}

export function exportResumePdf(data: ResumeExportData) {
  const doc = new jsPDF("p", "mm", "letter")

  const margin = 16
  const width = 178

  let y = 24

  function divider() {
    doc.setDrawColor(120)
    doc.line(margin, y, 194, y)
    y += 8
  }

  function section(title: string, content?: string | null) {
    if (!content) return

    if (y > 240) {
      doc.addPage()
      y = 20
    }

    doc.setFont("helvetica", "bold")
    doc.setFontSize(18)
    doc.text(title.toUpperCase(), margin, y)

    y += 4
    divider()

    doc.setFont("helvetica", "normal")
    doc.setFontSize(11)

    const lines = doc.splitTextToSize(content, width)

    lines.forEach((line: string) => {
      if (y > 265) {
        doc.addPage()
        y = 20
      }

      doc.text(line, margin, y)
      y += 6
    })

    y += 8
  }

  if (data.template === "executive") {
    doc.setFont("helvetica", "bold")
    doc.setFontSize(34)
  } else {
    doc.setFont("helvetica", "bold")
    doc.setFontSize(28)
  }

  doc.text(
    (data.full_name || "YOUR NAME").toUpperCase(),
    105,
    y,
    {
      align: "center",
    }
  )

  y += 12

  doc.setFont("helvetica", "bold")

  if (data.template === "modern") {
    doc.setFontSize(13)
  } else {
    doc.setFontSize(14)
  }

  doc.text(
    data.target_role || "",
    105,
    y,
    {
      align: "center",
    }
  )

  y += 10

  doc.setFont("helvetica", "normal")
  doc.setFontSize(11)

  const contactLine = [
    data.location,
    data.email,
    data.phone,
    data.linkedin,
  ]
    .filter(Boolean)
    .join(" | ")

  doc.text(contactLine, 105, y, {
    align: "center",
  })

  y += 14

  section("Professional Summary", data.summary)
  section("Work Experience", data.experience)
  section("Education", data.education)
  section("Skills", data.skills)
  section("Certifications", data.certifications)

  doc.save(
    `${(data.full_name || "resume")
      .replace(/[^a-z0-9]+/gi, "-")
      .toLowerCase()}-resume.pdf`
  )
}
