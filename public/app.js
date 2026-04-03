// src/app.ts
async function loadPackage(name) {
  const [metaRes, dlRes] = await Promise.all([
    fetch(`https://registry.npmjs.org/${encodeURIComponent(name)}`),
    fetch(`https://api.npmjs.org/downloads/point/last-week/${encodeURIComponent(name)}`).catch(() => new Response(JSON.stringify({
      downloads: 0
    }), {
      headers: {
        "content-type": "application/json"
      }
    }))
  ]);
  if (!metaRes.ok) throw new Error(`registry: ${metaRes.status}`);
  const meta = await metaRes.json();
  const dl = dlRes.ok ? await dlRes.json() : {
    downloads: 0
  };
  const distTags = meta["dist-tags"] || {};
  const latest = distTags.latest || Object.keys(meta.versions || {}).pop() || "";
  const v = meta.versions && meta.versions[latest] || {};
  const hasTypes = Boolean(v.types || v.typings);
  const license = v.license || meta.license || "";
  const homepage = v.homepage || meta.homepage || "";
  let repository = v.repository || meta.repository || null;
  if (typeof repository === "string") repository = {
    url: repository
  };
  return {
    name: meta.name || name,
    description: v.description || meta.description || "",
    version: latest,
    homepage,
    repository,
    downloads_week: Number(dl.downloads || 0),
    keywords: Array.isArray(v.keywords) ? v.keywords : Array.isArray(meta.keywords) ? meta.keywords : [],
    license,
    has_types: hasTypes
  };
}
function shieldsName(name) {
  return name.replace(/\//g, "%2F");
}
function appendLinks(container, meta) {
  const addLink = (href, text) => {
    const a = document.createElement("a");
    a.href = href;
    a.target = "_blank";
    a.rel = "noreferrer";
    a.textContent = text;
    return a;
  };
  const items = [];
  if (meta.homepage) items.push(addLink(meta.homepage, "homepage"));
  if (meta.repository && typeof meta.repository === "object" && meta.repository.url) {
    const url = meta.repository.url.replace(/^git\+/, "").replace(/\.git$/, "");
    items.push(addLink(url, "repository"));
  }
  items.push(addLink(`https://www.npmjs.com/package/${encodeURIComponent(meta.name)}`, "npm"));
  container.textContent = "";
  items.forEach((el, i) => {
    if (i > 0) container.appendChild(document.createTextNode(" \xB7 "));
    container.appendChild(el);
  });
}
function appendBadges(container, name, hasTypes) {
  const n = shieldsName(name);
  const defs = [
    { src: `https://img.shields.io/npm/v/${n}?label=version`, alt: "npm version" },
    { src: `https://img.shields.io/npm/dw/${n}`, alt: "weekly downloads" },
    { src: `https://img.shields.io/npm/l/${n}`, alt: "license" },
    ...hasTypes ? [{ src: "https://img.shields.io/badge/types-included-blue?logo=typescript", alt: "types included" }] : []
  ];
  container.textContent = "";
  for (const d of defs) {
    const img = document.createElement("img");
    img.alt = d.alt;
    img.src = d.src;
    container.appendChild(img);
  }
}
function appendTags(container, keywords) {
  container.textContent = "";
  const span = document.createElement("span");
  span.className = "chips";
  for (const k of keywords) {
    const q = encodeURIComponent(`keywords:${k}`);
    const a = document.createElement("a");
    a.className = "chip";
    a.href = `https://www.npmjs.com/search?q=${q}`;
    a.target = "_blank";
    a.rel = "noreferrer";
    a.setAttribute("aria-label", `Search npm for keyword ${k}`);
    a.textContent = `#${k}`;
    span.appendChild(a);
  }
  container.appendChild(span);
}
function setPackageDom(prefix, meta) {
  const get = (id) => document.getElementById(id);
  get(`${prefix}-desc`).textContent = meta.description || "\u2014";
  get(`${prefix}-ver`).textContent = meta.version || "\u2014";
  get(`${prefix}-dl`).textContent = new Intl.NumberFormat().format(meta.downloads_week || 0);
  appendLinks(get(`${prefix}-links`), meta);
  appendBadges(get(`${prefix}-badges`), meta.name, !!meta.has_types);
  if (Array.isArray(meta.keywords) && meta.keywords.length) {
    appendTags(get(`${prefix}-tags`), meta.keywords);
  }
}
async function init() {
  try {
    const meta = await loadPackage("@waelio/messaging");
    setPackageDom("msg", meta);
  } catch (e) {
    const el = document.getElementById("msg-error");
    if (el) el.textContent = e.message || String(e);
  }
  try {
    const meta = await loadPackage("@waelio/ustore");
    setPackageDom("ust", meta);
  } catch (e) {
    const el = document.getElementById("ust-error");
    if (el) el.textContent = e.message || String(e);
  }
  try {
    let util = null;
    try {
      util = await loadPackage("waelio-utils");
    } catch {
    }
    if (!util) {
      try {
        util = await loadPackage("@waelio/utils");
      } catch {
      }
    }
    if (!util) {
      try {
        util = await loadPackage("@waelio/waelio-utils");
      } catch {
      }
    }
    if (util) {
      setPackageDom("util", util);
    } else {
      const el = document.getElementById("util-error");
      if (el) el.textContent = "Package not found on npm";
    }
  } catch (e) {
    const el = document.getElementById("util-error");
    if (el) el.textContent = e.message || String(e);
  }
  if ("serviceWorker" in navigator) {
    self.addEventListener("load", () => {
      navigator.serviceWorker.register("/service-worker.js").catch((err) => {
        console.warn("Service worker registration failed:", err);
      });
    });
  }
}
init();
