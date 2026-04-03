/// <reference lib="dom" />

type NpmMeta = {
    name: string;
    description?: string;
    version?: string;
    homepage?: string;
    repository?: { url?: string } | string | null;
    downloads_week?: number;
    keywords?: string[];
    license?: string;
    has_types?: boolean;
};

async function loadPackage(name: string): Promise<NpmMeta> {
    const [meta, downloads] = await Promise.all([
        fetch(`https://registry.npmjs.org/${encodeURIComponent(name)}`).then((response) => {
            if (!response.ok) throw new Error(`registry: ${response.status}`);
            return response.json();
        }),
        fetch(`https://api.npmjs.org/downloads/point/last-week/${encodeURIComponent(name)}`)
            .then((response) => {
                if (!response.ok) throw new Error(`downloads: ${response.status}`);
                return response.json();
            })
            .catch(() => ({ downloads: 0 })),
    ]);

    const distTags = meta['dist-tags'] || {};
    const latest = distTags.latest || Object.keys(meta.versions || {}).pop() || '';
    const versionMeta = (meta.versions && meta.versions[latest]) || {};
    const hasTypes = Boolean(versionMeta.types || versionMeta.typings);
    const license = versionMeta.license || meta.license || '';
    const homepage = versionMeta.homepage || meta.homepage || '';
    let repository: NpmMeta['repository'] = versionMeta.repository || meta.repository || null;
    if (typeof repository === 'string') {
        repository = { url: repository };
    }

    return {
        name: meta.name || name,
        description: versionMeta.description || meta.description || '',
        version: latest,
        homepage,
        repository,
        downloads_week: Number(downloads.downloads || 0),
        keywords: Array.isArray(versionMeta.keywords)
            ? versionMeta.keywords
            : Array.isArray(meta.keywords)
                ? meta.keywords
                : [],
        license,
        has_types: hasTypes,
    };
}

function requireElement(id: string): HTMLElement {
    const element = document.getElementById(id);
    if (!element) throw new Error(`Missing element: ${id}`);
    return element;
}

function linkify(meta: NpmMeta): string {
    const links: string[] = [];

    if (meta.homepage) {
        links.push(`<a href="${meta.homepage}" target="_blank" rel="noreferrer">homepage</a>`);
    }

    if (meta.repository && typeof meta.repository === 'object' && meta.repository.url) {
        const url = meta.repository.url.replace(/^git\+/, '').replace(/\.git$/, '');
        links.push(`<a href="${url}" target="_blank" rel="noreferrer">repository</a>`);
    }

    links.push(`<a href="https://www.npmjs.com/package/${encodeURIComponent(meta.name)}" target="_blank" rel="noreferrer">npm</a>`);
    return links.join(' · ');
}

function shieldsName(name: string): string {
    return name.replace(/\//g, '%2F');
}

function badges(name: string, hasTypes: boolean): string {
    const safeName = shieldsName(name);
    const version = `<img alt="npm version" src="https://img.shields.io/npm/v/${safeName}?label=version">`;
    const downloads = `<img alt="weekly downloads" src="https://img.shields.io/npm/dw/${safeName}">`;
    const license = `<img alt="license" src="https://img.shields.io/npm/l/${safeName}">`;
    const types = hasTypes
        ? '<img alt="types included" src="https://img.shields.io/badge/types-included-blue?logo=typescript">'
        : '';

    return [version, downloads, license, types].filter(Boolean).join('\n');
}

function renderKeywords(id: string, keywords: string[] | undefined): void {
    if (!Array.isArray(keywords) || keywords.length === 0) return;
    requireElement(id).innerHTML = `<span class="chips">${keywords.map((keyword) => `<span class="chip">${keyword}</span>`).join('')}</span>`;
}

function renderPackage(prefix: 'msg' | 'ust' | 'util', meta: NpmMeta): void {
    requireElement(`${prefix}-desc`).textContent = meta.description || '—';
    requireElement(`${prefix}-ver`).textContent = meta.version || '—';
    requireElement(`${prefix}-dl`).textContent = new Intl.NumberFormat().format(meta.downloads_week || 0);
    requireElement(`${prefix}-links`).innerHTML = linkify(meta);
    requireElement(`${prefix}-badges`).innerHTML = badges(meta.name, Boolean(meta.has_types));
    renderKeywords(`${prefix}-tags`, meta.keywords);
}

function renderError(id: string, error: unknown): void {
    requireElement(id).textContent = error instanceof Error ? error.message : String(error);
}

async function loadPreferredUtilsPackage(): Promise<NpmMeta | null> {
    const candidates = ['waelio-utils', '@waelio/utils', '@waelio/waelio-utils'];

    for (const candidate of candidates) {
        try {
            return await loadPackage(candidate);
        } catch {
            // Try the next package name.
        }
    }

    return null;
}

async function init(): Promise<void> {
    try {
        renderPackage('msg', await loadPackage('@waelio/messaging'));
    } catch (error) {
        renderError('msg-error', error);
    }

    try {
        renderPackage('ust', await loadPackage('@waelio/ustore'));
    } catch (error) {
        renderError('ust-error', error);
    }

    try {
        const utilsPackage = await loadPreferredUtilsPackage();
        if (!utilsPackage) {
            requireElement('util-error').textContent = 'Package not found on npm';
        } else {
            renderPackage('util', utilsPackage);
        }
    } catch (error) {
        renderError('util-error', error);
    }

    if ('serviceWorker' in navigator) {
        globalThis.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js').catch((error: unknown) => {
                console.warn('Service worker registration failed:', error);
            });
        });
    }
}

void init();
