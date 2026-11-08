"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ComponentProps, JSX, KeyboardEvent } from "react";
import {
  List,
  ListItemButton,
  ListItemText,
  Typography
} from "@coderlifenet/ui-core";
import { useEmitUIEvent } from "@coderlifenet/ui-core/instrumentation";

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
  parentId: string | undefined;
  position: number;
  siblingCount: number;
}

function flatten(nodes: readonly TreeExplorerNode[], expanded: Set<string>, depth = 1, parentId?: string): FlatNode[] {
  const output: FlatNode[] = [];
  for (const [index, node] of nodes.entries()) {
    output.push({ node, depth, parentId, position: index + 1, siblingCount: nodes.length });
    if (node.children && node.children.length > 0 && expanded.has(node.id)) {
      output.push(...flatten(node.children, expanded, depth + 1, node.id));
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
  const [focusedId, setFocusedId] = useState<string>();
  const items = useRef(new Map<string, HTMLElement>());
  const detachedFocus = useRef<{ element: HTMLElement; parentId: string; previousNodes: FlatNode[] } | undefined>(undefined);

  const activeExpandedIds = expandedIds ?? internalExpandedIds;
  const activeSelectedId = selectedId === undefined ? internalSelectedId : selectedId;

  const expandedSet = useMemo(() => new Set(activeExpandedIds), [activeExpandedIds]);
  const flatNodes = useMemo(() => flatten(nodes, expandedSet), [nodes, expandedSet]);
  const enabledNodes = flatNodes.filter(({ node }) => !node.disabled);
  const tabStop = enabledNodes.find(({ node }) => node.id === focusedId)
    ?? enabledNodes.find(({ node }) => node.id === activeSelectedId)
    ?? enabledNodes[0];

  useLayoutEffect(() => {
    const detached = detachedFocus.current;
    detachedFocus.current = undefined;
    if (expandedIds === undefined || !detached || detached.element.isConnected) return;

    const { ownerDocument } = detached.element;
    if (ownerDocument.activeElement !== ownerDocument.body) return;

    let parentId: string | undefined = detached.parentId;
    while (parentId !== undefined && !items.current.has(parentId)) {
      parentId = detached.previousNodes.find(({ node }) => node.id === parentId)?.parentId;
    }
    const parent = enabledNodes.find(({ node }) => node.id === parentId);
    if (parent?.node.children?.length && !expandedSet.has(parent.node.id)) {
      items.current.get(parent.node.id)?.focus();
    }
  });

  const setExpanded = (next: readonly string[]): void => {
    if (expandedIds === undefined) setInternalExpandedIds(next);
    onExpandedIdsChange?.(next);
    emit({ type: "ui.tree.expand_change", action: "expand", component: "TreeExplorer", metadata: { expanded: next.length } });
  };

  const setSelected = (next: string | null): void => {
    if (selectedId === undefined) setInternalSelectedId(next);
    onSelectedIdChange?.(next);
    emit({ type: "ui.tree.selection_change", action: "select", component: "TreeExplorer" });
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

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>, item: FlatNode): void => {
    const { node, parentId } = item;
    if (event.defaultPrevented || event.target !== event.currentTarget || node.disabled) return;

    const index = enabledNodes.indexOf(item);
    let next: FlatNode | undefined;
    switch (event.key) {
      case "ArrowDown": next = enabledNodes[index + 1]; break;
      case "ArrowUp": next = enabledNodes[index - 1]; break;
      case "Home": next = enabledNodes[0]; break;
      case "End": next = enabledNodes.at(-1); break;
      case "ArrowRight":
        if (expandedSet.has(node.id)) next = enabledNodes.find((candidate) => candidate.parentId === node.id);
        else toggleNode(node);
        break;
      case "ArrowLeft":
        if (node.children?.length && expandedSet.has(node.id)) toggleNode(node);
        else next = enabledNodes.find((candidate) => candidate.node.id === parentId);
        break;
      default: return;
    }
    event.preventDefault();
    if (next && next !== item) {
      items.current.get(next.node.id)?.focus();
      if (activeSelectedId !== next.node.id) setSelected(next.node.id);
    }
  };

  if (loading) {
    return <Typography>Loading tree...</Typography>;
  }

  if (nodes.length === 0) {
    return <Typography>{emptyMessage}</Typography>;
  }

  return (
    <List component="div" role="tree" aria-label="Tree explorer">
      {flatNodes.map((item) => {
        const { node, depth, position, siblingCount } = item;
        const isExpanded = expandedSet.has(node.id);
        const hasChildren = Boolean(node.children && node.children.length > 0);
        return (
          <ListItemButton
            key={node.id}
            ref={(element) => {
              if (element) {
                items.current.set(node.id, element);
                return;
              }
              const previous = items.current.get(node.id);
              // Check focus before React removes the element from the document.
              if (item.parentId !== undefined && previous?.contains(previous.ownerDocument.activeElement)) {
                detachedFocus.current = { element: previous, parentId: item.parentId, previousNodes: flatNodes };
              }
              items.current.delete(node.id);
            }}
            role="treeitem"
            aria-level={depth}
            aria-posinset={position}
            aria-setsize={siblingCount}
            aria-expanded={hasChildren ? isExpanded : undefined}
            aria-selected={activeSelectedId === node.id}
            disabled={node.disabled ?? false}
            selected={activeSelectedId === node.id}
            tabIndex={tabStop === item ? 0 : -1}
            onFocus={() => setFocusedId(node.id)}
            onKeyDown={(event) => handleKeyDown(event, item)}
            onClick={() => {
              setSelected(node.id);
              toggleNode(node);
            }}
            sx={{ pl: depth * 2 }}
          >
            {hasChildren ? <Typography aria-hidden="true" sx={{ width: 16 }}>{isExpanded ? "v" : ">"}</Typography> : null}
            <ListItemText primary={renderLabel ? renderLabel(node) : node.label} />
          </ListItemButton>
        );
      })}
    </List>
  );
}
