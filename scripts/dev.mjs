#!/usr/bin/env node

import net from "node:net";
import { spawn } from "node:child_process";

const PORT = Number(process.env.PORT) || 3333;
const HOST = process.env.HOST || "127.0.0.1";
const SERVER_URL = `http://${HOST}:${PORT}`;

function isPortOpen(host, port, timeoutMs = 750) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let settled = false;

    const finish = (result) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(result);
    };

    socket.setTimeout(timeoutMs);
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false));
    socket.once("error", (error) => {
      if (error.code === "ECONNREFUSED" || error.code === "EHOSTUNREACH") {
        finish(false);
        return;
      }
      finish(true);
    });

    socket.connect(port, host);
  });
}

async function isWaelioServerRunning() {
  try {
    const res = await fetch(`${SERVER_URL}/api/config`, {
      signal: AbortSignal.timeout(1000),
    });

    if (!res.ok) return false;

    const data = await res.json();
    return Boolean(
      data && typeof data === "object" && "googleClientId" in data,
    );
  } catch {
    return false;
  }
}

async function main() {
  const portOpen = await isPortOpen(HOST, PORT);

  if (portOpen) {
    if (await isWaelioServerRunning()) {
      console.log(
        `Dev server already running at ${SERVER_URL}. Reusing existing server.`,
      );
      return;
    }

    console.error(
      `Port ${PORT} is already in use on ${HOST}. Stop the other process or set PORT to a different value.`,
    );
    process.exitCode = 1;
    return;
  }

  const child = spawn(process.execPath, ["--watch", "server.mjs"], {
    stdio: "inherit",
    env: process.env,
  });

  const forwardSignal = (signal) => {
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

await main();
