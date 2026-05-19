const APP_URL = "https://glowing-spork-q7gx5jjrrp552w6v-3000.app.github.dev"
const browserAPI = globalThis.browser || globalThis.chrome

browserAPI.storage.local.get(["crestpointUserId"], (result) => {
  if (result.crestpointUserId) {
    document.getElementById("userId").value = result.crestpointUserId
  }
})

document.getElementById("saveUser").addEventListener("click", () => {
  const userId = document.getElementById("userId").value.trim()

  browserAPI.storage.local.set({
    crestpointUserId: userId,
  })

  document.getElementById("status").innerText = "User ID saved."
})

document.getElementById("save").addEventListener("click", async () => {
  const [tab] = await browserAPI.tabs.query({
    active: true,
    currentWindow: true,
  })

  const userId = document.getElementById("userId").value.trim()

  browserAPI.storage.local.set({
    crestpointUserId: userId,
  })

  const payload = {
    userId,
    company: document.getElementById("company").value,
    role: document.getElementById("role").value,
    jobDescription: document.getElementById("description").value,
    jobUrl: tab.url,
    source: "manual-extension",
  }

  const res = await fetch(`${APP_URL}/api/jobs/import`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json()

  document.getElementById("status").innerText = res.ok
    ? "Job saved to Crestpoint."
    : data.error || "Import failed."
})