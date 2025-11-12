function readMeta(): string {
    const meta = document.querySelector('meta[name="ga-id"]') as HTMLMetaElement | null;
    if (meta && meta.content && meta.content.trim()) return meta.content.trim();
    return '';
}

function loadGA(id: string): void {
    const gtagScript = document.createElement('script');
    gtagScript.async = true;
    gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
    document.head.appendChild(gtagScript);

    type DataLayer = unknown[];
    interface GAContext { dataLayer?: DataLayer; gtag?: (...args: unknown[]) => void; }
    const ga: GAContext = globalThis as unknown as GAContext;
    ga.dataLayer = ga.dataLayer ?? [];
    function gtag(...args: unknown[]) { ga.dataLayer!.push(args); }
    ga.gtag = gtag;
    gtag('js', new Date());
    gtag('config', id, { anonymize_ip: true });
}

async function init(): Promise<void> {
    let id = readMeta();
    if (!id) {
        try {
            const res = await fetch('/ga.json', { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                if (data && data.gaId) id = String(data.gaId).trim();
            }
        } catch { /* ignore */ }
    }
    if (!id) return;
    loadGA(id);
}

init();
