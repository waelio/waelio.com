import type { ReactNode } from "react";
import { getPackageMarketing, getSitePackageConfig, isSitePackage, packageLink } from "./package-marketing.ts";

type PackageState =
    | { status: "loading" }
    | { status: "loaded"; meta: { name: string; description?: string; version?: string; downloadsWeek?: number } }
    | { status: "error"; error: string };

function formatDownloads(downloadsWeek: number | undefined): string {
    return new Intl.NumberFormat().format(downloadsWeek ?? 0);
}

function rankLabel(rank: number, loaded: boolean): string | null {
    if (!loaded) return null;
    if (rank === 1) return "★ Most downloads";
    if (rank === 2 || rank === 3) return "Popular";
    return null;
}

export function PackageGridCard(props: { title: string; state: PackageState; rank?: number }): ReactNode {
    const { title, state, rank } = props;
    const href = packageLink(title);
    const sitePackage = isSitePackage(title);
    const siteConfig = getSitePackageConfig(title);
    const marketing = getPackageMarketing(title);
    const productionBadge = marketing.productionProof
        ? `★ ${marketing.productionProof.appName}`
        : null;
    const liveBadge = marketing.liveShowcase ? "⚡ Live demo" : null;
    const badge = siteConfig?.badge
        ?? productionBadge
        ?? liveBadge
        ?? (rank ? rankLabel(rank, state.status === "loaded") : null);
    const featured = sitePackage
        || Boolean(marketing.productionProof)
        || Boolean(marketing.liveShowcase)
        || (rank === 1 && state.status === "loaded");
    const external = href.startsWith("http");

    if (state.status === "loading") {
        return (
            <a
                href={href}
                className="package-grid-card package-grid-card-loading"
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
                <h2 className="package-grid-card-title">{title}</h2>
                <p className="muted">Loading…</p>
            </a>
        );
    }

    if (state.status === "error") {
        return (
            <a
                href={href}
                className="package-grid-card package-grid-card-error"
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
                <h2 className="package-grid-card-title">{title}</h2>
                <p className="error">{state.error}</p>
                <span className="package-grid-card-cta">View page →</span>
            </a>
        );
    }

    const { meta } = state;

    return (
        <a
            href={href}
            className={featured ? "package-grid-card package-grid-card-featured" : "package-grid-card"}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
            {badge && <span className="package-grid-card-badge">{badge}</span>}
            <div className="package-grid-card-top">
                <h2 className="package-grid-card-title">{meta.name}</h2>
                <span className="package-grid-card-arrow" aria-hidden="true">→</span>
            </div>
            <p className="package-grid-card-desc">{meta.description || "Open package page for details."}</p>
            <div className="package-grid-card-meta">
                {sitePackage ? (
                    meta.name === "peace2074.com" ? (
                        <strong className="package-grid-card-big-stat" aria-label={`${formatDownloads(meta.downloadsWeek)} weekly total for peace2074.com`}>
                            {formatDownloads(meta.downloadsWeek)}/wk total
                        </strong>
                    ) : (
                        <>
                            <span>Live now</span>
                            <span>{siteConfig?.metaRight ?? "Site package"}</span>
                        </>
                    )
                ) : marketing.liveShowcase ? (
                    <>
                        <span>v{meta.version || "—"}</span>
                        <strong className="package-grid-card-big-stat">Live on Cloudflare</strong>
                    </>
                ) : marketing.productionProof ? (
                    <>
                        <span>v{meta.version || "—"}</span>
                        <strong className="package-grid-card-big-stat">
                            {formatDownloads(meta.downloadsWeek)}/wk incl. production
                        </strong>
                    </>
                ) : (
                    <>
                        <span>v{meta.version || "—"}</span>
                        <span>{formatDownloads(meta.downloadsWeek)}/wk</span>
                    </>
                )}
            </div>
            <span className="package-grid-card-cta">
                {marketing.liveShowcase ? "Open live demo →" : siteConfig?.cta ?? (sitePackage ? "Open →" : "Open package page")}
            </span>
        </a>
    );
}
