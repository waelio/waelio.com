// src/theme.ts
var THEME_STORAGE_KEY = "theme";
var DARK_MEDIA_QUERY = "(prefers-color-scheme: dark)";
function systemPrefersDark() {
  return Boolean(globalThis.matchMedia?.(DARK_MEDIA_QUERY).matches);
}
function applyTheme(theme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  if (theme === "dark") {
    document.body.classList.add("dark");
  } else {
    document.body.classList.remove("dark");
  }
  const button = document.getElementById("theme-toggle");
  if (!button) return;
  const isDark = theme === "dark";
  button.setAttribute("aria-pressed", String(isDark));
  button.setAttribute("title", isDark ? "Switch to light mode" : "Switch to dark mode");
  button.innerText = isDark ? "Light" : "Dark";
}
function readStoredTheme() {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return saved === "light" || saved === "dark" ? saved : null;
  } catch {
    return null;
  }
}
function getInitialTheme() {
  return readStoredTheme() ?? (systemPrefersDark() ? "dark" : "light");
}
function toggleTheme() {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  try {
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  } catch {
  }
  applyTheme(nextTheme);
}
var initialTheme = getInitialTheme();
applyTheme(initialTheme);
globalThis.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("theme-toggle");
  button?.addEventListener("click", toggleTheme);
});
var mediaQuery = globalThis.matchMedia?.(DARK_MEDIA_QUERY);
if (mediaQuery) {
  mediaQuery.addEventListener?.("change", (event) => {
    const savedTheme = readStoredTheme();
    if (!savedTheme) {
      applyTheme(event.matches ? "dark" : "light");
    }
  });
}
