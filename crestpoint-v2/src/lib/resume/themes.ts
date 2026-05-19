export type ResumeColorTheme =
  | "slate"
  | "cyan"
  | "purple"
  | "emerald"

export type ResumeFontTheme =
  | "modern"
  | "classic"
  | "executive"

export const resumeColorThemes = [
  {
    id: "slate",
    name: "Slate",
    preview: "bg-slate-700",
  },
  {
    id: "cyan",
    name: "Cyan",
    preview: "bg-cyan-500",
  },
  {
    id: "purple",
    name: "Purple",
    preview: "bg-purple-600",
  },
  {
    id: "emerald",
    name: "Emerald",
    preview: "bg-emerald-500",
  },
]

export const resumeFontThemes = [
  {
    id: "modern",
    name: "Modern Sans",
  },
  {
    id: "classic",
    name: "Classic Serif",
  },
  {
    id: "executive",
    name: "Executive",
  },
]
