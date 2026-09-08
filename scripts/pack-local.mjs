import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const packageJsonPath = path.resolve("package.json");
const originalRaw = readFileSync(packageJsonPath, "utf8");
const pkg = JSON.parse(originalRaw);

function stripLocalFileDeps(record) {
  if (!record || typeof record !== "object") {
    return;
  }
  for (const [name, version] of Object.entries(record)) {
    if (typeof version === "string" && version.startsWith("file:")) {
      delete record[name];
    }
  }
}

try {
  stripLocalFileDeps(pkg.dependencies);
  stripLocalFileDeps(pkg.devDependencies);
  stripLocalFileDeps(pkg.optionalDependencies);
  writeFileSync(packageJsonPath, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");

  execSync("pnpm pack --pack-destination ./artifacts", { stdio: "inherit" });
} finally {
  writeFileSync(packageJsonPath, originalRaw, "utf8");
}
