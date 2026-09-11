import { Component, useState } from "react";
import type { ReactNode } from "react";
import {
  ThemeProvider,
  createTheme,
  useColorScheme,
} from "@coderlifenet/ui-core/styles";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Code2,
  Copy,
  GitFork as Github,
  Menu,
  Monitor,
  Moon,
  RotateCcw,
  Search,
  Sun,
  X,
} from "lucide-react";
import DividerExample from "./examples/DividerExample";
import ButtonExample from "./examples/ButtonExample";
import DataTableExample from "./examples/DataTableExample";
import dividerSource from "./examples/DividerExample.tsx?raw";
import buttonSource from "./examples/ButtonExample.tsx?raw";
import tableSource from "./examples/DataTableExample.tsx?raw";
import { base, install, inventory, pages, version } from "./content";

const theme = createTheme({
  cssVariables: { colorSchemeSelector: ".theme-%s" },
  colorSchemes: {
    light: { palette: { primary: { main: "#08755b" } } },
    dark: { palette: { primary: { main: "#73dfb6" } } },
  },
  typography: {
    fontFamily: '"IBM Plex Sans", sans-serif',
    button: { textTransform: "none" },
  },
  shape: { borderRadius: 6 },
});
const sourceRoot =
  "https://github.com/CoderLifeNet/ui-components/blob/feat/ui-documentation-foundation/docs/site/src/";

class ExampleBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <p role="alert">
        This example could not render. Reset it to try again; the reference
        remains available.
      </p>
    ) : (
      this.props.children
    );
  }
}
function CopyButton({ text }: { text: string }) {
  const [state, setState] = useState("Copy source");
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState("Copied");
    } catch {
      setState("Copy unavailable; select the source");
    }
  }
  return (
    <>
      <button
        className="icon-button"
        title={state}
        aria-label={state}
        onClick={copy}
      >
        {state === "Copied" ? <Check size={17} /> : <Copy size={17} />}
      </button>
      <span className="sr-only" role="status">
        {state}
      </span>
    </>
  );
}
function Example({
  title,
  source,
  children,
}: {
  title: string;
  source: string;
  children: ReactNode;
}) {
  const [reset, setReset] = useState(0);
  return (
    <section className="example" aria-label={title}>
      <div className="example-bar">
        <span>
          <span className="status-dot" />
          {title}
        </span>
        <button
          className="icon-button"
          title="Reset example"
          aria-label="Reset example"
          onClick={() => setReset((value) => value + 1)}
        >
          <RotateCcw size={16} />
        </button>
      </div>
      <div className="example-body">
        <ExampleBoundary key={reset}>{children}</ExampleBoundary>
      </div>
      <details className="source">
        <summary>
          <Code2 size={16} /> Reviewed source
        </summary>
        <div className="source-tools">
          <span>TSX / registry packages</span>
          <CopyButton text={source} />
        </div>
        <pre>
          <code>{source}</code>
        </pre>
      </details>
    </section>
  );
}
function Appearance() {
  const { mode, setMode } = useColorScheme();
  return (
    <div className="appearance" role="group" aria-label="Appearance">
      {[
        ["system", Monitor],
        ["light", Sun],
        ["dark", Moon],
      ].map(([value, Icon]) => {
        const ModeIcon = Icon as typeof Sun;
        return (
          <button
            key={String(value)}
            className="icon-button"
            aria-label={`${value} theme`}
            title={`${value} theme`}
            aria-pressed={mode === value}
            onClick={() => setMode(value as "system" | "light" | "dark")}
          >
            <ModeIcon size={16} />
          </button>
        );
      })}
    </div>
  );
}
function Catalog() {
  const [filter, setFilter] = useState("");
  const entries = inventory.entries.filter((entry) =>
    `${entry.name} ${entry.category} ${entry.classification}`
      .toLowerCase()
      .includes(filter.toLowerCase()),
  );
  return (
    <>
      <p>
        {inventory.entries.length} published entry points. Three reviewed
        example templates. Pending entries are inventory records, not completed
        component references.
      </p>
      <label className="search-field">
        <Search size={18} />
        <input
          value={filter}
          onChange={(event) => setFilter(event.target.value.slice(0, 120))}
          placeholder="Filter exports..."
          aria-label="Filter exports"
        />
      </label>
      <div className="catalog-list">
        {entries.map((entry) => (
          <article
            id={`${entry.package.endsWith("ui-core") ? "core" : "components"}-${encodeURIComponent(entry.name)}`}
            key={`${entry.package}:${entry.subpath}`}
          >
            <div>
              <a href={entry.route}>{entry.name}</a>
              <p>
                {entry.package}
                {entry.subpath === "." ? "" : entry.subpath.slice(1)}
              </p>
            </div>
            <span>{entry.category.replaceAll("-", " ")}</span>
            <span
              className={`badge ${entry.status === "template-ready" ? "ready" : ""}`}
            >
              {entry.status === "template-ready"
                ? "Template ready"
                : "Reference pending"}
            </span>
          </article>
        ))}
      </div>
      {entries.length === 0 && (
        <p role="status">No exports match this filter.</p>
      )}
    </>
  );
}
function ComponentPage({ name }: { name: "Divider" | "Button" | "DataTable" }) {
  const entry = inventory.entries.find((item) => item.name === name)!;
  const source =
    name === "Divider"
      ? dividerSource
      : name === "Button"
        ? buttonSource
        : tableSource;
  return (
    <>
      <div className="metadata">
        <span className="badge ready">{entry.classification}</span>
        <code>{entry.package}</code>
        <span>Alpha {version}</span>
      </div>
      <nav className="page-toc" aria-label="On this page">
        <a href="#example">Example</a>
        <a href="#contract">Public contract</a>
        <a href="#limitations">Limits</a>
        <a href="#related">Related</a>
      </nav>
      <section id="example">
        <h2>Working example</h2>
        <Example title={`${name} / reviewed fixture`} source={source}>
          {name === "Divider" ? (
            <DividerExample />
          ) : name === "Button" ? (
            <ButtonExample />
          ) : (
            <DataTableExample />
          )}
        </Example>
      </section>
      <section id="contract">
        <h2>Public contract</h2>
        <pre>
          <code>{`import { ${name} } from '${entry.package}';\nimport ${name === "DataTable" ? "{ DataTable }" : name} from '${entry.package}/${name}';`}</code>
        </pre>
        {name === "Divider" ? (
          <p>
            No component-specific additions or analytics events. Props, refs,
            theme defaults, orientation and accessibility behavior come directly
            from Material UI. Use <code>aria-hidden</code> for purely decorative
            separators.
          </p>
        ) : name === "Button" ? (
          <>
            <p>
              The wrapper forwards the ref and composes the supplied click
              handler before emitting <code>ui.button.click</code>. A supplied
              handler takes precedence over a theme default handler. Theme
              variants and styling remain MUI behavior.
            </p>
            <dl>
              <dt>Event</dt>
              <dd>
                <code>
                  schemaVersion: "1.0.0", type: "ui.button.click", action:
                  "click", component: "Button"
                </code>
              </dd>
              <dt>Payload</dt>
              <dd>
                Timestamp plus variant/color metadata from explicit props. No
                typed input, source code or URL is included by this example.
              </dd>
              <dt>Precedence</dt>
              <dd>
                Provider enabled, ancestor boundary opt-out, runtime enabled and
                analytics consent all participate. The demo starts denied; its
                controls do not set site preferences.
              </dd>
            </dl>
          </>
        ) : (
          <>
            <p>
              <code>DataTable&lt;TRow&gt;</code> requires rows, typed columns
              and a stable <code>getRowId</code>. Columns provide an accessor
              and optional sortValue/filterValue. The fixture controls
              selection; page, sort and filter can also be controlled through
              their matching change callbacks.
            </p>
            <dl>
              <dt>States</dt>
              <dd>
                loading, error, empty rows, selectedRowIds, sort, filterQuery,
                page and pageSize.
              </dd>
              <dt>Defaults</dt>
              <dd>
                Client mode; no selection, no filter or sort. Default page size
                is 10. The fixture sets 3.
              </dd>
              <dt>Accessibility</dt>
              <dd>
                Uses MUI table, selection checkboxes and pagination controls.
                The horizontal region is keyboard focusable on narrow screens.
              </dd>
            </dl>
          </>
        )}
      </section>
      <section id="limitations">
        <h2>Known limits</h2>
        <p>
          {name === "Button"
            ? "The memory runtime does not enforce advertising consent per adapter or cancel in-flight work. Do not treat this demo as a production consent-manager integration. Metadata defaults do not necessarily reflect theme-resolved props."
            : name === "DataTable"
              ? "Client-side data only in this example. serverMode delegates operations to the host; it does not fetch data. This template is not a claim of virtualization, MUI X parity or complete UI-3 API coverage."
              : "This is a pass-through template, not a fork of the full upstream documentation."}
        </p>
        <p>
          Editable source is disabled. Only reviewed examples and bounded
          fixture controls are available. Complete API and framework coverage
          remains UI-2/UI-3 work.
        </p>
      </section>
      <section id="related">
        <h2>Related references</h2>
        <div className="link-list">
          {entry.upstreamGuide && (
            <>
              <a href={entry.upstreamGuide}>
                MUI {name} guide <ArrowUpRight size={15} />
              </a>
              <a href={entry.upstreamApi!}>
                MUI {name} API <ArrowUpRight size={15} />
              </a>
              <a href={entry.upstreamSource!}>
                MUI v9.4.0 source <ArrowUpRight size={15} />
              </a>
            </>
          )}
          <a href={sourceRoot + `examples/${name}Example.tsx`}>
            Example source <ArrowUpRight size={15} />
          </a>
          <a href={`${base}/privacy/`}>Runtime and privacy boundaries</a>
        </div>
        <p className="muted">
          Tested with MUI 9.4.0. Upstream guide/API URLs are rolling, verified
          against v9.4.0 source on 11 September 2026; use the immutable source
          link if upstream advances.
        </p>
      </section>
    </>
  );
}
function Landing() {
  return (
    <>
      <div className="landing-intro">
        <span className="eyebrow">
          Independent React libraries / public alpha
        </span>
        <h1>Coder Life UI</h1>
        <p className="lead">
          Material UI foundations.
          <br />
          Thoughtful interactions, ready to compose.
        </p>
        <p>
          Keep the components you know. Add optional instrumentation and
          purpose-built patterns through public, versioned packages.
        </p>
        <div className="button-row">
          <a className="primary-link" href={`${base}/getting-started/`}>
            Start building <ArrowRight size={18} />
          </a>
          <a className="text-link" href={`${base}/catalog/`}>
            Explore the catalog <ArrowRight size={17} />
          </a>
        </div>
      </div>
      <div className="release-strip">
        <span>
          <span className="status-dot" />
          {version}
        </span>
        <span>React 19.2.8</span>
        <span>MUI 9.4.0</span>
        <a href={`${base}/coverage/`}>
          3 reviewed templates / coverage in progress
        </a>
      </div>
      <section className="landing-showcase">
        <div>
          <span className="eyebrow">Original components</span>
          <h2>
            Your state. <br />A working table.
          </h2>
          <p>
            Sorting, filtering, selection and pagination. Composed from the
            public core, with fixture data you can inspect.
          </p>
          <a href={`${base}/components/data-table/`}>
            Open DataTable reference <ArrowRight size={17} />
          </a>
        </div>
        <Example title="DataTable / deterministic fixture" source={tableSource}>
          <DataTableExample />
        </Example>
      </section>
      <section>
        <div className="section-heading">
          <h2>One foundation. Three kinds of component.</h2>
          <a href={`${base}/catalog/`}>
            View inventory <ArrowRight size={16} />
          </a>
        </div>
        <div className="component-grid">
          {[
            [
              "Divider",
              "Unchanged",
              "Pure Material UI. No component-specific additions.",
              "core/divider",
            ],
            [
              "Button",
              "Enhanced",
              "Familiar behavior. Optional in-memory event instrumentation.",
              "core/button",
            ],
            [
              "DataTable",
              "Original",
              "Composable state and workflows, built on the public core.",
              "components/data-table",
            ],
          ].map(([name, kind, text, route]) => (
            <a className="component-card" key={name} href={`${base}/${route}/`}>
              <span className="eyebrow">{kind}</span>
              <h3>
                {name}
                <ArrowUpRight size={20} />
              </h3>
              <p>{text}</p>
            </a>
          ))}
        </div>
      </section>
      <section className="install-band">
        <h2>Use the published packages</h2>
        <div className="source-tools">
          <span>Exact alpha installation</span>
          <CopyButton text={install} />
        </div>
        <pre>
          <code>{install}</code>
        </pre>
        <p>
          Alpha APIs may change. Pin the version; review compatibility and
          limitations before adoption.
        </p>
      </section>
    </>
  );
}
function Guide({ path }: { path: string }) {
  if (path.endsWith("/getting-started/"))
    return (
      <>
        <h2>Install exact versions</h2>
        <pre>
          <code>{install}</code>
        </pre>
        <CopyButton text={install} />
        <h2>Keep your theme</h2>
        <pre>
          <code>{`import { ThemeProvider, createTheme } from '@coderlifenet/ui-core/styles';\nimport { Button } from '@coderlifenet/ui-core';\n\n<ThemeProvider theme={createTheme()}>\n  <Button variant="contained">Hello, world</Button>\n</ThemeProvider>`}</code>
        </pre>
        <p>
          Instrumentation is optional. No provider is required for ordinary
          component behavior. Do not mix these public packages with
          coderlife.net's internal @coderlife packages.
        </p>
        <a href={`${base}/core/button/`}>Add a memory-only analytics example</a>
        <h2>Framework boundaries</h2>
        <p>
          This foundation is built with Vite and prerendered React. Interactive
          components need a client boundary in Next.js. The library release
          passed Vite and Next.js registry consumer checks; complete framework
          guides remain pending.
        </p>
      </>
    );
  if (path.endsWith("/catalog/")) return <Catalog />;
  if (path.endsWith("/privacy/"))
    return (
      <>
        <h2>Site data</h2>
        <p>
          No optional analytics or advertising SDK is installed or activated.
          Search terms, appearance overrides and example state stay in memory
          and clear on reload. The appearance follows your device before you
          choose a session override. No code or search queries are transmitted.
        </p>
        <h2>Demo consent is separate</h2>
        <p>
          The Button example starts denied, uses only createMemoryAdapter, and
          never changes a visitor site preference. Granting consent records new
          fixture events only. Revocation stops new dispatch; reset clears the
          in-memory example.
        </p>
        <h2>Runtime gaps, not promised APIs</h2>
        <ul>
          <li>
            adStorage is present in the public type but not used to gate each
            adapter.
          </li>
          <li>
            configure can run while analytics consent is denied; SDK ownership
            remains host-specific.
          </li>
          <li>
            No pending-work cancellation or standard storage cleanup on
            revocation.
          </li>
          <li>
            No built-in banner, preference persistence, multi-tab
            synchronization or unknown consent state.
          </li>
          <li>
            Metadata sanitization restricts value types, not sensitive field
            names.
          </li>
        </ul>
        <p>
          Production banner integration and validated cleanup require
          library-owned UI-4 work. This site does not privately patch the
          published runtime.
        </p>
        <h2>Execution boundary</h2>
        <p>
          Arbitrary code execution is disabled. Reviewed examples accept bounded
          controls only. No runner, remote imports, snippet persistence or
          upload exists. UI-5 requires a separate security review.
        </p>
        <h2>Hosting disclosure</h2>
        <p>
          This is an undeployed preview. Production host access-log purpose,
          retention and approved privacy copy remain owner decisions. No claim
          of legal compliance or zero host logging is made.
        </p>
      </>
    );
  if (path.endsWith("/compatibility/"))
    return (
      <>
        <h2>Supported documentation version</h2>
        <dl>
          <dt>Public packages</dt>
          <dd>ui-core and ui-components {version}</dd>
          <dt>Runtime baseline</dt>
          <dd>
            React / React DOM 19.2.8; MUI 9.4.0; Emotion React 11.14.0 and
            styled 11.14.1
          </dd>
          <dt>Type checking</dt>
          <dd>TypeScript 7.0.2</dd>
          <dt>Upstream documentation</dt>
          <dd>
            MUI rolling guide/API URLs verified against v9.4.0 on 2026-09-11.
            Immutable v9.4.0 source links are provided; no patch-specific docs
            snapshot is claimed.
          </dd>
        </dl>
        <h2>Release sources</h2>
        <p>
          Core: <code>2ffe4807ddef447fa22deb70b553a84624727cff</code>
        </p>
        <p>
          Components: <code>5fb2188803ce9cb11b5aa11aeb2b21c41d4da163</code>
        </p>
        <p>
          Both alpha and latest currently point to alpha.2. The latest-tag
          policy exception is unresolved; use exact versions or @alpha.
        </p>
        <div className="link-list">
          <a href="https://www.npmjs.com/package/@coderlifenet/ui-core/v/0.1.0-alpha.2">
            Core on npm
          </a>
          <a href="https://www.npmjs.com/package/@coderlifenet/ui-components/v/0.1.0-alpha.2">
            Components on npm
          </a>
          <a href="https://github.com/CoderLifeNet/ui-components/blob/main/docs/RELEASING.md">
            Verified release records
          </a>
        </div>
      </>
    );
  return (
    <>
      <h2>Foundation coverage</h2>
      <p>
        The generated inventory contains {inventory.entries.length} published
        entry points. Divider, Button and DataTable have reviewed working
        templates. Other entries are searchable inventory records, not completed
        references.
      </p>
      <h2>Remaining milestones</h2>
      <ul>
        <li>UI-2: complete supported core reference and examples.</li>
        <li>UI-3: complete original-component API and interaction coverage.</li>
        <li>UI-4: full extensions, consent and privacy behavior.</li>
        <li>UI-5: approved constrained editing or validated isolation.</li>
        <li>UI-6: full release-candidate review.</li>
        <li>UI-7: separately authorized deployment and operations.</li>
      </ul>
      <div className="link-list">
        <a href="https://github.com/CoderLifeNet/coderlife.net/pull/20">
          Canonical documentation roadmap
        </a>
        <a href="https://github.com/CoderLifeNet/ui-components/blob/feat/ui-documentation-foundation/docs/UI_FOUNDATION.md">
          Architecture, threat model and acceptance evidence
        </a>
        <a href="https://github.com/CoderLifeNet/ui-components/issues">
          Contribute or report an issue
        </a>
        <a href="https://github.com/CoderLifeNet/ui-components/security">
          Security reporting
        </a>
      </div>
    </>
  );
}
export default function Site({ path }: { path: string }) {
  const [menu, setMenu] = useState(false);
  const [query, setQuery] = useState("");
  const page = pages.find((item) => item.path === path);
  const results = query.trim()
    ? [
        ...pages.map((item) => ({
          name: item.title,
          route: item.path,
          status: "Guide",
          terms: item.description,
        })),
        ...inventory.entries.map((item) => ({
          name: item.name,
          route: item.route,
          status: item.status,
          terms: `${item.category} ${item.classification}`,
        })),
      ]
        .filter((item) =>
          `${item.name} ${item.terms}`
            .toLowerCase()
            .includes(query.trim().toLowerCase()),
        )
        .slice(0, 12)
    : [];
  return (
    <ThemeProvider
      theme={theme}
      defaultMode="system"
      storageManager={null}
      disableTransitionOnChange
    >
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <a className="brand" href="/">
          <Code2 aria-hidden size={25} />
          <span>
            Coder Life <b>UI</b>
          </span>
        </a>
        <span className="header-divider" />
        <span className="header-label">Documentation</span>
        <div className="header-actions">
          <a
            className="icon-button"
            title="GitHub repository"
            aria-label="GitHub repository"
            href="https://github.com/CoderLifeNet/ui-components"
          >
            <Github size={19} />
          </a>
          <Appearance />
          <button
            className="icon-button menu-toggle"
            title="Navigation"
            aria-label="Toggle navigation"
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <div className="site-layout">
        <aside
          className={`sidebar ${menu ? "open" : ""}`}
          aria-label="Documentation sidebar"
        >
          <label className="version-label">
            Documentation version
            <select
              aria-label="Documentation version"
              value={version}
              onChange={() => {}}
            >
              <option value={version}>{version}</option>
            </select>
          </label>
          <div className="search-box">
            <label className="search-field">
              <Search size={17} />
              <input
                type="search"
                value={query}
                maxLength={120}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search this version"
                aria-label="Search documentation"
              />
            </label>
            {query && (
              <div className="search-results" aria-label="Search results">
                <p role="status">
                  {results.length} results in {version}
                </p>
                {results.map((item, index) => (
                  <a key={`${item.route}-${index}`} href={item.route}>
                    {item.name}
                    <small>{item.status}</small>
                  </a>
                ))}
                {results.length === 0 && <p>No matching pages or exports.</p>}
              </div>
            )}
          </div>
          <nav aria-label="Main navigation">
            {[
              "Overview",
              "Reference",
              "Core components",
              "Original components",
              "Guides",
              "Project",
            ].map((group) => (
              <div className="nav-group" key={group}>
                <p>{group}</p>
                {pages
                  .filter((item) => item.group === group)
                  .map((item) => (
                    <a
                      key={item.path}
                      href={item.path}
                      aria-current={path === item.path ? "page" : undefined}
                    >
                      {item.path === "/" ? "Introduction" : item.title}
                    </a>
                  ))}
              </div>
            ))}
          </nav>
          <div className="sidebar-note">
            <span className="status-dot" />
            Public alpha
            <p>
              3 templates ready.
              <br />
              Complete reference in progress.
            </p>
            <a href={`${base}/coverage/`}>
              Coverage status <ArrowUpRight size={14} />
            </a>
          </div>
        </aside>
        <main id="main" tabIndex={-1}>
          {path === "/" ? (
            <Landing />
          ) : !page ? (
            <>
              <h1>Page not found</h1>
              <p>This reference is not available in {version}.</p>
              <a href={`${base}/catalog/`}>Browse the export catalog</a>
            </>
          ) : (
            <>
              <div className="breadcrumb">
                <a href="/">Documentation</a>
                <span>/</span>
                <span>{page.group}</span>
              </div>
              <div className="page-heading">
                <span className="eyebrow">
                  {version} / {page.group}
                </span>
                <h1>{page.title}</h1>
                <p className="lead">{page.description}</p>
              </div>
              {path.endsWith("/divider/") ? (
                <ComponentPage name="Divider" />
              ) : path.endsWith("/button/") ? (
                <ComponentPage name="Button" />
              ) : path.endsWith("/data-table/") ? (
                <ComponentPage name="DataTable" />
              ) : (
                <Guide path={path} />
              )}
            </>
          )}
          <footer>
            <div>
              <Code2 size={20} />
              <strong>Built on Material UI.</strong>
              <p>
                Coder Life is an independent project, not affiliated with or
                endorsed by MUI.
              </p>
            </div>
            <div className="footer-links">
              <a href="https://mui.com/material-ui/">Material UI</a>
              <a href="https://github.com/mui/material-ui/blob/v9.4.0/LICENSE">
                MUI license
              </a>
              <a href="https://mui.com/material-ui/getting-started/support/">
                Support MUI
              </a>
              <a href={`${base}/privacy/`}>Privacy & data</a>
              <a href={`${base}/coverage/`}>Contributing & security</a>
            </div>
          </footer>
        </main>
      </div>
    </ThemeProvider>
  );
}
