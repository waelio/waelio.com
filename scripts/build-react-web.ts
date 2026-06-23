import { rm, readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { ALL_PACKAGE_NAMES, getPackageMarketing } from "../src/package-marketing.ts";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = dirname(SCRIPT_DIR);
const PUBLIC_DIR = join(ROOT_DIR, "public");

async function main(): Promise<void> {
    await Promise.all([
        rm(join(PUBLIC_DIR, "app.js"), { force: true }),
        rm(join(PUBLIC_DIR, "docs.js"), { force: true }),
        rm(join(PUBLIC_DIR, "login.js"), { force: true }),
        rm(join(PUBLIC_DIR, "chat.js"), { force: true }),
        rm(join(PUBLIC_DIR, "main.js"), { force: true }),
        rm(join(PUBLIC_DIR, "main.css"), { force: true }),
        rm(join(PUBLIC_DIR, "private.js"), { force: true }),
        rm(join(PUBLIC_DIR, "shared"), { recursive: true, force: true }),
        rm(join(PUBLIC_DIR, "private-app"), { recursive: true, force: true }),
        rm(join(PUBLIC_DIR, "private-agent"), { recursive: true, force: true }),
        rm(join(PUBLIC_DIR, "packages"), { recursive: true, force: true }),
    ]);

    await build({
        entryPoints: {
            app: join(ROOT_DIR, "src", "app.tsx"),
            docs: join(ROOT_DIR, "src", "docs.tsx"),
            login: join(ROOT_DIR, "src", "login.tsx"),
            chat: join(ROOT_DIR, "src", "chat.tsx"),
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

    console.log("Generating static package pages...");
    const templatePath = join(PUBLIC_DIR, "index.html");
    const templateHtml = await readFile(templatePath, "utf-8");

    for (const name of ALL_PACKAGE_NAMES) {
        const marketing = getPackageMarketing(name);
        const cleanedTagline = marketing.tagline.replace(/\.$/, "");
        const descriptionText = `${cleanedTagline}. Live npm version, weekly downloads, and documentation for ${name}.`;
        const canonicalUrl = `https://waelio.com/packages/${encodeURIComponent(name)}`;

        // Replace metadata
        let html = templateHtml;

        // Replace title
        html = html.replace(
            /<title>.*?<\/title>/,
            `<title>${name} – waelio.com</title>`
        );

        // Replace meta description
        html = html.replace(
            /<meta\s+name="description"\s+content=".*?"\s*\/?>/i,
            `<meta name="description" content="${descriptionText}" />`
        );

        // Replace canonical URL
        html = html.replace(
            /<link\s+rel="canonical"\s+href=".*?"\s*\/?>/i,
            `<link rel="canonical" href="${canonicalUrl}" />`
        );

        // Replace OG Title
        html = html.replace(
            /<meta\s+property="og:title"\s+content=".*?"\s*\/?>/i,
            `<meta property="og:title" content="${name} – waelio.com" />`
        );

        // Replace OG Description
        html = html.replace(
            /<meta\s+property="og:description"\s+content=".*?"\s*\/?>/i,
            `<meta property="og:description" content="${descriptionText}" />`
        );

        // Replace OG URL
        html = html.replace(
            /<meta\s+property="og:url"\s+content=".*?"\s*\/?>/i,
            `<meta property="og:url" content="${canonicalUrl}" />`
        );

        // Replace Twitter Title
        html = html.replace(
            /<meta\s+name="twitter:title"\s+content=".*?"\s*\/?>/i,
            `<meta name="twitter:title" content="${name} – waelio.com" />`
        );

        // Replace Twitter Description
        html = html.replace(
            /<meta\s+name="twitter:description"\s+content=".*?"\s*\/?>/i,
            `<meta name="twitter:description" content="${descriptionText}" />`
        );

        const packageDir = join(PUBLIC_DIR, "packages", name);
        await mkdir(packageDir, { recursive: true });
        await writeFile(join(packageDir, "index.html"), html, "utf-8");
        console.log(`Generated page for ${name}`);
    }
}

void main();
