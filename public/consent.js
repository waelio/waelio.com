// src/consent.ts
var CONSENT_STORAGE_KEY = "consent";
function getConsent() {
  try {
    const value = localStorage.getItem(CONSENT_STORAGE_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}
function setConsent(value) {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, value);
  } catch {
  }
}
function hideBanner(banner) {
  banner?.parentElement?.removeChild(banner);
}
function createBanner() {
  const wrapper = document.createElement("div");
  wrapper.className = "consent-banner";
  wrapper.setAttribute("role", "dialog");
  wrapper.setAttribute("aria-live", "polite");
  wrapper.setAttribute("aria-label", "Cookie consent");
  wrapper.innerHTML = `
      <div class="consent-inner">
        <p class="muted">We use analytics (GA4) to improve the site. Do you consent to anonymous usage tracking?</p>
        <div class="consent-actions">
          <button type="button" class="decline">Decline</button>
          <button type="button" class="accept">Allow</button>
        </div>
      </div>
    `;
  const declineButton = wrapper.querySelector(".decline");
  const acceptButton = wrapper.querySelector(".accept");
  declineButton?.addEventListener("click", () => {
    setConsent("denied");
    hideBanner(wrapper);
  });
  acceptButton?.addEventListener("click", () => {
    setConsent("granted");
    hideBanner(wrapper);
    globalThis.dispatchEvent(new CustomEvent("consent:granted"));
  });
  document.body.appendChild(wrapper);
  return wrapper;
}
globalThis.addEventListener("DOMContentLoaded", () => {
  if (!getConsent()) {
    createBanner();
  }
});
