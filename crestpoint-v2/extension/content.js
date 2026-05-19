function getMetaContent(selector) {
  return document.querySelector(selector)?.content || ""
}

function detectJob() {
  const title =
    document.querySelector("h1")?.innerText ||
    getMetaContent('meta[property="og:title"]')

  const description =
    document.body.innerText.slice(0, 5000)

  return {
    title,
    description,
    url: window.location.href,
  }
}

window.addEventListener("message", (event) => {
  if (event.data?.type === "CRESTPOINT_GET_JOB") {
    window.postMessage({
      type: "CRESTPOINT_JOB_DATA",
      payload: detectJob(),
    })
  }
})
