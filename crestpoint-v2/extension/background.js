const CRESTPOINT_APP_URL =
  "https://glowing-spork-q7gx5jjrrp552w6v-3000.app.github.dev"

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type !== "CRESTPOINT_SAVE_JOB") return

  fetch(`${CRESTPOINT_APP_URL}/api/jobs/import`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message.payload),
  })
    .then(async (res) => {
      const text = await res.text()

      let data = {}

      try {
        data = JSON.parse(text)
      } catch {
        throw new Error("API returned non-JSON response.")
      }

      if (!res.ok) {
        throw new Error(data.error || `Import failed: ${res.status}`)
      }

      sendResponse({ success: true, data })
    })
    .catch((error) => {
      sendResponse({
        success: false,
        error: error.message || "Could not save job.",
      })
    })

  return true
})