const CRESTPOINT_APP_URL = "https://glowing-spork-q7gx5jjrrp552w6v-3000.app.github.dev"

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
      getText(".job-details-jobs-unified-top-card__primary-description-container") ||
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
    role: title,
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
  button.style.background = "linear-gradient(90deg, #8b5cf6, #06b6d4)"
  button.style.color = "white"
  button.style.fontWeight = "700"
  button.style.fontSize = "14px"
  button.style.cursor = "pointer"
  button.style.boxShadow = "0 10px 30px rgba(0,0,0,.35)"

  button.addEventListener("click", async () => {
    const browserAPI = globalThis.browser || globalThis.chrome
    const job = detectJobData()

    browserAPI.storage.local.get(["crestpointUserId"], async (result) => {
      const userId = result.crestpointUserId

      if (!userId) {
        alert("Open the Crestpoint extension popup and enter your Supabase User ID first.")
        return
      }

      button.innerText = "Saving..."

      try {
        const res = await fetch(`${CRESTPOINT_APP_URL}/api/jobs/import`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            company: job.company,
            role: job.role,
            location: job.location,
            jobUrl: job.url,
            jobDescription: job.description,
            source: job.source,
          }),
        })

        const data = await res.json()

        if (!res.ok) {
          button.innerText = "Save Failed"
          alert(data.error || "Import failed.")
          return
        }

        button.innerText = "Saved ✓"

        setTimeout(() => {
          button.innerText = "Save to Crestpoint"
        }, 2500)
      } catch (error) {
        console.error(error)
        button.innerText = "Save Failed"
        alert("Could not save job.")
      }
    })
  })

  document.body.appendChild(button)
}

setTimeout(createOverlay, 1500)

let lastUrl = location.href

setInterval(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href
    setTimeout(createOverlay, 1500)
  }
}, 1000)