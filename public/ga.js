// src/ga.ts
function readMeta() {
  const meta = document.querySelector('meta[name="ga-id"]');
  if (meta && meta.content && meta.content.trim()) return meta.content.trim();
  return "";
}
function loadGA(id) {
  const gtagScript = document.createElement("script");
  gtagScript.async = true;
  gtagScript.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
  document.head.appendChild(gtagScript);
  const ga = globalThis;
  ga.dataLayer = ga.dataLayer ?? [];
  function gtag(...args) {
    ga.dataLayer.push(args);
  }
  ga.gtag = gtag;
  gtag("js", /* @__PURE__ */ new Date());
  gtag("config", id, {
    anonymize_ip: true
  });
}
function consentGranted() {
  try {
    return localStorage.getItem("consent") === "granted";
  } catch {
    return false;
  }
}
var state = {
  id: "",
  loaded: false
};
function maybeInit() {
  if (state.loaded) return;
  if (!state.id) return;
  if (!consentGranted()) return;
  loadGA(state.id);
  state.loaded = true;
}
async function init() {
  state.id = readMeta();
  if (!state.id) {
    try {
      const res = await fetch("/ga.json", {
        cache: "no-store"
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.gaId) state.id = String(data.gaId).trim();
      }
    } catch {
    }
  }
  if (!state.id) return;
  maybeInit();
}
init();
globalThis.addEventListener("consent:granted", () => maybeInit());
