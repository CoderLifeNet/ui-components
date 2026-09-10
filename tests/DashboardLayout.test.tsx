import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { UIExtensionsProvider, createAnalyticsExtension } from "@coderlifenet/ui-core/extensions";
import { createAnalyticsRuntime, createMemoryAdapter } from "@coderlifenet/ui-core/analytics";
import { DashboardLayout } from "../src/components/DashboardLayout.js";

describe("DashboardLayout", () => {
  it("renders title and emits navigation callback", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();

    render(
      <DashboardLayout
        title="Workspace"
        navigationItems={[{ id: "home", label: "Home", onNavigate }]}
      >
        <div>Body</div>
      </DashboardLayout>
    );

    expect(screen.getByText("Workspace")).toBeTruthy();
    await user.click(screen.getByText("Home"));
    expect(onNavigate).toHaveBeenCalledTimes(1);
  });

  it("supports controlled sidebar state on menu interaction", async () => {
    const user = userEvent.setup();
    const onSidebarOpenChange = vi.fn();

    render(
      <DashboardLayout
        title="Controlled"
        sidebarOpen={false}
        onSidebarOpenChange={onSidebarOpenChange}
        navigationItems={[{ id: "home", label: "Home" }]}
      >
        <div>Body</div>
      </DashboardLayout>
    );

    await user.click(screen.getByRole("button", { name: "Open navigation" }));
    expect(onSidebarOpenChange).toHaveBeenCalledWith(true);
  });

  it("renders accessible landmarks and breadcrumb navigation", async () => {
    const user = userEvent.setup();
    render(
      <DashboardLayout
        title="A11y"
        defaultSidebarOpen={false}
        breadcrumbs={[{ id: "docs", label: "Docs", href: "/docs" }]}
        navigationItems={[{ id: "home", label: "Home", href: "/" }]}
      >
        <div>Body</div>
      </DashboardLayout>
    );

    expect(screen.getByRole("main")).toBeTruthy();
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Open navigation" }));
    expect(screen.getByRole("navigation", { name: "Primary" })).toBeTruthy();
  });

  it("emits dashboard semantic events without duplicate nested link/icon events by default", async () => {
    const user = userEvent.setup();
    const memory = createMemoryAdapter();
    const runtime = createAnalyticsRuntime([memory], {
      enabled: true,
      consent: { analyticsStorage: "granted", adStorage: "denied" }
    });

    render(
      <UIExtensionsProvider initialConfig={{ enabled: true }} extensions={[createAnalyticsExtension(runtime)]}>
        <DashboardLayout
          title="Tracked"
          defaultSidebarOpen={false}
          navigationItems={[{ id: "reports", label: "Reports" }]}
        >
          <div>Body</div>
        </DashboardLayout>
      </UIExtensionsProvider>
    );

    await user.click(screen.getByRole("button", { name: "Open navigation" }));
    await user.click(screen.getByText("Reports"));

    const types = memory.read().map((entry) => entry.type);
    expect(types).toContain("ui.dashboard.sidebar_toggle");
    expect(types).toContain("ui.dashboard.navigate");
    expect(types).not.toContain("ui.icon_button.click");
    expect(types).not.toContain("ui.link.click");
  });
});
