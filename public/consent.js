(function(){
  const KEY = 'consent'; // 'granted' | 'denied'

  function getConsent(){
    const v = localStorage.getItem(KEY);
    return v === 'granted' || v === 'denied' ? v : null;
  }

  function setConsent(val){
    try { localStorage.setItem(KEY, val); } catch {}
  }

  function hide(banner){
    banner?.parentElement?.removeChild(banner);
  }

  function createBanner(){
    const wrapper = document.createElement('div');
    wrapper.className = 'consent-banner';
    wrapper.setAttribute('role', 'dialog');
    wrapper.setAttribute('aria-live', 'polite');
    wrapper.setAttribute('aria-label', 'Cookie consent');

    wrapper.innerHTML = `
      <div class="consent-inner">
        <p class="muted">We use analytics (GA4) to improve the site. Do you consent to anonymous usage tracking?</p>
        <div class="consent-actions">
          <button type="button" class="decline">Decline</button>
          <button type="button" class="accept">Allow</button>
        </div>
      </div>
    `;

    const decline = wrapper.querySelector('.decline');
    const accept = wrapper.querySelector('.accept');
    decline?.addEventListener('click', () => {
      setConsent('denied');
      hide(wrapper);
    });
    accept?.addEventListener('click', () => {
      setConsent('granted');
      hide(wrapper);
      const ev = new CustomEvent('consent:granted');
      globalThis.dispatchEvent(ev);
    });

    document.body.appendChild(wrapper);
    return wrapper;
  }

  // Initialize on DOM ready
  globalThis.addEventListener('DOMContentLoaded', () => {
    const state = getConsent();
    if (!state) createBanner();
  });
})();
