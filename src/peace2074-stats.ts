export interface Peace2074DownloadStats {
    downloadsWeek: number;
    downloadsTotal: number;
}

const PEACE2074_STATS_URL = "https://peace2074.com/api/stats/offline-recitation";

export async function fetchPeace2074DownloadStats(): Promise<Peace2074DownloadStats> {
    try {
        const response = await fetch(PEACE2074_STATS_URL, { cache: "no-store" });
        if (!response.ok) {
            return { downloadsWeek: 0, downloadsTotal: 0 };
        }

        const payload = await response.json() as Partial<Peace2074DownloadStats & { ok?: boolean }>;
        return {
            downloadsWeek: Number(payload.downloadsWeek ?? 0),
            downloadsTotal: Number(payload.downloadsTotal ?? 0),
        };
    } catch {
        return { downloadsWeek: 0, downloadsTotal: 0 };
    }
}
