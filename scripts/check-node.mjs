#!/usr/bin/env node
const semverMajor = Number(process.versions.node.split('.')[0])
const required = 22
if (Number.isNaN(semverMajor) || semverMajor < required) {
  console.error(`\n[waelio.com] Node ${required}.x is required. Detected Node ${process.versions.node}.`)
  console.error(`\nFix it with one of the following:`)
  console.error(`  - If using nvm: nvm install ${required} && nvm use ${required}`)
  console.error(`  - If not using nvm: install Node ${required}.x from https://nodejs.org/ and retry`)
  console.error(`\nTip: this repo includes .nvmrc. Once nvm is installed, just run: nvm use`)
  process.exit(1)
}
