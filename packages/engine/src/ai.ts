import { COMMUNITIES } from './actions.js';
import { getMetrics, validateOrders } from './engine.js';
import { activeNodes, isCentralNode } from './graph.js';
import type { ActionOrder, Community, GameState, Side } from './types.js';

function visibleUnknownCommunity(state: GameState, community: Community): boolean {
  const visible = new Set(state.visibleNodes);
  const known = new Set(state.knownNodes);
  return activeNodes(state).some(
    (node) => node.community === community && visible.has(node.id) && !known.has(node.id),
  );
}

function redCandidates(state: GameState): ActionOrder[] {
  const metrics = getMetrics(state);
  const candidates: ActionOrder[] = [];
  if (state.support < 25) {
    candidates.push({ id: state.money >= 30 ? 'socialServices' : 'propaganda' }, { id: 'propaganda' });
  }
  if (state.money < 30 && state.materiel >= 30) candidates.push({ id: 'illicitFundraising' });
  if (state.materiel < 30 && state.money >= 15) candidates.push({ id: 'stealMateriel' });
  if (metrics.operationalSize === 0) candidates.push({ id: 'grow', community: 'operational' });

  const canAttack = metrics.operationalSize > 0;
  if (canAttack && state.turn >= 10 && metrics.effectiveness >= 0.78) candidates.push({ id: 'massiveAttack' });
  if (canAttack && state.turn >= 6 && metrics.effectiveness >= 0.68) candidates.push({ id: 'majorAttack' });
  if (canAttack && (state.turn >= 3 || metrics.effectiveness >= 0.75)) candidates.push({ id: 'minorAttack' });

  if (state.ties.logistical < 15) candidates.push({ id: 'increaseLogistical' });
  if (state.ties.financial < 15) candidates.push({ id: 'increaseFinancial' });
  if (state.ties.operational < 25) candidates.push({ id: 'increaseOperational' });
  if (metrics.networkSize < 48) candidates.push({ id: 'grow' });
  if (state.centralization < 65) candidates.push({ id: 'centralize' });
  if (state.support < 45) candidates.push({ id: 'propaganda' });
  if (state.materiel >= 30 && state.money < 45) candidates.push({ id: 'illicitFundraising' });
  if (state.money >= 15 && state.materiel < 60) candidates.push({ id: 'stealMateriel' });
  candidates.push(
    { id: 'increaseOperational' },
    { id: 'increaseLogistical' },
    { id: 'increaseFinancial' },
    { id: 'propaganda' },
  );
  return candidates;
}

function blueCandidates(state: GameState): ActionOrder[] {
  const metrics = getMetrics(state);
  const candidates: ActionOrder[] = [];
  const visible = activeNodes(state).filter((node) => state.visibleNodes.includes(node.id));
  if (state.terror >= 30 || state.turn >= 12) candidates.push({ id: 'securityPresence' });
  for (const community of COMMUNITIES) {
    if (visibleUnknownCommunity(state, community)) candidates.push({ id: 'investigate', community });
  }
  if (visible.length < Math.min(14, metrics.networkSize)) {
    candidates.push({ id: 'intelKnown' }, { id: 'intelUnknown' });
  }
  candidates.push({ id: 'disruptMateriel' }, { id: 'reduceCapacity' }, { id: 'counterFinance' });

  const centralVisible = visible
    .filter((node) => isCentralNode(state, node.id))
    .sort((a, b) => b.centrality - a.centrality);
  if (centralVisible.length > 0 && state.centralization >= 45 && state.support >= 15) {
    candidates.push({ id: 'killNode', targetNodeId: centralVisible[0].id });
  }
  if (visible.length > 0) {
    const target = [...visible].sort((a, b) => b.centrality - a.centrality)[0];
    candidates.push({ id: 'captureNode', targetNodeId: target.id });
  }
  if (state.support > 0) candidates.push({ id: 'informationOps' });
  if (metrics.networkSize > 15) candidates.push({ id: 'pruneCapture' });
  candidates.push(
    { id: 'intelKnown' },
    { id: 'intelUnknown' },
    { id: 'securityPresence' },
    { id: 'informationOps' },
  );
  return candidates;
}

export function chooseAiOrders(state: GameState, side: Side): ActionOrder[] {
  const candidates = side === 'red' ? redCandidates(state) : blueCandidates(state);
  const orders: ActionOrder[] = [];
  for (const candidate of candidates) {
    if (orders.length >= 3) break;
    const next = [...orders, candidate];
    if (validateOrders(state, side, next).valid) orders.push(candidate);
  }
  return orders;
}
