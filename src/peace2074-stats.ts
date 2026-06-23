export interface Peace2074DownloadStats {
    downloadsWeek: number;
    downloadsTotal: number;
    offlineDownloadsWeek?: number;
    quranReadsWeek?: number;
    activeUsersWeek?: number;
    npmDownloadsWeek?: number;
}

const PEACE2074_STATS_URL = "https://peace2074.com/api/stats/offline-recitation";
const APP_STATS_TIMEOUT_MS = 2500;

const PEACE2074_NPM_PACKAGES = [
    "@waelio/realdb",
    "@waelio/messaging",
    "@waelio/ustore",
    "@waelio/sync",
] as const;

let cachedStatsPromise: Promise<Peace2074DownloadStats> | null = null;

function npmWeeklyRange(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(yesterday);
    weekAgo.setDate(yesterday.getDate() - 6);
    const fmt = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return `${fmt(weekAgo)}:${fmt(yesterday)}`;
}

async function fetchNpmWeeklyDownloads(name: string): Promise<number> {
    try {
        const range = npmWeeklyRange();
        const response = await fetch(
            `https://api.npmjs.org/downloads/point/${range}/${encodeURIComponent(name)}`,
            { cache: "no-store" },
        );
        if (!response.ok) return 0;
        const payload = await response.json() as { downloads?: number };
        return Number(payload.downloads ?? 0);
    } catch {
        return 0;
    }
}

async function fetchPeace2074AppStats(): Promise<Partial<Peace2074DownloadStats>> {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), APP_STATS_TIMEOUT_MS);
        const response = await fetch(PEACE2074_STATS_URL, {
            cache: "no-store",
            signal: controller.signal,
        });
        clearTimeout(timeout);
        if (!response.ok) return {};
        const payload = await response.json() as Partial<Peace2074DownloadStats & { ok?: boolean }>;
        return {
            downloadsWeek: Number(payload.downloadsWeek ?? 0),
            downloadsTotal: Number(payload.downloadsTotal ?? 0),
            offlineDownloadsWeek: Number(payload.offlineDownloadsWeek ?? 0),
            quranReadsWeek: Number(payload.quranReadsWeek ?? 0),
            activeUsersWeek: Number(payload.activeUsersWeek ?? 0),
        };
    } catch {
        return {};
    }
}

async function loadPeace2074DownloadStats(): Promise<Peace2074DownloadStats> {
    const npmCounts = await Promise.all(
        PEACE2074_NPM_PACKAGES.map((name) => fetchNpmWeeklyDownloads(name)),
    );
    const npmDownloadsWeek = npmCounts.reduce((sum, count) => sum + count, 0);

    const appStats = await fetchPeace2074AppStats();
    const appDownloadsWeek = Number(appStats.downloadsWeek ?? 0);

    return {
        downloadsWeek: npmDownloadsWeek + appDownloadsWeek,
        downloadsTotal: Number(appStats.downloadsTotal ?? 0) + npmDownloadsWeek,
        offlineDownloadsWeek: Number(appStats.offlineDownloadsWeek ?? 0),
        quranReadsWeek: Number(appStats.quranReadsWeek ?? 0),
        activeUsersWeek: Number(appStats.activeUsersWeek ?? 0),
        npmDownloadsWeek,
    };
}

/** Cached — one fetch for the whole page (npm totals + optional peace2074 app stats). */
export function fetchPeace2074DownloadStats(): Promise<Peace2074DownloadStats> {
    if (!cachedStatsPromise) {
        cachedStatsPromise = loadPeace2074DownloadStats();
    }
    return cachedStatsPromise;
}
