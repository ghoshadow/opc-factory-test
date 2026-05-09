"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  Box,
  CheckSquare,
  ChevronRight,
  FileText,
  FlaskConical,
  GitPullRequest,
  Maximize,
  ShieldCheck,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import type {
  DecomposeNode,
  DecomposePipelineResponse,
  PipelineStageStatus,
} from "@/types/factory";

// ──── Layout ────────────────────────────────────────────────────────────────
interface LayoutNode extends DecomposeNode {
  x: number;
  y: number;
}

function layoutNodes(data: DecomposePipelineResponse): LayoutNode[] {
  const nodeMap = new Map<string, DecomposeNode>();
  data.nodes.forEach((n) => nodeMap.set(n.id, n));

  // BFS to assign layer
  const layer = new Map<string, number>();
  const queue = [data.rootId];
  layer.set(data.rootId, 0);

  while (queue.length > 0) {
    const id = queue.shift()!;
    const currentLayer = layer.get(id)!;
    const node = nodeMap.get(id);
    if (!node) continue;
    for (const childId of node.children) {
      if (!layer.has(childId)) {
        layer.set(childId, currentLayer + 1);
        queue.push(childId);
      }
    }
  }

  // Group nodes by layer
  const layerGroups = new Map<number, string[]>();
  for (const [id, l] of layer) {
    if (!layerGroups.has(l)) layerGroups.set(l, []);
    layerGroups.get(l)!.push(id);
  }

  const maxLayer = Math.max(...layerGroups.keys());
  const LAYER_GAP = 160;
  const NODE_GAP = 40;
  const NODE_WIDTH = 200;
  const PADDING_LEFT = 100;
  let maxWidth = 0;

  const result: LayoutNode[] = [];

  for (let l = 0; l <= maxLayer; l++) {
    const ids = layerGroups.get(l) ?? [];
    const totalWidth = ids.length * NODE_WIDTH + (ids.length - 1) * NODE_GAP;
    maxWidth = Math.max(maxWidth, totalWidth);
    const startX = PADDING_LEFT + (maxWidth - totalWidth) / 2;

    ids.forEach((id, i) => {
      const node = nodeMap.get(id)!;
      result.push({
        ...node,
        x: startX + i * (NODE_WIDTH + NODE_GAP) + NODE_WIDTH / 2,
        y: 80 + l * LAYER_GAP,
      } as LayoutNode);
    });
  }

  return result;
}

// ──── Config ────────────────────────────────────────────────────────────────

const typeConfig: Record<
  DecomposeNode["type"],
  { icon: typeof Box; bg: string; border: string; text: string; badge: string }
> = {
  spec: {
    icon: FileText,
    bg: "fill-amber-50 dark:fill-amber-950/30",
    border: "stroke-amber-300 dark:stroke-amber-700",
    text: "fill-amber-800 dark:fill-amber-200",
    badge: "Spec",
  },
  task: {
    icon: CheckSquare,
    bg: "fill-sky-50 dark:fill-sky-950/30",
    border: "stroke-sky-300 dark:stroke-sky-700",
    text: "fill-sky-800 dark:fill-sky-200",
    badge: "Task",
  },
  pr: {
    icon: GitPullRequest,
    bg: "fill-violet-50 dark:fill-violet-950/30",
    border: "stroke-violet-300 dark:stroke-violet-700",
    text: "fill-violet-800 dark:fill-violet-200",
    badge: "PR",
  },
  test: {
    icon: FlaskConical,
    bg: "fill-emerald-50 dark:fill-emerald-950/30",
    border: "stroke-emerald-300 dark:stroke-emerald-700",
    text: "fill-emerald-800 dark:fill-emerald-200",
    badge: "Test",
  },
  check: {
    icon: ShieldCheck,
    bg: "fill-rose-50 dark:fill-rose-950/30",
    border: "stroke-rose-300 dark:stroke-rose-700",
    text: "fill-rose-800 dark:fill-rose-200",
    badge: "Check",
  },
  artifact: {
    icon: Box,
    bg: "fill-slate-50 dark:fill-slate-950/30",
    border: "stroke-slate-300 dark:stroke-slate-700",
    text: "fill-slate-800 dark:fill-slate-200",
    badge: "Artifact",
  },
};

const statusPulse: Record<PipelineStageStatus, string> = {
  waiting: "fill-muted-foreground/40",
  running: "fill-blue-500 animate-pulse",
  done: "fill-emerald-500",
  failed: "fill-red-500",
};

const statusText: Record<PipelineStageStatus, string> = {
  waiting: "fill-muted-foreground/60",
  running: "fill-blue-700 dark:fill-blue-300",
  done: "fill-emerald-700 dark:fill-emerald-300",
  failed: "fill-red-700 dark:fill-red-300",
};

// ──── Helpers ───────────────────────────────────────────────────────────────

function curvePath(x1: number, y1: number, x2: number, y2: number): string {
  const dx = x2 - x1;
  const cx = x1 + dx * 0.5;
  // Add slight horizontal offset to avoid straight overlap
  const offset = Math.min(Math.abs(dx) * 0.15, 30);
  const cx1 = cx + (dx > 0 ? offset : -offset);
  const cx2 = cx - (dx > 0 ? offset : -offset);
  return `M ${x1} ${y1 + 28} C ${cx1} ${y1 + 28}, ${cx2} ${y2 - 28}, ${x2} ${y2 - 28}`;
}

// ──── Component ─────────────────────────────────────────────────────────────

export function DecomposeGraph({ data }: { data: DecomposePipelineResponse }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: 1200, h: 800 });
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [panning, setPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const initialLayout = useMemo(() => layoutNodes(data), [data]);
  const [nodePositions, setNodePositions] = useState<Map<string, { x: number; y: number }>>(() => {
    const map = new Map<string, { x: number; y: number }>();
    initialLayout.forEach((n) => {
      map.set(n.id, { x: n.x, y: n.y });
    });
    return map;
  });

  const nodeMap = useMemo(() => {
    const m = new Map<string, DecomposeNode>();
    data.nodes.forEach((n) => m.set(n.id, n));
    return m;
  }, [data.nodes]);

  const getPos = useCallback(
    (id: string) => nodePositions.get(id) ?? { x: 0, y: 0 },
    [nodePositions],
  );

  const selectedNode = selectedId ? (nodeMap.get(selectedId) ?? null) : null;

  // Close detail on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Zoom
  const zoom = useCallback((factor: number) => {
    setViewBox((vb) => {
      const cw = vb.w * factor;
      const ch = vb.h * factor;
      const cx = vb.x + (vb.w - cw) / 2;
      const cy = vb.y + (vb.h - ch) / 2;
      return { x: cx, y: cy, w: cw, h: ch };
    });
  }, []);

  const resetView = useCallback(() => {
    setViewBox({ x: 0, y: 0, w: 1200, h: 800 });
  }, []);

  // Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.15 : 1 / 1.15;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    // Zoom centered on mouse
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    setViewBox((vb) => {
      const svgX = vb.x + (mx / rect.width) * vb.w;
      const svgY = vb.y + (my / rect.height) * vb.h;
      const nw = vb.w * factor;
      const nh = vb.h * factor;
      const nx = svgX - (mx / rect.width) * nw;
      const ny = svgY - (my / rect.height) * nh;
      return { x: nx, y: ny, w: nw, h: nh };
    });
  }, []);

  // Pan / drag
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const target = e.target as Element;
    const nodeGroup = target.closest("[data-node-id]");
    if (nodeGroup) {
      const nodeId = nodeGroup.getAttribute("data-node-id")!;
      if (e.button === 0) {
        setDraggingNodeId(nodeId);
        (nodeGroup as Element).setPointerCapture(e.pointerId);
        setSelectedId(nodeId);
      }
      return;
    }
    // Pan
    setPanning(true);
    setPanStart({ x: e.clientX, y: e.clientY });
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (draggingNodeId) {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const svgX = viewBox.x + (e.clientX - rect.left) * (viewBox.w / rect.width);
        const svgY = viewBox.y + (e.clientY - rect.top) * (viewBox.h / rect.height);
        setNodePositions((prev) => {
          const next = new Map(prev);
          next.set(draggingNodeId, { x: svgX, y: svgY });
          return next;
        });
        return;
      }
      if (panning) {
        const dx = e.clientX - panStart.x;
        const dy = e.clientY - panStart.y;
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const scale = viewBox.w / rect.width;
        setViewBox((vb) => ({
          ...vb,
          x: vb.x - dx * scale,
          y: vb.y - dy * scale,
        }));
        setPanStart({ x: e.clientX, y: e.clientY });
      }
    },
    [draggingNodeId, panning, panStart, viewBox],
  );

  const handlePointerUp = useCallback(() => {
    setDraggingNodeId(null);
    setPanning(false);
  }, []);

  const nodeElements = useMemo(() => {
    return data.nodes.map((node) => {
      const pos = getPos(node.id);
      const t = typeConfig[node.type];
      const Icon = t.icon;
      const isSelected = selectedId === node.id;
      const isFailed = node.status === "failed";

      return (
        <g key={node.id} data-node-id={node.id} className={isSelected ? "z-10" : ""}>
          {/* Node box */}
          <rect
            x={pos.x - 100}
            y={pos.y - 28}
            width={200}
            height={56}
            rx={10}
            className={`${t.bg} ${t.border} ${isSelected ? "stroke-2" : "stroke-1"} ${
              isFailed ? "stroke-red-400 dark:stroke-red-600" : ""
            } transition-colors`}
            strokeWidth={isSelected ? 2.5 : 1.5}
          />
          {/* Status indicator dot */}
          <circle cx={pos.x - 84} cy={pos.y - 8} r={4} className={statusPulse[node.status]} />
          {/* Type icon */}
          <foreignObject x={pos.x - 72} y={pos.y - 16} width={16} height={16}>
            <Icon className="size-4 text-muted-foreground" />
          </foreignObject>
          {/* Label */}
          <text
            x={pos.x - 50}
            y={pos.y - 5}
            className={`text-[11px] font-semibold leading-tight ${statusText[node.status]}`}
            textAnchor="start"
          >
            {node.label}
          </text>
          {/* Subtext */}
          <text
            x={pos.x - 50}
            y={pos.y + 12}
            className="text-[9px] fill-muted-foreground/60"
            textAnchor="start"
          >
            {node.detail.length > 20 ? node.detail.slice(0, 20) + "…" : node.detail}
          </text>
          {/* Badge */}
          <rect
            x={pos.x + 60}
            y={pos.y - 26}
            width={34}
            height={14}
            rx={6}
            className="fill-muted/40"
          />
          <text
            x={pos.x + 77}
            y={pos.y - 16}
            className="text-[8px] font-semibold fill-muted-foreground"
            textAnchor="middle"
          >
            {t.badge}
          </text>
          {/* Child count */}
          {node.children.length > 0 && (
            <text
              x={pos.x}
              y={pos.y + 34}
              className="text-[9px] fill-muted-foreground/40"
              textAnchor="middle"
            >
              {node.children.length} 个子节点
            </text>
          )}
        </g>
      );
    });
  }, [data.nodes, getPos, selectedId]);

  const edgeElements = useMemo(() => {
    return data.edges.map((edge) => {
      const src = getPos(edge.source);
      const tgt = getPos(edge.target);
      const srcNode = nodeMap.get(edge.source);
      const tgtNode = nodeMap.get(edge.target);
      const active = srcNode?.status === "done" || srcNode?.status === "running";
      const failed = srcNode?.status === "failed" || tgtNode?.status === "failed";

      // Midpoint for label
      const mx = (src.x + tgt.x) / 2;
      const my = (src.y + tgt.y) / 2;

      return (
        <g key={`${edge.source}-${edge.target}`}>
          {/* Glow for active edges */}
          {active && (
            <path
              d={curvePath(src.x, src.y, tgt.x, tgt.y)}
              fill="none"
              className="stroke-blue-400/20"
              strokeWidth={6}
            />
          )}
          <path
            d={curvePath(src.x, src.y, tgt.x, tgt.y)}
            fill="none"
            className={
              failed
                ? "stroke-red-300/60 dark:stroke-red-700/40"
                : active
                  ? "stroke-blue-400/60"
                  : "stroke-muted-foreground/20"
            }
            strokeWidth={failed ? 1.5 : 1.2}
            markerEnd={
              failed ? "url(#arrow-failed)" : active ? "url(#arrow-active)" : "url(#arrow-idle)"
            }
          />
          {/* Edge label */}
          <rect x={mx - 14} y={my - 8} width={28} height={14} rx={4} className="fill-card/80" />
          <text
            x={mx}
            y={my + 2}
            className="text-[9px] font-medium fill-muted-foreground"
            textAnchor="middle"
          >
            {edge.label}
          </text>
        </g>
      );
    });
  }, [data.edges, getPos, nodeMap]);

  return (
    <div className="flex flex-col gap-0 rounded-xl border bg-card shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/30">
        <div>
          <h2 className="text-sm font-semibold">流水线分解图谱</h2>
          <p className="text-[11px] text-muted-foreground">拖拽节点 · 滚轮缩放 · 点击查看详情</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => zoom(1 / 1.3)}
            className="p-1.5 rounded-md hover:bg-muted transition-colors"
            title="缩小"
          >
            <ZoomOut className="size-4 text-muted-foreground" />
          </button>
          <button
            type="button"
            onClick={() => zoom(1.3)}
            className="p-1.5 rounded-md hover:bg-muted transition-colors"
            title="放大"
          >
            <ZoomIn className="size-4 text-muted-foreground" />
          </button>
          <button
            type="button"
            onClick={resetView}
            className="p-1.5 rounded-md hover:bg-muted transition-colors"
            title="重置视图"
          >
            <Maximize className="size-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 px-4 py-1.5 bg-muted/20 border-b border-border text-[10px] text-muted-foreground">
        {(
          Object.entries(typeConfig) as [
            DecomposeNode["type"],
            (typeof typeConfig)[DecomposeNode["type"]],
          ][]
        ).map(([t, cfg]) => {
          const Icon = cfg.icon;
          return (
            <span key={t} className="inline-flex items-center gap-1">
              <Icon className="size-3" />
              {cfg.badge}
            </span>
          );
        })}
        <span className="mx-1 text-border">|</span>
        <span className="inline-flex items-center gap-1">
          <span className="size-2 rounded-full bg-emerald-500" />
          完成
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="size-2 rounded-full bg-blue-500" />
          进行中
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="size-2 rounded-full bg-red-500" />
          失败
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="size-2 rounded-full bg-muted-foreground/40" />
          等待
        </span>
      </div>

      {/* Canvas + Detail panel */}
      <div className="flex">
        {/* SVG Canvas */}
        <div
          ref={containerRef}
          className="flex-1 relative bg-muted/10 overflow-hidden"
          style={{ height: 600, touchAction: "none" }}
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <svg
            viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
            className="w-full h-full"
          >
            <defs>
              <marker
                id="arrow-idle"
                viewBox="0 0 8 8"
                refX={8}
                refY={4}
                markerWidth={5}
                markerHeight={5}
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 8 4 L 0 8 Z" className="fill-muted-foreground/30" />
              </marker>
              <marker
                id="arrow-active"
                viewBox="0 0 8 8"
                refX={8}
                refY={4}
                markerWidth={5}
                markerHeight={5}
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 8 4 L 0 8 Z" className="fill-blue-400/60" />
              </marker>
              <marker
                id="arrow-failed"
                viewBox="0 0 8 8"
                refX={8}
                refY={4}
                markerWidth={5}
                markerHeight={5}
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 8 4 L 0 8 Z" className="fill-red-300/60 dark:fill-red-700/40" />
              </marker>
            </defs>
            {/* Grid pattern */}
            <pattern id="grid" width={40} height={40} patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                className="stroke-muted-foreground/5"
                strokeWidth={0.5}
              />
            </pattern>
            <rect
              x={viewBox.x - 2000}
              y={viewBox.y - 2000}
              width={viewBox.w + 4000}
              height={viewBox.h + 4000}
              fill="url(#grid)"
            />
            {edgeElements}
            {nodeElements}
          </svg>
        </div>

        {/* Detail panel */}
        {selectedNode && (
          <div className="w-64 shrink-0 border-l border-border bg-card/80 p-4 overflow-y-auto max-h-[600px]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                节点详情
              </span>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
              >
                ✕ 关闭
              </button>
            </div>
            {(() => {
              const t = typeConfig[selectedNode.type];
              const Icon = t.icon;
              return (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className={`rounded-md p-1.5 ${t.bg} ${t.border} border`}>
                      <Icon className="size-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{selectedNode.label}</p>
                      <span
                        className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${t.bg} ${t.border} border`}
                      >
                        {t.badge}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {selectedNode.detail}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">状态</span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className={`size-2 rounded-full ${statusPulse[selectedNode.status]}`} />
                      <span className="text-xs font-medium">
                        {selectedNode.status === "done"
                          ? "已完成"
                          : selectedNode.status === "running"
                            ? "进行中"
                            : selectedNode.status === "failed"
                              ? "失败"
                              : "等待中"}
                      </span>
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground">ID</span>
                    <p className="text-xs font-mono">{selectedNode.id}</p>
                  </div>
                  {selectedNode.children.length > 0 && (
                    <div>
                      <span className="text-[10px] text-muted-foreground">
                        子节点 ({selectedNode.children.length})
                      </span>
                      <div className="mt-1 space-y-0.5">
                        {selectedNode.children.map((childId) => {
                          const child = nodeMap.get(childId);
                          if (!child) return null;
                          const ct = typeConfig[child.type];
                          const CIcon = ct.icon;
                          return (
                            <button
                              key={childId}
                              type="button"
                              onClick={() => setSelectedId(childId)}
                              className="w-full flex items-center gap-1.5 px-2 py-1 rounded hover:bg-muted/50 transition-colors text-left"
                            >
                              <CIcon className="size-3 text-muted-foreground shrink-0" />
                              <span className="text-xs truncate">{child.label}</span>
                              <span
                                className={`ml-auto size-1.5 rounded-full shrink-0 ${statusPulse[child.status]}`}
                              />
                              <ChevronRight className="size-3 text-muted-foreground/40 shrink-0" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
