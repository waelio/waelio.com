import type { ReactNode } from "react";
import { getSitePackageConfig, isSitePackage, packageLink } from "./package-marketing.ts";

type PackageState =
    | { status: "loading" }
    | { status: "loaded"; meta: { name: string; description?: string; version?: string; downloadsWeek?: number } }
    | { status: "error"; error: string };

function formatDownloads(downloadsWeek: number | undefined): string {
    return new Intl.NumberFormat().format(downloadsWeek ?? 0);
}

function downloadBadge(downloadRank: number | undefined, loaded: boolean): string | null {
    if (!loaded || !downloadRank) {
        return null;
    }
    if (downloadRank === 1) {
        return "★ Most downloads";
    }
    if (downloadRank === 2 || downloadRank === 3) {
        return "Popular";
    }
    return null;
}

export function PackageGridCard(props: {
    title: string;
    state: PackageState;
    downloadRank?: number;
}): ReactNode {
    const { title, state, downloadRank } = props;
    const href = packageLink(title);
    const sitePackage = isSitePackage(title);
    const siteConfig = getSitePackageConfig(title);
    const badge = siteConfig?.badge ?? downloadBadge(downloadRank, state.status === "loaded");
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
            className="package-grid-card"
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
            {badge && <span className="package-grid-card-badge">{badge}</span>}
            <div className="package-grid-card-top">
                <h2 className="package-grid-card-title">{meta.name}</h2>
                <span className="package-grid-card-arrow" aria-hidden="true">→</span>
            </div>
            <p className="package-grid-card-desc">{meta.description || "Open package page for details."}</p>
            <div className="package-grid-card-meta">
                <span>v{meta.version || "—"}</span>
                <span>{formatDownloads(meta.downloadsWeek)}/wk</span>
            </div>
            <span className="package-grid-card-cta">
                {sitePackage
                    ? (siteConfig?.cta ?? "Open →")
                    : `npm i ${meta.name}`}
            </span>
        </a>
    );
}
