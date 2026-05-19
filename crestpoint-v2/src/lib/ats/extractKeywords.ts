const COMMON_WORDS = [
  "the",
  "and",
  "with",
  "from",
  "that",
  "this",
  "will",
  "have",
  "your",
  "about",
  "their",
  "they",
  "into",
  "using",
  "years",
  "ability",
  "work",
  "team",
  "experience",
  "skills",
  "required",
  "preferred",
]

export function extractKeywords(
  text: string
) {
  const cleaned = text
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s]/g, " ")

  const words = cleaned
    .split(/\s+/)
    .filter(
      (word) =>
        word.length > 3 &&
        !COMMON_WORDS.includes(word)
    )

  const frequency: Record<
    string,
    number
  > = {}

  for (const word of words) {
    frequency[word] =
      (frequency[word] || 0) + 1
  }

  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 25)
    .map(([word]) => word)
}