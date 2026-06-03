import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import type { ReactNode } from "react";
import { useThemeMode } from "./shared/theme.ts";
import { ReadmeMarkdown } from "./readme-markdown.tsx";

/* ── Package Registry ────────────────────────────────── */

interface PackageDef {
    name: string;
    slug: string;
    tagline: string;
    category: "core" | "storage" | "framework" | "tooling";
    icon: string;
}

const PACKAGES: PackageDef[] = [
    { name: "@waelio/utils", slug: "utils", tagline: "Utilities for config, storage & notifications", category: "core", icon: "🛠️" },
    { name: "waelio-utils", slug: "waelio-utils", tagline: "50+ pure JS/TS utility functions", category: "core", icon: "⚡" },
    { name: "@waelio/ustore", slug: "ustore", tagline: "Universal Storage — 13 storage backends", category: "storage", icon: "🗄️" },
    { name: "@waelio/cli", slug: "cli", tagline: "CLI for building siteforge websites", category: "tooling", icon: "💻" },
    { name: "@waelio/data", slug: "data", tagline: "Shared data structures and constants", category: "core", icon: "📦" },
    { name: "@waelio/agent", slug: "agent", tagline: "AI agent integration layer", category: "tooling", icon: "🤖" },
    { name: "@waelio/messaging", slug: "messaging", tagline: "Cross-context messaging system", category: "core", icon: "📡" },
    { name: "@waelio/sync", slug: "sync", tagline: "Real-time data synchronization", category: "core", icon: "🔄" },
    { name: "quasar-app-extension-waelio", slug: "quasar-ext", tagline: "Quasar framework extension", category: "framework", icon: "🎯" },
];

const CATEGORIES: Record<string, { label: string; icon: string }> = {
    core: { label: "Core", icon: "⚙️" },
    storage: { label: "Storage", icon: "💾" },
    framework: { label: "Framework", icon: "🏗️" },
    tooling: { label: "Tooling", icon: "🔧" },
};

/* ── API Reference Data ──────────────────────────────── */

interface ApiEntry {
    name: string;
    description: string;
    category: string;
}

const WAELIO_UTILS_API: ApiEntry[] = [
    // Reactive
    { name: "_reactive", description: "Reactive object with property tracking", category: "Reactive" },
    { name: "_trickle", description: "Reduces numbers array in stages", category: "Reactive" },
    // Strings
    { name: "_jsonToQueryString", description: "JSON object → URL query string", category: "Strings" },
    { name: "_queryStringToJson", description: "URL query string → JSON object", category: "Strings" },
    { name: "_resetString", description: "URL-decodes an encoded string", category: "Strings" },
    { name: "_snakeToCamel", description: "snake_case → camelCase", category: "Strings" },
    { name: "_camelToSnake", description: "camelCase → snake_case or kebab-case", category: "Strings" },
    { name: "_toBase64", description: "Encodes a string to Base64", category: "Strings" },
    { name: "_generateId", description: "Generates a random ID string", category: "Strings" },
    { name: "_sniffId", description: "Extracts id/_id/Id from an object", category: "Strings" },
    { name: "_a_or_an", description: 'Returns "a" or "an" for a word', category: "Strings" },
    { name: "_encrypt", description: "Encrypts any value with a salt", category: "Strings" },
    { name: "_decrypt", description: "Decrypts an encrypted value", category: "Strings" },
    // Arrays
    { name: "_hideRandom", description: "Masks random indexes in an array", category: "Arrays" },
    { name: "_rotateArray", description: "Rotates a 2D array 90° clockwise", category: "Arrays" },
    { name: "_equals", description: "Deep equality check for arrays", category: "Arrays" },
    { name: "_repeat", description: "Runs a function N times", category: "Arrays" },
    { name: "_chunk", description: "Splits array into chunks of size N", category: "Arrays" },
    { name: "_rotate", description: "Rotates a matrix 90° clockwise", category: "Arrays" },
    { name: "_rotateCounterClockwise", description: "Rotates a matrix 90° counter-clockwise", category: "Arrays" },
    { name: "_transpose", description: "Swaps rows and columns of a matrix", category: "Arrays" },
    // Objects
    { name: "_cleanResponse", description: "Unwraps paginated API response data", category: "Objects" },
    { name: "_deepClone", description: "Deep clones objects, arrays, Dates", category: "Objects" },
    { name: "_get", description: "Safely reads nested object/array data", category: "Objects" },
    { name: "_omit", description: "Creates object excluding specified keys", category: "Objects" },
    { name: "_pick", description: "Creates object with only specified keys", category: "Objects" },
    { name: "_reParseString", description: "Deep clone via JSON parse/stringify", category: "Objects" },
    // Type Checkers
    { name: "_isArray", description: "Checks if value is an Array", category: "Type Checkers" },
    { name: "_isFunction", description: "Checks if value is a Function", category: "Type Checkers" },
    { name: "_isNumber", description: "Checks if value is a Number", category: "Type Checkers" },
    { name: "_isObject", description: "Checks if value is an Object", category: "Type Checkers" },
    { name: "_isString", description: "Checks if value is a String", category: "Type Checkers" },
    { name: "_isValid", description: "Checks if value is array, object, string, or number", category: "Type Checkers" },
    // Math
    { name: "_fibonacci", description: "Returns the nth Fibonacci number", category: "Math" },
    { name: "_fibonacciSequence", description: "Returns Fibonacci sequence up to nth", category: "Math" },
    { name: "_factorial", description: "Returns factorial of a non-negative integer", category: "Math" },
    { name: "_isPrime", description: "Checks if a number is prime", category: "Math" },
    { name: "_sieveOfEratosthenes", description: "All primes up to a given limit", category: "Math" },
    { name: "_sumOf", description: "Sums an array of numbers", category: "Math" },
    // Other
    { name: "_calculateClockDrift", description: "Calculates JWT token clock drift", category: "Other" },
    { name: "_notifyMe", description: "Sends a PWA browser notification", category: "Other" },
    { name: "_to", description: "Wraps a promise → [error, result]", category: "Other" },
];

const USTORE_API: ApiEntry[] = [
    { name: "localStorage", description: "Namespaced browser localStorage via store2", category: "Browser" },
    { name: "sessionStorage", description: "Namespaced browser sessionStorage", category: "Browser" },
    { name: "cookieStorage", description: "Read/write document.cookie with serialization", category: "Browser" },
    { name: "memoryStorage", description: "In-memory key-value store (JS object)", category: "Memory" },
    { name: "signalStorage", description: "Reactive store with subscribe() listeners", category: "Reactive" },
    { name: "idbStorage", description: "IndexedDB via localforage", category: "Database" },
    { name: "webqlStorage", description: "SQL-like storage via WebSQL", category: "Database" },
    { name: "configStorage", description: "Layered configuration storage", category: "Config" },
    { name: "secureStorage", description: "AES-encrypted storage", category: "Security" },
    { name: "gunStorage", description: "Decentralized P2P real-time database", category: "P2P" },
    { name: "rxjsStorage", description: "Reactive streams via RxJS BehaviorSubjects", category: "Reactive" },
    { name: "piniaStorage", description: "Vue Pinia state management adapter", category: "Framework" },
    { name: "vuexStorage", description: "Vue Vuex state management adapter", category: "Framework" },
];

const UTILS_API: ApiEntry[] = [
    { name: "store", description: "Key-value store via store2 library", category: "Storage" },
    { name: "config", description: "Layered config (client/server/dev/prod)", category: "Config" },
    { name: "conf", description: "Simplified configuration accessor", category: "Config" },
    { name: "storage", description: "Storage layer accessor", category: "Storage" },
    { name: "note", description: "Notification system (success, error, warning, info, loading, dialog)", category: "Notifications" },
    { name: "Notify", description: "Low-level notification dispatcher", category: "Notifications" },
    { name: "configureNote", description: "Configure notification adapters (Quasar, etc.)", category: "Notifications" },
    { name: "uStore", description: "Universal multi-backend store (local, session, cookie, memory, signal)", category: "Storage" },
    { name: "localStorage", description: "Namespaced local storage adapter", category: "Storage" },
    { name: "sessionStorage", description: "Namespaced session storage adapter", category: "Storage" },
    { name: "cookieStorage", description: "Cookie-based storage adapter", category: "Storage" },
    { name: "memoryStorage", description: "In-memory storage adapter", category: "Storage" },
    { name: "signalStorage", description: "Reactive signal-based storage", category: "Storage" },
];

const API_MAP: Record<string, ApiEntry[]> = {
    "waelio-utils": WAELIO_UTILS_API,
    ustore: USTORE_API,
    utils: UTILS_API,
};

/* ── NPM Data Loader ─────────────────────────────────── */

interface NpmMeta {
    name: string;
    description: string;
    version: string;
    homepage: string;
    downloadsWeek: number;
    readme: string;
    license: string;
    hasTypes: boolean;
    keywords: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function readString(record: Record<string, unknown>, key: string): string {
    const value = record[key];
    return typeof value === "string" ? value : "";
}

async function loadNpmMeta(name: string): Promise<NpmMeta> {
    const [meta, downloads] = await Promise.all([
        fetch(`https://registry.npmjs.org/${encodeURIComponent(name)}`, { cache: "no-store" }).then(async (r) => {
            if (!r.ok) throw new Error(`registry: ${r.status}`);
            return (await r.json()) as unknown;
        }),
        fetch(`https://api.npmjs.org/downloads/point/last-week/${encodeURIComponent(name)}`, { cache: "no-store" })
            .then(async (r) => {
                if (!r.ok) return { downloads: 0 };
                return (await r.json()) as unknown;
            })
            .catch(() => ({ downloads: 0 })),
    ]);

    const m = isRecord(meta) ? meta : {};
    const d = isRecord(downloads) ? downloads : {};
    const distTags = isRecord(m["dist-tags"]) ? (m["dist-tags"] as Record<string, unknown>) : {};
    const versions = isRecord(m.versions) ? (m.versions as Record<string, unknown>) : {};
    const latest = readString(distTags, "latest") || Object.keys(versions).pop() || "";
    const vm = isRecord(versions[latest]) ? (versions[latest] as Record<string, unknown>) : {};
    const keywords = Array.isArray(vm.keywords) ? (vm.keywords as string[]) : Array.isArray(m.keywords) ? (m.keywords as string[]) : [];

    return {
        name: readString(m, "name") || name,
        description: readString(vm, "description") || readString(m, "description"),
        version: latest,
        homepage: readString(vm, "homepage") || readString(m, "homepage"),
        downloadsWeek: Number((d as Record<string, unknown>).downloads ?? 0),
        readme: readString(m, "readme") || readString(vm, "readme"),
        license: readString(vm, "license") || readString(m, "license"),
        hasTypes: Boolean(vm.types || vm.typings),
        keywords,
    };
}

/* ── Components ──────────────────────────────────────── */

function SearchBox(props: { value: string; onChange: (v: string) => void }): ReactNode {
    return (
        <div className="docs-search">
            <span className="docs-search-icon" aria-hidden="true">🔍</span>
            <input
                id="docs-search-input"
                type="text"
                placeholder="Search APIs, packages, utilities…"
                value={props.value}
                onChange={(e) => props.onChange(e.target.value)}
                className="docs-search-input"
            />
            {props.value && (
                <button className="docs-search-clear" onClick={() => props.onChange("")} aria-label="Clear search">✕</button>
            )}
        </div>
    );
}

function Sidebar(props: {
    packages: PackageDef[];
    active: string | null;
    onSelect: (slug: string) => void;
}): ReactNode {
    const grouped = Object.entries(CATEGORIES).map(([key, cat]) => ({
        ...cat,
        key,
        items: props.packages.filter((p) => p.category === key),
    }));

    return (
        <nav className="docs-sidebar" aria-label="Package navigation">
            <div className="docs-sidebar-header">
                <a href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none", color: "inherit" }}>
                    <img src="/logo.png?v=20260514" alt="waelio" className="brand-lockup" style={{ width: "140px" }} />
                </a>
            </div>

            {grouped.map((group) =>
                group.items.length > 0 ? (
                    <div key={group.key} className="docs-sidebar-group">
                        <div className="docs-sidebar-category">
                            <span>{group.icon}</span> {group.label}
                        </div>
                        {group.items.map((pkg) => (
                            <button
                                key={pkg.slug}
                                className={`docs-sidebar-item ${props.active === pkg.slug ? "docs-sidebar-item-active" : ""}`}
                                onClick={() => props.onSelect(pkg.slug)}
                            >
                                <span className="docs-sidebar-icon">{pkg.icon}</span>
                                <div className="docs-sidebar-item-content">
                                    <span className="docs-sidebar-name">{pkg.name}</span>
                                    <span className="docs-sidebar-tagline">{pkg.tagline}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : null,
            )}

            <div className="docs-sidebar-footer">
                <a href="/" className="docs-sidebar-back">← Package Stats</a>
            </div>
        </nav>
    );
}

function CopyButton(props: { text: string; label?: string }): ReactNode {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(props.text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }).catch(() => { });
    };
    return (
        <button className="btn-outline docs-copy-btn" onClick={handleCopy} title="Copy to clipboard">
            {copied ? "✅ Copied" : props.label || "📋 Copy"}
        </button>
    );
}

function ApiTable(props: { entries: ApiEntry[]; search: string }): ReactNode {
    const filtered = props.search
        ? props.entries.filter(
            (e) =>
                e.name.toLowerCase().includes(props.search.toLowerCase()) ||
                e.description.toLowerCase().includes(props.search.toLowerCase()) ||
                e.category.toLowerCase().includes(props.search.toLowerCase()),
        )
        : props.entries;

    const grouped = filtered.reduce<Record<string, ApiEntry[]>>((acc, entry) => {
        (acc[entry.category] = acc[entry.category] || []).push(entry);
        return acc;
    }, {});

    if (filtered.length === 0) {
        return <div className="docs-empty">No matching APIs found.</div>;
    }

    return (
        <div className="docs-api-tables">
            {Object.entries(grouped).map(([cat, entries]) => (
                <div key={cat} className="docs-api-group">
                    <h3 className="docs-api-category">{cat}</h3>
                    <div className="docs-api-list">
                        {entries.map((entry) => (
                            <div key={entry.name} className="docs-api-entry">
                                <code className="docs-api-name">{entry.name}</code>
                                <span className="docs-api-desc">{entry.description}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

function PackageDetail(props: { pkg: PackageDef; search: string }): ReactNode {
    const [meta, setMeta] = useState<NpmMeta | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showReadme, setShowReadme] = useState(false);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError("");
        setShowReadme(false);

        loadNpmMeta(props.pkg.name)
            .then((data) => {
                if (!cancelled) {
                    setMeta(data);
                    setLoading(false);
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : String(err));
                    setLoading(false);
                }
            });

        return () => { cancelled = true; };
    }, [props.pkg.name]);

    const apiEntries = API_MAP[props.pkg.slug];
    const installCmd = `npm i ${props.pkg.name}`;

    return (
        <div className="docs-detail">
            {/* Header */}
            <div className="docs-detail-header">
                <div className="docs-detail-icon">{props.pkg.icon}</div>
                <div>
                    <h1 className="docs-detail-title">{props.pkg.name}</h1>
                    <p className="docs-detail-tagline">{props.pkg.tagline}</p>
                </div>
            </div>

            {/* Install */}
            <div className="docs-install-bar">
                <code className="docs-install-cmd">{installCmd}</code>
                <CopyButton text={installCmd} />
            </div>

            {/* Meta badges */}
            {loading && <div className="docs-loading">Loading package data…</div>}
            {error && <div className="docs-error">Failed to load: {error}</div>}
            {meta && (
                <div className="docs-meta-grid">
                    <div className="docs-meta-item">
                        <span className="docs-meta-label">Version</span>
                        <span className="docs-meta-value">{meta.version || "—"}</span>
                    </div>
                    <div className="docs-meta-item">
                        <span className="docs-meta-label">Downloads/week</span>
                        <span className="docs-meta-value">{new Intl.NumberFormat().format(meta.downloadsWeek)}</span>
                    </div>
                    <div className="docs-meta-item">
                        <span className="docs-meta-label">License</span>
                        <span className="docs-meta-value">{meta.license || "—"}</span>
                    </div>
                    <div className="docs-meta-item">
                        <span className="docs-meta-label">TypeScript</span>
                        <span className="docs-meta-value">{meta.hasTypes ? "✅ Included" : "—"}</span>
                    </div>
                </div>
            )}

            {/* API Reference */}
            {apiEntries && (
                <section className="docs-section">
                    <h2 className="docs-section-title">API Reference</h2>
                    <p className="docs-section-desc">
                        {apiEntries.length} exports across {new Set(apiEntries.map((e) => e.category)).size} categories
                    </p>
                    <ApiTable entries={apiEntries} search={props.search} />
                </section>
            )}

            {/* README */}
            {meta?.readme && (
                <section className="docs-section">
                    <div className="docs-readme-toggle">
                        <h2 className="docs-section-title">README</h2>
                        <button className="btn-outline" onClick={() => setShowReadme(!showReadme)}>
                            {showReadme ? "Hide" : "Show"} README
                        </button>
                    </div>
                    {showReadme && (
                        <ReadmeMarkdown source={meta.readme} />
                    )}
                </section>
            )}

            {/* Keywords */}
            {meta?.keywords && meta.keywords.length > 0 && (
                <div className="docs-keywords">
                    {meta.keywords.map((kw) => (
                        <span key={kw} className="chip">{kw}</span>
                    ))}
                </div>
            )}
        </div>
    );
}

function DocsOverview(): ReactNode {
    return (
        <div className="docs-overview">
            <div className="docs-overview-hero">
                <div className="docs-overview-eyebrow">Documentation</div>
                <h1 className="docs-overview-title">@waelio packages</h1>
                <p className="docs-overview-desc">
                    Practical npm packages for storage, utilities, configuration, and notifications.
                    Select a package from the sidebar to explore its API.
                </p>
            </div>

            <div className="docs-overview-grid">
                {PACKAGES.map((pkg) => (
                    <div key={pkg.slug} className="docs-overview-card">
                        <div className="docs-overview-card-icon">{pkg.icon}</div>
                        <h3 className="docs-overview-card-name">{pkg.name}</h3>
                        <p className="docs-overview-card-desc">{pkg.tagline}</p>
                        <div className="docs-overview-card-badge">{CATEGORIES[pkg.category]?.label}</div>
                    </div>
                ))}
            </div>

            <div className="docs-overview-stats">
                <div className="docs-overview-stat">
                    <span className="docs-overview-stat-value">{PACKAGES.length}</span>
                    <span className="docs-overview-stat-label">Packages</span>
                </div>
                <div className="docs-overview-stat">
                    <span className="docs-overview-stat-value">{WAELIO_UTILS_API.length + USTORE_API.length + UTILS_API.length}</span>
                    <span className="docs-overview-stat-label">Total APIs</span>
                </div>
                <div className="docs-overview-stat">
                    <span className="docs-overview-stat-value">MIT</span>
                    <span className="docs-overview-stat-label">License</span>
                </div>
            </div>
        </div>
    );
}

/* ── App ─────────────────────────────────────────────── */

function DocsApp(): ReactNode {
    const path = window.location.pathname;
    const slugFromUrl = path.replace(/^\/docs\/?/, "").replace(/\/$/, "") || null;
    const [activeSlug, setActiveSlug] = useState<string | null>(slugFromUrl);
    const [search, setSearch] = useState("");
    const [mobileOpen, setMobileOpen] = useState(false);
    const { theme, setTheme, themeOptions } = useThemeMode();

    const activePkg = PACKAGES.find((p) => p.slug === activeSlug) ?? null;

    const handleSelect = (slug: string) => {
        setActiveSlug(slug);
        setMobileOpen(false);
        window.history.pushState(null, "", `/docs/${slug}`);
    };

    useEffect(() => {
        const handlePop = () => {
            const newSlug = window.location.pathname.replace(/^\/docs\/?/, "").replace(/\/$/, "") || null;
            setActiveSlug(newSlug);
        };
        window.addEventListener("popstate", handlePop);
        return () => window.removeEventListener("popstate", handlePop);
    }, []);

    return (
        <div className="docs-layout">
            {/* Mobile toggle */}
            <button className="docs-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle navigation">
                {mobileOpen ? "✕" : "☰"} Packages
            </button>

            {/* Sidebar */}
            <div className={`docs-sidebar-wrapper ${mobileOpen ? "docs-sidebar-open" : ""}`}>
                <Sidebar packages={PACKAGES} active={activeSlug} onSelect={handleSelect} />
            </div>

            {/* Main content */}
            <main className="docs-main">
                <div className="docs-toolbar">
                    <SearchBox value={search} onChange={setSearch} />
                    <div className="theme-switcher" role="group" aria-label="Choose theme">
                        {themeOptions.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                className={theme === option.value ? "theme-option theme-option-active" : "theme-option"}
                                aria-pressed={theme === option.value}
                                onClick={() => setTheme(option.value)}
                            >
                                <span className="theme-option-icon" aria-hidden="true">{option.icon}</span>
                                <span>{option.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {activePkg ? (
                    <PackageDetail pkg={activePkg} search={search} />
                ) : (
                    <DocsOverview />
                )}

                <footer className="docs-footer">
                    <span className="muted">© 2026 waelio.com</span>
                    <div className="footer-links">
                        <a href="/">Package Stats</a>
                        <a href="/privacy.html">Privacy</a>
                        <a href="/terms.html">Terms</a>
                    </div>
                </footer>
            </main>
        </div>
    );
}

/* ── Mount ───────────────────────────────────────────── */

const container = document.getElementById("app");
if (!container) throw new Error("Missing app root");
createRoot(container).render(<DocsApp />);
