import { useEffect, useMemo, useState } from "react";

export type ThemeMode = "dim" | "light" | "dark";

export interface ThemeOption {
    value: ThemeMode;
    label: string;
    icon: string;
}

export const THEME_OPTIONS: readonly ThemeOption[] = [
    { value: "dim", label: "Soft", icon: "◐" },
    { value: "dark", label: "Dark", icon: "☾" },
    { value: "light", label: "Light", icon: "☼" },
];

const THEME_STORAGE_KEY = "waelio-theme";
const THEME_COLORS: Record<ThemeMode, string> = {
    dim: "#dbe1e8",
    light: "#f4f7fb",
    dark: "#171d2c",
};
const THEME_SCHEMES: Record<ThemeMode, "light" | "dark"> = {
    dim: "light",
    light: "light",
    dark: "dark",
};

function isThemeMode(value: unknown): value is ThemeMode {
    return value === "dim" || value === "light" || value === "dark";
}

function readPreferredThemeMode(): ThemeMode {
    if (typeof window === "undefined") {
        return "dim";
    }

    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
    }

    return "dim";
}

export function readStoredThemeMode(): ThemeMode {
    if (typeof window === "undefined") {
        return "dim";
    }

    try {
        const storedValue = window.localStorage.getItem(THEME_STORAGE_KEY);
        if (isThemeMode(storedValue)) {
            return storedValue;
        }
    } catch {
        // Ignore storage failures and fall back to a comfortable theme.
    }

    return readPreferredThemeMode();
}

export function applyThemeMode(theme: ThemeMode): void {
    if (typeof document === "undefined") {
        return;
    }

    const root = document.documentElement;
    root.dataset.theme = theme;
    root.style.colorScheme = THEME_SCHEMES[theme];

    const body = document.body;
    if (body) {
        body.dataset.theme = theme;
    }

    const metaThemeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    metaThemeColor?.setAttribute("content", THEME_COLORS[theme]);
}

export function persistThemeMode(theme: ThemeMode): void {
    if (typeof window === "undefined") {
        return;
    }

    try {
        window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
        // Ignore storage failures and keep the current in-memory theme.
    }
}

export function useThemeMode(): {
    theme: ThemeMode;
    setTheme: (theme: ThemeMode) => void;
    themeOptions: readonly ThemeOption[];
} {
    const [theme, setTheme] = useState<ThemeMode>(() => readStoredThemeMode());

    useEffect(() => {
        applyThemeMode(theme);
        persistThemeMode(theme);
    }, [theme]);

    return useMemo(() => ({
        theme,
        setTheme: (nextTheme: ThemeMode) => {
            setTheme(nextTheme);
        },
        themeOptions: THEME_OPTIONS,
    }), [theme]);
}
