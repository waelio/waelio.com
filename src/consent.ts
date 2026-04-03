type ConsentState = 'granted' | 'denied';

const CONSENT_STORAGE_KEY = 'consent';

function getConsent(): ConsentState | null {
    try {
        const value = localStorage.getItem(CONSENT_STORAGE_KEY);
        return value === 'granted' || value === 'denied' ? value : null;
    } catch {
        return null;
    }
}

function setConsent(value: ConsentState): void {
    try {
        localStorage.setItem(CONSENT_STORAGE_KEY, value);
    } catch {
        // Ignore storage failures.
    }
}

function hideBanner(banner: HTMLElement | null): void {
    banner?.parentElement?.removeChild(banner);
}

function createBanner(): HTMLElement {
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

    const declineButton = wrapper.querySelector<HTMLButtonElement>('.decline');
    const acceptButton = wrapper.querySelector<HTMLButtonElement>('.accept');

    declineButton?.addEventListener('click', () => {
        setConsent('denied');
        hideBanner(wrapper);
    });

    acceptButton?.addEventListener('click', () => {
        setConsent('granted');
        hideBanner(wrapper);
        globalThis.dispatchEvent(new CustomEvent('consent:granted'));
    });

    document.body.appendChild(wrapper);
    return wrapper;
}

globalThis.addEventListener('DOMContentLoaded', () => {
    if (!getConsent()) {
        createBanner();
    }
});
