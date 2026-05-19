export type IndustryMode =
  | "general"
  | "technology"
  | "healthcare"
  | "finance"
  | "sales"
  | "operations"
  | "executive"

const stopWords = [
  "the", "and", "for", "with", "you", "your", "are", "that", "this",
  "from", "have", "will", "our", "they", "their", "experience", "work",
  "team", "skills", "role", "job", "required", "preferred"
]

export function extractResumeKeywords(text: string) {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3 && !stopWords.includes(word))

  const counts: Record<string, number> = {}

  for (const word of words) {
    counts[word] = (counts[word] || 0) + 1
  }

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 35)
    .map(([word]) => word)
}

export function calculateJobMatch({
  resumeText,
  jobDescription,
}: {
  resumeText: string
  jobDescription: string
}) {
  const resume = resumeText.toLowerCase()
  const keywords = extractResumeKeywords(jobDescription)

  const matched = keywords.filter((word) => resume.includes(word))
  const missing = keywords.filter((word) => !resume.includes(word))

  const score =
    keywords.length === 0
      ? 0
      : Math.round((matched.length / keywords.length) * 100)

  return {
    score,
    matched,
    missing,
    keywords,
  }
}

export function detectSkillGaps({
  resumeText,
  jobDescription,
}: {
  resumeText: string
  jobDescription: string
}) {
  const result = calculateJobMatch({
    resumeText,
    jobDescription,
  })

  return result.missing.slice(0, 20)
}

export function getIndustrySuggestions(mode: IndustryMode) {
  const suggestions: Record<IndustryMode, string[]> = {
    general: [
      "Use clear measurable outcomes.",
      "Prioritize recent relevant experience.",
      "Match job description language naturally.",
    ],
    technology: [
      "Highlight tools, systems, frameworks, and technical outcomes.",
      "Show project impact, automation, scalability, or reliability improvements.",
      "Include technical skills in a clean keyword section.",
    ],
    healthcare: [
      "Emphasize compliance, patient care, accuracy, and documentation.",
      "Highlight certifications and regulated workflows.",
      "Use clear clinical or operational impact language.",
    ],
    finance: [
      "Emphasize accuracy, reporting, forecasting, risk, and financial impact.",
      "Highlight tools, reconciliations, analysis, and process controls.",
      "Include measurable cost, revenue, or efficiency language when truthful.",
    ],
    sales: [
      "Lead with revenue, pipeline, conversion, retention, and client growth.",
      "Use quota, territory, CRM, negotiation, and prospecting language.",
      "Show business development impact.",
    ],
    operations: [
      "Emphasize process improvement, efficiency, logistics, compliance, and teams.",
      "Show measurable reductions in time, cost, errors, or bottlenecks.",
      "Highlight cross-functional coordination.",
    ],
    executive: [
      "Lead with strategic impact, leadership scope, revenue, growth, and transformation.",
      "Prioritize board-level, enterprise, and operational outcomes.",
      "Use concise achievement-driven language.",
    ],
  }

  return suggestions[mode]
}