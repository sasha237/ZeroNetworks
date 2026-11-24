import { COMMUNITIES } from './actions.js';
import { pick, random, randomInt } from './prng.js';
import type { Community, GameState, NetworkNode } from './types.js';

export const GRAPH_WIDTH = 1000;
export const GRAPH_HEIGHT = 620;

const centers: Record<Community, { x: number; y: number }> = {
  logistical: { x: 245, y: 390 },
  operational: { x: 755, y: 390 },
  financial: { x: 500, y: 190 },
};

export function activeNodes(state: GameState): NetworkNode[] {
  return state.nodes.filter((node) => node.capturedUntil === null);
}

export function nodeById(state: GameState, id: number): NetworkNode | undefined {
  return state.nodes.find((node) => node.id === id);
}

function addLink(state: GameState, a: number, b: number): void {
  if (a === b) return;
  const first = nodeById(state, a);
  const second = nodeById(state, b);
  if (!first || !second) return;
  if (!first.links.includes(b)) first.links.push(b);
  if (!second.links.includes(a)) second.links.push(a);
}

export function createNode(state: GameState, community: Community): NetworkNode {
  const center = centers[community];
  const angle = random(state) * Math.PI * 2;
  const radius = 45 + random(state) * 145;
  const id = Math.max(0, ...state.nodes.map((node) => node.id)) + 1;
  const node: NetworkNode = {
    id,
    community,
    x: Math.max(35, Math.min(GRAPH_WIDTH - 35, center.x + Math.cos(angle) * radius)),
    y: Math.max(40, Math.min(GRAPH_HEIGHT - 35, center.y + Math.sin(angle) * radius * 0.72)),
    links: [],
    centrality: 0,
    capturedUntil: null,
  };
  state.nodes.push(node);
  return node;
}

export function populateInitialGraph(state: GameState, count: number): void {
  for (let i = 0; i < count; i++) {
    const community = COMMUNITIES[i % COMMUNITIES.length];
    const node = createNode(state, community);
    if (i > 0) {
      const candidates = state.nodes.slice(0, -1);
      const same = candidates.filter((candidate) => candidate.community === community);
      addLink(state, node.id, pick(state, same.length > 0 && random(state) < 0.78 ? same : candidates).id);
      if (i > 3 && random(state) < 0.6) addLink(state, node.id, pick(state, candidates).id);
    }
  }
  for (const node of state.nodes) {
    if (random(state) < 0.38) addLink(state, node.id, pick(state, state.nodes).id);
  }
  recalculateCentrality(state);
}

export function growNetwork(state: GameState, community?: Community): number {
  const available = Math.max(0, 60 - state.nodes.length);
  const amount = Math.min(10, available);
  for (let i = 0; i < amount; i++) {
    const assigned = community ?? COMMUNITIES[(state.nodes.length + i) % 3];
    const node = createNode(state, assigned);
    const candidates = activeNodes(state).filter((candidate) => candidate.id !== node.id);
    if (candidates.length === 0) continue;
    const same = candidates.filter((candidate) => candidate.community === assigned);
    addLink(state, node.id, pick(state, same.length > 0 ? same : candidates).id);
    if (candidates.length > 2) addLink(state, node.id, pick(state, candidates).id);
  }
  recalculateCentrality(state);
  return amount;
}

export function removeNodes(state: GameState, ids: number[]): void {
  const removed = new Set(ids);
  state.nodes = state.nodes.filter((node) => !removed.has(node.id));
  for (const node of state.nodes) node.links = node.links.filter((id) => !removed.has(id));
  state.visibleNodes = state.visibleNodes.filter((id) => !removed.has(id));
  state.knownNodes = state.knownNodes.filter((id) => !removed.has(id));
  state.taggedNodes = state.taggedNodes.filter((id) => !removed.has(id));
  state.temporaryVisible = state.temporaryVisible.filter((id) => !removed.has(id));
  recalculateCentrality(state);
}

export function shrinkNetwork(state: GameState, community?: Community): number {
  const candidates = activeNodes(state)
    .filter((node) => !community || node.community === community)
    .sort((a, b) => a.centrality - b.centrality || a.id - b.id);
  const ids = candidates.slice(0, Math.min(10, candidates.length)).map((node) => node.id);
  removeNodes(state, ids);
  return ids.length;
}

export function leastConnectedIds(state: GameState, count: number): number[] {
  return activeNodes(state)
    .sort((a, b) => a.links.filter((id) => activeNodes(state).some((n) => n.id === id)).length - b.links.filter((id) => activeNodes(state).some((n) => n.id === id)).length || a.centrality - b.centrality || a.id - b.id)
    .slice(0, count)
    .map((node) => node.id);
}

export function isCentralNode(state: GameState, id: number): boolean {
  const active = activeNodes(state);
  const count = Math.max(1, Math.ceil(active.length * 0.2));
  return [...active]
    .sort((a, b) => b.centrality - a.centrality || a.id - b.id)
    .slice(0, count)
    .some((node) => node.id === id);
}

export function adjustLinks(state: GameState, centralize: boolean): void {
  const active = activeNodes(state);
  if (active.length < 3) return;
  if (centralize) {
    const hub = [...active].sort((a, b) => b.centrality - a.centrality || a.id - b.id)[0];
    const peripheral = [...active].sort((a, b) => a.centrality - b.centrality || a.id - b.id).slice(0, 10);
    for (const node of peripheral) addLink(state, hub.id, node.id);
  } else {
    const peripheral = [...active].sort((a, b) => a.centrality - b.centrality || a.id - b.id).slice(0, 14);
    for (let i = 0; i < peripheral.length - 1; i += 2) addLink(state, peripheral[i].id, peripheral[i + 1].id);
  }
  recalculateCentrality(state);
}

export function recalculateCentrality(state: GameState): void {
  const active = activeNodes(state);
  const activeIds = new Set(active.map((node) => node.id));
  const scores = new Map<number, number>(active.map((node) => [node.id, 0]));
  for (const source of active) {
    const distances = new Map<number, number>([[source.id, 0]]);
    const paths = new Map<number, number>([[source.id, 1]]);
    const predecessors = new Map<number, number[]>();
    const stack: number[] = [];
    const queue = [source.id];
    while (queue.length > 0) {
      const current = queue.shift()!;
      stack.push(current);
      const node = nodeById(state, current)!;
      for (const neighbor of node.links) {
        if (!activeIds.has(neighbor)) continue;
        if (!distances.has(neighbor)) {
          distances.set(neighbor, distances.get(current)! + 1);
          queue.push(neighbor);
        }
        if (distances.get(neighbor) === distances.get(current)! + 1) {
          paths.set(neighbor, (paths.get(neighbor) ?? 0) + paths.get(current)!);
          predecessors.set(neighbor, [...(predecessors.get(neighbor) ?? []), current]);
        }
      }
    }
    const dependency = new Map<number, number>();
    while (stack.length > 0) {
      const current = stack.pop()!;
      for (const predecessor of predecessors.get(current) ?? []) {
        const contribution = (paths.get(predecessor)! / paths.get(current)!) * (1 + (dependency.get(current) ?? 0));
        dependency.set(predecessor, (dependency.get(predecessor) ?? 0) + contribution);
      }
      if (current !== source.id) scores.set(current, scores.get(current)! + (dependency.get(current) ?? 0));
    }
  }
  const denominator = active.length > 2 ? (active.length - 1) * (active.length - 2) : 1;
  for (const node of state.nodes) node.centrality = activeIds.has(node.id) ? (scores.get(node.id) ?? 0) / denominator : 0;
}

export function neighborsOf(state: GameState, ids: number[]): number[] {
  const result = new Set<number>();
  for (const id of ids) {
    const node = nodeById(state, id);
    for (const neighbor of node?.links ?? []) result.add(neighbor);
  }
  return [...result];
}

export function ensureConnected(state: GameState): void {
  const active = activeNodes(state);
  if (active.length < 2) return;
  const connected = new Set<number>([active[0].id]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const node of active) {
      if (!connected.has(node.id)) continue;
      for (const linked of node.links) {
        if (!connected.has(linked) && activeNodes(state).some((candidate) => candidate.id === linked)) {
          connected.add(linked);
          changed = true;
        }
      }
    }
  }
  for (const node of active) {
    if (!connected.has(node.id)) addLink(state, node.id, pick(state, [...connected]));
    connected.add(node.id);
  }
  recalculateCentrality(state);
}

export function randomCommunity(state: GameState): Community {
  return COMMUNITIES[randomInt(state, 0, COMMUNITIES.length - 1)];
}
