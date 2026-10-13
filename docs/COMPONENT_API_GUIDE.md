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

The standalone host owns the single analytics runtime and `UIExtensionsProvider`.
The embedded builder receives persisted form and field tracking settings and maps
each level to `TrackingBoundary` without creating another provider.

```tsx
import { useMemo, useState } from "react";
import { MenuItem, Stack, TextField, Typography } from "@coderlifenet/ui-core";
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

type PersistedFieldTrackingSettings = PersistedBoundarySettings & {
	fieldKey: string;
	a11yLabel: string;
	kind: "text" | "number" | "date" | "select";
	label: string;
	required?: boolean;
	selectOptions?: readonly { value: string; label: string }[];
};

type PersistedFormTrackingSettings = PersistedBoundarySettings & {
	fields: readonly PersistedFieldTrackingSettings[];
};

const appBoundary: PersistedBoundarySettings = {
	id: "trackforge-app",
	semanticId: "trackforge",
	metadata: {
		area: "workflow-builder",
		surface: "template-management"
	}
};

const formBoundary: PersistedFormTrackingSettings = {
	id: "workflow-template-form",
	semanticId: "workflow-template",
	metadata: {
		formType: "workflow-template",
		productArea: "trackforge"
	},
	events: ["ui.text_field.change", "ui.text_field.blur", "ui.select.change"],
	fields: [
		{
			fieldKey: "templateName",
			id: "field-template-name",
			semanticId: "template-name",
			metadata: { section: "identity", kind: "text" },
			events: ["ui.text_field.change", "ui.text_field.blur"],
			optOut: false,
			kind: "text",
			label: "Template Name",
			required: true,
			a11yLabel: "Workflow template name"
		},
		{
			fieldKey: "ownerTeam",
			id: "field-owner-team",
			semanticId: "owner-team",
			metadata: { section: "ownership", kind: "text" },
			events: ["ui.text_field.change", "ui.text_field.blur"],
			optOut: false,
			kind: "text",
			label: "Owner Team",
			a11yLabel: "Owner team"
		},
		{
			fieldKey: "defaultPriority",
			id: "field-default-priority",
			semanticId: "default-priority",
			metadata: { section: "behavior", kind: "select" },
			events: ["ui.select.change"],
			optOut: false,
			kind: "select",
			label: "Default Priority",
			a11yLabel: "Default priority",
			selectOptions: [
				{ value: "low", label: "Low" },
				{ value: "normal", label: "Normal" },
				{ value: "high", label: "High" }
			]
		}
	]
};

type BuilderValues = Record<string, string>;

type WorkflowTemplateBuilderProps = {
	appSettings: PersistedBoundarySettings;
	formSettings: PersistedFormTrackingSettings;
	values: BuilderValues;
	onValueChange: (fieldKey: string, nextValue: string) => void;
};

function WorkflowTemplateBuilder({ appSettings, formSettings, values, onValueChange }: WorkflowTemplateBuilderProps) {
	return (
		<TrackingBoundary
			id={appSettings.id}
			semanticId={appSettings.semanticId}
			metadata={appSettings.metadata}
			optOut={appSettings.optOut}
			events={appSettings.events}
		>
			<TrackingBoundary
				id={formSettings.id}
				semanticId={formSettings.semanticId}
				metadata={formSettings.metadata}
				optOut={formSettings.optOut}
				events={formSettings.events}
			>
				<Stack spacing={2}>
					<Typography variant="h6">Workflow Template Builder</Typography>
					{formSettings.fields.map((field) => (
						<TrackingBoundary
							key={field.id}
							id={field.id}
							semanticId={field.semanticId}
							metadata={field.metadata}
							optOut={field.optOut}
							events={field.events}
						>
							{field.kind === "select" ? (
								<TextField
									select
									label={field.label}
									name={field.fieldKey}
									value={values[field.fieldKey] ?? ""}
									onChange={(event) => onValueChange(field.fieldKey, event.target.value)}
									slotProps={{ input: { "aria-label": field.a11yLabel } }}
								>
									{field.selectOptions?.map((option) => (
										<MenuItem key={option.value} value={option.value}>
											{option.label}
										</MenuItem>
									))}
								</TextField>
							) : (
								<TextField
									label={field.label}
									name={field.fieldKey}
									required={field.required}
									type={field.kind === "number" ? "number" : "text"}
									value={values[field.fieldKey] ?? ""}
									onChange={(event) => onValueChange(field.fieldKey, event.target.value)}
									slotProps={{ input: { "aria-label": field.a11yLabel } }}
								/>
							)}
						</TrackingBoundary>
					))}
				</Stack>
			</TrackingBoundary>
		</TrackingBoundary>
	);
}

export function WorkflowTemplateBuilderHost() {
	const [values, setValues] = useState<Record<string, string>>({
		templateName: "",
		ownerTeam: "",
		defaultPriority: "normal"
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
			<WorkflowTemplateBuilder
				appSettings={appBoundary}
				formSettings={formBoundary}
				values={values}
				onValueChange={(fieldKey, nextValue) =>
					setValues((prev) => ({
						...prev,
						[fieldKey]: nextValue
					}))
				}
			/>
		</UIExtensionsProvider>
	);
}
```

Notes:

- `events` allowlists intersect across nested boundaries. A field event is delivered only if both parent form/app and field-level selections allow it.
- Keep field values/content out of `metadata`. Use static classification metadata only (section/kind/surface), not user-entered data.
