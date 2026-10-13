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

## Integration Example: TrackForge Ordinary App Controls (ui-core)

TrackForge applies `@coderlifenet/ui-core` wrappers across ordinary controls
throughout the app. This does not require replacing existing shell/tables with
`@coderlifenet/ui-components`.

```tsx
import { Button, Checkbox, FormControlLabel, MenuItem, Stack, TextField } from "@coderlifenet/ui-core";

export function TrackForgeAssetFilters() {
	return (
		<Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
			<TextField
				label="Asset Name"
				name="assetName"
				size="small"
				slotProps={{ input: { "aria-label": "Filter by asset name" } }}
			/>
			<TextField
				select
				label="Status"
				name="status"
				size="small"
				slotProps={{ input: { "aria-label": "Filter by status" } }}
			>
				<MenuItem value="open">Open</MenuItem>
				<MenuItem value="in_progress">In Progress</MenuItem>
				<MenuItem value="done">Done</MenuItem>
			</TextField>
			<FormControlLabel control={<Checkbox name="assignedToMe" />} label="Assigned to me" />
			<Button type="submit">Apply</Button>
		</Stack>
	);
}
```

## Integration Example: Form Builder For User-Created Workflows

This is an integration pattern, not a reusable form-builder engine implementation.
Keep TrackForge's ordinary app forms on their existing path.

```tsx
import { useMemo, useState } from "react";
import { Box, MenuItem, Stack, TextField, Typography } from "@coderlifenet/ui-core";
import { createMemoryAdapter } from "@coderlifenet/ui-core/analytics";
import { createAnalyticsRuntime } from "@coderlifenet/ui-core/analytics";
import { TrackingBoundary, UIExtensionsProvider, createAnalyticsExtension } from "@coderlifenet/ui-core/extensions";

type PersistedBoundarySettings = {
	id: string;
	semanticId?: string;
	optOut?: boolean;
	events?: string[];
	metadata?: Record<string, string>;
};

type WorkflowField = {
	id: string;
	label: string;
	kind: "text" | "number" | "date";
	required?: boolean;
	a11yLabel: string;
};

const appBoundary: PersistedBoundarySettings = {
	id: "trackforge-app",
	semanticId: "trackforge",
	metadata: { area: "workflow-builder" }
};

const formBoundary: PersistedBoundarySettings = {
	id: "workflow-template-form",
	semanticId: "workflow-template",
	events: ["ui.text_field.change", "ui.text_field.blur", "ui.select.change"]
};

const fields: WorkflowField[] = [
	{ id: "templateName", label: "Template Name", kind: "text", required: true, a11yLabel: "Workflow template name" },
	{ id: "ownerTeam", label: "Owner Team", kind: "text", a11yLabel: "Owner team" },
	{ id: "escalationWindow", label: "Escalation Window", kind: "number", a11yLabel: "Escalation window in hours" }
];

export function WorkflowTemplateBuilderIntegration() {
	const [values, setValues] = useState<Record<string, string>>({
		templateName: "",
		ownerTeam: "",
		escalationWindow: ""
	});

	const analyticsRuntime = useMemo(
		() =>
			createAnalyticsRuntime([createMemoryAdapter()], {
				enabled: true,
				consent: { analyticsStorage: "granted", adStorage: "denied" }
			}),
		[]
	);

	return (
		<UIExtensionsProvider initialConfig={{ enabled: true }} extensions={[createAnalyticsExtension(analyticsRuntime)]}>
			<TrackingBoundary
				id={appBoundary.id}
				semanticId={appBoundary.semanticId}
				metadata={appBoundary.metadata}
				optOut={appBoundary.optOut}
			>
				<TrackingBoundary
					id={formBoundary.id}
					semanticId={formBoundary.semanticId}
					metadata={formBoundary.metadata}
					optOut={formBoundary.optOut}
					events={formBoundary.events}
				>
					<Stack spacing={2}>
						<Typography variant="h6">Workflow Template Builder</Typography>
						{fields.map((field) => (
							<TrackingBoundary key={field.id} id={`field-${field.id}`} semanticId={field.id}>
								<TextField
									label={field.label}
									name={field.id}
									required={field.required}
									value={values[field.id] ?? ""}
									type={field.kind === "number" ? "number" : "text"}
									onChange={(event) =>
										setValues((prev) => ({
											...prev,
											[field.id]: event.target.value
										}))
									}
									slotProps={{ input: { "aria-label": field.a11yLabel } }}
								/>
							</TrackingBoundary>
						))}

						<TextField
							select
							label="Default Priority"
							name="defaultPriority"
							value={values.defaultPriority ?? "normal"}
							onChange={(event) =>
								setValues((prev) => ({
									...prev,
									defaultPriority: event.target.value
								}))
							}
							slotProps={{ input: { "aria-label": "Default priority" } }}
						>
							<MenuItem value="low">Low</MenuItem>
							<MenuItem value="normal">Normal</MenuItem>
							<MenuItem value="high">High</MenuItem>
						</TextField>
					</Stack>
				</TrackingBoundary>
			</TrackingBoundary>
		</UIExtensionsProvider>
	);
}
```
