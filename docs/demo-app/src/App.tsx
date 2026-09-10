import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  CssBaseline,
  Divider,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  ThemeProvider,
  Typography,
  createTheme
} from "@coderlifenet/ui-core";
import SubpathButton from "@coderlifenet/ui-core/Button";
import { createAnalyticsRuntime, createMemoryAdapter } from "@coderlifenet/ui-core/analytics";
import { TrackingBoundary, UIExtensionsProvider, createAnalyticsExtension } from "@coderlifenet/ui-core/extensions";
import { DashboardLayout, DataTable, TreeExplorer } from "@coderlifenet/ui-components";
import inventory from "../../../../ui-core/generated/mui-surface.json";

interface InventoryEntry {
  subpath: string;
  moduleSpecifier: string;
  category: string;
}

const sampleRows = [
  { id: "ord-001", customer: "Ava", amount: 124, status: "Paid" },
  { id: "ord-002", customer: "Noah", amount: 55, status: "Pending" },
  { id: "ord-003", customer: "Mia", amount: 310, status: "Paid" }
];

const sampleTree = [
  {
    id: "workspace",
    label: "Workspace",
    children: [
      { id: "docs", label: "Documentation" },
      { id: "reports", label: "Reports" }
    ]
  }
];

export function App() {
  const [enabled, setEnabled] = useState(true);
  const [consent, setConsent] = useState(true);
  const [query, setQuery] = useState("");
  const [events, setEvents] = useState<Array<Record<string, unknown>>>([]);

  const memory = useMemo(() => createMemoryAdapter(), []);
  const runtime = useMemo(
    () =>
      createAnalyticsRuntime([memory], {
        enabled,
        consent: {
          analyticsStorage: consent ? "granted" : "denied",
          adStorage: "denied"
        }
      }),
    [consent, enabled, memory]
  );

  useEffect(() => {
    runtime.update({
      enabled,
      consent: {
        analyticsStorage: consent ? "granted" : "denied",
        adStorage: "denied"
      }
    });
  }, [consent, enabled, runtime]);

  useEffect(() => {
    const timer = setInterval(() => {
      setEvents(memory.read().map((entry) => ({ ...entry })));
    }, 250);
    return () => clearInterval(timer);
  }, [memory]);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: "light",
          primary: { main: "#0d47a1" },
          secondary: { main: "#ad1457" }
        }
      }),
    []
  );

  const entries = (inventory.entries as InventoryEntry[])
    .filter((entry) =>
      `${entry.subpath} ${entry.moduleSpecifier} ${entry.category}`.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 30);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <UIExtensionsProvider initialConfig={{ enabled: true }} extensions={[createAnalyticsExtension(runtime)]}>
        <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
          <Typography variant="h4" sx={{ mb: 2 }}>
            CoderLife UI Demo
          </Typography>
          <Typography sx={{ mb: 2 }}>
            Synthetic demo only. No live analytics adapters are configured.
          </Typography>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 3 }}>
            <FormControlLabel
              control={<Switch checked={enabled} onChange={(_, checked) => setEnabled(checked)} />}
              label="Analytics Enabled"
            />
            <FormControlLabel
              control={<Switch checked={consent} onChange={(_, checked) => setConsent(checked)} />}
              label="Consent Granted"
            />
            <Button
              onClick={() => {
                memory.clear();
                setEvents([]);
              }}
            >
              Clear Event Inspector
            </Button>
          </Stack>

          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6">Root And Subpath Usage</Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
              <Button variant="contained">Root Button</Button>
              <SubpathButton variant="outlined">Subpath Button</SubpathButton>
            </Stack>
          </Paper>

          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6">Compatibility Inventory</Typography>
            <input
              aria-label="Inventory search"
              placeholder="Search subpath or category"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              style={{ width: "100%", padding: 10, marginTop: 8, marginBottom: 12 }}
            />
            <Typography variant="body2" sx={{ mb: 1 }}>
              Showing {entries.length} entries (of {(inventory.entries as InventoryEntry[]).length})
            </Typography>
            <Box sx={{ maxHeight: 240, overflow: "auto" }}>
              {entries.map((entry) => (
                <Box key={entry.subpath} sx={{ py: 0.5 }}>
                  <Typography variant="body2">
                    {entry.subpath} | {entry.category} | {entry.moduleSpecifier}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>

          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Advanced Components
            </Typography>
            <DataTable
              rows={sampleRows}
              columns={[
                { id: "customer", header: "Customer", accessor: (row) => row.customer },
                { id: "amount", header: "Amount", accessor: (row) => row.amount, sortValue: (row) => row.amount },
                { id: "status", header: "Status", accessor: (row) => row.status }
              ]}
              getRowId={(row) => row.id}
              onRefresh={() => undefined}
            />
            <Divider sx={{ my: 2 }} />
            <TreeExplorer nodes={sampleTree} defaultExpandedIds={["workspace"]} defaultSelectedId="workspace" />
            <Divider sx={{ my: 2 }} />
            <DashboardLayout
              title="Demo Dashboard"
              defaultSidebarOpen={false}
              navigationItems={[{ id: "home", label: "Home" }, { id: "settings", label: "Settings" }]}
              breadcrumbs={[{ id: "demo", label: "Demo" }]}
            >
              <Typography>Dashboard body</Typography>
            </DashboardLayout>
          </Paper>

          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6">TrackingBoundary Behavior</Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
              <TrackingBoundary id="tracked-section">
                <Button variant="contained">Tracked Section</Button>
              </TrackingBoundary>
              <TrackingBoundary id="private-section" optOut>
                <Button variant="contained">Opted-Out Section</Button>
              </TrackingBoundary>
            </Stack>
          </Paper>

          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Event Inspector
            </Typography>
            <Box sx={{ maxHeight: 220, overflow: "auto", fontFamily: "monospace", fontSize: 12 }}>
              {events.length === 0 ? (
                <Typography variant="body2">No captured events.</Typography>
              ) : (
                events.map((event, index) => (
                  <Typography key={index} variant="body2">
                    {JSON.stringify(event)}
                  </Typography>
                ))
              )}
            </Box>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Upstream References</Typography>
            <ul>
              <li>
                <a href="https://mui.com/material-ui/getting-started/overview/" target="_blank" rel="noreferrer">
                  Material UI Docs
                </a>
              </li>
              <li>
                <a href="https://react.dev/" target="_blank" rel="noreferrer">
                  React Docs
                </a>
              </li>
            </ul>
          </Paper>
        </Box>
      </UIExtensionsProvider>
    </ThemeProvider>
  );
}
