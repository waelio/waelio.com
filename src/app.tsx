import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import type { ReactNode } from "react";
import { disableWaelioRuntimeCaching } from "./shared/browser-runtime.ts";

type PackageKey = "msg" | "ust" | "util";

type NpmRepository = { url?: string } | null;

interface NpmMeta {
    name: string;
    description?: string;
    version?: string;
    homepage?: string;
    repository?: NpmRepository;
    downloadsWeek?: number;
    keywords?: string[];
    license?: string;
    hasTypes?: boolean;
}

type PackageState =
    | { status: "loading" }
    | { status: "loaded"; meta: NpmMeta }
    | { status: "error"; error: string };

interface PackageDefinition {
    key: PackageKey;
    title: string;
    load: () => Promise<NpmMeta>;
}

const PACKAGE_DEFINITIONS: PackageDefinition[] = [
    {
        key: "msg",
        title: "@waelio/messaging",
        load: () => loadPackage("@waelio/messaging"),
    },
    {
        key: "ust",
        title: "@waelio/ustore",
        load: () => loadPackage("@waelio/ustore"),
    },
    {
        key: "util",
        title: "waelio-utils",
        load: loadPreferredUtilsPackage,
    },
];

const INITIAL_PACKAGE_STATE: Record<PackageKey, PackageState> = {
    msg: { status: "loading" },
    ust: { status: "loading" },
    util: { status: "loading" },
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function readString(record: Record<string, unknown>, key: string): string | undefined {
    const value = record[key];
    return typeof value === "string" ? value : undefined;
}

function readRecord(record: Record<string, unknown>, key: string): Record<string, unknown> | undefined {
    const value = record[key];
    return isRecord(value) ? value : undefined;
}

function readStringArray(record: Record<string, unknown>, key: string): string[] | undefined {
    const value = record[key];
    if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
        return undefined;
    }

    return value;
}

function normalizeRepository(value: unknown): NpmRepository {
    if (typeof value === "string") {
        return { url: value };
    }

    if (isRecord(value)) {
        const url = readString(value, "url");
        return url ? { url } : {};
    }

    return null;
}

async function loadPackage(name: string): Promise<NpmMeta> {
    const [meta, downloads] = await Promise.all([
        fetch(`https://registry.npmjs.org/${encodeURIComponent(name)}`).then(async (response) => {
            if (!response.ok) {
                throw new Error(`registry: ${response.status}`);
            }

            return await response.json() as unknown;
        }),
        fetch(`https://api.npmjs.org/downloads/point/last-week/${encodeURIComponent(name)}`)
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error(`downloads: ${response.status}`);
                }

                return await response.json() as unknown;
            })
            .catch(() => ({ downloads: 0 })),
    ]);

    const metaRecord = isRecord(meta) ? meta : {};
    const downloadsRecord = isRecord(downloads) ? downloads : {};
    const distTags = readRecord(metaRecord, "dist-tags") ?? {};
    const versions = readRecord(metaRecord, "versions") ?? {};
    const latest = readString(distTags, "latest") || Object.keys(versions).pop() || "";
    const versionMeta = readRecord(versions, latest) ?? {};
    const hasTypes = Boolean(versionMeta.types || versionMeta.typings);
    const license = readString(versionMeta, "license") || readString(metaRecord, "license") || "";
    const homepage = readString(versionMeta, "homepage") || readString(metaRecord, "homepage") || "";
    const repository = normalizeRepository(versionMeta.repository ?? metaRecord.repository ?? null);
    const keywords = readStringArray(versionMeta, "keywords") ?? readStringArray(metaRecord, "keywords") ?? [];

    return {
        name: readString(metaRecord, "name") || name,
        description: readString(versionMeta, "description") || readString(metaRecord, "description") || "",
        version: latest,
        homepage,
        repository,
        downloadsWeek: Number(downloadsRecord.downloads ?? 0),
        keywords,
        license,
        hasTypes,
    };
}

async function loadPreferredUtilsPackage(): Promise<NpmMeta> {
    const candidates = ["waelio-utils", "@waelio/utils", "@waelio/waelio-utils"];

    for (const candidate of candidates) {
        try {
            return await loadPackage(candidate);
        } catch {
            // Try the next package name.
        }
    }

    throw new Error("Package not found on npm");
}

function shieldsName(name: string): string {
    return name.replaceAll("/", "%2F");
}

function formatDownloads(downloadsWeek: number | undefined): string {
    return new Intl.NumberFormat().format(downloadsWeek ?? 0);
}

function getRepositoryUrl(repository: NpmRepository | undefined): string | null {
    if (!repository?.url) {
        return null;
    }

    return repository.url.replace(/^git\+/, "").replace(/\.git$/, "");
}

function buildLinks(meta: NpmMeta): Array<{ href: string; label: string }> {
    const links: Array<{ href: string; label: string }> = [];

    if (meta.homepage) {
        links.push({ href: meta.homepage, label: "homepage" });
    }

    const repositoryUrl = getRepositoryUrl(meta.repository);
    if (repositoryUrl) {
        links.push({ href: repositoryUrl, label: "repository" });
    }

    links.push({ href: `https://www.npmjs.com/package/${encodeURIComponent(meta.name)}`, label: "npm" });
    return links;
}

function renderBadges(meta: NpmMeta): ReactNode {
    const safeName = shieldsName(meta.name);
    const badges = [
        {
            alt: "npm version",
            src: `https://img.shields.io/npm/v/${safeName}?label=version`,
        },
        {
            alt: "weekly downloads",
            src: `https://img.shields.io/npm/dw/${safeName}`,
        },
        {
            alt: "license",
            src: `https://img.shields.io/npm/l/${safeName}`,
        },
    ];

    if (meta.hasTypes) {
        badges.push({
            alt: "types included",
            src: "https://img.shields.io/badge/types-included-blue?logo=typescript",
        });
    }

    return badges.map((badge) => (
        <img key={badge.alt} alt={badge.alt} src={badge.src} />
    ));
}

function PackageCard(props: { title: string; state: PackageState }): ReactNode {
    const { state, title } = props;

    if (state.status === "loading") {
        return (
            <div className="card">
                <h2>{title}</h2>
                <div className="muted">Loading…</div>
            </div>
        );
    }

    if (state.status === "error") {
        return (
            <div className="card">
                <h2>{title}</h2>
                <div className="error">{state.error}</div>
            </div>
        );
    }

    const { meta } = state;
    const links = buildLinks(meta);

    return (
        <div className="card">
            <h2>{title}</h2>
            <div className="muted">{meta.description || "—"}</div>
            <div className="row">
                <span className="label">Latest:</span>
                <span className="val">{meta.version || "—"}</span>
            </div>
            <div className="row">
                <span className="label">Last week:</span>
                <span className="val">{formatDownloads(meta.downloadsWeek)}</span>
            </div>
            <div className="row">
                <span className="label">Links:</span>
                <span>
                    {links.map((link, index) => (
                        <span key={link.label}>
                            {index > 0 ? " · " : null}
                            <a href={link.href} target="_blank" rel="noreferrer">{link.label}</a>
                        </span>
                    ))}
                </span>
            </div>
            <div className="badges">{renderBadges(meta)}</div>
            <div className="row">
                <span className="label">Tags:</span>
                <span>
                    {meta.keywords && meta.keywords.length > 0 ? (
                        <span className="chips">
                            {meta.keywords.map((keyword) => (
                                <span key={keyword} className="chip">{keyword}</span>
                            ))}
                        </span>
                    ) : <span className="muted">—</span>}
                </span>
            </div>
        </div>
    );
}

function App(): ReactNode {
    const [packages, setPackages] = useState<Record<PackageKey, PackageState>>(INITIAL_PACKAGE_STATE);

    useEffect(() => {
        let cancelled = false;

        const loadAllPackages = async () => {
            await Promise.all(PACKAGE_DEFINITIONS.map(async (definition) => {
                try {
                    const meta = await definition.load();
                    if (cancelled) {
                        return;
                    }

                    setPackages((current) => ({
                        ...current,
                        [definition.key]: { status: "loaded", meta },
                    }));
                } catch (error) {
                    if (cancelled) {
                        return;
                    }

                    setPackages((current) => ({
                        ...current,
                        [definition.key]: {
                            status: "error",
                            error: error instanceof Error ? error.message : String(error),
                        },
                    }));
                }
            }));
        };

        void disableWaelioRuntimeCaching();
        void loadAllPackages();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <>
            <header>
                <div className="site-branding">
                    <img
                        src="/logo.png?v=20260502"
                        alt="waelio logo"
                        className="brand-lockup brand-lockup-header"
                    />
                    <h1 className="site-title">Package stats</h1>
                </div>
                <div className="header-nav">
                    <span className="muted">Live npm metadata</span>
                    <a href="/private" className="nav-link">🔒 Private</a>
                </div>
            </header>

            <div className="container">
                {PACKAGE_DEFINITIONS.map((definition) => (
                    <PackageCard
                        key={definition.key}
                        title={definition.title}
                        state={packages[definition.key]}
                    />
                ))}
            </div>

            <footer className="site-footer">
                <span className="muted">© 2026 waelio.com</span>
                <div className="footer-links">
                    <a href="/privacy.html">Privacy Policy</a>
                    <a href="/terms.html">Terms of Service</a>
                </div>
            </footer>
        </>
    );
}

const container = document.getElementById("app");
if (!container) {
    throw new Error("Missing app root");
}

createRoot(container).render(<App />);
