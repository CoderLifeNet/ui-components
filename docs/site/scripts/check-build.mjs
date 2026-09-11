import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { gzipSync } from "node:zlib";
import path from "node:path";
const inventory = JSON.parse(
  readFileSync("src/generated/inventory.json", "utf8"),
);
const manifest = JSON.parse(readFileSync("package.json", "utf8"));
for (const name of ["@coderlifenet/ui-core", "@coderlifenet/ui-components"])
  assert.equal(manifest.dependencies[name], inventory.version);
assert.ok(
  !/"(?:file|link|workspace):/.test(readFileSync("package-lock.json", "utf8")),
);
const files = readdirSync("dist", { recursive: true }).filter(
  (file) => typeof file === "string",
);
const htmlFiles = files.filter((file) => file.endsWith(".html"));
const ids = new Map(
  htmlFiles.map((file) => [
    file,
    new Set(
      [
        ...readFileSync(path.join("dist", file), "utf8").matchAll(
          /\bid="([^"]+)"/g,
        ),
      ].map((match) => match[1]),
    ),
  ]),
);
for (const file of htmlFiles) {
  const html = readFileSync(path.join("dist", file), "utf8");
  assert.ok(html.includes("<h1"), `${file}: readable prerender missing`);
  assert.ok(html.includes("noindex, nofollow"));
  for (const [, href] of html.matchAll(/href="(\/[^"?#]*)(?:#[^"]*)?"/g)) {
    const target = href.endsWith("/")
      ? `${href.slice(1)}index.html`
      : href.slice(1);
    assert.ok(files.includes(target), `${file}: broken local link ${href}`);
  }
}
for (const entry of inventory.entries) {
  const [route, fragment] = entry.route.split("#");
  const file = `${route.slice(1)}index.html`;
  assert.ok(ids.has(file), `Missing inventory page ${entry.name}`);
  if (fragment)
    assert.ok(
      ids.get(file).has(fragment),
      `Missing catalog anchor ${fragment}`,
    );
}
const bytes = (extension) =>
  files
    .filter((file) => file.endsWith(extension))
    .reduce(
      (total, file) =>
        total + gzipSync(readFileSync(path.join("dist", file))).length,
      0,
    );
const javascript = bytes(".js");
const css = bytes(".css");
assert.ok(javascript < 250 * 1024, `JS gzip budget exceeded: ${javascript}`);
assert.ok(css < 45 * 1024, `CSS gzip budget exceeded: ${css}`);
console.log(
  JSON.stringify(
    {
      routes: htmlFiles.length,
      inventoryEntries: inventory.entries.length,
      javascriptGzip: javascript,
      cssGzip: css,
      budgets: { javascript: 256000, css: 46080 },
    },
    null,
    2,
  ),
);
