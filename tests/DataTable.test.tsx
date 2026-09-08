import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { UIExtensionsProvider, createAnalyticsExtension } from "@coderlife/ui-core/extensions";
import { createAnalyticsRuntime, createMemoryAdapter } from "@coderlife/ui-core/analytics";
import { DataTable } from "../src/components/DataTable.js";

interface Row {
  id: string;
  name: string;
  visits: number;
}

const rows: Row[] = [
  { id: "1", name: "Ava", visits: 12 },
  { id: "2", name: "Noah", visits: 4 },
  { id: "3", name: "Mia", visits: 8 }
];

const columns = [
  { id: "name", header: "Name", accessor: (row: Row) => row.name },
  { id: "visits", header: "Visits", accessor: (row: Row) => row.visits, sortValue: (row: Row) => row.visits }
];

describe("DataTable", () => {
  it("renders rows and supports filtering", async () => {
    const user = userEvent.setup();

    render(
      <DataTable
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
      />
    );

    expect(screen.getByText("Ava")).toBeTruthy();
    await user.type(screen.getByLabelText("Filter"), "Noah");
    expect(screen.getByText("Noah")).toBeTruthy();
  });

  it("supports controlled pagination", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(
      <DataTable
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        page={0}
        pageSize={1}
        onPageChange={onPageChange}
      />
    );

    const nextButtons = screen.getAllByLabelText("Go to next page");
    const target = nextButtons[nextButtons.length - 1];
    if (!target) {
      throw new Error("Expected at least one next-page button");
    }
    await user.click(target);
    expect(onPageChange).toHaveBeenCalledTimes(1);
  });

  it("keeps controlled selection stable through sort/filter/pagination changes", async () => {
    const user = userEvent.setup();
    let selected: readonly string[] = ["3"];
    const onSelectedRowIdsChange = vi.fn((next: readonly string[]) => {
      selected = next;
    });

    const { rerender } = render(
      <DataTable
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        selectedRowIds={selected}
        onSelectedRowIdsChange={onSelectedRowIdsChange}
        page={0}
        pageSize={2}
      />
    );

    const visitsSort = screen.getAllByRole("button", { name: "Visits" })[0];
    if (!visitsSort) {
      throw new Error("Missing Visits sort control");
    }
    await user.click(visitsSort);

    const filterInput = screen.getAllByLabelText("Filter")[0];
    if (!filterInput) {
      throw new Error("Missing Filter input");
    }
    await user.type(filterInput, "Mia");

    rerender(
      <DataTable
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        selectedRowIds={selected}
        onSelectedRowIdsChange={onSelectedRowIdsChange}
        page={0}
        pageSize={2}
      />
    );

    expect(screen.getByLabelText("Select row 3")).toHaveProperty("checked", true);
  });

  it("uses serverMode without local filtering/sorting", async () => {
    const user = userEvent.setup();
    const onFilterQueryChange = vi.fn();

    render(
      <DataTable
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        serverMode
        onFilterQueryChange={onFilterQueryChange}
      />
    );

    const filterInput = screen.getAllByLabelText("Filter")[0];
    if (!filterInput) {
      throw new Error("Missing Filter input");
    }
    await user.type(filterInput, "Noah");
    expect(onFilterQueryChange).toHaveBeenCalled();
    expect(screen.getByText("Ava")).toBeTruthy();
    expect(screen.getByText("Noah")).toBeTruthy();
  });

  it("renders loading, error, and empty states", () => {
    const { rerender } = render(
      <DataTable rows={rows} columns={columns} getRowId={(row) => row.id} loading />
    );
    expect(screen.getByRole("progressbar")).toBeTruthy();

    rerender(
      <DataTable rows={rows} columns={columns} getRowId={(row) => row.id} error="Broken" />
    );
    expect(screen.getByText("Broken")).toBeTruthy();

    rerender(
      <DataTable rows={[]} columns={columns} getRowId={(row) => row.id} emptyMessage="Nothing" />
    );
    expect(screen.getByText("Nothing")).toBeTruthy();
  });

  it("emits DataTable semantic events without duplicate nested checkbox events by default", async () => {
    const user = userEvent.setup();
    const memory = createMemoryAdapter();
    const runtime = createAnalyticsRuntime([memory], {
      enabled: true,
      consent: { analyticsStorage: "granted", adStorage: "denied" }
    });

    render(
      <UIExtensionsProvider initialConfig={{ enabled: true }} extensions={[createAnalyticsExtension(runtime)]}>
        <DataTable rows={rows} columns={columns} getRowId={(row) => row.id} />
      </UIExtensionsProvider>
    );

    const firstRowCheckbox = screen.getAllByLabelText("Select row 1")[0];
    if (!firstRowCheckbox) {
      throw new Error("Missing row checkbox");
    }
    await user.click(firstRowCheckbox);

    const types = memory.read().map((entry) => entry.type);
    expect(types).toContain("ui.table.selection_change");
    expect(types).not.toContain("ui.checkbox.change");
  });
});
