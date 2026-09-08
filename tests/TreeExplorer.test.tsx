import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
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
    expect(onExpandedIdsChange).toHaveBeenCalledTimes(1);
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
              { id: "api", label: "API" }
            ]
          }
        ]}
      />
    );

    const docsNode = screen.getByRole("treeitem", { name: /Docs/ });
    docsNode.focus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("treeitem", { name: /Guide/ })).toHaveAttribute("aria-selected", "true");

    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("treeitem", { name: /API/ })).toHaveAttribute("aria-selected", "true");

    await user.keyboard("{ArrowUp}");
    expect(screen.getByRole("treeitem", { name: /Guide/ })).toHaveAttribute("aria-selected", "true");
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
});
