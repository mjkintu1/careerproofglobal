import { describe, expect, it } from "vitest";
import { CareerNetwork, type NetworkEdge } from "./routes";

const e = (from: string, to: string, weight: number): NetworkEdge => ({ from, to, kind: "progression", years: weight, weight, via: "", evidence: "curated" });

describe("CareerNetwork.routes", () => {
  // A chain of 7 moves: longer than the old 4-move cap.
  const chain = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const edges = [...chain.slice(1).map((n, i) => e(chain[i]!, n, 1)), e("a", "x", 2), e("x", "h", 9), e("c", "y", 1), e("y", "f", 1)];
  const net = new CareerNetwork(edges);

  it("finds routes longer than four moves", () => {
    const [best] = net.routes("a", "h");
    expect(best!.edges.length).toBe(6); // a b c y f g h
    expect(best!.weight).toBe(6);
  });

  it("returns alternatives cheapest first, without loops", () => {
    const all = net.routes("a", "h", 5);
    expect(all.map((r) => r.weight)).toEqual([6, 7, 11]);
    for (const r of all) {
      const nodes = [r.edges[0]!.from, ...r.edges.map((x) => x.to)];
      expect(new Set(nodes).size).toBe(nodes.length);
    }
  });

  it("a per-move cost favours fewer moves without changing reported weights", () => {
    const [best] = net.routes("a", "h", 1, [], 10); // 6 moves x 10 > 2 moves x 10 + 11
    expect(best!.edges.map((x) => x.to)).toEqual(["x", "h"]);
    expect(best!.weight).toBe(11);
  });

  it("limits moves without published time, but not known moves", () => {
    const u = (from: string, to: string): NetworkEdge => ({ ...e(from, to, 1), years: null, kind: "related", evidence: "onet-related" });
    const n = new CareerNetwork([u("a", "b"), u("b", "c"), u("c", "d"), e("a", "d", 9), e("d", "f", 1), e("f", "g", 1)]);
    expect(n.routes("a", "d", 5).map((r) => r.weight)).toEqual([3, 9]);
    expect(n.routes("a", "d", 5, [], 0, 2).map((r) => r.weight)).toEqual([9]);
    expect(n.routes("a", "g", 1, [], 0, 2)[0]!.edges.length).toBe(3); // a-d-f-g: known moves only
  });

  it("returns nothing when no route exists", () => {
    expect(net.routes("h", "a")).toEqual([]);
  });

  it("counts unpublished times separately", () => {
    const n = new CareerNetwork([{ ...e("a", "b", 3), years: null }, e("b", "c", 2)]);
    const [r] = n.routes("a", "c");
    expect(r).toMatchObject({ knownYears: 2, unknownMoves: 1, weight: 5 });
  });
});
