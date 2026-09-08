"use client";

import { useMemo, useState } from "react";
import type { ComponentProps, JSX, KeyboardEvent } from "react";
import {
  Box,
  Collapse,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Typography
} from "@coderlife/ui-core";
import { useEmitUIEvent } from "@coderlife/ui-core/instrumentation";

type TreeLabelNode = ComponentProps<typeof ListItemText>["primary"];

export interface TreeExplorerNode {
  id: string;
  label: TreeLabelNode;
  disabled?: boolean;
  children?: readonly TreeExplorerNode[];
}

export interface TreeExplorerProps {
  nodes: readonly TreeExplorerNode[];
  expandedIds?: readonly string[];
  defaultExpandedIds?: readonly string[];
  selectedId?: string | null;
  defaultSelectedId?: string | null;
  onExpandedIdsChange?: (ids: readonly string[]) => void;
  onSelectedIdChange?: (id: string | null) => void;
  loading?: boolean;
  emptyMessage?: string;
  renderLabel?: (node: TreeExplorerNode) => TreeLabelNode;
}

interface FlatNode {
  node: TreeExplorerNode;
  depth: number;
}

function flatten(nodes: readonly TreeExplorerNode[], expanded: Set<string>, depth = 1): FlatNode[] {
  const output: FlatNode[] = [];
  for (const node of nodes) {
    output.push({ node, depth });
    if (node.children && node.children.length > 0 && expanded.has(node.id)) {
      output.push(...flatten(node.children, expanded, depth + 1));
    }
  }
  return output;
}

export function TreeExplorer({
  nodes,
  expandedIds,
  defaultExpandedIds = [],
  selectedId,
  defaultSelectedId = null,
  onExpandedIdsChange,
  onSelectedIdChange,
  loading = false,
  emptyMessage = "No tree data.",
  renderLabel
}: TreeExplorerProps): JSX.Element {
  const emit = useEmitUIEvent();

  const [internalExpandedIds, setInternalExpandedIds] = useState<readonly string[]>(defaultExpandedIds);
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(defaultSelectedId);

  const activeExpandedIds = expandedIds ?? internalExpandedIds;
  const activeSelectedId = selectedId ?? internalSelectedId;

  const expandedSet = useMemo(() => new Set(activeExpandedIds), [activeExpandedIds]);
  const flatNodes = useMemo(() => flatten(nodes, expandedSet), [nodes, expandedSet]);

  const setExpanded = (next: readonly string[]): void => {
    if (onExpandedIdsChange) {
      onExpandedIdsChange(next);
    } else {
      setInternalExpandedIds(next);
    }
    emit({ type: "ui.tree.expand_change", action: "expand", component: "TreeExplorer", metadata: { expanded: next.length } });
  };

  const setSelected = (next: string | null): void => {
    if (onSelectedIdChange) {
      onSelectedIdChange(next);
    } else {
      setInternalSelectedId(next);
    }
    emit(
      next
        ? { type: "ui.tree.selection_change", action: "select", component: "TreeExplorer", semanticId: next }
        : { type: "ui.tree.selection_change", action: "select", component: "TreeExplorer" }
    );
  };

  const toggleNode = (node: TreeExplorerNode): void => {
    if (!node.children || node.children.length === 0 || node.disabled) {
      return;
    }
    if (expandedSet.has(node.id)) {
      setExpanded(activeExpandedIds.filter((id) => id !== node.id));
      return;
    }
    setExpanded([...activeExpandedIds, node.id]);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLUListElement>): void => {
    const currentIndex = flatNodes.findIndex((item) => item.node.id === activeSelectedId);

    if (event.key === "ArrowDown") {
      event.preventDefault();
      const next = flatNodes[Math.min(currentIndex + 1, flatNodes.length - 1)];
      if (next && !next.node.disabled) {
        setSelected(next.node.id);
      }
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      const next = flatNodes[Math.max(currentIndex - 1, 0)];
      if (next && !next.node.disabled) {
        setSelected(next.node.id);
      }
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      const current = flatNodes[currentIndex]?.node;
      if (current) {
        toggleNode(current);
      }
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      const current = flatNodes[currentIndex]?.node;
      if (current && expandedSet.has(current.id)) {
        setExpanded(activeExpandedIds.filter((id) => id !== current.id));
      }
    }
  };

  if (loading) {
    return <Typography>Loading tree...</Typography>;
  }

  if (nodes.length === 0) {
    return <Typography>{emptyMessage}</Typography>;
  }

  return (
    <Box role="tree" aria-label="Tree explorer">
      <List role="group" onKeyDown={handleKeyDown}>
        {flatNodes.map(({ node, depth }) => {
          const isExpanded = expandedSet.has(node.id);
          const hasChildren = Boolean(node.children && node.children.length > 0);
          return (
            <Stack key={node.id}>
              <ListItemButton
                role="treeitem"
                aria-expanded={hasChildren ? isExpanded : undefined}
                aria-selected={activeSelectedId === node.id}
                disabled={node.disabled ?? false}
                selected={activeSelectedId === node.id}
                onClick={() => {
                  setSelected(node.id);
                  toggleNode(node);
                }}
                sx={{ pl: depth * 2 }}
              >
                {hasChildren ? <Typography sx={{ width: 16 }}>{isExpanded ? "v" : ">"}</Typography> : null}
                <ListItemText primary={renderLabel ? renderLabel(node) : node.label} />
              </ListItemButton>
              {hasChildren ? (
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <Box role="group" />
                </Collapse>
              ) : null}
            </Stack>
          );
        })}
      </List>
    </Box>
  );
}
