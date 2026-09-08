"use client";

import { useMemo, useState } from "react";
import type { ComponentProps, JSX } from "react";
import {
  Alert,
  Box,
  Checkbox,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Toolbar,
  Typography
} from "@coderlife/ui-core";
import { TrackingBoundary } from "@coderlife/ui-core/extensions";
import { useEmitUIEvent } from "@coderlife/ui-core/instrumentation";

export type SortDirection = "asc" | "desc";

type UINode = ComponentProps<typeof Box>["children"];

export interface DataTableSortState {
  columnId: string;
  direction: SortDirection;
}

export interface DataTableColumn<TRow> {
  id: string;
  header: UINode;
  accessor: (row: TRow) => UINode;
  sortValue?: (row: TRow) => string | number;
  filterValue?: (row: TRow) => string;
  align?: "left" | "right" | "center";
}

export interface DataTableProps<TRow> {
  rows: readonly TRow[];
  columns: readonly DataTableColumn<TRow>[];
  getRowId: (row: TRow) => string;
  loading?: boolean;
  error?: string;
  serverMode?: boolean;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  sort?: DataTableSortState | null;
  onSortChange?: (sort: DataTableSortState | null) => void;
  filterQuery?: string;
  onFilterQueryChange?: (query: string) => void;
  selectedRowIds?: readonly string[];
  onSelectedRowIdsChange?: (next: readonly string[]) => void;
  toolbarActions?: UINode;
  onRefresh?: () => void;
  emptyMessage?: string;
  semanticTrackingOnly?: boolean;
}

function compareValues(a: string | number, b: string | number, direction: SortDirection): number {
  const result = a > b ? 1 : a < b ? -1 : 0;
  return direction === "asc" ? result : result * -1;
}

export function DataTable<TRow>({
  rows,
  columns,
  getRowId,
  loading = false,
  error,
  serverMode = false,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  sort,
  onSortChange,
  filterQuery,
  onFilterQueryChange,
  selectedRowIds,
  onSelectedRowIdsChange,
  toolbarActions,
  onRefresh,
  emptyMessage = "No records found.",
  semanticTrackingOnly = true
}: DataTableProps<TRow>): JSX.Element {
  const emit = useEmitUIEvent();

  const [internalPage, setInternalPage] = useState(0);
  const [internalPageSize, setInternalPageSize] = useState(10);
  const [internalSort, setInternalSort] = useState<DataTableSortState | null>(null);
  const [internalFilter, setInternalFilter] = useState("");
  const [internalSelectedRowIds, setInternalSelectedRowIds] = useState<readonly string[]>([]);

  const activePage = page ?? internalPage;
  const activePageSize = pageSize ?? internalPageSize;
  const activeSort = sort ?? internalSort;
  const activeFilter = filterQuery ?? internalFilter;
  const activeSelectedRowIds = selectedRowIds ?? internalSelectedRowIds;

  const filteredRows = useMemo(() => {
    if (serverMode) {
      return rows;
    }
    if (!activeFilter.trim()) {
      return rows;
    }

    const query = activeFilter.toLowerCase();
    return rows.filter((row) =>
      columns.some((column) => {
        const value = column.filterValue?.(row) ?? String(column.accessor(row));
        return value.toLowerCase().includes(query);
      })
    );
  }, [activeFilter, columns, rows, serverMode]);

  const sortedRows = useMemo(() => {
    if (serverMode || !activeSort) {
      return filteredRows;
    }

    const column = columns.find((entry) => entry.id === activeSort.columnId);
    if (!column) {
      return filteredRows;
    }

    return [...filteredRows].sort((a, b) => {
      const aValue = column.sortValue?.(a) ?? String(column.accessor(a));
      const bValue = column.sortValue?.(b) ?? String(column.accessor(b));
      return compareValues(aValue, bValue, activeSort.direction);
    });
  }, [activeSort, columns, filteredRows, serverMode]);

  const pagedRows = useMemo(() => {
    if (serverMode) {
      return sortedRows;
    }
    const start = activePage * activePageSize;
    const end = start + activePageSize;
    return sortedRows.slice(start, end);
  }, [activePage, activePageSize, serverMode, sortedRows]);

  const allSelected = pagedRows.length > 0 && pagedRows.every((row) => activeSelectedRowIds.includes(getRowId(row)));

  const setPageValue = (next: number): void => {
    if (onPageChange) {
      onPageChange(next);
    } else {
      setInternalPage(next);
    }
    emit({
      type: "ui.table.page_change",
      action: "paginate",
      component: "DataTable",
      metadata: { page: next }
    });
  };

  const setPageSizeValue = (next: number): void => {
    if (onPageSizeChange) {
      onPageSizeChange(next);
    } else {
      setInternalPageSize(next);
      setInternalPage(0);
    }
    emit({
      type: "ui.table.page_size_change",
      action: "page_size",
      component: "DataTable",
      metadata: { pageSize: next }
    });
  };

  const setSortValue = (next: DataTableSortState | null): void => {
    if (onSortChange) {
      onSortChange(next);
    } else {
      setInternalSort(next);
    }
    emit({
      type: "ui.table.sort_change",
      action: "sort",
      component: "DataTable",
      metadata: { hasSort: Boolean(next) }
    });
  };

  const setFilterValue = (next: string): void => {
    if (onFilterQueryChange) {
      onFilterQueryChange(next);
    } else {
      setInternalFilter(next);
    }
    emit({
      type: "ui.table.filter_change",
      action: "filter",
      component: "DataTable",
      metadata: { queryLength: next.length }
    });
  };

  const setSelectionValue = (next: readonly string[]): void => {
    if (onSelectedRowIdsChange) {
      onSelectedRowIdsChange(next);
    } else {
      setInternalSelectedRowIds(next);
    }
    emit({
      type: "ui.table.selection_change",
      action: "select",
      component: "DataTable",
      metadata: { selectedCount: next.length }
    });
  };

  const content = (
    <Paper>
      <Toolbar>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ width: "100%", alignItems: { sm: "center" } }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Data Table
          </Typography>
          <TextField
            size="small"
            label="Filter"
            value={activeFilter}
            onChange={(event) => setFilterValue(event.target.value)}
          />
          {toolbarActions}
          {onRefresh ? (
            <IconButton
              aria-label="Refresh table"
              onClick={() => {
                onRefresh();
                emit({ type: "ui.table.refresh", action: "refresh", component: "DataTable" });
              }}
            >
              <Typography variant="caption">R</Typography>
            </IconButton>
          ) : null}
        </Stack>
      </Toolbar>

      {error ? <Alert severity="error">{error}</Alert> : null}

      <TableContainer sx={{ maxWidth: "100%", overflowX: "auto" }}>
        <Table aria-label="Data table">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  slotProps={{ input: { "aria-label": "Select all rows" } }}
                  checked={allSelected}
                  onChange={(event) => {
                    if (event.target.checked) {
                      setSelectionValue(pagedRows.map((row) => getRowId(row)));
                    } else {
                      setSelectionValue([]);
                    }
                  }}
                />
              </TableCell>
              {columns.map((column) => {
                const isSorted = activeSort?.columnId === column.id;
                return (
                  <TableCell key={column.id} align={column.align ?? "left"}>
                    <TableSortLabel
                      active={isSorted}
                      direction={isSorted ? activeSort.direction : "asc"}
                      onClick={() => {
                        if (!isSorted) {
                          setSortValue({ columnId: column.id, direction: "asc" });
                          return;
                        }
                        const nextDirection = activeSort.direction === "asc" ? "desc" : "asc";
                        setSortValue({ columnId: column.id, direction: nextDirection });
                      }}
                    >
                      {column.header}
                    </TableSortLabel>
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1}>
                  <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                    <CircularProgress size={24} />
                  </Box>
                </TableCell>
              </TableRow>
            ) : pagedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1}>
                  <Typography sx={{ py: 2 }}>{emptyMessage}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              pagedRows.map((row) => {
                const rowId = getRowId(row);
                const checked = activeSelectedRowIds.includes(rowId);
                return (
                  <TableRow hover key={rowId} selected={checked}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        slotProps={{ input: { "aria-label": `Select row ${rowId}` } }}
                        checked={checked}
                        onChange={(event) => {
                          const next = event.target.checked
                            ? [...activeSelectedRowIds, rowId]
                            : activeSelectedRowIds.filter((id) => id !== rowId);
                          setSelectionValue(next);
                        }}
                      />
                    </TableCell>
                    {columns.map((column) => (
                      <TableCell key={column.id} align={column.align ?? "left"}>
                        {column.accessor(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={serverMode ? rows.length : sortedRows.length}
        page={activePage}
        rowsPerPage={activePageSize}
        rowsPerPageOptions={[...new Set([activePageSize, 5, 10, 25, 50])].sort((a, b) => a - b)}
        onPageChange={(_, next) => setPageValue(next)}
        onRowsPerPageChange={(event) => setPageSizeValue(Number(event.target.value))}
      />
    </Paper>
  );

  if (!semanticTrackingOnly) {
    return content;
  }

  return (
    <TrackingBoundary id="datatable-internal" optOut>
      {content}
    </TrackingBoundary>
  );
}
