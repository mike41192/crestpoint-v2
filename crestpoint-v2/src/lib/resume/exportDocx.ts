import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
} from "docx"

import { saveAs } from "file-saver"

import { ResumeTemplate } from "@/lib/resume/templates"
import {
  ResumeColorTheme,
  ResumeFontTheme,
} from "@/lib/resume/themes"

type ExportResumeDocxProps = {
  fullName: string
  targetRole: string
  summary: string
  experience: string
  skills: string
  template?: ResumeTemplate
  colorTheme?: ResumeColorTheme
  fontTheme?: ResumeFontTheme
}

function getThemeColor(colorTheme: ResumeColorTheme = "slate") {
  const colors = {
    slate: "334155",
    cyan: "06B6D4",
    purple: "9333EA",
    emerald: "10B981",
  }

  return colors[colorTheme]
}

function getFont(fontTheme: ResumeFontTheme = "modern") {
  if (fontTheme === "classic") return "Times New Roman"
  if (fontTheme === "executive") return "Georgia"
  return "Arial"
}

export async function exportResumeDocx({
  fullName,
  targetRole,
  summary,
  experience,
  skills,
  template = "classic",
  colorTheme = "slate",
  fontTheme = "modern",
}: ExportResumeDocxProps) {
  const accent = getThemeColor(colorTheme)
  const font = getFont(fontTheme)

  const sectionBorder =
    template === "modern" ||
    template === "executive" ||
    template === "premiumSidebar" ||
    template === "premiumMinimal"

  function section(title: string, body: string) {
    return [
      new Paragraph({
        spacing: { before: 300, after: 120 },
        border: sectionBorder
          ? {
              bottom: {
                color: accent,
                style: BorderStyle.SINGLE,
                size: 6,
              },
            }
          : undefined,
        children: [
          new TextRun({
            text: title.toUpperCase(),
            bold: true,
            color: accent,
            size: 24,
            font,
          }),
        ],
      }),

      new Paragraph({
        spacing: { after: 180 },
        children: [
          new TextRun({
            text: body || "Not provided.",
            size: 22,
            font,
          }),
        ],
      }),
    ]
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            alignment: AlignmentType.LEFT,
            heading: HeadingLevel.TITLE,
            children: [
              new TextRun({
                text: fullName || "Your Name",
                bold: true,
                size: 40,
                color: accent,
                font,
              }),
            ],
          }),

          new Paragraph({
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: targetRole || "Target Role",
                size: 24,
                color: "4B5563",
                font,
              }),
            ],
          }),

          ...section("Professional Summary", summary),
          ...section("Experience", experience),
          ...section("Skills", skills),
        ],
      },
    ],
  })

  const blob = await Packer.toBlob(doc)

  saveAs(blob, `${fullName || "resume"}.docx`)
}
