const APP_URL = "https://glowing-spork-q7gx5jjrrp552w6v-3000.app.github.dev/"
const browserAPI = globalThis.browser || globalThis.chrome

document.getElementById("save").addEventListener("click", async () => {
  const [tab] = await browserAPI.tabs.query({ active: true, currentWindow: true })

browserAPI.storage.local.get(["crestpointUserId"], (result) => {
  if (result.crestpointUserId) {
    document.getElementById("userId").value =
      result.crestpointUserId
  }
})

browserAPI.tabs.query(
  { active: true, currentWindow: true },
  (tabs) => {
    browserAPI.scripting.executeScript({
      target: { tabId: tabs[0].id },
      files: ["content.js"],
    })
  }
)

  const payload = {
    userId: document.getElementById("userId").value,
    company: document.getElementById("company").value,
    role: document.getElementById("role").value,
    jobDescription: document.getElementById("description").value,
    jobUrl: tab.url,
  }

browserAPI.storage.local.set({
  crestpointUserId: payload.userId,
})


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