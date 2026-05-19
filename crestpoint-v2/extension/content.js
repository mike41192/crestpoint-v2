function syncCrestpointUserId() {
  const browserAPI = globalThis.browser || globalThis.chrome

  const userIdElement = document.getElementById("crestpoint-user-id")

  if (!userIdElement) return

  const userId = userIdElement.innerText.trim()

  if (!userId || userId === "Loading...") return

  browserAPI.storage.local.set({
    crestpointUserId: userId,
  })
}

setInterval(syncCrestpointUserId, 1000)

function cleanText(value) {
  return (value || "")
    .replace(/\s+/g, " ")
    .replace(/Show more/gi, "")
    .replace(/Show less/gi, "")
    .replace(/Apply now/gi, "")
    .replace(/Save job/gi, "")
    .trim()
}

function getText(selector) {
  const el = document.querySelector(selector)
  return cleanText(el?.innerText || el?.textContent || "")
}

function getMeta(selector) {
  return cleanText(document.querySelector(selector)?.content || "")
}

function firstValidText(selectors) {
  for (const selector of selectors) {
    const value = getText(selector)

    if (value && value.length > 1) {
      return value
    }
  }

  return ""
}

function extractIndeedCompanyFromSubtitle() {
  const subtitle =
    getText('[data-testid="jobsearch-JobInfoHeader-companyName"]') ||
    getText('[data-testid="inlineHeader-companyName"]') ||
    getText(".jobsearch-CompanyInfoContainer") ||
    ""

  return subtitle
    .split("\n")[0]
    .split(" - ")[0]
    .split("•")[0]
    .trim()
}

function extractIndeedLocationFromSubtitle() {
  return (
    getText('[data-testid="job-location"]') ||
    getText('[data-testid="jobsearch-JobInfoHeader-companyLocation"]') ||
    ""
  )
}

function detectIndeedJob() {
  const role = firstValidText([
    '[data-testid="jobsearch-JobInfoHeader-title"]',
    "h1.jobsearch-JobInfoHeader-title",
    "h1",
  ])

  const company =
    extractIndeedCompanyFromSubtitle() ||
    firstValidText([
      '[data-company-name="true"]',
      ".jobsearch-CompanyInfoContainer a",
      ".jobsearch-InlineCompanyRating div",
    ])

  const location = extractIndeedLocationFromSubtitle()

  const description = firstValidText([
    "#jobDescriptionText",
    '[data-testid="jobDescriptionText"]',
    ".jobsearch-jobDescriptionText",
  ])

  return {
    company,
    role,
    location,
    description,
    url: window.location.href,
    source: "indeed",
  }
}

function detectLinkedInJob() {
  const role = firstValidText([
    ".job-details-jobs-unified-top-card__job-title",
    ".jobs-unified-top-card__job-title",
    ".top-card-layout__title",
    "h1",
  ])

  const company = firstValidText([
    ".job-details-jobs-unified-top-card__company-name",
    ".jobs-unified-top-card__company-name",
    ".topcard__org-name-link",
    ".top-card-layout__card .topcard__flavor",
  ])

  const location = firstValidText([
    ".job-details-jobs-unified-top-card__primary-description-container",
    ".jobs-unified-top-card__bullet",
    ".topcard__flavor--bullet",
  ])

  const description = firstValidText([
    ".jobs-description-content__text",
    ".jobs-box__html-content",
    ".description__text",
  ])

  return {
    company,
    role,
    location,
    description,
    url: window.location.href,
    source: "linkedin",
  }
}

function detectGenericJob() {
  const role =
    firstValidText(["h1"]) ||
    getMeta('meta[property="og:title"]') ||
    document.title

  const description =
    firstValidText([
      "main",
      "article",
      '[role="main"]',
    ]) || ""

  return {
    company: "",
    role: cleanText(role) || "Imported Job",
    location: "",
    description: cleanText(description).slice(0, 4000),
    url: window.location.href,
    source: "generic",
  }
}

function detectJobData() {
  const host = window.location.hostname.toLowerCase()

  if (host.includes("indeed.com")) {
    return detectIndeedJob()
  }

  if (host.includes("linkedin.com")) {
    return detectLinkedInJob()
  }

  return detectGenericJob()
}

function createOverlay() {
  if (document.getElementById("crestpoint-save-overlay")) return

  const button = document.createElement("button")

  button.id = "crestpoint-save-overlay"
  button.innerText = "Save to Crestpoint"

  button.style.position = "fixed"
  button.style.right = "20px"
  button.style.bottom = "20px"
  button.style.zIndex = "999999"
  button.style.padding = "14px 18px"
  button.style.borderRadius = "999px"
  button.style.border = "none"
  button.style.background = "linear-gradient(90deg, #8b5cf6, #06b6d4)"
  button.style.color = "white"
  button.style.fontWeight = "700"
  button.style.fontSize = "14px"
  button.style.cursor = "pointer"
  button.style.boxShadow = "0 10px 30px rgba(0,0,0,.35)"

  button.addEventListener("click", async () => {
    const browserAPI = globalThis.browser || globalThis.chrome
    const job = detectJobData()

    if (!job.description || job.description.length < 80) {
      alert(
        "Could not detect a clean job description. Open the full job details page and try again."
      )
      return
    }

    browserAPI.storage.local.get(["crestpointUserId"], async (result) => {
      const userId = result.crestpointUserId

      if (!userId) {
        alert("Open Crestpoint extension popup first so your user ID can sync.")
        return
      }

      button.innerText = "Saving..."

      chrome.runtime.sendMessage(
        {
          type: "CRESTPOINT_SAVE_JOB",
          payload: {
            userId,
            company: job.company,
            role: job.role,
            location: job.location,
            jobUrl: job.url,
            jobDescription: job.description,
            source: job.source,
          },
        },
        (response) => {
          if (!response?.success) {
            button.innerText = "Save Failed"
            alert(response?.error || "Could not save job.")
            return
          }

          button.innerText = "Saved ✓"

          setTimeout(() => {
            button.innerText = "Save to Crestpoint"
          }, 2500)
        }
      )
    })
  })

  document.body.appendChild(button)
}

setTimeout(createOverlay, 1500)

let lastUrl = location.href

setInterval(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href

    const existing = document.getElementById("crestpoint-save-overlay")

    if (existing) {
      existing.remove()
    }

    setTimeout(createOverlay, 1500)
  }
}, 1000)