#!/usr/bin/env node
// Node version enforcement script.
// Local development: strongly recommend Node 22+ (aligned with .nvmrc).
// CI / Netlify: allow Node >=20 (some hosts may not yet provide 22).
const semverMajor = Number(process.versions.node.split('.')[0])
const REQUIRED_IDEAL = 22
const REQUIRED_MIN_CI = 20
const isCI = process.env.CI === 'true' || process.env.NETLIFY === 'true'

if (Number.isNaN(semverMajor)) {
  console.error(`\n[waelio.com] Unable to determine Node version (process.versions.node='${process.versions.node}').`)
  process.exit(1)
}

// Determine threshold based on environment
const threshold = isCI ? REQUIRED_MIN_CI : REQUIRED_IDEAL

if (semverMajor < threshold) {
  console.error(`\n[waelio.com] Node ${threshold}+ required${isCI ? ' for CI build' : ''}. Detected ${process.versions.node}.`)
  console.error(`Upgrade suggestions:`)
  console.error(`  nvm install ${REQUIRED_IDEAL} && nvm use ${REQUIRED_IDEAL}`)
  console.error(`  or download latest from https://nodejs.org/`)
  process.exit(1)
}

// Warn (do not fail) if in CI and below ideal but above minimum
if (isCI && semverMajor < REQUIRED_IDEAL) {
  console.warn(`\n[waelio.com] Warning: running on Node ${process.versions.node}. Recommended ${REQUIRED_IDEAL}.x. Proceeding (CI allowance >=${REQUIRED_MIN_CI}).`)
}

