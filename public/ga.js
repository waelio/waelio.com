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
async function init() {
  let id = readMeta();
  if (!id) {
    try {
      const res = await fetch("/ga.json", {
        cache: "no-store"
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.gaId) id = String(data.gaId).trim();
      }
    } catch {
    }
  }
  if (!id) return;
  loadGA(id);
}
init();
