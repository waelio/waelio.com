export interface TextAd {
    headline: string;
    body: string;
    ctaLabel: string;
    ctaUrl: string;
}

export interface ProductionProof {
    appName: string;
    appUrl: string;
    detail: string;
}

export interface PackageMarketing {
    /** Short marketing headline shown in hero */
    tagline: string;
    /** Longer pitch for the landing page */
    pitch: string;
    benefits: string[];
    useCases: string[];
    /** Optional primary CTA label (install is always shown) */
    ctaHint?: string;
    /** Text-only promo for testing (no image required) */
    textAd: TextAd;
    /** Documented all-time weekly download peak for this specific package */
    peakWeeklyDownloads?: number;
    /** Live app that ships this package in production */
    productionProof?: ProductionProof;
    /** Related @waelio packages to cross-promote */
    relatedPackages?: string[];
}

const PROFILES: Record<string, PackageMarketing> = {
    "@waelio/ustore": {
        tagline: "Reliable local state management — no server required.",
        pitch: "A practical storage layer for apps that need dependable local state without heavy infrastructure. Simple API, predictable behavior, works everywhere.",
        benefits: [
            "Simple read/write/sync API — no boilerplate",
            "Works in browser and Node environments",
            "Lightweight — zero heavy dependencies",
            "Battle-tested in production apps",
        ],
        useCases: ["Offline-first web apps", "Local caches", "User preferences", "Session state"],
        peakWeeklyDownloads: 6000,
        relatedPackages: ["@waelio/sync", "@waelio/data", "@waelio/realdb"],
        textAd: {
            headline: "Ship faster with reliable local storage",
            body: "Try @waelio/ustore — minimal setup, predictable persistence, works in browser and Node.",
            ctaLabel: "Install @waelio/ustore",
            ctaUrl: "https://www.npmjs.com/package/@waelio/ustore",
        },
    },
    "@waelio/utils": {
        tagline: "The TypeScript utilities you reach for every week.",
        pitch: "Small, focused helpers for everyday TypeScript work — not another kitchen-sink library. Tree-shakeable, fully typed, and consistent across all your projects.",
        benefits: [
            "Tree-shakeable — only ship what you use",
            "Fully typed — TypeScript native",
            "Consistent conventions across your whole codebase",
            "Modern ESM with CommonJS fallback",
        ],
        useCases: ["App scaffolding", "Shared internal tooling", "Reducing copy-paste code", "Monorepo shared utilities"],
        peakWeeklyDownloads: 6000,
        relatedPackages: ["@waelio/data", "@waelio/cli", "waelio-utils"],
        textAd: {
            headline: "Stop rewriting the same TypeScript helpers",
            body: "@waelio/utils — the small utilities you use every week, properly typed and tree-shakeable.",
            ctaLabel: "Install @waelio/utils",
            ctaUrl: "https://www.npmjs.com/package/@waelio/utils",
        },
    },
    "@waelio/data": {
        tagline: "Schemas and local data, done simply",
        pitch: "Structure your data with schemas and keep local persistence predictable as you grow.",
        benefits: [
            "Schema-first data modeling",
            "Local database patterns",
            "Pairs well with other @waelio packages",
        ],
        useCases: ["Client-side data layers", "Prototypes with real structure", "Embedded apps"],
        textAd: {
            headline: "Schema-first data without the ceremony",
            body: "Model and persist local data with @waelio/data — built for real prototypes and products.",
            ctaLabel: "Explore @waelio/data",
            ctaUrl: "https://www.npmjs.com/package/@waelio/data",
        },
    },
    "@waelio/messaging": {
        tagline: "Simple, reliable messaging between your services.",
        pitch: "Send and receive messages across services with clear patterns built for production. No overengineering — just the primitives you actually need.",
        benefits: [
            "Clean publish/subscribe API",
            "Works across tabs, workers, and services",
            "Integrates with any modern Node.js stack",
            "Production-tested patterns, not academic abstractions",
        ],
        useCases: ["Event-driven backends", "Cross-tab communication", "Worker messaging", "Notification pipelines"],
        peakWeeklyDownloads: 6000,
        relatedPackages: ["@waelio/sync", "@waelio/negotiate", "@waelio/chat"],
        textAd: {
            headline: "Messaging primitives that just work",
            body: "@waelio/messaging — connect services with clear, production-ready patterns. No bloat.",
            ctaLabel: "Get @waelio/messaging",
            ctaUrl: "https://www.npmjs.com/package/@waelio/messaging",
        },
    },
    "@waelio/chat": {
        tagline: "Your direct channel — no WhatsApp, no social networks.",
        pitch: "Sign in with Google and message Wael on waelio.com. Open to anyone. No WhatsApp or Facebook.",
        benefits: [
            "Always available from waelio.com",
            "Google sign-in — real names, not anonymous noise",
            "No WhatsApp, Facebook, or third-party social apps",
            "Powered by your own @waelio/messaging stack",
        ],
        useCases: ["Direct conversations", "Community support", "Staying in touch on your own platform", "Replacing social-app DMs"],
        ctaHint: "Install to your home screen for one-tap access",
        relatedPackages: ["@waelio/messaging", "peace2074.com", "@waelio/sync"],
        textAd: {
            headline: "Talk on waelio.com — not on WhatsApp",
            body: "@waelio/chat is your signed-in direct channel. Open it any time from your packages or home screen.",
            ctaLabel: "Open secure chat",
            ctaUrl: "https://waelio.com/chat",
        },
    },
    "peace2074.com": {
        tagline: "Quran, reflection, and community — at peace2074.com.",
        pitch: "The main PEACE2074 app: multilingual Quran, recitation, blog, chat, and more. Built on the @waelio stack.",
        benefits: [
            "Web app and native iOS wrapper",
            "Many languages including Arabic, English, Uzbek, and more",
            "Uses @waelio/messaging, @waelio/realdb, and @waelio/sync",
            "Open source and always improving",
        ],
        useCases: ["Daily Quran reading", "Community and blog", "Peace2074 mobile app", "Production home for @waelio packages"],
        relatedPackages: ["@waelio/chat", "@waelio/messaging", "@waelio/realdb"],
        textAd: {
            headline: "peace2074.com — the main app",
            body: "Open peace2074.com — Quran, chat, blog, and the @waelio ecosystem in one place.",
            ctaLabel: "Open peace2074.com",
            ctaUrl: "https://peace2074.com",
        },
    },
    "@waelio/cli": {
        tagline: "Command-line tools that respect your time",
        pitch: "A CLI toolkit for automating repetitive dev tasks and shipping faster from the terminal.",
        benefits: [
            "Scriptable commands",
            "Composable with npm scripts",
            "Built for daily developer use",
        ],
        useCases: ["Project automation", "Release workflows", "Internal dev tooling"],
        textAd: {
            headline: "Automate from the terminal",
            body: "@waelio/cli wraps the commands you run daily into one dependable toolkit.",
            ctaLabel: "Try the CLI",
            ctaUrl: "https://www.npmjs.com/package/@waelio/cli",
        },
    },
    "quasar-app-extension-waelio": {
        tagline: "Scaffold a production-ready Quasar app, powered by the @waelio ecosystem.",
        pitch: "Drop Waelio capabilities into Quasar + Vue 3 projects with one command. Local state via @waelio/ustore, utilities via @waelio/utils, messaging via @waelio/messaging — all wired up for you from the start.",
        benefits: [
            "Replaces store2 with @waelio/ustore for modern local state",
            "Vue 3 / Quasar 2+ compatible — no Vue.prototype patterns",
            "Full page scaffold: home, about, contact, products, 404 and more",
            "Built-in i18n: English, Arabic, Hebrew, Russian",
            "TypeScript-ready variant included",
        ],
        useCases: ["Quasar SPAs", "Vue 3 enterprise apps", "Teams standardizing on @waelio", "Rapid app prototyping"],
        relatedPackages: ["@waelio/ustore", "@waelio/utils", "@waelio/messaging"],
        textAd: {
            headline: "Full Quasar app scaffold in one command",
            body: "quasar ext add waelio — pages, i18n, local state, and messaging, all powered by @waelio and ready to customize.",
            ctaLabel: "Install the extension",
            ctaUrl: "https://www.npmjs.com/package/quasar-app-extension-waelio",
        },
    },
    "waelio-utils": {
        tagline: "Legacy utilities — still maintained",
        pitch: "The original Waelio utils package. Prefer @waelio/utils for new work; this remains for existing projects.",
        benefits: [
            "Stable API for legacy codebases",
            "Wide compatibility",
            "Migration path to @waelio/utils",
        ],
        useCases: ["Existing apps on waelio-utils", "Gradual migration", "Long-lived deployments"],
        ctaHint: "Consider @waelio/utils for new projects",
        textAd: {
            headline: "Still on waelio-utils?",
            body: "It remains supported — new projects should start with @waelio/utils instead.",
            ctaLabel: "Compare @waelio/utils",
            ctaUrl: "https://waelio.com/packages/@waelio%2Futils",
        },
    },
    "@waelio/agent": {
        tagline: "Agent tooling for modern workflows",
        pitch: "Embed agent experiences in your app — install from npm and wire it into your stack.",
        benefits: [
            "Embeddable agent UI",
            "Works with your stack",
            "Published on npm",
        ],
        useCases: ["In-app assistants", "Internal tools", "Product copilots"],
        textAd: {
            headline: "Embed an agent in your product",
            body: "@waelio/agent — install from npm and integrate with your app.",
            ctaLabel: "Install @waelio/agent",
            ctaUrl: "https://www.npmjs.com/package/@waelio/agent",
        },
    },
    "@waelio/sync": {
        tagline: "Keep your data in sync — on the edge, without the overhead.",
        pitch: "A worker-oriented sync layer for keeping data aligned across clients and services. Built for edge and worker runtimes.",
        benefits: [
            "Edge-native — runs in worker environments",
            "Multi-client data alignment out of the box",
            "Minimal footprint, focused scope",
            "Pairs perfectly with @waelio/realdb and @waelio/ustore",
        ],
        useCases: ["Edge deployments", "Multi-client sync", "Real-time collaboration", "Lightweight backends"],
        relatedPackages: ["@waelio/realdb", "@waelio/ustore", "@waelio/messaging"],
        textAd: {
            headline: "Sync clients at the edge — no heavy backend",
            body: "@waelio/sync keeps clients aligned with a lightweight edge-first architecture.",
            ctaLabel: "Install @waelio/sync",
            ctaUrl: "https://www.npmjs.com/package/@waelio/sync",
        },
    },
    "@waelio/builder": {
        tagline: "Scaffold projects with confidence",
        pitch: "Generate project structure and boilerplate so you start from a working baseline, not a blank folder.",
        benefits: [
            "Opinionated scaffolds",
            "CLI-first workflow",
            "Repeatable project setup",
        ],
        useCases: ["New repos", "Team templates", "Consistent starter kits"],
        textAd: {
            headline: "Start from a real baseline",
            body: "@waelio/builder scaffolds projects so day one is code, not empty folders.",
            ctaLabel: "Use @waelio/builder",
            ctaUrl: "https://www.npmjs.com/package/@waelio/builder",
        },
    },
    "@waelio/negotiate": {
        tagline: "Your real situation — two AIs negotiate what you write",
        pitch: "Bring a real negotiation from your life or work. You describe the topic and both sides. Agent A and Agent B argue only your words — not a canned demo.",
        benefits: [
            "You supply the real topic — nothing pre-written",
            "Two AIs negotiate only what you type",
            "Continue rounds until you stop",
            "Install from npm for your own server",
        ],
        useCases: [
            "A deal or dispute you are actually facing",
            "Practice before a real conversation",
            "Exploring both sides of a decision",
            "Multi-agent experiments with your own context",
        ],
        ctaHint: "Install with npm, then run your own negotiation server.",
        relatedPackages: ["@waelio/messaging", "@waelio/sync", "@waelio/agent"],
        textAd: {
            headline: "Two AIs negotiate what you write",
            body: "Real topic from you. Agent A and Agent B argue your scenario — install from npm.",
            ctaLabel: "Install @waelio/negotiate",
            ctaUrl: "https://www.npmjs.com/package/@waelio/negotiate",
        },
    },

    "@waelio/sockets": {
        tagline: "Native WebSocket client — event-driven, typed, reconnect-ready.",
        pitch: "A lightweight, typed WebSocket client for browsers and Node. Drop-in socket.io replacement with zero dependencies — familiar API, native speed.",
        benefits: [
            "Zero dependencies — uses native WebSocket",
            "Event-emitter API: socket.on(), socket.send(), socket.off()",
            "Auto-reconnect with configurable retry delay",
            "TypeScript-first with full type safety",
        ],
        useCases: ["Real-time apps", "Chat and collaboration", "Live dashboards", "Replacing socket.io-client"],
        relatedPackages: ["@waelio/messaging", "@waelio/sync", "@waelio/chat"],
        textAd: {
            headline: "Native WebSocket — no socket.io overhead",
            body: "@waelio/sockets — typed, reconnect-ready, zero deps. The WebSocket client you actually want.",
            ctaLabel: "Install @waelio/sockets",
            ctaUrl: "https://www.npmjs.com/package/@waelio/sockets",
        },
    },

    "@waelio/realdb": {
        tagline: "Reactive local database — powers offline Quran audio on peace2074.com",
        pitch: "@waelio/realdb stores and tracks offline recitation downloads in production on peace2074.com. Reactive collections, TypeScript-first, no server required.",
        benefits: [
            "In production on peace2074.com — offline recitation download state",
            "Reactive queries that update automatically",
            "Works offline — LocalStorage and memory adapters",
            "TypeScript-first with full type safety",
            "Pairs with @waelio/sync for cross-device Quran position",
        ],
        useCases: [
            "Offline-first PWAs",
            "Download progress tracking",
            "Local-first mobile apps",
            "Reactive UI state",
        ],
        productionProof: {
            appName: "peace2074.com",
            appUrl: "https://peace2074.com",
            detail: "Tracks every offline Quran recitation download — reactive, persistent, queryable.",
        },
        ctaHint: "Used in production on peace2074.com today.",
        textAd: {
            headline: "The database behind peace2074 offline audio",
            body: "@waelio/realdb — battle-tested for offline recitation downloads, not just demos.",
            ctaLabel: "Install @waelio/realdb",
            ctaUrl: "https://www.npmjs.com/package/@waelio/realdb",
        },
    },

};

export const ALL_PACKAGE_NAMES = [
    "@waelio/chat",
    "peace2074.com",
    "@waelio/ustore",
    "@waelio/utils",
    "@waelio/data",
    "@waelio/messaging",
    "@waelio/sockets",
    "@waelio/cli",
    "quasar-app-extension-waelio",
    "waelio-utils",
    "@waelio/agent",
    "@waelio/sync",
    "@waelio/builder",
    "@waelio/negotiate",
    "@waelio/realdb",
] as const;

export const CHAT_PACKAGE_NAME = "@waelio/chat";
export const CHAT_PACKAGE_URL = "/chat";
export const PEACE2074_PACKAGE_NAME = "peace2074.com";
export const PEACE2074_PACKAGE_URL = "https://peace2074.com";
export const PINNED_PACKAGE_NAMES = [CHAT_PACKAGE_NAME, PEACE2074_PACKAGE_NAME] as const;

export interface SitePackageConfig {
    url: string;
    badge: string;
    cta: string;
    metaRight: string;
}

const SITE_PACKAGE_CONFIG: Record<string, SitePackageConfig> = {
    [CHAT_PACKAGE_NAME]: {
        url: CHAT_PACKAGE_URL,
        badge: "💬 Chat",
        cta: "Open chat →",
        metaRight: "Secure chat",
    },
    [PEACE2074_PACKAGE_NAME]: {
        url: PEACE2074_PACKAGE_URL,
        badge: "★ Main app",
        cta: "Open peace2074 →",
        metaRight: "Web app",
    },
};

export function getSitePackageConfig(name: string): SitePackageConfig | null {
    return SITE_PACKAGE_CONFIG[name] ?? null;
}

export interface SitePackageMeta {
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

export function isSitePackage(name: string): boolean {
    return (PINNED_PACKAGE_NAMES as readonly string[]).includes(name);
}

export function packageLink(name: string): string {
    return getSitePackageConfig(name)?.url ?? packagePagePath(name);
}

export function getSitePackageMeta(name: string): SitePackageMeta | null {
    const config = getSitePackageConfig(name);
    if (!config) {
        return null;
    }

    const marketing = getPackageMarketing(name);
    const readmeByPackage: Record<string, string[]> = {
        [CHAT_PACKAGE_NAME]: [
            "## @waelio/chat",
            "",
            "Your signed-in direct channel on waelio.com.",
            "",
            "- [Open secure chat](/chat)",
        ],
        [PEACE2074_PACKAGE_NAME]: [
            "## peace2074.com",
            "",
            "Quran, blog, chat, and community.",
            "",
            "- [Open peace2074.com](https://peace2074.com)",
        ],
    };

    return {
        name,
        description: marketing.tagline,
        version: "published",
        homepage: config.url.startsWith("http") ? config.url : `https://waelio.com${config.url}`,
        repository: name === PEACE2074_PACKAGE_NAME
            ? { url: "https://github.com/waelio/peace2074.com" }
            : null,
        keywords: name === CHAT_PACKAGE_NAME
            ? ["chat", "direct", "secure", "messaging"]
            : ["quran", "peace2074", "app", "community"],
        license: name === CHAT_PACKAGE_NAME ? "Your channel" : "Open app",
        readme: (readmeByPackage[name] ?? []).join("\n"),
    };
}

export function packagePagePath(name: string): string {
    return `/packages/${encodeURIComponent(name)}`;
}

export function getPackageMarketing(name: string, npmDescription?: string): PackageMarketing {
    const profile = PROFILES[name];
    if (profile) {
        return profile;
    }

    return {
        tagline: npmDescription || "A @waelio npm package",
        pitch: npmDescription || "Explore this package, install it, and use the documentation below to get started.",
        benefits: [
            "Published on npm under @waelio",
            "Current version and download stats",
            "Documentation included below",
        ],
        useCases: ["JavaScript and TypeScript projects", "Node and browser tooling", "Open source workflows"],
        textAd: {
            headline: name,
            body: npmDescription || "Install from npm and explore the documentation on this page.",
            ctaLabel: "View on npm",
            ctaUrl: `https://www.npmjs.com/package/${encodeURIComponent(name)}`,
        },
    };
}
