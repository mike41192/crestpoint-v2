export type AtsResult = {
  score: number
  matchedKeywords: string[]
  missingKeywords: string[]
  checks: {
    label: string
    passed: boolean
  }[]
  recommendations: string[]
}

export function scoreResume({
  resumeText,
  jobDescription,
}: {
  resumeText: string
  jobDescription: string
}): AtsResult {
  const resume =
    resumeText.toLowerCase()

  const job =
    jobDescription.toLowerCase()

  const words =
    Array.from(
      new Set(
        job
          .replace(/[^a-zA-Z0-9\s]/g, "")
          .split(/\s+/)
          .filter((word) => word.length > 4)
      )
    )

  const importantKeywords =
    words.slice(0, 30)

  const matchedKeywords =
    importantKeywords.filter((word) =>
      resume.includes(word)
    )

  const missingKeywords =
    importantKeywords.filter((word) =>
      !resume.includes(word)
    )

  const checks = [
    {
      label: "Includes professional summary",
      passed:
        resume.includes("summary") ||
        resume.length > 250,
    },
    {
      label: "Includes experience details",
      passed:
        resume.includes("experience") ||
        resume.includes("work"),
    },
    {
      label: "Includes skills section",
      passed:
        resume.includes("skills") ||
        resume.includes("technologies"),
    },
    {
      label: "Uses measurable detail",
      passed: /\d/.test(resume),
    },
  ]

  const keywordScore =
    importantKeywords.length === 0
      ? 0
      : Math.round(
          (matchedKeywords.length /
            importantKeywords.length) *
            60
        )

  const structureScore =
    checks.filter((check) => check.passed).length * 10

  const score =
    Math.min(100, keywordScore + structureScore)

  const recommendations = [
    missingKeywords.length > 0
      ? "Add more relevant keywords from the job description."
      : "Strong keyword alignment.",
    !/\d/.test(resume)
      ? "Add measurable achievements such as percentages, dollar amounts, or counts."
      : "Good use of measurable detail.",
    score < 75
      ? "Improve section structure and job-description alignment before applying."
      : "Resume is reasonably aligned for this job description.",
  ]

  return {
    score,
    matchedKeywords,
    missingKeywords,
    checks,
    recommendations,
  }
}