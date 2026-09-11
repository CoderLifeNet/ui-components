import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import net from "node:net";
import path from "node:path";
import { chromium } from "playwright";

const HOST = "127.0.0.1";
const ROOT = process.cwd();
const DEFAULT_VITE_PORT = 4173;
const DEFAULT_NEXT_PORT = 4180;
const REGISTRY_MODE = process.argv.includes("--registry");

function sha512Base64(filePath) {
  const data = readFileSync(filePath);
  return createHash("sha512").update(data).digest("base64");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function verifyLockfileIdentity(lockfilePath, expectedCoreIntegrity, expectedComponentsIntegrity) {
  const lock = readFileSync(lockfilePath, "utf8");
  if (REGISTRY_MODE) {
    const fixture = JSON.parse(readFileSync(path.join(path.dirname(lockfilePath), "package.json"), "utf8"));
    assert(!/\b(?:file|link|workspace):/.test(lock), `${lockfilePath} still contains local dependencies`);
    for (const name of ["@coderlifenet/ui-core", "@coderlifenet/ui-components"]) {
      assert(fixture.dependencies[name] === "0.1.0-alpha.2", `${name} must use the exact registry alpha`);
      assert(lock.includes(`'${name}@0.1.0-alpha.2':`), `${name} is not registry-locked`);
    }
  } else {
    assert(
      lock.includes("file:../../../ui-core/artifacts/coderlifenet-ui-core-0.1.0-alpha.2.tgz"),
      `${lockfilePath} is not pinned to ui-core alpha.2 tarball`
    );
    assert(
      lock.includes("file:../../artifacts/coderlifenet-ui-components-0.1.0-alpha.2.tgz"),
      `${lockfilePath} is not pinned to ui-components alpha.2 tarball`
    );
  }
  assert(
    lock.includes(`sha512-${expectedCoreIntegrity}`),
    `${lockfilePath} integrity does not match ui-core alpha.2 tarball bytes`
  );
  assert(
    lock.includes(`sha512-${expectedComponentsIntegrity}`),
    `${lockfilePath} integrity does not match ui-components alpha.2 tarball bytes`
  );
}

function startProcess(command, args, cwd) {
  const child = spawn(command, args, {
    cwd,
    stdio: ["ignore", "pipe", "pipe"],
    env: process.env
  });

  child.stdout.on("data", (chunk) => {
    process.stdout.write(chunk);
  });
  child.stderr.on("data", (chunk) => {
    process.stderr.write(chunk);
  });

  return child;
}

async function findOpenPort(startPort) {
  let candidate = startPort;
  while (candidate < startPort + 200) {
    // eslint-disable-next-line no-await-in-loop
    const available = await new Promise((resolve, reject) => {
      const server = net.createServer();
      server.unref();
      server.on("error", (error) => {
        if (error && typeof error === "object" && "code" in error && error.code === "EADDRINUSE") {
          resolve(false);
          return;
        }
        reject(error);
      });
      server.listen({ host: HOST, port: candidate }, () => {
        server.close((closeError) => {
          if (closeError) {
            reject(closeError);
            return;
          }
          resolve(true);
        });
      });
    });

    if (available) {
      return candidate;
    }
    candidate += 1;
  }

  throw new Error(`Could not find an open port starting at ${startPort}`);
}

async function waitForHttp(url, timeoutMs = 30_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // Keep waiting for server startup.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function readEventCount(page) {
  const text = await page.locator("[data-testid='event-count']").textContent();
  const value = Number.parseInt(text ?? "", 10);
  if (Number.isNaN(value)) {
    throw new Error(`Unable to parse event count from value: ${String(text)}`);
  }
  return value;
}

async function waitForEventCount(page, expected, label) {
  await page.waitForFunction(
    (wanted) => {
      const node = document.querySelector("[data-testid='event-count']");
      if (!node) {
        return false;
      }
      const value = Number.parseInt(node.textContent ?? "", 10);
      return value === wanted;
    },
    expected,
    { timeout: 5_000 }
  );

  const actual = await readEventCount(page);
  if (actual !== expected) {
    throw new Error(`${label}: expected event count ${expected}, got ${actual}`);
  }
}

async function waitForEventCountAtLeast(page, expected, label) {
  await page.waitForFunction(
    (wanted) => {
      const node = document.querySelector("[data-testid='event-count']");
      if (!node) {
        return false;
      }
      const value = Number.parseInt(node.textContent ?? "", 10);
      return Number.isFinite(value) && value >= wanted;
    },
    expected,
    { timeout: 5_000 }
  );

  const actual = await readEventCount(page);
  if (actual < expected) {
    throw new Error(`${label}: expected event count >= ${expected}, got ${actual}`);
  }
}

async function assertEventCountUnchanged(page, baseline, label) {
  await new Promise((resolve) => setTimeout(resolve, 250));
  const actual = await readEventCount(page);
  if (actual !== baseline) {
    throw new Error(`${label}: expected event count to stay at ${baseline}, got ${actual}`);
  }
}

async function waitForToggleValue(page, testId, expectedChecked) {
  await page.waitForFunction(
    ([id, expected]) => {
      const input = document.querySelector(`[data-testid='${id}']`);
      return !!input && input instanceof HTMLInputElement && input.checked === expected;
    },
    [testId, expectedChecked],
    { timeout: 5_000 }
  );
}

async function runAssertions(page, label) {
  await page.locator("[data-testid='event-count']").waitFor();
  await page.locator("[data-testid='enabled-toggle']").setChecked(true);
  await page.locator("[data-testid='consent-toggle']").setChecked(true);

  const baseline = await readEventCount(page);

  await page.locator("[data-testid='root-button']").click();
  await waitForEventCountAtLeast(page, baseline + 1, `${label} root click`);

  await page.locator("[data-testid='subpath-button']").click();
  await waitForEventCountAtLeast(page, baseline + 2, `${label} subpath click`);

  const afterRootAndSubpath = await readEventCount(page);

  await page.locator("[data-testid='optout-button']").click();
  await assertEventCountUnchanged(page, afterRootAndSubpath, `${label} opted-out boundary click`);

  await page.locator("[data-testid='consent-toggle']").setChecked(false);
  await waitForToggleValue(page, "consent-toggle", false);
  const afterConsentRevoked = await readEventCount(page);
  await page.locator("[data-testid='root-button']").click();
  await assertEventCountUnchanged(page, afterConsentRevoked, `${label} consent revoked click`);

  await page.locator("[data-testid='consent-toggle']").setChecked(true);
  await waitForToggleValue(page, "consent-toggle", true);
  await page.locator("[data-testid='enabled-toggle']").setChecked(false);
  await waitForToggleValue(page, "enabled-toggle", false);
  const afterDisabled = await readEventCount(page);
  await page.locator("[data-testid='subpath-button']").click();
  await assertEventCountUnchanged(page, afterDisabled, `${label} analytics disabled click`);
}

async function verifyPage(browser, url, label) {
  const page = await browser.newPage();
  const pageErrors = [];
  const consoleErrors = [];

  page.on("pageerror", (error) => {
    pageErrors.push(String(error));
  });
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  await page.goto(url, { waitUntil: "networkidle" });
  await runAssertions(page, label);

  return {
    label,
    url,
    assertions: {
      rootAndSubpath: "pass",
      boundaryOptOut: "pass",
      consentRevocation: "pass",
      analyticsDisablement: "pass"
    },
    pageErrors,
    consoleErrors
  };
}

function terminate(child) {
  if (!child || child.killed) {
    return;
  }
  child.kill("SIGTERM");
}

async function main() {
  const coreTarball = path.resolve(ROOT, "../ui-core/artifacts/coderlifenet-ui-core-0.1.0-alpha.2.tgz");
  const componentsTarball = path.resolve(ROOT, "artifacts/coderlifenet-ui-components-0.1.0-alpha.2.tgz");

  async function registryIntegrity(name) {
    const response = await fetch(`https://registry.npmjs.org/${encodeURIComponent(name)}/0.1.0-alpha.2`);
    assert(response.ok, `Registry package unavailable: ${name} (${response.status})`);
    const metadata = await response.json();
    assert(metadata.version === "0.1.0-alpha.2", `Unexpected version: ${name}`);
    assert(metadata.dist.integrity.startsWith("sha512-"), `Missing SHA512 registry integrity: ${name}`);
    return metadata.dist.integrity.slice(7);
  }
  const coreIntegrity = REGISTRY_MODE ? await registryIntegrity("@coderlifenet/ui-core") : sha512Base64(coreTarball);
  const componentsIntegrity = REGISTRY_MODE ? await registryIntegrity("@coderlifenet/ui-components") : sha512Base64(componentsTarball);

  verifyLockfileIdentity(
    path.resolve(ROOT, "consumers/vite-app/pnpm-lock.yaml"),
    coreIntegrity,
    componentsIntegrity
  );
  verifyLockfileIdentity(
    path.resolve(ROOT, "consumers/next-app/pnpm-lock.yaml"),
    coreIntegrity,
    componentsIntegrity
  );

  const vitePort = await findOpenPort(DEFAULT_VITE_PORT);
  const nextPort = await findOpenPort(DEFAULT_NEXT_PORT);

  const vite = startProcess(
    path.resolve(ROOT, "consumers/vite-app/node_modules/.bin/vite"),
    ["preview", "--host", HOST, "--port", String(vitePort)],
    path.resolve(ROOT, "consumers/vite-app")
  );
  const next = startProcess(
    path.resolve(ROOT, "consumers/next-app/node_modules/.bin/next"),
    ["start", "--hostname", HOST, "--port", String(nextPort)],
    path.resolve(ROOT, "consumers/next-app")
  );

  try {
    await waitForHttp(`http://${HOST}:${vitePort}/`);
    await waitForHttp(`http://${HOST}:${nextPort}/`);

    const browser = await chromium.launch({ headless: true });
    try {
      const viteResult = await verifyPage(browser, `http://${HOST}:${vitePort}/`, "vite");
      const nextResult = await verifyPage(browser, `http://${HOST}:${nextPort}/`, "next");

      const results = [viteResult, nextResult];
      for (const result of results) {
        assert(result.pageErrors.length === 0, `${result.label} reported page errors: ${result.pageErrors.join(" | ")}`);
        assert(
          result.consoleErrors.length === 0,
          `${result.label} reported console errors: ${result.consoleErrors.join(" | ")}`
        );
      }

      console.log(JSON.stringify({
        artifacts: {
          core: {
            tarball: REGISTRY_MODE ? "@coderlifenet/ui-core@0.1.0-alpha.2 (npm registry)" : "ui-core/artifacts/coderlifenet-ui-core-0.1.0-alpha.2.tgz",
            integrity: `sha512-${coreIntegrity}`
          },
          components: {
            tarball: REGISTRY_MODE ? "@coderlifenet/ui-components@0.1.0-alpha.2 (npm registry)" : "ui-components/artifacts/coderlifenet-ui-components-0.1.0-alpha.2.tgz",
            integrity: `sha512-${componentsIntegrity}`
          }
        },
        results
      }, null, 2));
    } finally {
      await browser.close();
    }
  } finally {
    terminate(vite);
    terminate(next);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
});
