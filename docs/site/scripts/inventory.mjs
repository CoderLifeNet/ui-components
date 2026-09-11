import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
const require = createRequire(import.meta.url);
const root = path.resolve(
  path.dirname(require.resolve("@coderlifenet/ui-core")),
  "..",
);
const core = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
const surface = JSON.parse(
  readFileSync(path.join(root, "generated/mui-surface.json"), "utf8"),
);
const componentsRoot = path.resolve(
  path.dirname(require.resolve("@coderlifenet/ui-components")),
  "..",
);
const components = JSON.parse(
  readFileSync(path.join(componentsRoot, "package.json"), "utf8"),
);
const version = "0.1.0-alpha.2";
const enhanced = new Set();
for (const entry of surface.entries) {
  const target = core.exports[entry.subpath]?.default;
  if (
    target &&
    readFileSync(path.join(root, target), "utf8").includes("../wrappers/")
  )
    enhanced.add(entry.subpath);
}
const examples = {
  "./Divider": "divider",
  "./Button": "button",
  "./DataTable": "data-table",
};
const entries = [];
for (const [kind, manifest] of [
  ["core", core],
  ["components", components],
]) {
  assert.equal(manifest.version, version);
  for (const [subpath, target] of Object.entries(manifest.exports)) {
    const name = subpath === "." ? "Root exports" : subpath.slice(2);
    const materialEntry =
      kind === "core"
        ? surface.entries.find((entry) => entry.subpath === subpath)
        : undefined;
    const category =
      materialEntry?.category ??
      (kind === "core" || subpath === "."
        ? "package-entry"
        : "original-component");
    const example = examples[subpath];
    const ready = Boolean(example);
    entries.push({
      package: manifest.name,
      version,
      subpath,
      name,
      category,
      classification:
        kind === "components"
          ? "original"
          : enhanced.has(subpath)
            ? "enhanced"
            : category === "renderable-component"
              ? "unchanged"
              : "reference",
      route: ready
        ? `/v/${version}/${kind}/${example}/`
        : `/v/${version}/catalog/#${kind}-${encodeURIComponent(name)}`,
      example: example ?? null,
      status: ready ? "template-ready" : "reference-pending",
      target,
      availability: ["./lab", "./icons"].includes(subpath)
        ? "optional-peer-required"
        : "published",
      evidence:
        kind === "core"
          ? "package.json exports and generated/mui-surface.json; built wrapper import"
          : "package.json exports and published declarations",
      upstreamSource: materialEntry
        ? `https://github.com/mui/material-ui/tree/v9.4.0/packages/mui-material/src/${materialEntry.moduleSpecifier.slice("@mui/material/".length)}`
        : null,
      upstreamGuide: ["Divider", "Button"].includes(name)
        ? `https://mui.com/material-ui/react-${name.toLowerCase()}/`
        : null,
      upstreamApi: ["Divider", "Button"].includes(name)
        ? `https://mui.com/material-ui/api/${name.toLowerCase()}/`
        : null,
    });
  }
}
assert.equal(
  new Set(entries.map((entry) => `${entry.package}:${entry.subpath}`)).size,
  entries.length,
);
assert.ok(
  entries.find(
    (entry) => entry.name === "Divider" && entry.classification === "unchanged",
  ),
);
assert.ok(
  entries.find(
    (entry) => entry.name === "Button" && entry.classification === "enhanced",
  ),
);
mkdirSync("src/generated", { recursive: true });
writeFileSync(
  "src/generated/inventory.json",
  JSON.stringify(
    { version, mui: "9.4.0", upstreamChecked: "2026-09-11", entries },
    null,
    2,
  ) + "\n",
);
console.log(
  `${entries.length} package entry points inventoried; ${surface.entries.length} MUI subpaths; ${enhanced.size} enhanced wrappers; 3 example templates`,
);
