/**
 * Extracted Quran-related type definitions from peace2074/peace2074.com
 * shared/types/index.ts at commit 31c7f00a9d49a7a955875668f1c146b794594f9b.
 * Only Quran-related interfaces are included to avoid external deps.
 * Source:
 * https://raw.githubusercontent.com/peace2074/peace2074.com/31c7f00a9d49a7a955875668f1c146b794594f9b/shared/types/index.ts
 */

export interface aya_interface {
    chapter: number;
    verse: number;
    text: string;
}

export interface HarfI {
    value: string;
    name?: string;
    weight?: number;
    description?: string;
    color?: string;
    encoding?: string;
}

export interface KalimatI extends HarfI, aya_interface {
    horuf: HarfI[];
}

export interface AyaI extends KalimatI, HarfI, aya_interface {
    Kalemat: KalimatI[];
}

export interface SuraI {
    id: number;
    name: string;
    e_name: string;
    type: string;
    total: number;
    ayat: AyaI[];
}

export interface QuranI {
    Surah: SuraI[];
}

export interface QDBI {
    [key: string]: unknown;
    id: number;
    name: string;
    e_name?: string;
    type: string;
    total_verses: number;
    ayat: aya_interface[];
}
