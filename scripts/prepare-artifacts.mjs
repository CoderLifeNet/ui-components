// Refresh only locally built tarball integrity, never registry resolutions/versions.
// CI must first build core from the immutable ref in its workflow.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const directories = process.argv.includes("--root")
  ? ["."]
  : ["consumers/vite-app", "consumers/next-app", "consumers/external-check"];
for (const relative of directories) {
  const directory = path.join(root, relative);
  const manifest = JSON.parse(readFileSync(path.join(directory, "package.json"), "utf8"));
  const lockPath = path.join(directory, "pnpm-lock.yaml");
  let lock = readFileSync(lockPath, "utf8");
  for (const [name, specifier] of Object.entries({ ...manifest.dependencies, ...manifest.devDependencies })) {
    if (!name.startsWith("@coderlife/") || !specifier.startsWith("file:")) continue;
    const tarball = path.resolve(directory, specifier.slice(5));
    const bytes = readFileSync(tarball);
    const packed = JSON.parse(execFileSync("tar", ["-xOf", tarball, "package/package.json"], { encoding: "utf8" }));
    assert.equal(packed.name, name);
    assert.equal(packed.version, "0.1.0-alpha.2");
    for (const section of ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"]) {
      for (const version of Object.values(packed[section] ?? {})) {
        assert.ok(!/^(file:|link:|workspace:|\/)/.test(version), `Nonportable packed dependency in ${name}`);
      }
    }
    const integrity = `sha512-${createHash("sha512").update(bytes).digest("base64")}`;
    let matched = 0;
    lock = lock.replace(/resolution: \{integrity: [^,}]+, tarball: ([^}]+)\}/g, (line, target) => {
      if (target !== specifier) return line;
      matched++;
      return `resolution: {integrity: ${integrity}, tarball: ${target}}`;
    });
    assert.equal(matched, 1, `Expected exactly one locked tarball resolution for ${relative}: ${name}`);
    console.log(`${relative}: ${name}@${packed.version} sha256=${createHash("sha256").update(bytes).digest("hex")} ${integrity}`);
  }
  writeFileSync(lockPath, lock);
}