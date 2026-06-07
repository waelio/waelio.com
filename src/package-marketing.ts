export interface TextAd {
    headline: string;
    body: string;
    ctaLabel: string;
    ctaUrl: string;
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
        relatedPackages: ["@waelio/sync", "@waelio/negotiate", "@waelio/cli"],
        textAd: {
            headline: "Messaging primitives that just work",
            body: "@waelio/messaging — connect services with clear, production-ready patterns. No bloat.",
            ctaLabel: "Get @waelio/messaging",
            ctaUrl: "https://www.npmjs.com/package/@waelio/messaging",
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
        pitch: "Host and embed agent experiences — npm for embedders, hosted URLs when you want zero setup.",
        benefits: [
            "Embeddable agent UI",
            "Works with your stack",
            "Hosted and npm distribution options",
        ],
        useCases: ["In-app assistants", "Internal tools", "Product copilots"],
        textAd: {
            headline: "Embed an agent in your product",
            body: "@waelio/agent — npm for embedders, hosted options when you want zero setup.",
            ctaLabel: "Learn about @waelio/agent",
            ctaUrl: "https://www.npmjs.com/package/@waelio/agent",
        },
    },
    "@waelio/sync": {
        tagline: "Keep your data in sync — on the edge, without the overhead.",
        pitch: "A worker-oriented sync layer for keeping data aligned across clients and services. Built for Cloudflare Workers and edge-first architectures.",
        benefits: [
            "Edge-native — runs on Cloudflare Workers",
            "Multi-client data alignment out of the box",
            "Minimal footprint, focused scope",
            "Pairs perfectly with @waelio/realdb and @waelio/ustore",
        ],
        useCases: ["Edge deployments", "Multi-client sync", "Real-time collaboration", "Lightweight backends"],
        relatedPackages: ["@waelio/realdb", "@waelio/ustore", "@waelio/messaging"],
        textAd: {
            headline: "Sync clients at the edge — no heavy backend",
            body: "@waelio/sync keeps clients aligned with an edge-first architecture built for Cloudflare Workers.",
            ctaLabel: "See @waelio/sync",
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
        tagline: "Two AI agents negotiate, autonomously — you just watch.",
        pitch: "A production-ready multi-agent AI negotiation service. Two AI agents exchange proposals, counter-offers, and reach agreements — fully autonomously. Deploy serverless on Cloudflare or self-hosted. Change context, goals, and personas mid-session.",
        benefits: [
            "Fully autonomous AI vs AI negotiation",
            "Hot-swap context and goals mid-session",
            "Serverless on Cloudflare or self-hosted with Python",
            "Persistent sessions with handoff support",
            "Ships with npm CLI + REST API + live web UI",
        ],
        useCases: ["Salary negotiation simulation", "Contract term discussions", "Multi-agent AI workflows", "AI product demos", "Agent handoff and resumption"],
        relatedPackages: ["@waelio/messaging", "@waelio/sync"],
        textAd: {
            headline: "Let two AIs negotiate — fully automated",
            body: "@waelio/negotiate — deploy in minutes, change context mid-session, watch agents reach real agreements.",
            ctaLabel: "Try @waelio/negotiate",
            ctaUrl: "https://www.npmjs.com/package/@waelio/negotiate",
        },
    },

    "@waelio/realdb": {
        tagline: "A reactive local database built for modern JavaScript apps",
        pitch: "@waelio/realdb is a lightweight, reactive database layer that brings real-time local data management to your JavaScript and TypeScript projects — without the overhead of a server.",
        benefits: [
            "Reactive queries that update automatically",
            "Works offline — no server required",
            "TypeScript-first with full type safety",
            "Tiny footprint, zero external dependencies",
            "Pairs perfectly with @waelio/sync for edge sync",
        ],
        useCases: ["Offline-first apps", "Real-time UI state", "Local-first data architecture", "PWAs and embedded apps"],
        textAd: {
            headline: "A reactive database that lives in your app",
            body: "@waelio/realdb — reactive, local, and TypeScript-native. No server, no hassle.",
            ctaLabel: "Install @waelio/realdb",
            ctaUrl: "https://www.npmjs.com/package/@waelio/realdb",
        },
    },

};

export const ALL_PACKAGE_NAMES = [
    "@waelio/ustore",
    "@waelio/utils",
    "@waelio/data",
    "@waelio/messaging",
    "@waelio/cli",
    "quasar-app-extension-waelio",
    "waelio-utils",
    "@waelio/agent",
    "@waelio/sync",
    "@waelio/builder",
    "@waelio/negotiate",
    "@waelio/realdb",
] as const;

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
            "Live version and download stats",
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
