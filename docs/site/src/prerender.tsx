import { renderToString } from "react-dom/server";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import Site from "./Site";
import { pages, version } from "./content";
const template = readFileSync("dist/index.html", "utf8");
for (const page of [...pages, { path: "/404/", title: "Page not found" }]) {
  const directory = path.join("dist", page.path);
  mkdirSync(directory, { recursive: true });
  writeFileSync(
    path.join(directory, "index.html"),
    template
      .replace(
        '<div id="root"></div>',
        `<div id="root">${renderToString(<Site path={page.path} />)}</div>`,
      )
      .replace(
        "<title>Coder Life UI</title>",
        `<title>${page.title.replaceAll("&", "&amp;")} | Coder Life UI ${version}</title>`,
      ),
  );
}
writeFileSync("dist/404.html", readFileSync("dist/404/index.html"));
console.log(`Prerendered ${pages.length} documentation routes and 404`);
