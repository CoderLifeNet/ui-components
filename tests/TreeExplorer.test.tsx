import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { UIExtensionsProvider, createAnalyticsExtension } from "@coderlifenet/ui-core/extensions";
import { createAnalyticsRuntime, createMemoryAdapter } from "@coderlifenet/ui-core/analytics";
import { TreeExplorer } from "../src/components/TreeExplorer.js";

describe("TreeExplorer", () => {
  it("renders and expands nodes", async () => {
    const user = userEvent.setup();
    const onExpandedIdsChange = vi.fn();

    render(
      <TreeExplorer
        nodes={[
          {
            id: "docs",
            label: "Docs",
            children: [{ id: "guide", label: "Guide" }]
          }
        ]}
        onExpandedIdsChange={onExpandedIdsChange}
      />
    );

    await user.click(screen.getByRole("treeitem", { name: /Docs/ }));
    expect(onExpandedIdsChange).toHaveBeenCalledWith(["docs"]);
    expect(screen.getByRole("treeitem", { name: "Guide" })).toBeVisible();
  });

  it("supports visible-node keyboard navigation and selection updates", async () => {
    const user = userEvent.setup();

    render(
      <TreeExplorer
        defaultSelectedId="docs"
        defaultExpandedIds={["docs"]}
        nodes={[
          {
            id: "docs",
            label: "Docs",
            children: [
              { id: "guide", label: "Guide" },
              { id: "locked", label: "Locked", disabled: true },
              { id: "api", label: "API" }
            ]
          }
        ]}
      />
    );

    const docsNode = screen.getByRole("treeitem", { name: "Docs" });
    const guide = screen.getByRole("treeitem", { name: "Guide" });
    const api = screen.getByRole("treeitem", { name: "API" });
    await user.tab();
    expect(docsNode).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(guide).toHaveFocus();
    expect(guide).toHaveAttribute("aria-selected", "true");
    expect(guide).toHaveAttribute("aria-level", "2");
    expect(docsNode).toHaveAttribute("tabindex", "-1");

    await user.keyboard("{ArrowDown}");
    expect(api).toHaveFocus();
    expect(api).toHaveAttribute("aria-selected", "true");

    await user.keyboard("{ArrowUp}");
    expect(guide).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(docsNode).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(guide).not.toBeInTheDocument();
    await user.keyboard("{ArrowRight}{ArrowRight}");
    expect(screen.getByRole("treeitem", { name: "Guide" })).toHaveFocus();
    await user.keyboard("{End}");
    expect(screen.getByRole("treeitem", { name: "API" })).toHaveFocus();
    await user.keyboard("{Home}");
    expect(docsNode).toHaveFocus();
  });

  it("moves focus independently of controlled selection", async () => {
    const user = userEvent.setup();
    const onSelectedIdChange = vi.fn();
    render(<TreeExplorer selectedId={null} defaultSelectedId="second" onSelectedIdChange={onSelectedIdChange}
      nodes={[{ id: "first", label: "First" }, { id: "second", label: "Second" }]} />);

    await user.tab();
    expect(screen.getByRole("treeitem", { name: "First" })).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    const second = screen.getByRole("treeitem", { name: "Second" });
    expect(second).toHaveFocus();
    expect(second).toHaveAttribute("aria-selected", "false");
    expect(onSelectedIdChange).toHaveBeenCalledWith("second");
  });

  it("returns focus to the parent when the host collapses a controlled branch", async () => {
    const user = userEvent.setup();
    const onSelectedIdChange = vi.fn();
    const onExpandedIdsChange = vi.fn();
    const nodes = [
      { id: "first", label: "First" },
      { id: "docs", label: "Docs", children: [{ id: "guide", label: "Guide" }] }
    ];
    const tree = (expandedIds: string[]) => (
      <TreeExplorer
        nodes={nodes}
        expandedIds={expandedIds}
        selectedId="guide"
        onExpandedIdsChange={onExpandedIdsChange}
        onSelectedIdChange={onSelectedIdChange}
      />
    );
    const { rerender } = render(tree(["docs"]));
    await user.tab();
    expect(screen.getByRole("treeitem", { name: "Guide" })).toHaveFocus();

    rerender(tree([]));

    const parent = screen.getByRole("treeitem", { name: "Docs" });
    expect(screen.queryByRole("treeitem", { name: "Guide" })).not.toBeInTheDocument();
    expect(parent).toHaveFocus();
    expect(parent).toHaveAttribute("tabindex", "0");
    expect(parent).toHaveAttribute("aria-selected", "false");
    expect(onExpandedIdsChange).not.toHaveBeenCalled();
    expect(onSelectedIdChange).not.toHaveBeenCalled();
  });

  it("moves focus to the parent with ArrowLeft after an expanded node becomes a leaf", async () => {
    const user = userEvent.setup();
    const onExpandedIdsChange = vi.fn();
    const tree = (withChildren: boolean) => (
      <TreeExplorer
        nodes={[{ id: "docs", label: "Docs", children: [{
          id: "guide",
          label: "Guide",
          ...(withChildren ? { children: [{ id: "chapter", label: "Chapter" }] } : {})
        }] }]}
        expandedIds={["docs", "guide"]}
        selectedId="guide"
        onExpandedIdsChange={onExpandedIdsChange}
      />
    );
    const { rerender } = render(tree(true));
    await user.tab();
    const guide = screen.getByRole("treeitem", { name: "Guide" });
    expect(guide).toHaveFocus();
    expect(guide).toHaveAttribute("aria-expanded", "true");

    rerender(tree(false));
    expect(guide).not.toHaveAttribute("aria-expanded");
    await user.keyboard("{ArrowLeft}");

    expect(screen.getByRole("treeitem", { name: "Docs" })).toHaveFocus();
    expect(onExpandedIdsChange).not.toHaveBeenCalled();
  });

  it("does not expand or select disabled nodes", async () => {
    const user = userEvent.setup();
    const onExpandedIdsChange = vi.fn();
    const onSelectedIdChange = vi.fn();

    render(
      <TreeExplorer
        onExpandedIdsChange={onExpandedIdsChange}
        onSelectedIdChange={onSelectedIdChange}
        nodes={[
          {
            id: "locked",
            label: "Locked",
            disabled: true,
            children: [{ id: "child", label: "Child" }]
          }
        ]}
      />
    );

    const item = screen.getByRole("treeitem", { name: /Locked/ });
    item.focus();
    await user.keyboard("{ArrowRight}");

    expect(item).toHaveAttribute("aria-expanded", "false");
    expect(onExpandedIdsChange).not.toHaveBeenCalled();
    expect(onSelectedIdChange).not.toHaveBeenCalled();
  });

  it("does not promote node IDs into semantic event identity", async () => {
    const user = userEvent.setup();
    const memory = createMemoryAdapter();
    const runtime = createAnalyticsRuntime([memory], {
      enabled: true,
      consent: { analyticsStorage: "granted", adStorage: "denied" }
    });

    render(
      <UIExtensionsProvider initialConfig={{ enabled: true }} extensions={[createAnalyticsExtension(runtime)]}>
        <TreeExplorer nodes={[{ id: "customer-42", label: "Customer" }]} />
      </UIExtensionsProvider>
    );

    await user.click(screen.getByRole("treeitem", { name: /Customer/ }));
    const selectionEvent = memory.read().find((entry) => entry.type === "ui.tree.selection_change");
    expect(selectionEvent).toBeTruthy();
    expect(selectionEvent?.semanticId).toBeUndefined();
  });
});
