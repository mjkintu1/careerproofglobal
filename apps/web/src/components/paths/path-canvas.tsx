"use client";

import "@xyflow/react/dist/style.css";
import { Background, Controls, MarkerType, MiniMap, Panel, ReactFlow, useEdgesState, useNodesState, useReactFlow, useStore, type Edge, type Node } from "@xyflow/react";
import { Maximize2, Minimize2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { NetworkEdge, NetworkRoute } from "@careerproof/career-graph";
import type { CareerCard } from "@/lib/path-network";
import { nodeTypes, type CareerNodeRole } from "./flow-nodes";
import { START, START_LABEL, yearsText } from "./route-list";

/** "forward": start on the left, goal on the right. "backward": goal on the left, tracing back to the start. */
export type PathDirection = "forward" | "backward";

const COL = 280;
const LANE = 150;
/** Routes this much longer than the best are folded away (still one click to show). */
export const isLong = (w: number, best: number) => w > best + Math.max(6, best);

export const EDGE_STYLE: Record<NetworkEdge["kind"], { stroke: string; dash?: string }> = {
  progression: { stroke: "#16a34a" },
  specialisation: { stroke: "#16a34a" },
  entry: { stroke: "#7c3aed" },
  pivot: { stroke: "#ea580c", dash: "6 5" },
  related: { stroke: "#ea580c", dash: "2 5" },
};

const edgeLabel = (e: NetworkEdge) => (e.years !== null ? yearsText(e.years) : `${yearsText(e.weight)}?`);

function layout(routes: NetworkRoute[], cards: Record<string, CareerCard>, from: string, to: string, active: number | null, selected: string | null, direction: PathDirection) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const cols = Math.max(1, ...routes.map((r) => r.edges.length + r.edges.filter((e) => e.kind === "entry").length));
  const midY = ((routes.length - 1) * LANE) / 2;
  const dim = (i: number) => active !== null && active !== i;
  const career = (slug: string, role: CareerNodeRole, x: number, y: number, id: string, dimmed: boolean) => {
    const c = cards[slug];
    nodes.push({ id, type: "career", position: { x, y }, data: { title: c?.title ?? slug, role, earnings: c?.earnings ?? null, dimmed, selected: selected === slug, slug } });
  };

  if (from === START) nodes.push({ id: "n:start", type: "start", position: { x: 0, y: midY }, data: { title: START_LABEL } });
  else career(from, "current", 0, midY, "n:start", false);
  career(to, "target", cols * COL, midY, "n:target", false);

  routes.forEach((r, i) => {
    const y = i * LANE;
    let prev = "n:start";
    // Working backward, routes line up from the goal (right-aligned before mirroring), so each
    // step's distance from the goal reads directly; forward, they line up from the start.
    const span = r.edges.length + r.edges.filter((e) => e.kind === "entry").length;
    let col = direction === "backward" ? cols - span : 0;
    r.edges.forEach((e, j) => {
      const last = j === r.edges.length - 1;
      const style = EDGE_STYLE[e.kind];
      const link = (source: string, target: string, label?: string) =>
        edges.push({
          id: `e:${i}:${j}:${target}`, source, target, label,
          animated: active === i,
          style: { stroke: style.stroke, strokeWidth: active === i ? 3 : 2, strokeDasharray: style.dash, opacity: dim(i) ? 0.15 : 1 },
          markerEnd: { type: MarkerType.ArrowClosed, color: style.stroke },
          labelStyle: { fontSize: 11, fontWeight: 700, fill: "#0f172a" },
          labelBgStyle: { fill: "#fff", stroke: style.stroke, strokeWidth: 1 },
          labelBgPadding: [6, 3], labelBgBorderRadius: 10,
        });
      if (e.kind === "entry") {
        col += 1;
        const cid = `c:${i}:${j}`;
        const routeType = cards[e.to]?.routes.find((x) => x.title === e.via)?.type ?? (e.years === null ? "preparation" : "course");
        nodes.push({ id: cid, type: "credential", position: { x: col * COL, y: y + 8 }, data: { title: e.via, years: e.years, type: routeType, dimmed: dim(i) } });
        link(prev, cid);
        prev = cid;
      }
      col += 1;
      const target = last ? "n:target" : `n:${i}:${j}`;
      if (!last) career(e.to, e.kind === "pivot" || e.kind === "related" ? "pivot" : "step", col * COL, y, target, dim(i));
      link(prev, target, e.kind === "entry" ? undefined : edgeLabel(e));
      prev = target;
    });
  });
  // Backward view: mirror the layout so the goal sits on the left and the route reads back to the
  // start. Arrows still point the way people move; handles swap sides to match.
  const maxX = cols * COL;
  for (const n of nodes) {
    if (direction === "backward") n.position = { x: maxX - n.position.x, y: n.position.y };
    n.data = { ...n.data, dir: direction };
  }
  return { nodes, edges };
}

/** Fit the view once React Flow has measured the current layout's nodes. */
function AutoFit({ layout }: { layout: string }) {
  const { fitView } = useReactFlow();
  // Signature of what is laid out and measured; refit when it changes (new layout measured).
  const measured = useStore((st) => {
    let sig = "";
    for (const n of st.nodeLookup.values()) sig += `${n.id}:${n.measured.width ?? 0}x${n.measured.height ?? 0};`;
    return sig;
  });
  const fitted = useRef("");
  useEffect(() => {
    if (!measured || measured.includes(":0x0;") || fitted.current === `${layout}|${measured}`) return;
    fitted.current = `${layout}|${measured}`;
    const id = requestAnimationFrame(() => void fitView({ padding: 0.12, duration: 200 }));
    return () => cancelAnimationFrame(id);
  }, [layout, measured, fitView]);
  return null;
}

/** Refit when the canvas switches in or out of full screen (its size changes, the layout does not). */
function RefitOnResize({ full }: { full: boolean }) {
  const { fitView } = useReactFlow();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const id = requestAnimationFrame(() => void fitView({ padding: 0.12, duration: 200 }));
    return () => cancelAnimationFrame(id);
  }, [full, fitView]);
  return null;
}

export interface PathCanvasProps {
  routes: NetworkRoute[];
  cards: Record<string, CareerCard>;
  from: string;
  to: string;
  active: number | null;
  selected: string | null;
  direction: PathDirection;
  /** Changes when the route set changes (forces a fresh layout and fit). */
  layoutKey: string;
  onSelectNode?: (slug: string) => void;
  onSelectRoute?: (index: number) => void;
  className?: string;
}

/**
 * The node-and-wire route canvas, shared by the planner and the career pages.
 * On phones it is about 70% of the screen tall; "Full screen" expands it over the whole page (Escape or the button exits).
 */
export function PathCanvas({ routes, cards, from, to, active, selected, direction, layoutKey, onSelectNode, onSelectRoute, className = "h-[70svh] min-h-[420px] sm:h-[620px]" }: PathCanvasProps) {
  const [full, setFull] = useState(false);
  useEffect(() => {
    if (!full) return;
    document.documentElement.classList.add("canvas-full");
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setFull(false); };
    document.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.classList.remove("canvas-full");
      document.removeEventListener("keydown", onKey);
    };
  }, [full]);
  const flow = useMemo(() => layout(routes, cards, from, to, active, selected, direction), [routes, cards, from, to, active, selected, direction]);
  // React Flow records measured sizes (needed for fitting and the minimap) through onNodesChange.
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState<Edge>([]);
  // Same route set (only highlighting changed): keep any positions the user dragged.
  // New route set or direction: lay out afresh, since node ids repeat between layouts.
  const key = `${layoutKey}:${direction}`;
  const lastLayout = useRef("");
  useEffect(() => {
    const same = lastLayout.current === key;
    lastLayout.current = key;
    setNodes((prev) => {
      if (!same) return flow.nodes;
      const pos = new Map(prev.map((n) => [n.id, n.position]));
      return flow.nodes.map((n) => ({ ...n, position: pos.get(n.id) ?? n.position }));
    });
    setFlowEdges(flow.edges);
  }, [flow, key, setNodes, setFlowEdges]);

  return (
    <div role={full ? "dialog" : undefined} aria-modal={full || undefined} aria-label={full ? "Route map, full screen" : undefined}
      className={full ? "fixed inset-0 z-50 overflow-hidden bg-white" : `card overflow-hidden p-0 ${className}`}>
      <ReactFlow
        nodes={nodes} edges={flowEdges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} nodeTypes={nodeTypes}
        fitView fitViewOptions={{ padding: 0.15 }} minZoom={0.2} maxZoom={1.5} nodesConnectable={false}
        onNodeClick={(_, n) => { const slug = (n.data as { slug?: string }).slug; if (slug) onSelectNode?.(slug); }}
        onEdgeClick={(_, e) => { const m = /^e:(\d+):/.exec(e.id); if (m) onSelectRoute?.(Number(m[1])); }}
      >
        <Background gap={22} size={1.2} color="#cbd5e1" />
        {/* Hidden on narrow screens, where it would cover much of the map; zoom controls stay. */}
        <MiniMap pannable zoomable ariaLabel="Overview of the route canvas" maskColor="rgba(15, 23, 42, 0.08)" className="max-sm:!hidden"
          nodeColor={(n) => (n.type === "credential" ? "#c4b5fd" : n.id === "n:target" ? "#f59e0b" : n.id === "n:start" ? "#10b981" : "#94a3b8")} />
        <Controls position="bottom-right" showInteractive={false} />
        <AutoFit layout={key} />
        <RefitOnResize full={full} />
        <Panel position="top-right">
          <button type="button" onClick={() => setFull((f) => !f)} aria-pressed={full}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-semibold text-ink shadow-sm hover:bg-teal-50">
            {full ? <Minimize2 aria-hidden="true" size={16} /> : <Maximize2 aria-hidden="true" size={16} />}
            {full ? "Exit full screen" : "Full screen"}
          </button>
        </Panel>
      </ReactFlow>
    </div>
  );
}
