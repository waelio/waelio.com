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
}

const PROFILES: Record<string, PackageMarketing> = {
    "@waelio/ustore": {
        tagline: "Persistent storage that stays out of your way",
        pitch: "A practical storage layer for apps that need reliable local state without heavy infrastructure.",
        benefits: [
            "Simple API for read/write and sync patterns",
            "Works in browser and Node environments",
            "Built for real apps, not demo tutorials",
        ],
        useCases: ["Offline-first web apps", "Local caches", "User preferences and session state"],
        textAd: {
            headline: "Ship faster with reliable local storage",
            body: "Try @waelio/ustore in your next app — minimal setup, predictable persistence.",
            ctaLabel: "View on npm",
            ctaUrl: "https://www.npmjs.com/package/@waelio/ustore",
        },
    },
    "@waelio/utils": {
        tagline: "Modern utilities for everyday TypeScript",
        pitch: "Small, focused helpers you reach for when shipping — not another kitchen-sink library.",
        benefits: [
            "Tree-shakeable modules",
            "Typed helpers for common patterns",
            "Consistent conventions across projects",
        ],
        useCases: ["App scaffolding", "Shared internal tooling", "Reducing copy-paste utils"],
        textAd: {
            headline: "Stop rewriting the same helpers",
            body: "@waelio/utils bundles the small TypeScript utilities you use every week.",
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
        tagline: "Messaging primitives for connected apps",
        pitch: "Send and receive messages across services with a package built for production workflows.",
        benefits: [
            "Clear messaging patterns",
            "Integrates with modern Node stacks",
            "Maintained for real-world usage",
        ],
        useCases: ["Event-driven backends", "Worker communication", "Notification pipelines"],
        textAd: {
            headline: "Messaging that fits your stack",
            body: "Connect services with @waelio/messaging — clear patterns, production-minded defaults.",
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
        tagline: "Waelio integrations for Quasar apps",
        pitch: "Drop Waelio capabilities into Quasar projects with an extension shaped for Vue + Quasar conventions.",
        benefits: [
            "Quasar-native integration",
            "Faster setup than wiring manually",
            "Keeps app structure clean",
        ],
        useCases: ["Quasar SPAs", "Vue enterprise apps", "Teams standardizing on Waelio"],
        textAd: {
            headline: "Waelio inside your Quasar app",
            body: "Install the extension once — wire Waelio into Vue + Quasar the conventional way.",
            ctaLabel: "View extension",
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
        tagline: "Sync workloads on the edge",
        pitch: "A worker-oriented sync app for keeping data aligned across clients and services.",
        benefits: [
            "Edge-friendly architecture",
            "Built for Cloudflare Workers patterns",
            "Focused sync scope",
        ],
        useCases: ["Edge deployments", "Multi-client sync", "Lightweight backends"],
        textAd: {
            headline: "Sync at the edge",
            body: "@waelio/sync keeps clients aligned without dragging a heavy backend along.",
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
        tagline: "CLI wrapper for negotiation flows",
        pitch: "npm-distributed CLI for negotiation-related workflows — install globally or per project.",
        benefits: [
            "CLI on npm",
            "Scriptable in CI",
            "Focused single purpose",
        ],
        useCases: ["Automation scripts", "CLI tooling chains", "Backend integrations"],
        textAd: {
            headline: "Negotiation flows from the CLI",
            body: "@waelio/negotiate — scriptable, npm-distributed, built for automation.",
            ctaLabel: "Install @waelio/negotiate",
            ctaUrl: "https://www.npmjs.com/package/@waelio/negotiate",
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
