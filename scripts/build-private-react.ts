import { mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = dirname(SCRIPT_DIR);
const ENTRY_FILE = join(ROOT_DIR, "src", "private-react", "main.tsx");
const OUTPUT_DIR = join(ROOT_DIR, "public", "private-app");

async function main(): Promise<void> {
    await Promise.all([
        rm(join(ROOT_DIR, "public", "private.js"), { force: true }),
        rm(join(ROOT_DIR, "public", "shared"), { recursive: true, force: true }),
        rm(OUTPUT_DIR, { recursive: true, force: true }),
    ]);

    await mkdir(OUTPUT_DIR, { recursive: true });

    await build({
        entryPoints: [ENTRY_FILE],
        outdir: OUTPUT_DIR,
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
