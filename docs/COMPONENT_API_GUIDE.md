# Component API Guide

## DataTable

- Typed columns and rows
- Controlled or uncontrolled sorting/filtering/pagination/selection
- Loading, empty, and error states
- Toolbar action slot

## TreeExplorer

- Typed hierarchical nodes with stable IDs
- Controlled/uncontrolled expansion and selection
- Disabled node support and keyboard interactions

## DashboardLayout

- Header, sidebar, navigation, breadcrumbs, and content slots
- Mobile drawer behavior and controlled/uncontrolled sidebar state
- Router-neutral navigation callbacks

## Integration Example: TrackForge App Surface

Use `DashboardLayout` and `DataTable` for TrackForge app surfaces like asset lists,
inspection queues, and navigation shells.

```tsx
import { DashboardLayout, DataTable, type DataTableColumn } from "@coderlifenet/ui-components";

type WorkOrderRow = {
	id: string;
	jobCode: string;
	status: "open" | "in_progress" | "done";
};

const columns: DataTableColumn<WorkOrderRow>[] = [
	{ id: "jobCode", header: "Job", accessor: (row) => row.jobCode },
	{ id: "status", header: "Status", accessor: (row) => row.status }
];

export function TrackForgeWorkOrders({ rows }: { rows: WorkOrderRow[] }) {
	return (
		<DashboardLayout
			title="TrackForge"
			navigationItems={[{ id: "work-orders", label: "Work Orders", href: "/work-orders" }]}
			breadcrumbs={[{ id: "home", label: "Home", href: "/" }, { id: "work-orders", label: "Work Orders" }]}
		>
			<DataTable rows={rows} columns={columns} getRowId={(row) => row.id} />
		</DashboardLayout>
	);
}
```

## Integration Example: Form Builder For User-Created Workflows

Keep TrackForge's ordinary app forms as-is. Use a separate builder-style surface
only for user-created workflow templates.

```tsx
import { useState } from "react";
import { Box, Button, MenuItem, Stack, TextField, Typography } from "@coderlifenet/ui-core";

type WorkflowField = {
	id: string;
	label: string;
	kind: "text" | "number" | "date";
};

export function WorkflowFormBuilder() {
	const [fields, setFields] = useState<WorkflowField[]>([]);

	return (
		<Stack spacing={2}>
			<Typography variant="h6">Workflow Form Builder</Typography>
			<Button
				onClick={() =>
					setFields((prev) => [...prev, { id: `field-${prev.length + 1}`, label: "New field", kind: "text" }])
				}
			>
				Add Field
			</Button>

			{fields.map((field) => (
				<Box key={field.id} sx={{ display: "grid", gap: 1, gridTemplateColumns: "2fr 1fr" }}>
					<TextField label="Field Label" value={field.label} size="small" />
					<TextField select label="Field Type" value={field.kind} size="small">
						<MenuItem value="text">Text</MenuItem>
						<MenuItem value="number">Number</MenuItem>
						<MenuItem value="date">Date</MenuItem>
					</TextField>
				</Box>
			))}
		</Stack>
	);
}
```
