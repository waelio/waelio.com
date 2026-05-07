import { rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = dirname(SCRIPT_DIR);
const PUBLIC_DIR = join(ROOT_DIR, "public");

async function main(): Promise<void> {
    await Promise.all([
        rm(join(PUBLIC_DIR, "app.js"), { force: true }),
        rm(join(PUBLIC_DIR, "login.js"), { force: true }),
        rm(join(PUBLIC_DIR, "main.js"), { force: true }),
        rm(join(PUBLIC_DIR, "main.css"), { force: true }),
        rm(join(PUBLIC_DIR, "private.js"), { force: true }),
        rm(join(PUBLIC_DIR, "shared"), { recursive: true, force: true }),
        rm(join(PUBLIC_DIR, "private-app"), { recursive: true, force: true }),
        rm(join(PUBLIC_DIR, "private-agent"), { recursive: true, force: true }),
    ]);

    await build({
        entryPoints: {
            app: join(ROOT_DIR, "src", "app.tsx"),
            login: join(ROOT_DIR, "src", "login.tsx"),
        },
        outdir: PUBLIC_DIR,
        bundle: true,
        format: "esm",
        platform: "browser",
        target: ["es2022"],
        jsx: "automatic",
        sourcemap: false,
        minify: false,
        entryNames: "[name]",
        assetNames: "assets/[name]-[hash]",
        logLevel: "info",
    });

    await build({
        entryPoints: [join(ROOT_DIR, "src", "private-react", "main.tsx")],
        outdir: join(PUBLIC_DIR, "private-app"),
        bundle: true,
        format: "esm",
        platform: "browser",
        target: ["es2022"],
        jsx: "automatic",
        sourcemap: false,
        minify: false,
        entryNames: "main",
        assetNames: "assets/[name]-[hash]",
        logLevel: "info",
    });

    await build({
        entryPoints: [join(ROOT_DIR, "src", "private-agent", "main.tsx")],
        outdir: join(PUBLIC_DIR, "private-agent"),
        bundle: true,
        format: "esm",
        platform: "browser",
        target: ["es2022"],
        jsx: "automatic",
        sourcemap: false,
        minify: false,
        entryNames: "main",
        assetNames: "assets/[name]-[hash]",
        logLevel: "info",
    });
}

void main();
