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

type NpmRepository = Exclude<NpmMeta['repository'], undefined>;

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function readString(record: Record<string, unknown>, key: string): string | undefined {
    const value = record[key];
    return typeof value === 'string' ? value : undefined;
}

function readRecord(record: Record<string, unknown>, key: string): Record<string, unknown> | undefined {
    const value = record[key];
    return isRecord(value) ? value : undefined;
}

function readStringArray(record: Record<string, unknown>, key: string): string[] | undefined {
    const value = record[key];
    if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
        return undefined;
    }

    return value;
}

function normalizeRepository(value: unknown): NpmRepository {
    if (typeof value === 'string') {
        return { url: value };
    }

    if (isRecord(value)) {
        const url = readString(value, 'url');
        return url ? { url } : {};
    }

    return null;
}

async function loadPackage(name: string): Promise<NpmMeta> {
    const [meta, downloads] = await Promise.all([
        fetch(`https://registry.npmjs.org/${encodeURIComponent(name)}`).then((response) => {
            if (!response.ok) throw new Error(`registry: ${response.status}`);
            return response.json() as Promise<unknown>;
        }),
        fetch(`https://api.npmjs.org/downloads/point/last-week/${encodeURIComponent(name)}`)
            .then((response) => {
                if (!response.ok) throw new Error(`downloads: ${response.status}`);
                return response.json() as Promise<unknown>;
            })
            .catch(() => ({ downloads: 0 })),
    ]);

    const metaRecord = isRecord(meta) ? meta : {};
    const downloadsRecord = isRecord(downloads) ? downloads : {};
    const distTags = readRecord(metaRecord, 'dist-tags') ?? {};
    const versions = readRecord(metaRecord, 'versions') ?? {};
    const latest = readString(distTags, 'latest') || Object.keys(versions).pop() || '';
    const versionMeta = readRecord(versions, latest) ?? {};
    const hasTypes = Boolean(versionMeta.types || versionMeta.typings);
    const license = readString(versionMeta, 'license') || readString(metaRecord, 'license') || '';
    const homepage = readString(versionMeta, 'homepage') || readString(metaRecord, 'homepage') || '';
    const repository = normalizeRepository(versionMeta.repository ?? metaRecord.repository ?? null);
    const keywords = readStringArray(versionMeta, 'keywords') ?? readStringArray(metaRecord, 'keywords') ?? [];

    return {
        name: readString(metaRecord, 'name') || name,
        description: readString(versionMeta, 'description') || readString(metaRecord, 'description') || '',
        version: latest,
        homepage,
        repository,
        downloads_week: Number(downloadsRecord.downloads ?? 0),
        keywords,
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
            navigator.serviceWorker.register('/service-worker.js').catch(() => {
                // Logging disabled.
            });
        });
    }
}

void init();
