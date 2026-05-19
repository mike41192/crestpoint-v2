import jsPDF from "jspdf"

import { ResumeTemplate } from "@/lib/resume/templates"

import {
  ResumeColorTheme,
  ResumeFontTheme,
} from "@/lib/resume/themes"

type ExportResumeProps = {
  fullName: string
  targetRole: string
  summary: string
  experience: string
  skills: string

  template?: ResumeTemplate

  colorTheme?: ResumeColorTheme
  fontTheme?: ResumeFontTheme
}

export function exportResumePdf({
  fullName,
  targetRole,
  summary,
  experience,
  skills,

  template = "classic",

  colorTheme = "slate",
  fontTheme = "modern",
}: ExportResumeProps) {
  const doc = new jsPDF("p", "mm", "letter")

  const margin = 18

  const pageWidth =
    doc.internal.pageSize.getWidth()

  const pageHeight =
    doc.internal.pageSize.getHeight()

  const usableWidth =
    pageWidth - margin * 2

  let y = 20

  const themeColors = {
    slate: [51, 65, 85],
    cyan: [6, 182, 212],
    purple: [147, 51, 234],
    emerald: [16, 185, 129],
  }

  const activeColor =
    themeColors[colorTheme]

  if (template === "premiumSidebar") {
    doc.setFillColor(
      activeColor[0],
      activeColor[1],
      activeColor[2]
    )

    doc.rect(
      0,
      0,
      12,
      pageHeight,
      "F"
    )
  }

  function checkPageSpace(
    spaceNeeded = 12
  ) {
    if (
      y + spaceNeeded >
      pageHeight - margin
    ) {
      doc.addPage()

      y = 20

      if (
        template ===
        "premiumSidebar"
      ) {
        doc.setFillColor(
          activeColor[0],
          activeColor[1],
          activeColor[2]
        )

        doc.rect(
          0,
          0,
          12,
          pageHeight,
          "F"
        )
      }
    }
  }

  function divider() {
    if (template === "modern") {
      doc.setDrawColor(
        activeColor[0],
        activeColor[1],
        activeColor[2]
      )

      doc.setLineWidth(0.6)

      doc.line(
        margin,
        y,
        pageWidth - margin,
        y
      )

      y += 7
    }

    if (
      template === "executive"
    ) {
      doc.setDrawColor(
        activeColor[0],
        activeColor[1],
        activeColor[2]
      )

      doc.setLineWidth(1)

      doc.line(
        margin,
        y,
        pageWidth - margin,
        y
      )

      y += 8
    }

    if (
      template ===
      "premiumSidebar"
    ) {
      doc.setDrawColor(
        activeColor[0],
        activeColor[1],
        activeColor[2]
      )

      doc.setLineWidth(2)

      doc.line(
        margin,
        y,
        pageWidth - margin,
        y
      )

      y += 8
    }

    if (
      template ===
      "premiumMinimal"
    ) {
      doc.setDrawColor(
        180
      )

      doc.setLineWidth(0.3)

      doc.line(
        margin,
        y,
        pageWidth - margin,
        y
      )

      y += 7
    }
  }

  function getFontFamily() {
    if (
      fontTheme === "classic"
    ) {
      return "times"
    }

    if (
      fontTheme ===
      "executive"
    ) {
      return "courier"
    }

    return "helvetica"
  }

  function addText(
    text: string,
    fontSize = 11,
    bold = false
  ) {
    doc.setFont(
      getFontFamily(),
      bold
        ? "bold"
        : "normal"
    )

    doc.setFontSize(fontSize)

    const lines =
      doc.splitTextToSize(
        text ||
          "Not provided.",
        usableWidth
      )

    lines.forEach(
      (line: string) => {
        checkPageSpace(8)

        doc.text(
          line,
          margin,
          y
        )

        y += 6
      }
    )

    y += 4
  }

  function addSection(
    title: string,
    content: string
  ) {
    checkPageSpace(18)

    doc.setFont(
      getFontFamily(),
      "bold"
    )

    doc.setTextColor(
      activeColor[0],
      activeColor[1],
      activeColor[2]
    )

    doc.setFontSize(
      template ===
        "executive"
        ? 13
        : 14
    )

    doc.text(
      title.toUpperCase(),
      margin,
      y
    )

    y += 7

    divider()

    doc.setTextColor(
      0,
      0,
      0
    )

    addText(
      content,
      11,
      false
    )
  }

  doc.setFont(
    getFontFamily(),
    "bold"
  )

  doc.setTextColor(
    activeColor[0],
    activeColor[1],
    activeColor[2]
  )

  doc.setFontSize(
    template ===
      "executive"
      ? 24
      : 22
  )

  doc.text(
    fullName ||
      "Your Name",
    margin,
    y
  )

  y += 9

  doc.setFont(
    getFontFamily(),
    "normal"
  )

  doc.setTextColor(
    80,
    80,
    80
  )

  doc.setFontSize(13)

  doc.text(
    targetRole ||
      "Target Role",
    margin,
    y
  )

  y += 14

  doc.setTextColor(
    0,
    0,
    0
  )

  addSection(
    "Professional Summary",
    summary
  )

  addSection(
    "Experience",
    experience
  )

  addSection(
    "Skills",
    skills
  )

  doc.save(
    `${fullName || "resume"}.pdf`
  )
}
