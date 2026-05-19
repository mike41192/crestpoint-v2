import type {
  ResumeAccent,
  ResumeDensity,
  ResumeSectionKey,
  ResumeTemplate,
} from "@/lib/resume/templates"

export type ResumeBuilderState = {
  resumeId: string | null
  versions: any[]

  template: ResumeTemplate
  accent: ResumeAccent
  density: ResumeDensity
  visibleSections: Record<ResumeSectionKey, boolean>

  industryMode: any

  fullName: string
  targetRole: string
  location: string
  email: string
  phone: string
  linkedin: string

  summary: string
  experience: string
  education: string
  skills: string
  certifications: string

  importedResume: string
  jobDescription: string

  matchScore: number | null
  matchedKeywords: string[]
  missingKeywords: string[]
  skillGaps: string[]
  reorderReasoning: string

  status: string
  aiLoading: boolean
  quantifying: boolean
  tailoring: boolean
  reorderLoading: boolean
  importingFile: boolean

  selectedAccent: any
  densityClass: string

  setTemplate: (value: ResumeTemplate) => void
  setAccent: (value: ResumeAccent) => void
  setDensity: (value: ResumeDensity) => void
  setIndustryMode: (value: any) => void

  setFullName: (value: string) => void
  setTargetRole: (value: string) => void
  setLocation: (value: string) => void
  setEmail: (value: string) => void
  setPhone: (value: string) => void
  setLinkedin: (value: string) => void

  setSummary: (value: string) => void
  setExperience: (value: string) => void
  setEducation: (value: string) => void
  setSkills: (value: string) => void
  setCertifications: (value: string) => void

  setImportedResume: (value: string) => void
  setJobDescription: (value: string) => void

  saveResume: () => Promise<void>
  handleResumeFileUpload: (file: File) => Promise<void>
  importResumeText: () => void
  rewriteWithAi: () => Promise<void>
  quantifyExperience: () => Promise<void>
  tailorResumeToJob: () => Promise<void>
  runResumeIntelligence: () => void
  reorderResumeSections: () => Promise<void>
  exportPdf: () => void
  toggleSection: (section: ResumeSectionKey) => void
  restoreVersion: (version: any) => void
  renderLines: (text: string, fallback: string) => React.ReactNode
}