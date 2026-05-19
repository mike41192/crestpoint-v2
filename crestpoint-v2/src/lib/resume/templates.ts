export type ResumeTemplate =
  | "professional"
  | "minimalAts"
  | "executive"
  | "technical"
  | "skilledTrades"
  | "healthcare"
  | "operations"
  | "modernSidebar"

export type ResumeAccent =
  | "slate"
  | "blue"
  | "emerald"
  | "purple"
  | "amber"

export type ResumeDensity =
  | "compact"
  | "standard"
  | "spacious"

export type ResumeSectionKey =
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "certifications"

export const resumeTemplates = [
  {
    id: "professional",
    name: "Professional Header",
    description: "Classic recruiter-safe format with centered name and bold dividers.",
    bestFor: "General business, admin, professional roles",
  },
  {
    id: "minimalAts",
    name: "Minimal ATS",
    description: "Plain, clean layout optimized for ATS parsing and readability.",
    bestFor: "Online applications and high-volume job boards",
  },
  {
    id: "executive",
    name: "Executive Bold",
    description: "Strong header and premium spacing for leadership positioning.",
    bestFor: "Management, director, executive roles",
  },
  {
    id: "technical",
    name: "Technical Engineer",
    description: "Skills-forward layout for technical, software, and systems roles.",
    bestFor: "Engineering, IT, data, technical operations",
  },
  {
    id: "skilledTrades",
    name: "Skilled Trades",
    description: "Practical layout built for maintenance, manufacturing, and technician resumes.",
    bestFor: "Maintenance, mechanic, manufacturing, facilities",
  },
  {
    id: "healthcare",
    name: "Healthcare Professional",
    description: "Credential-aware layout for clinical and healthcare operations roles.",
    bestFor: "Healthcare, patient care, compliance, medical admin",
  },
  {
    id: "operations",
    name: "Operations Manager",
    description: "Process, people, and performance focused layout.",
    bestFor: "Operations, logistics, supervisors, managers",
  },
  {
    id: "modernSidebar",
    name: "Modern Sidebar",
    description: "Modern two-column feel with strong visual hierarchy.",
    bestFor: "Premium modern applications and portfolio-style resumes",
  },
] as const

export const resumeAccents = [
  { id: "slate", name: "Slate", border: "border-slate-700", text: "text-slate-900", bg: "bg-slate-700" },
  { id: "blue", name: "Blue", border: "border-blue-600", text: "text-blue-700", bg: "bg-blue-600" },
  { id: "emerald", name: "Emerald", border: "border-emerald-600", text: "text-emerald-700", bg: "bg-emerald-600" },
  { id: "purple", name: "Purple", border: "border-purple-600", text: "text-purple-700", bg: "bg-purple-600" },
  { id: "amber", name: "Amber", border: "border-amber-600", text: "text-amber-700", bg: "bg-amber-600" },
] as const

export const resumeDensities = [
  { id: "compact", name: "Compact" },
  { id: "standard", name: "Standard" },
  { id: "spacious", name: "Spacious" },
] as const

export const defaultVisibleSections: Record<ResumeSectionKey, boolean> = {
  summary: true,
  experience: true,
  education: true,
  skills: true,
  certifications: true,
}