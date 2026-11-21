// makefun-bring-the-humans-03 — entrypoint.
//
// The grader runs it as:
//   MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
//
// Its whole job is to hand VIDEO.json over to the output directory, so the
// house can read the TikTok address of the ad. Nothing else: no network,
// no clock, no writes anywhere but the output directory.

import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const botDir = resolve(process.env.MAKEFUN_BOT_DIR ?? ".");
const outputDir = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? "out");

const source = join(botDir, "VIDEO.json");
const target = join(outputDir, "VIDEO.json");

try {
  if (!existsSync(source)) {
    throw new Error(`VIDEO.json not found at ${source}`);
  }
  // Parse once so a broken file fails loudly instead of being copied blindly.
  const parsed: unknown = JSON.parse(readFileSync(source, "utf8"));
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    typeof (parsed as { url?: unknown }).url !== "string"
  ) {
    throw new Error("VIDEO.json must be a JSON object with a string url");
  }
  // Create the output directory if it is missing. Never remove it: the
  // grader mounts /output there and deleting it would fail the grade.
  mkdirSync(outputDir, { recursive: true });
  copyFileSync(source, target);
  // Read the copy back: the grader must see the same bytes we read.
  if (!readFileSync(target).equals(readFileSync(source))) {
    throw new Error(`copied VIDEO.json does not match ${source}`);
  }
} catch (error) {
  console.error(
    `main.ts failed: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exit(1);
}
