"use client";

import { useState } from "react";
import type { ComponentProps, JSX } from "react";
import {
  AppBar,
  Box,
  Breadcrumbs,
  Drawer,
  IconButton,
  Link,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme
} from "@coderlifenet/ui-core";
import { TrackingBoundary } from "@coderlifenet/ui-core/extensions";
import { useEmitUIEvent } from "@coderlifenet/ui-core/instrumentation";

type UINode = ComponentProps<typeof Box>["children"];

export interface NavigationItem {
  id: string;
  label: string;
  href?: string;
  onNavigate?: () => void;
}

export interface DashboardLayoutProps {
  title: UINode;
  breadcrumbs?: readonly NavigationItem[];
  navigationItems?: readonly NavigationItem[];
  sidebar?: UINode;
  headerEnd?: UINode;
  children: UINode;
  sidebarOpen?: boolean;
  defaultSidebarOpen?: boolean;
  onSidebarOpenChange?: (open: boolean) => void;
  semanticTrackingOnly?: boolean;
}

export function DashboardLayout({
  title,
  breadcrumbs = [],
  navigationItems = [],
  sidebar,
  headerEnd,
  children,
  sidebarOpen,
  defaultSidebarOpen = true,
  onSidebarOpenChange,
  semanticTrackingOnly = true
}: DashboardLayoutProps): JSX.Element {
  const emit = useEmitUIEvent();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const [internalSidebarOpen, setInternalSidebarOpen] = useState(defaultSidebarOpen);
  const activeSidebarOpen = sidebarOpen ?? internalSidebarOpen;

  const setOpen = (next: boolean): void => {
    if (onSidebarOpenChange) {
      onSidebarOpenChange(next);
    } else {
      setInternalSidebarOpen(next);
    }
    emit({ type: "ui.dashboard.sidebar_toggle", action: "toggle_sidebar", component: "DashboardLayout", metadata: { open: next } });
  };

  const drawerContent = (
    <Box component="nav" aria-label="Primary">
      <Stack spacing={1} sx={{ p: 2 }}>
        {navigationItems.map((item) => (
          <Link
            key={item.id}
            href={item.href ?? "#"}
            underline="hover"
            onClick={(event) => {
              if (!item.href) {
                event.preventDefault();
              }
              item.onNavigate?.();
              emit({
                type: "ui.dashboard.navigate",
                action: "navigate",
                component: "DashboardLayout",
                semanticId: item.id
              });
            }}
          >
            {item.label}
          </Link>
        ))}
        {sidebar}
      </Stack>
    </Box>
  );

  const content = (
    <Box sx={{ minHeight: "100vh", display: "grid", gridTemplateRows: "auto 1fr" }}>
      <AppBar position="sticky" color="default" elevation={0}>
        <Toolbar>
          <IconButton edge="start" aria-label="Open navigation" onClick={() => setOpen(!activeSidebarOpen)}>
            <Typography variant="button">Menu</Typography>
          </IconButton>
          <Typography variant="h6" sx={{ ml: 1, flexGrow: 1 }}>
            {title}
          </Typography>
          {headerEnd}
        </Toolbar>
      </AppBar>

      <Box sx={{ display: "grid", gridTemplateColumns: { md: activeSidebarOpen ? "280px 1fr" : "1fr" }, minHeight: 0 }}>
        {isDesktop ? (
          activeSidebarOpen ? (
            <Box component="aside" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
              {drawerContent}
            </Box>
          ) : null
        ) : (
          <Drawer
            open={activeSidebarOpen}
            onClose={() => setOpen(false)}
            ModalProps={{ keepMounted: true }}
          >
            {drawerContent}
          </Drawer>
        )}

        <Box component="main" sx={{ p: 2 }}>
          {breadcrumbs.length > 0 ? (
            <Breadcrumbs aria-label="Breadcrumb">
              {breadcrumbs.map((item) => (
                <Link
                  key={item.id}
                  href={item.href ?? "#"}
                  onClick={(event) => {
                    if (!item.href) {
                      event.preventDefault();
                    }
                    item.onNavigate?.();
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </Breadcrumbs>
          ) : null}
          <Box sx={{ mt: breadcrumbs.length > 0 ? 2 : 0 }}>{children}</Box>
        </Box>
      </Box>
    </Box>
  );

  if (!semanticTrackingOnly) {
    return content;
  }

  return (
    <TrackingBoundary id="dashboard-layout-internal" optOut>
      {content}
    </TrackingBoundary>
  );
}
