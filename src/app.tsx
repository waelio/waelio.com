import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import type { ReactNode } from "react";
import { disableWaelioRuntimeCaching } from "./shared/browser-runtime.ts";
import { useThemeMode } from "./shared/theme.ts";

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
    key: string;
    title: string;
    load: () => Promise<NpmMeta>;
}

const NPM_MAINTAINER = "waelio";

const FALLBACK_PACKAGE_NAMES = [
    "@waelio/agent",
    "@waelio/cli",
    "@waelio/data",
    "@waelio/messaging",
    "@waelio/ustore",
    "@waelio/utils",
    "quasar-app-extension-waelio",
    "waelio-utils",
];

const LOADING_PACKAGE_STATE: PackageState = { status: "loading" };

function buildPackageDefinitions(names: string[]): PackageDefinition[] {
    const seen = new Set<string>();

    return names.flatMap((name) => {
        const normalizedName = name.trim();
        if (!normalizedName || seen.has(normalizedName)) {
            return [];
        }

        seen.add(normalizedName);
        return [{
            key: normalizedName,
            title: normalizedName,
            load: () => loadPackage(normalizedName),
        }];
    });
}

const FALLBACK_PACKAGE_DEFINITIONS = buildPackageDefinitions(FALLBACK_PACKAGE_NAMES);

function buildInitialPackageState(definitions: PackageDefinition[]): Record<string, PackageState> {
    return Object.fromEntries(definitions.map(({ key }) => [key, LOADING_PACKAGE_STATE])) as Record<string, PackageState>;
}

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

async function loadMaintainerPackageNames(maintainer: string): Promise<string[]> {
    const response = await fetch(
        `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(`maintainer:${maintainer}`)}&size=250`,
    );

    if (!response.ok) {
        throw new Error(`maintainer search: ${response.status}`);
    }

    const payload = await response.json() as unknown;
    const payloadRecord = isRecord(payload) ? payload : {};
    const objects = Array.isArray(payloadRecord.objects) ? payloadRecord.objects : [];
    const names = objects
        .map((entry) => {
            if (!isRecord(entry)) {
                return undefined;
            }

            const packageRecord = readRecord(entry, "package");
            return packageRecord ? readString(packageRecord, "name") : undefined;
        })
        .filter((name): name is string => Boolean(name));

    const uniqueNames = [...new Set(names)];
    if (uniqueNames.length === 0) {
        throw new Error(`No npm packages found for ${maintainer}`);
    }

    return uniqueNames;
}

function shieldsName(name: string): string {
    return name.replaceAll("/", "%2F");
}

function formatDownloads(downloadsWeek: number | undefined): string {
    return new Intl.NumberFormat().format(downloadsWeek ?? 0);
}

function isLoadedPackageState(state: PackageState): state is Extract<PackageState, { status: "loaded" }> {
    return state.status === "loaded";
}

function isErrorPackageState(state: PackageState): state is Extract<PackageState, { status: "error" }> {
    return state.status === "error";
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
    const [copied, setCopied] = useState(false);

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
    const installCmd = `npm i ${meta.name}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(installCmd).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }).catch(() => {
            // fallback or ignore
        });
    };

    return (
        <div className="card">
            <h2>{title}</h2>
            <div className="muted">{meta.description || "—"}</div>
            
            <div className="row" style={{ marginTop: "1.25rem", marginBottom: "1.5rem", width: "100%" }}>
                <div style={{ 
                    display: "flex", 
                    width: "100%", 
                    justifyContent: "space-between", 
                    alignItems: "center", 
                    background: "var(--wa-surface-soft)", 
                    border: "1px solid var(--wa-border-strong)", 
                    borderRadius: "12px", 
                    padding: "0.5rem 0.5rem 0.5rem 1.25rem",
                    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)"
                }}>
                    <code style={{ fontFamily: "monospace", fontSize: "0.95rem", color: "var(--wa-accent-strong)", fontWeight: 600 }}>
                        {installCmd}
                    </code>
                    <button 
                        onClick={handleCopy} 
                        className="btn-outline"
                        style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.4rem 0.8rem", borderRadius: "8px", border: "1px solid var(--wa-outline-border)" }}
                        title="Copy to clipboard"
                    >
                        {copied ? "✅ Copied" : "📋 Copy"}
                    </button>
                </div>
            </div>

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

function DownloadsSummary(props: {
    packageDefinitions: PackageDefinition[];
    packages: Record<string, PackageState>;
}): ReactNode {
    const states = props.packageDefinitions.map((definition) => props.packages[definition.key] ?? LOADING_PACKAGE_STATE);
    const loadedStates = states.filter(isLoadedPackageState);
    const errorCount = states.filter(isErrorPackageState).length;
    const totalWeeklyDownloads = loadedStates.reduce(
        (sum, state) => sum + (state.meta.downloadsWeek ?? 0),
        0,
    );
    const allLoaded = loadedStates.length === props.packageDefinitions.length;
    const caption = allLoaded
        ? `${props.packageDefinitions.length} packages counted from npm last week`
        : `${loadedStates.length}/${props.packageDefinitions.length} packages loaded so far`;
    const meta = errorCount > 0
        ? `${errorCount} package${errorCount === 1 ? "" : "s"} could not be loaded right now.`
        : "Live total based on the package cards below.";

    return (
        <section className="summary-card" aria-label="Total downloads summary">
            <div className="summary-eyebrow">Combined downloads</div>
            <div className="summary-value">
                {loadedStates.length > 0 ? formatDownloads(totalWeeklyDownloads) : "Loading…"}
            </div>
            <div className="summary-caption">Weekly npm downloads across your packages</div>
            <div className="summary-meta">{caption} · {meta}</div>
        </section>
    );
}

function HeroIntro(): ReactNode {
    return (
        <section className="hero-card" aria-label="Homepage introduction">
            <div className="hero-eyebrow">Built for developers like me</div>
            <h2 className="hero-title">Built with love to help developers like me save time.</h2>
            <p className="hero-description">
                Practical npm packages, live stats, and small tools I actually reach for when shipping things.
            </p>
            <div className="hero-note">Made with love for developers who just want to ship.</div>
        </section>
    );
}

function App(): ReactNode {
    const path = window.location.pathname;
    const extractedName = decodeURIComponent(path.replace(/^\/packages\/?/, "").replace(/\/$/, ""));
    const isPackageRoute = path.startsWith("/packages/") && extractedName.length > 0;
    const specificPackageName = isPackageRoute ? extractedName : null;

    const initialDefinitions = specificPackageName 
        ? buildPackageDefinitions([specificPackageName]) 
        : FALLBACK_PACKAGE_DEFINITIONS;

    const [packageDefinitions, setPackageDefinitions] = useState<PackageDefinition[]>(initialDefinitions);
    const [packages, setPackages] = useState<Record<string, PackageState>>(() => (
        buildInitialPackageState(initialDefinitions)
    ));
    const { theme, setTheme, themeOptions } = useThemeMode();

    useEffect(() => {
        let cancelled = false;

        const loadAllPackages = async () => {
            let definitions = specificPackageName 
                ? buildPackageDefinitions([specificPackageName]) 
                : FALLBACK_PACKAGE_DEFINITIONS;

            if (!specificPackageName) {
                try {
                    const maintainerPackageNames = await loadMaintainerPackageNames(NPM_MAINTAINER);
                    definitions = buildPackageDefinitions(maintainerPackageNames);
                } catch {
                    // Keep the fallback list if npm maintainer search is unavailable.
                }
            }

            if (cancelled) {
                return;
            }

            setPackageDefinitions(definitions);
            setPackages(buildInitialPackageState(definitions));

            await Promise.all(definitions.map(async (definition) => {
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
                    <a href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none", color: "inherit" }}>
                        <img
                            src="/logo.png?v=20260502"
                            alt="waelio logo"
                            className="brand-lockup brand-lockup-header"
                        />
                        <h1 className="site-title">Package stats</h1>
                    </a>
                </div>
                <div className="header-nav">
                    <span className="muted">
                        {isPackageRoute ? (
                            <a href="/" className="nav-link">← All packages</a>
                        ) : (
                            `${packageDefinitions.length} npm packages · live metadata`
                        )}
                    </span>
                    <div className="theme-switcher" role="group" aria-label="Choose theme">
                        {themeOptions.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                className={theme === option.value ? "theme-option theme-option-active" : "theme-option"}
                                aria-pressed={theme === option.value}
                                onClick={() => {
                                    setTheme(option.value);
                                }}
                            >
                                <span className="theme-option-icon" aria-hidden="true">{option.icon}</span>
                                <span>{option.label}</span>
                            </button>
                        ))}
                    </div>
                    <a href="/private" className="nav-link">🔒 Private</a>
                </div>
            </header>

            <div className="page-shell">
                {!isPackageRoute && (
                    <>
                        <HeroIntro />
                        <DownloadsSummary packageDefinitions={packageDefinitions} packages={packages} />
                    </>
                )}
            </div>

            <div className="container">
                {packageDefinitions.map((definition) => (
                    <PackageCard
                        key={definition.key}
                        title={definition.title}
                        state={packages[definition.key] ?? LOADING_PACKAGE_STATE}
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
