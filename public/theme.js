(function(){
  const KEY = 'theme'; // 'light' | 'dark'

  function systemPrefersDark(){
    return globalThis.matchMedia && globalThis.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function applyTheme(theme){
    const root = document.documentElement;
    root.dataset.theme = theme; // CSS hooks
    if (theme === 'dark') document.body.classList.add('dark'); else document.body.classList.remove('dark');
    // Update button label/icon if present
    const btn = document.getElementById('theme-toggle');
    if (btn) {
      const isDark = theme === 'dark';
      btn.setAttribute('aria-pressed', String(isDark));
      btn.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
      btn.innerText = isDark ? 'Light' : 'Dark';
    }
  }

  function getInitialTheme(){
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch { /* ignore */ }
    return systemPrefersDark() ? 'dark' : 'light';
  }

  function toggleTheme(){
    const next = (document.documentElement.dataset.theme === 'dark') ? 'light' : 'dark';
    try { localStorage.setItem(KEY, next); } catch { /* ignore */ }
    applyTheme(next);
  }

  // Initialize
  const initial = getInitialTheme();
  applyTheme(initial);

  // Bind button
  globalThis.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.addEventListener('click', toggleTheme);
  });

  // React to system changes if user hasn't chosen explicitly
  if (globalThis.matchMedia) {
    const mq = globalThis.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener?.('change', (e) => {
      let saved = null;
      try { saved = localStorage.getItem(KEY); } catch { /* ignore */ }
      if (saved !== 'light' && saved !== 'dark') {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }
})();
