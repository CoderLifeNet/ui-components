import inventory from "./generated/inventory.json";
export const version = inventory.version;
export const base = `/v/${version}`;
export const pages = [
  {
    path: "/",
    title: "Coder Life UI",
    group: "Overview",
    description:
      "Material UI foundations. Coder Life interactions. Public React libraries, with room to build.",
  },
  {
    path: `${base}/getting-started/`,
    title: "Getting started",
    group: "Overview",
    description:
      "Install the published alpha and keep your existing Material UI theme.",
  },
  {
    path: `${base}/catalog/`,
    title: "Component & export catalog",
    group: "Reference",
    description: "The published surface, with honest documentation coverage.",
  },
  {
    path: `${base}/core/divider/`,
    title: "Divider",
    group: "Core components",
    description:
      "A familiar separator. The original Material UI implementation, unchanged.",
  },
  {
    path: `${base}/core/button/`,
    title: "Button",
    group: "Core components",
    description:
      "The Material UI button, with an optional, consent-gated interaction event.",
  },
  {
    path: `${base}/components/data-table/`,
    title: "DataTable",
    group: "Original components",
    description:
      "Sort, filter and select deterministic rows with controlled application state.",
  },
  {
    path: `${base}/compatibility/`,
    title: "Versions & compatibility",
    group: "Guides",
    description:
      "Exact tested packages, upstream context and immutable release sources.",
  },
  {
    path: `${base}/privacy/`,
    title: "Privacy & runtime boundaries",
    group: "Guides",
    description:
      "No optional site tracking. In-memory examples. Explicit implementation limits.",
  },
  {
    path: `${base}/coverage/`,
    title: "Coverage & roadmap",
    group: "Project",
    description:
      "UI-0 decisions and UI-1 templates. Full-library coverage is not complete.",
  },
];
export { inventory };
export const install =
  "npm install @coderlifenet/ui-core@0.1.0-alpha.2 @coderlifenet/ui-components@0.1.0-alpha.2 @mui/material@9.4.0 @emotion/react@11.14.0 @emotion/styled@11.14.1 react@19.2.8 react-dom@19.2.8";
