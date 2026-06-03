import type { ReactNode } from "react";
import { packagePagePath } from "./package-marketing.ts";

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
    const href = packagePagePath(title);
    const badge = rank ? rankLabel(rank, state.status === "loaded") : null;
    const featured = rank === 1 && state.status === "loaded";

    if (state.status === "loading") {
        return (
            <a href={href} className="package-grid-card package-grid-card-loading">
                <h2 className="package-grid-card-title">{title}</h2>
                <p className="muted">Loading…</p>
            </a>
        );
    }

    if (state.status === "error") {
        return (
            <a href={href} className="package-grid-card package-grid-card-error">
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
            <span className="package-grid-card-cta">Open package page</span>
        </a>
    );
}
