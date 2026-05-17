#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const workflowsDir = join(root, ".github", "workflows");
const errors = [];
const warnings = [];
const fullShaPattern = /^[0-9a-f]{40}$/i;

if (!existsSync(workflowsDir)) {
  errors.push("Missing .github/workflows directory.");
} else {
  for (const file of readdirSync(workflowsDir).filter((name) => name.endsWith(".yml") || name.endsWith(".yaml"))) {
    checkWorkflow(file, readFileSync(join(workflowsDir, file), "utf8"));
  }
}

checkHacsBundle();

if (warnings.length > 0) {
  for (const warning of warnings) {
    console.warn(`CI guard warning: ${warning}`);
  }
}

if (errors.length > 0) {
  for (const error of errors) {
    console.error(`CI guard failed: ${error}`);
  }
  process.exit(1);
}

console.log("CI resource guard passed.");

function checkHacsBundle() {
  const hacsPath = join(root, "hacs.json");
  if (!existsSync(hacsPath)) {
    errors.push("Missing hacs.json.");
    return;
  }

  let hacs;
  try {
    hacs = JSON.parse(readFileSync(hacsPath, "utf8"));
  } catch (error) {
    errors.push(`hacs.json is not valid JSON: ${error instanceof Error ? error.message : "unknown error"}`);
    return;
  }

  if (!hacs.name) {
    errors.push("hacs.json must define name.");
  }

  const filename = typeof hacs.filename === "string" ? hacs.filename : "";
  if (!filename.endsWith(".js")) {
    errors.push("hacs.json filename must point to a JavaScript dashboard plugin.");
    return;
  }

  const distBundle = join(root, "dist", filename);
  const rootBundle = join(root, filename);
  if (!existsSync(distBundle) && !existsSync(rootBundle)) {
    errors.push(`HACS plugin bundle '${filename}' must exist in dist/ or the repository root.`);
  }
}

function checkWorkflow(file, text) {
  if (/pull_request_target\s*:/.test(text)) {
    errors.push(`${file}: pull_request_target is not allowed for this project.`);
  }

  if (/^\s{2}schedule\s*:/m.test(text)) {
    errors.push(`${file}: scheduled workflows are disabled unless intentionally reviewed.`);
  }

  if (!/^permissions:\s*\n\s+contents:\s+read\s*$/m.test(text)) {
    errors.push(`${file}: workflow must set top-level permissions: contents: read.`);
  }

  if (/npm\s+install(?:\s|$)/.test(text)) {
    errors.push(`${file}: use npm ci --ignore-scripts instead of npm install.`);
  }

  for (const match of text.matchAll(/npm\s+ci([^\n]*)/g)) {
    if (!match[1]?.includes("--ignore-scripts")) {
      errors.push(`${file}: npm ci must include --ignore-scripts.`);
    }
  }

  if (/npm\s+run\s+perf(?::stress)?/.test(text)) {
    errors.push(`${file}: perf harnesses should stay manual, not push/PR CI work.`);
  }

  if (/^\s+matrix\s*:/m.test(text) && !/^\s+max-parallel\s*:/m.test(text)) {
    errors.push(`${file}: matrix jobs need max-parallel to avoid accidental fan-out.`);
  }

  const runsOnCount = [...text.matchAll(/^\s+runs-on\s*:/gm)].length;
  const timeoutCount = [...text.matchAll(/^\s+timeout-minutes\s*:/gm)].length;
  if (timeoutCount < runsOnCount) {
    errors.push(`${file}: every job with runs-on should set timeout-minutes.`);
  }

  for (const match of text.matchAll(/^\s*-\s+uses:\s+([^\s#]+).*$/gm)) {
    const spec = match[1] ?? "";
    if (spec.startsWith("./") || spec.startsWith("../")) {
      continue;
    }
    const atIndex = spec.lastIndexOf("@");
    if (atIndex < 0) {
      errors.push(`${file}: action '${spec}' must include a pinned full commit SHA.`);
      continue;
    }
    const ref = spec.slice(atIndex + 1);
    if (!fullShaPattern.test(ref)) {
      errors.push(`${file}: action '${spec}' must be pinned to a full commit SHA.`);
    }
  }
}
