import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const origin = process.env.DOCS_URL ?? "http://127.0.0.1:4321";
const evidence =
  process.env.DOCS_EVIDENCE ?? "/tmp/coderlifenet-ui-foundation-evidence";
const base = "/v/0.1.0-alpha.2";
mkdirSync(evidence, { recursive: true });
const browser = await chromium.launch();
const results = [];
try {
  for (const [label, width, height, colorScheme] of [
    ["desktop-light", 1440, 1000, "light"],
    ["desktop-dark", 1440, 1000, "dark"],
    ["mobile-light", 390, 844, "light"],
    ["mobile-dark", 390, 844, "dark"],
  ]) {
    const context = await browser.newContext({
      viewport: { width, height },
      colorScheme,
      reducedMotion: "reduce",
      permissions: ["clipboard-read", "clipboard-write"],
    });
    const page = await context.newPage();
    const errors = [];
    const external = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("request", (request) => {
      if (!request.url().startsWith(origin)) external.push(request.url());
    });
    await page.goto(origin);
    await page.keyboard.press("Tab");
    assert.equal(await page.locator(":focus").textContent(), "Skip to content");
    await page.keyboard.press("Enter");
    assert.equal(await page.locator(":focus").getAttribute("id"), "main");
    await page.getByRole("button", { name: "dark theme", exact: true }).click();
    await page.waitForFunction(() =>
      document.documentElement.classList.contains("theme-dark"),
    );
    await page
      .getByRole("button", { name: "light theme", exact: true })
      .click();
    await page.waitForFunction(() =>
      document.documentElement.classList.contains("theme-light"),
    );
    await page
      .getByRole("button", { name: "system theme", exact: true })
      .click();
    await page.waitForFunction(
      (scheme) =>
        document.documentElement.classList.contains(`theme-${scheme}`),
      colorScheme,
    );
    await page
      .getByRole("heading", { name: "Coder Life UI", exact: true })
      .waitFor();
    await page.screenshot({
      path: `${evidence}/${label}-home.png`,
      fullPage: true,
    });
    for (const route of [
      "/",
      `${base}/core/divider/`,
      `${base}/core/button/`,
      `${base}/components/data-table/`,
    ]) {
      await page.goto(origin + route);
      await page.locator("main h1").waitFor();
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        `${label} horizontal overflow at ${route}`,
      );
      const audit = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      assert.deepEqual(
        audit.violations.map((item) => ({
          id: item.id,
          nodes: item.nodes.map((node) => node.target),
        })),
        [],
        `${label} accessibility ${route}`,
      );
      await page.screenshot({
        path: `${evidence}/${label}-${route.split("/").filter(Boolean).at(-1) ?? "home"}.png`,
        fullPage: true,
      });
    }
    await page.goto(origin + `${base}/core/button/`);
    await page.getByRole("button", { name: "Run action", exact: true }).click();
    await page.waitForFunction(
      () =>
        document.querySelector('[data-testid="actions"]')?.textContent === "1",
    );
    assert.equal(await page.getByTestId("events").textContent(), "0");
    await page.getByLabel("Demo analytics consent").check();
    await page.getByRole("button", { name: "Run action", exact: true }).click();
    await page.waitForFunction(
      () =>
        document.querySelector('[data-testid="events"]')?.textContent === "1",
    );
    await page
      .getByRole("button", { name: "Opted-out action", exact: true })
      .click();
    assert.equal(await page.getByTestId("events").textContent(), "1");
    await page.getByLabel("Demo analytics consent").uncheck();
    await page.getByRole("button", { name: "Run action", exact: true }).click();
    assert.equal(await page.getByTestId("events").textContent(), "1");
    await page.getByRole("button", { name: "Reset example" }).click();
    assert.equal(await page.getByTestId("events").textContent(), "0");
    assert.equal(await page.getByTestId("actions").textContent(), "0");
    await page.getByText("Reviewed source", { exact: true }).click();
    assert.ok(
      (await page.locator(".source pre").textContent()).includes(
        "createMemoryAdapter",
      ),
    );
    await page
      .getByRole("button", { name: "Copy source", exact: true })
      .click();
    assert.equal(
      await page.evaluate(() => navigator.clipboard.readText()),
      await page.locator(".source pre").textContent(),
    );
    await page.goto(origin + `${base}/components/data-table/`);
    await page.getByLabel("Fixture state").selectOption("error");
    await page
      .getByRole("alert")
      .filter({ hasText: "Fixture error" })
      .waitFor();
    await page.getByLabel("Fixture state").selectOption("loading");
    await page.getByRole("progressbar").waitFor();
    await page.getByLabel("Fixture state").selectOption("empty");
    await page.getByText("No records found.", { exact: true }).waitFor();
    await page.getByLabel("Fixture state").selectOption("ready");
    await page
      .getByRole("textbox", { name: "Filter", exact: true })
      .fill("Divider");
    assert.equal(await page.locator("tbody tr").count(), 1);
    await page.getByLabel("Select row divider", { exact: true }).check();
    await page.getByText("1 selected", { exact: true }).waitFor();
    await page.getByRole("textbox", { name: "Filter", exact: true }).fill("");
    await page.getByRole("button", { name: "Component", exact: true }).click();
    assert.ok(
      (await page.locator("tbody tr").first().textContent()).includes("Button"),
    );
    await page.getByRole("button", { name: "Go to next page" }).click();
    assert.equal(await page.locator("tbody tr").count(), 2);
    await page.getByRole("combobox", { name: "Rows per page:" }).click();
    await page.getByRole("option", { name: "5", exact: true }).click();
    assert.equal(await page.locator("tbody tr").count(), 5);
    await page.getByRole("button", { name: "Reset example" }).click();
    if (width < 760)
      await page.getByRole("button", { name: "Toggle navigation" }).click();
    await page
      .getByRole("searchbox", { name: "Search documentation" })
      .fill("Divider");
    await page.locator(".search-results a").first().click();
    await page.getByRole("heading", { name: "Divider", exact: true }).waitFor();
    assert.deepEqual(external, [], `${label} external requests`);
    assert.deepEqual(errors, [], `${label} browser errors`);
    assert.equal(
      await page.evaluate(() => localStorage.length + sessionStorage.length),
      0,
    );
    const domContentLoaded = await page.evaluate(
      () =>
        performance.getEntriesByType("navigation")[0].domContentLoadedEventEnd,
    );
    assert.ok(
      domContentLoaded < 5000,
      `${label}: local DCL budget exceeded (${domContentLoaded}ms)`,
    );
    results.push({
      label,
      routes: 4,
      axeViolations: 0,
      externalRequests: 0,
      browserErrors: 0,
      examples: "passed",
      localDomContentLoadedMs: Math.round(domContentLoaded),
    });
    await context.close();
  }
  const staticContext = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
    colorScheme: "dark",
  });
  const staticPage = await staticContext.newPage();
  await staticPage.goto(origin + `${base}/core/button/`);
  await staticPage
    .getByRole("heading", { name: "Button", exact: true })
    .waitFor();
  assert.ok(
    (await staticPage.locator("main").textContent()).includes(
      "Public contract",
    ),
  );
  assert.ok(
    await staticPage
      .getByRole("navigation", { name: "Main navigation", exact: true })
      .isVisible(),
  );
  await staticContext.close();
  writeFileSync(
    `${evidence}/results.json`,
    JSON.stringify(
      { results, noJavaScript: "readable", arbitraryExecution: "absent" },
      null,
      2,
    ),
  );
  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser.close();
}
