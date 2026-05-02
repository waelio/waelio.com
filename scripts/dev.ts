import net from "node:net";
import { spawn } from "node:child_process";

const PORT = Number(process.env.PORT) || 3333;
const HOST = process.env.HOST || "127.0.0.1";
const SERVER_URL = `http://${HOST}:${PORT}`;
const PNPM_COMMAND = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

function isPortOpen(host: string, port: number, timeoutMs = 750): Promise<boolean> {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        let settled = false;

        const finish = (result: boolean) => {
            if (settled) return;
            settled = true;
            socket.destroy();
            resolve(result);
        };

        socket.setTimeout(timeoutMs);
        socket.once("connect", () => finish(true));
        socket.once("timeout", () => finish(false));
        socket.once("error", (error: NodeJS.ErrnoException) => {
            if (error.code === "ECONNREFUSED" || error.code === "EHOSTUNREACH") {
                finish(false);
                return;
            }

            finish(true);
        });

        socket.connect(port, host);
    });
}

async function isWaelioServerRunning(): Promise<boolean> {
    try {
        const response = await fetch(`${SERVER_URL}/api/config`, {
            signal: AbortSignal.timeout(1000),
        });
        if (!response.ok) return false;

        const payload = await response.json().catch(() => null);
        return typeof payload === "object" && payload !== null && "googleClientId" in payload;
    } catch {
        return false;
    }
}

function runCommand(command: string, args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            stdio: "inherit",
            env: process.env,
        });

        child.on("error", reject);
        child.on("exit", (code) => {
            if (code === 0) {
                resolve();
                return;
            }

            reject(new Error(`${command} ${args.join(" ")} exited with code ${code ?? 1}`));
        });
    });
}

async function main(): Promise<void> {
    const portOpen = await isPortOpen(HOST, PORT);

    if (portOpen) {
        if (await isWaelioServerRunning()) {
            console.log(`Dev server already running at ${SERVER_URL}. Reusing existing server.`);
            return;
        }

        console.error(
            `Port ${PORT} is already in use on ${HOST}. Stop the other process or set PORT to a different value.`,
        );
        process.exitCode = 1;
        return;
    }

    await runCommand(PNPM_COMMAND, ["run", "build:web"]);

    const child = spawn(PNPM_COMMAND, ["exec", "tsx", "watch", "server.ts"], {
        stdio: "inherit",
        env: process.env,
    });

    const forwardSignal = (signal: NodeJS.Signals) => {
        if (!child.killed) child.kill(signal);
    };

    process.on("SIGINT", () => forwardSignal("SIGINT"));
    process.on("SIGTERM", () => forwardSignal("SIGTERM"));

    child.on("error", (error) => {
        console.error(`Failed to start dev server: ${error.message}`);
        process.exit(1);
    });

    child.on("exit", (code) => {
        process.exit(code ?? 0);
    });
}

void main();
