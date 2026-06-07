import { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import type { ReactNode } from "react";
import { disableWaelioRuntimeCaching } from "./shared/browser-runtime.ts";
import { useThemeMode } from "./shared/theme.ts";
import { ALL_PACKAGE_NAMES } from "./package-marketing.ts";
import { PackageGridCard } from "./package-grid-card.tsx";
import {
    PackageLandingError,
    PackageLandingLoading,
    PackageLandingPage,
} from "./package-landing-page.tsx";

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
    readme?: string;
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

const FALLBACK_PACKAGE_DEFINITIONS = buildPackageDefinitions([...ALL_PACKAGE_NAMES]);

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
        fetch(`https://registry.npmjs.org/${encodeURIComponent(name)}`, { cache: "no-store" }).then(async (response) => {
            if (!response.ok) {
                throw new Error(`registry: ${response.status}`);
            }

            return await response.json() as unknown;
        }),
        fetch(`https://api.npmjs.org/downloads/point/last-week/${encodeURIComponent(name)}`, { cache: "no-store" })
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
    const readme = readString(metaRecord, "readme") || readString(versionMeta, "readme") || "";

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
        readme,
    };
}

async function loadMaintainerPackageNames(maintainer: string): Promise<string[]> {
    const response = await fetch(
        `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(`maintainer:${maintainer}`)}&size=250`,
        { cache: "no-store" },
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

function formatDownloads(downloadsWeek: number | undefined): string {
    return new Intl.NumberFormat().format(downloadsWeek ?? 0);
}

function isLoadedPackageState(state: PackageState): state is Extract<PackageState, { status: "loaded" }> {
    return state.status === "loaded";
}

function isErrorPackageState(state: PackageState): state is Extract<PackageState, { status: "error" }> {
    return state.status === "error";
}

function weeklyDownloads(packages: Record<string, PackageState>, key: string): number {
    const state = packages[key];
    if (state?.status === "loaded") {
        return state.meta.downloadsWeek ?? 0;
    }
    return -1;
}

/** Homepage order: highest weekly downloads first; loading/errors last. */
function sortDefinitionsByDownloads(
    definitions: PackageDefinition[],
    packages: Record<string, PackageState>,
): PackageDefinition[] {
    return [...definitions].sort(
        (a, b) => weeklyDownloads(packages, b.key) - weeklyDownloads(packages, a.key),
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
            <div className="hero-eyebrow">Open source · npm · TypeScript</div>
            <h2 className="hero-title">Small packages. Real production use. Built by a developer, for developers.</h2>
            <p className="hero-description">
                The <strong>@waelio</strong> ecosystem — focused npm packages for local state, sync, messaging, and tooling.
                No bloat, no lock-in. Install what you need, ship faster.
            </p>
            <div className="hero-note">Sorted by weekly downloads · click any package for docs, badges, and install command.</div>
        </section>
    );
}

function parsePackageNameFromPath(pathname: string): string | null {
    if (!pathname.startsWith("/packages/")) {
        return null;
    }
    const raw = pathname.replace(/^\/packages\/?/, "").replace(/\/$/, "");
    if (!raw) {
        return null;
    }
    return decodeURIComponent(raw);
}

function App(): ReactNode {
    const path = window.location.pathname;
    const specificPackageName = parsePackageNameFromPath(path);
    const isPackageRoute = specificPackageName !== null;

    const initialDefinitions = specificPackageName
        ? buildPackageDefinitions([specificPackageName])
        : FALLBACK_PACKAGE_DEFINITIONS;

    const [packageDefinitions, setPackageDefinitions] = useState<PackageDefinition[]>(initialDefinitions);
    const [packages, setPackages] = useState<Record<string, PackageState>>(() => (
        buildInitialPackageState(initialDefinitions)
    ));
    const { theme, setTheme, themeOptions } = useThemeMode();

    const sortedDefinitions = useMemo(
        () => (isPackageRoute ? packageDefinitions : sortDefinitionsByDownloads(packageDefinitions, packages)),
        [isPackageRoute, packageDefinitions, packages],
    );

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
    }, [specificPackageName]);

    useEffect(() => {
        if (isPackageRoute && specificPackageName) {
            document.title = `${specificPackageName} – waelio.com`;
            return;
        }
        document.title = "waelio.com – Open Source npm Package Stats";
    }, [isPackageRoute, specificPackageName]);

    const packageState = specificPackageName
        ? packages[specificPackageName] ?? LOADING_PACKAGE_STATE
        : null;

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
                        <h1 className="site-title">{isPackageRoute ? "Package" : "Package stats"}</h1>
                    </a>
                </div>
                <div className="header-nav">
                    <span className="muted">
                        {isPackageRoute ? (
                            <a href="/" className="nav-link">← All packages</a>
                        ) : (
                            `${packageDefinitions.length} npm packages · click to open`
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

            {!isPackageRoute && (
            <div className="page-shell">
                        <HeroIntro />
                        <DownloadsSummary packageDefinitions={packageDefinitions} packages={packages} />
                </div>
            )}

            {isPackageRoute && specificPackageName && packageState ? (
                <div className="package-landing-shell">
                    {packageState.status === "loading" && (
                        <PackageLandingLoading name={specificPackageName} />
                    )}
                    {packageState.status === "error" && (
                        <PackageLandingError name={specificPackageName} error={packageState.error} />
                    )}
                    {packageState.status === "loaded" && (
                        <PackageLandingPage meta={packageState.meta} />
                )}
            </div>
            ) : !isPackageRoute ? (
                <div className="container package-grid">
                    {sortedDefinitions.map((definition, index) => (
                        <PackageGridCard
                            key={definition.key}
                            title={definition.title}
                            state={packages[definition.key] ?? LOADING_PACKAGE_STATE}
                            rank={index + 1}
                        />
                ))}
            </div>
            ) : null}

            <footer className="site-footer">
                <span className="muted">© 2026 waelio.com</span>
                <div className="footer-links">
                    <a href="/advertise.html">📣 Advertise</a>
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
