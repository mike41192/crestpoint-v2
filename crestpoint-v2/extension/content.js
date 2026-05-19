const CRESTPOINT_APP_URL =
  "https://glowing-spork-q7gx5jjrrp552w6v-3000.app.github.dev"

function syncCrestpointUserId() {
  const browserAPI = globalThis.browser || globalThis.chrome

  const userIdElement = document.getElementById("crestpoint-user-id")

  if (!userIdElement) return

  const userId = userIdElement.innerText.trim()

  if (!userId || userId === "Loading...") return

  browserAPI.storage.local.set({
    crestpointUserId: userId,
  })

  console.log("Crestpoint User ID synced:", userId)
}

setInterval(syncCrestpointUserId, 1000)

function getText(selector) {
  return document.querySelector(selector)?.innerText?.trim() || ""
}

function getMeta(selector) {
  return document.querySelector(selector)?.content?.trim() || ""
}

function detectLinkedInJob() {
  return {
    company:
      getText(".job-details-jobs-unified-top-card__company-name") ||
      getText(".jobs-unified-top-card__company-name") ||
      "",

    role:
      getText(".job-details-jobs-unified-top-card__job-title") ||
      getText(".jobs-unified-top-card__job-title") ||
      document.querySelector("h1")?.innerText?.trim() ||
      "",

    location:
      getText(
        ".job-details-jobs-unified-top-card__primary-description-container"
      ) ||
      getText(".jobs-unified-top-card__bullet") ||
      "",

    description:
      getText(".jobs-description-content__text") ||
      getText(".jobs-box__html-content") ||
      document.body.innerText.slice(0, 5000),

    url: window.location.href,

    source: "linkedin",
  }
}

function detectIndeedJob() {
  return {
    company:
      getText('[data-testid="inlineHeader-companyName"]') ||
      getText(".jobsearch-CompanyInfoContainer a") ||
      "",

    role:
      getText('[data-testid="jobsearch-JobInfoHeader-title"]') ||
      document.querySelector("h1")?.innerText?.trim() ||
      "",

    location:
      getText('[data-testid="job-location"]') ||
      getText(".jobsearch-JobInfoHeader-subtitle") ||
      "",

    description:
      getText("#jobDescriptionText") ||
      document.body.innerText.slice(0, 5000),

    url: window.location.href,

    source: "indeed",
  }
}

function detectGenericJob() {
  const title =
    document.querySelector("h1")?.innerText?.trim() ||
    getMeta('meta[property="og:title"]') ||
    document.title

  return {
    company: "",

    role: title || "Imported Job",

    location: "",

    description: document.body.innerText.slice(0, 5000),

    url: window.location.href,

    source: "generic",
  }
}

function detectJobData() {
  const host = window.location.hostname.toLowerCase()

  if (host.includes("linkedin.com")) {
    return detectLinkedInJob()
  }

  if (host.includes("indeed.com")) {
    return detectIndeedJob()
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
  button.style.background =
    "linear-gradient(90deg, #8b5cf6, #06b6d4)"
  button.style.color = "white"
  button.style.fontWeight = "700"
  button.style.fontSize = "14px"
  button.style.cursor = "pointer"
  button.style.boxShadow =
    "0 10px 30px rgba(0,0,0,.35)"

  button.addEventListener("click", async () => {
    const browserAPI =
      globalThis.browser || globalThis.chrome

    const job = detectJobData()

    browserAPI.storage.local.get(
      ["crestpointUserId"],
      async (result) => {
        const userId = result.crestpointUserId

        if (!userId) {
          alert(
            "Open Crestpoint extension popup first so your user ID can sync."
          )

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

              alert(
                response?.error ||
                  "Could not save job."
              )

              return
            }

            button.innerText = "Saved ✓"

            setTimeout(() => {
              button.innerText =
                "Save to Crestpoint"
            }, 2500)
          }
        )
      }
    )
  })

  document.body.appendChild(button)
}

setTimeout(createOverlay, 1500)

let lastUrl = location.href

setInterval(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href

    const existing = document.getElementById(
      "crestpoint-save-overlay"
    )

    if (existing) {
      existing.remove()
    }

    setTimeout(createOverlay, 1500)
  }
}, 1000)