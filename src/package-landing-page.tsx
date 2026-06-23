import { useState } from "react";
import type { ReactNode } from "react";
import { getPackageMarketing, getSitePackageConfig, isSitePackage, packageLink } from "./package-marketing.ts";
import { ReadmeMarkdown } from "./readme-markdown.tsx";

interface NpmMeta {
    name: string;
    description?: string;
    version?: string;
    homepage?: string;
    repository?: { url?: string } | null;
    downloadsWeek?: number;
    keywords?: string[];
    license?: string;
    hasTypes?: boolean;
    readme?: string;
}

function formatDownloads(downloadsWeek: number | undefined): string {
    return new Intl.NumberFormat().format(downloadsWeek ?? 0);
}

function getRepositoryUrl(repository: { url?: string } | null | undefined): string | null {
    if (!repository?.url) return null;
    return repository.url.replace(/^git\+/, "").replace(/\.git$/, "");
}

function shieldsName(name: string): string {
    return name.replaceAll("/", "%2F");
}

function renderBadges(meta: NpmMeta): ReactNode {
    const safeName = shieldsName(meta.name);
    const badges = [
        { alt: "npm version", src: `https://img.shields.io/npm/v/${safeName}?label=version` },
        { alt: "weekly downloads", src: `https://img.shields.io/npm/dw/${safeName}` },
        { alt: "license", src: `https://img.shields.io/npm/l/${safeName}` },
    ];
    if (meta.hasTypes) {
        badges.push({
            alt: "types included",
            src: "https://img.shields.io/badge/types-included-blue?logo=typescript",
        });
    }
    return badges.map((badge) => (
        <img key={badge.alt} alt={badge.alt} src={badge.src} className="package-landing-badge" />
    ));
}

export function PackageLandingPage(props: { meta: NpmMeta }): ReactNode {
    const { meta } = props;
    const marketing = getPackageMarketing(meta.name, meta.description);
    const sitePackage = isSitePackage(meta.name);
    const siteConfig = getSitePackageConfig(meta.name);
    const installCmd = sitePackage ? (siteConfig?.cta ?? "Open site") : `npm i ${meta.name}`;
    const [copied, setCopied] = useState(false);

    const links: Array<{ href: string; label: string }> = [];
    if (meta.homepage) links.push({ href: meta.homepage, label: sitePackage ? "Open chat" : "Homepage" });
    const repo = getRepositoryUrl(meta.repository);
    if (repo) links.push({ href: repo, label: "Repository" });
    if (!sitePackage) {
        links.push({
            href: `https://www.npmjs.com/package/${encodeURIComponent(meta.name)}`,
            label: "npm",
        });
    }

    const handleCopy = () => {
        void navigator.clipboard.writeText(installCmd).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <article className="package-landing">
            <section className="package-landing-hero" aria-label="Package overview">
                <div className="package-landing-eyebrow-row">
                    <p className="package-landing-eyebrow">@waelio package</p>
                    {marketing.peakWeeklyDownloads && (
                        <span className="package-landing-peak-badge">
                            ⚡ {new Intl.NumberFormat().format(marketing.peakWeeklyDownloads)}+ weekly downloads at peak
                        </span>
                    )}
                </div>
                <h1 className="package-landing-title">{meta.name}</h1>
                <p className="package-landing-tagline">{marketing.tagline}</p>
                <p className="package-landing-pitch">{marketing.pitch}</p>

                <div className="package-landing-install">
                    {sitePackage ? (
                        <a
                            href={packageLink(meta.name)}
                            className="btn-outline package-landing-open-chat"
                            {...(packageLink(meta.name).startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        >
                            {siteConfig?.cta ?? "Open site →"}
                        </a>
                    ) : marketing.liveShowcase ? (
                        <>
                            <a
                                href={marketing.liveShowcase.url}
                                className="btn-outline package-landing-open-chat"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Open live demo →
                            </a>
                            <code>{installCmd}</code>
                            <button type="button" className="btn-outline package-landing-copy" onClick={handleCopy}>
                                {copied ? "Copied" : "Copy install"}
                            </button>
                        </>
                    ) : (
                        <>
                            <code>{installCmd}</code>
                            <button type="button" className="btn-outline package-landing-copy" onClick={handleCopy}>
                                {copied ? "Copied" : "Copy install"}
                            </button>
                        </>
                    )}
                </div>

                {marketing.ctaHint && (
                    <p className="package-landing-cta-hint">{marketing.ctaHint}</p>
                )}

                {marketing.productionProof && (
                    <section className="package-landing-production" aria-label="Production use">
                        <p className="package-landing-production-label">In production</p>
                        <p className="package-landing-production-detail">{marketing.productionProof.detail}</p>
                        <a
                            href={marketing.productionProof.appUrl}
                            className="package-landing-production-link"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Open {marketing.productionProof.appName} →
                        </a>
                    </section>
                )}

                {marketing.liveShowcase && (
                    <section className="package-landing-showcase" aria-label="Live demo">
                        <p className="package-landing-showcase-label">{marketing.liveShowcase.title}</p>
                        <p className="package-landing-showcase-detail">{marketing.liveShowcase.detail}</p>
                        <a
                            href={marketing.liveShowcase.url}
                            className="package-landing-showcase-link"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Open live demo →
                        </a>
                    </section>
                )}

                <div className="package-landing-stats">
                    <div className="package-landing-stat">
                        <span className="package-landing-stat-label">{sitePackage ? "Status" : "Latest"}</span>
                        <span className="package-landing-stat-value">{meta.version || "—"}</span>
                    </div>
                    <div className="package-landing-stat">
                        <span className="package-landing-stat-label">
                            {sitePackage && meta.name === "peace2074.com"
                                ? "Offline downloads / week"
                                : marketing.productionProof
                                    ? "npm + production / week"
                                    : sitePackage
                                        ? "Access"
                                        : "Downloads / week"}
                        </span>
                        <span className="package-landing-stat-value">
                            {sitePackage && meta.name === "peace2074.com"
                                ? `${formatDownloads(meta.downloadsWeek)} real uses this week (Quran reads + offline downloads on peace2074.com)`
                                : marketing.productionProof
                                    ? `${formatDownloads(meta.downloadsWeek)} (npm installs + peace2074.com offline activity)`
                                    : sitePackage
                                        ? "Home screen"
                                        : formatDownloads(meta.downloadsWeek)}
                        </span>
                    </div>
                    <div className="package-landing-stat">
                        <span className="package-landing-stat-label">License</span>
                        <span className="package-landing-stat-value">{meta.license || "—"}</span>
                    </div>
                </div>

                {!sitePackage && <div className="package-landing-badges">{renderBadges(meta)}</div>}
            </section>

            <section className="package-landing-section" aria-label="Why this package">
                <h2 className="package-landing-section-title">Why this package</h2>
                <ul className="package-landing-list">
                    {marketing.benefits.map((item) => (
                        <li key={item}>{item}</li>
                    ))}
                </ul>
            </section>

            <section className="package-landing-section" aria-label="Use cases">
                <h2 className="package-landing-section-title">Good for</h2>
                <div className="package-landing-chips">
                    {marketing.useCases.map((item) => (
                        <span key={item} className="chip">{item}</span>
                    ))}
                </div>
            </section>

            <section className="package-landing-section package-landing-marketing-slot" aria-label="Sponsored">
                <div className="package-ad-slot">
                    <div className="package-ad-slot-inner">
                        <div className="package-ad-slot-top">
                            <span className="package-ad-slot-label">Sponsored</span>
                            <a href="/advertise" className="package-ad-slot-advertise-link">Advertise here →</a>
                        </div>
                        <h3 className="package-ad-slot-headline">{marketing.textAd.headline}</h3>
                        <p className="package-ad-slot-body">{marketing.textAd.body}</p>
                        <a
                            href={marketing.textAd.ctaUrl}
                            className="package-ad-slot-cta"
                            {...(sitePackage ? {} : { target: "_blank", rel: "noreferrer" })}
                        >
                            {marketing.textAd.ctaLabel} →
                        </a>
                    </div>
                </div>
            </section>


            <section className="package-landing-section" aria-label="Links">
                <h2 className="package-landing-section-title">Links</h2>
                <div className="package-landing-links">
                    {links.map((link) => (
                        <a
                            key={link.label}
                            href={link.href}
                            {...(link.href.startsWith("/") ? {} : { target: "_blank", rel: "noreferrer" })}
                        >
                            {link.label}
                        </a>
                    ))}
                </div>
                {meta.keywords && meta.keywords.length > 0 && (
                    <div className="package-landing-chips" style={{ marginTop: "1rem" }}>
                        {meta.keywords.map((keyword) => (
                            <span key={keyword} className="chip">{keyword}</span>
                        ))}
                    </div>
                )}
            </section>

            {meta.readme && (
                <section className="package-landing-section package-landing-docs" aria-label="Documentation">
                    <h2 className="package-landing-section-title">Documentation</h2>
                    <ReadmeMarkdown source={meta.readme} />
                </section>
            )}

            {marketing.relatedPackages && marketing.relatedPackages.length > 0 && (
                <section className="package-landing-section" aria-label="Related packages">
                    <h2 className="package-landing-section-title">Related @waelio packages</h2>
                    <div className="package-landing-related">
                        {marketing.relatedPackages.map((pkg) => (
                            <a
                                key={pkg}
                                href={packageLink(pkg)}
                                className="package-landing-related-link"
                            >
                                <span className="package-landing-related-name">{pkg}</span>
                                <span className="package-landing-related-arrow">→</span>
                            </a>
                        ))}
                    </div>
                </section>
            )}
        </article>
    );
}

export function PackageLandingLoading(props: { name: string }): ReactNode {
    return (
        <div className="package-landing package-landing-loading">
            <h1 className="package-landing-title">{props.name}</h1>
            <p className="muted">Loading package data…</p>
        </div>
    );
}

export function PackageLandingError(props: { name: string; error: string }): ReactNode {
    return (
        <div className="package-landing package-landing-error">
            <h1 className="package-landing-title">{props.name}</h1>
            <p className="error">{props.error}</p>
            <a href="/" className="nav-link">← Back to all packages</a>
        </div>
    );
}
