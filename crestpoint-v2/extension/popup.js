const APP_URL =
  "https://glowing-spork-q7gx5jjrrp552w6v-3000.app.github.dev"

const browserAPI = globalThis.browser || globalThis.chrome

browserAPI.storage.local.get(["crestpointUserId"], (result) => {
  if (result.crestpointUserId) {
    document.getElementById("userId").value = result.crestpointUserId
    document.getElementById("status").innerText =
      "User ID auto-filled from Crestpoint."
  }
})