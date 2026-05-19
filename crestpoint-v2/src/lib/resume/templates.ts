export type ResumeTemplate =
  | "classic"
  | "modern"
  | "executive"
  | "premiumSidebar"
  | "premiumMinimal"

export const resumeTemplates = [
  {
    id: "classic",
    name: "Classic",
    pro: false,
  },
  {
    id: "modern",
    name: "Modern",
    pro: false,
  },
  {
    id: "executive",
    name: "Executive",
    pro: false,
  },
  {
    id: "premiumSidebar",
    name: "Premium Sidebar",
    pro: true,
  },
  {
    id: "premiumMinimal",
    name: "Premium Minimal",
    pro: true,
  },
] as const
