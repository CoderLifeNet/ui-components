import { useState } from "react";
import { DataTable } from "@coderlifenet/ui-components/DataTable";
import type { DataTableColumn } from "@coderlifenet/ui-components/DataTable";

const fixtures = [
  {
    id: "divider",
    component: "Divider",
    kind: "Unchanged",
    state: "Reviewed template",
  },
  {
    id: "button",
    component: "Button",
    kind: "Enhanced",
    state: "Reviewed template",
  },
  {
    id: "table",
    component: "DataTable",
    kind: "Original",
    state: "Reviewed template",
  },
  {
    id: "tree",
    component: "TreeExplorer",
    kind: "Original",
    state: "Reference pending",
  },
  {
    id: "layout",
    component: "DashboardLayout",
    kind: "Original",
    state: "Reference pending",
  },
];
const columns: DataTableColumn<(typeof fixtures)[number]>[] = [
  {
    id: "component",
    header: "Component",
    accessor: (row) => row.component,
    sortValue: (row) => row.component,
    filterValue: (row) => row.component,
  },
  {
    id: "kind",
    header: "Classification",
    accessor: (row) => row.kind,
    sortValue: (row) => row.kind,
  },
  { id: "state", header: "Coverage", accessor: (row) => row.state },
];

export default function DataTableExample() {
  const [state, setState] = useState("ready");
  const [pageSize, setPageSize] = useState(3);
  const [page, setPage] = useState(0);
  const [filterQuery, setFilterQuery] = useState("");
  const [selection, setSelection] = useState<readonly string[]>([]);
  return (
    <div className="table-fixture">
      <div className="fixture-controls">
        <label>
          Fixture state{" "}
          <select
            value={state}
            onChange={(event) => setState(event.target.value)}
          >
            {["ready", "loading", "empty", "error"].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <span aria-live="polite">{selection.length} selected</span>
      </div>
      <div
        className="table-scroll"
        role="region"
        aria-label="Component fixture table"
        tabIndex={0}
      >
        <DataTable
          rows={state === "empty" ? [] : fixtures}
          columns={columns}
          getRowId={(row) => row.id}
          loading={state === "loading"}
          error={
            state === "error"
              ? "Fixture error: request unavailable."
              : undefined
          }
          selectedRowIds={selection}
          onSelectedRowIdsChange={setSelection}
          pageSize={pageSize}
          page={page}
          onPageChange={setPage}
          onPageSizeChange={(next) => {
            setPageSize(next);
            setPage(0);
          }}
          filterQuery={filterQuery}
          onFilterQueryChange={(next) => {
            setFilterQuery(next);
            setPage(0);
          }}
        />
      </div>
      <p className="muted">
        Deterministic fixtures. Client-side sorting, filtering, selection and
        pagination; no server connection.
      </p>
    </div>
  );
}
