# waelio.com (Deno project)# Nuxt Minimal Starter

This repository currently contains a minimal Deno project with a simple example
function and a matching test.Look at the
[Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to
learn more.

## Files## Setup

- `main.ts` — exports a sample `add(a, b)` function and prints a demo when run
  directly.Make sure to install dependencies:

- `main_test.ts` — unit test for `add` using the Deno standard assert library.

- `deno.json` — project tasks and import mappings.```bash

# npm

## Quick startnpm install

Run the program once:# pnpm

pnpm install

````sh
deno run main.ts# yarn

```yarn install



Run in watch mode (restarts on file changes):# bun

bun install

```sh```

deno task dev

```## Development Server



Run tests:Start the development server on `http://localhost:3000`:



```sh```bash

deno test# npm

```npm run dev



## Notes# pnpm

pnpm dev

- This is a Deno-native project. Node, npm, and Nuxt/Vue configs are not used in this folder.

- If you previously had Node or Nuxt artifacts here (e.g., `node_modules/`, `package.json`), remove them to avoid conflicts.# yarn

yarn dev

# bun
bun run dev
````

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the
[deployment documentation](https://nuxt.com/docs/getting-started/deployment) for
more information.
