import { ACTIONS, COMMUNITIES } from './actions.js';
import {
  activeNodes,
  adjustLinks,
  growNetwork,
  isCentralNode,
  leastConnectedIds,
  neighborsOf,
  nodeById,
  populateInitialGraph,
  recalculateCentrality,
  removeNodes,
  shrinkNetwork,
} from './graph.js';
import { pick, randomInt, shuffle } from './prng.js';
import type {
  ActionId,
  ActionOrder,
  AttackReport,
  Community,
  Cost,
  GameEvent,
  GameResult,
  GameState,
  Metrics,
  Side,
  TurnSummary,
  ValidationResult,
  Victory,
} from './types.js';

export const RULESET_VERSION = '1.0.0-restored';

const attackBase: Partial<Record<ActionId, number>> = {
  minorAttack: 20,
  majorAttack: 40,
  massiveAttack: 80,
};

const attackSupportLoss: Partial<Record<ActionId, number>> = {
  minorAttack: 2,
  majorAttack: 4,
  massiveAttack: 8,
};

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

function clone(state: GameState): GameState {
  return JSON.parse(JSON.stringify(state)) as GameState;
}

function countOrders(orders: ActionOrder[], id: ActionId): number {
  return orders.filter((order) => order.id === id).length;
}

function totalCost(orders: ActionOrder[]): Cost {
  return orders.reduce(
    (total, order) => ({
      materiel: total.materiel + ACTIONS[order.id].cost.materiel,
      money: total.money + ACTIONS[order.id].cost.money,
    }),
    { materiel: 0, money: 0 },
  );
}

export function getMetrics(state: GameState): Metrics {
  const networkSize = activeNodes(state).length;
  const operationalSize = activeNodes(state).filter((node) => node.community === 'operational').length;
  const externalTies = state.ties.logistical + state.ties.operational + state.ties.financial;
  const security = clamp(
    25 *
      ((1 - networkSize / 60) +
        (1 - state.centralization / 100) +
        (1 - externalTies / 90) +
        state.support / 100),
  );
  const disruption = 1 - security / 200;
  const effectiveness =
    0.5 +
    0.1 *
      (networkSize / 60 +
        Math.min(operationalSize / 20, 1) +
        state.ties.operational / 30 +
        state.centralization / 100 +
        state.support / 100);
  return {
    networkSize,
    totalMembers: state.nodes.length,
    operationalSize,
    externalTies,
    security,
    disruption,
    effectiveness,
  };
}

export function createGame(seed = Date.now()): GameState {
  const normalizedSeed = seed >>> 0;
  const state: GameState = {
    rulesetVersion: RULESET_VERSION,
    seed: normalizedSeed,
    rngState: normalizedSeed,
    turn: 1,
    maxTurns: 15,
    nodes: [],
    centralization: 0,
    ties: { logistical: 0, operational: 0, financial: 0 },
    materiel: 0,
    money: 0,
    support: 0,
    terror: 0,
    visibleNodes: [],
    knownNodes: [],
    taggedNodes: [],
    temporaryVisible: [],
    supportZeroStreak: 0,
    status: 'active',
    result: null,
  };
  populateInitialGraph(state, randomInt(state, 30, 45));
  state.centralization = randomInt(state, 0, 50);
  for (const community of COMMUNITIES) state.ties[community] = randomInt(state, 5, 15);
  state.materiel = randomInt(state, 40, 90);
  state.money = randomInt(state, 20, 45);
  state.support = randomInt(state, 30, 60);
  state.terror = randomInt(state, 0, 20);
  state.visibleNodes = shuffle(state, activeNodes(state).map((node) => node.id)).slice(0, 3);
  return state;
}

function hasKnownCommunityNode(state: GameState, community: Community): boolean {
  const visible = new Set(state.visibleNodes);
  const known = new Set(state.knownNodes);
  return activeNodes(state).some(
    (node) => node.community === community && visible.has(node.id) && known.has(node.id),
  );
}

export function validateOrders(state: GameState, side: Side, orders: ActionOrder[]): ValidationResult {
  const errors: string[] = [];
  if (state.status !== 'active') errors.push('The game is already finished.');
  if (orders.length > 3) errors.push('You can queue at most three actions per turn.');
  const active = activeNodes(state);
  const visible = new Set(state.visibleNodes);
  let totalMateriel = 0;
  let totalMoney = 0;
  for (const order of orders) {
    const definition = ACTIONS[order.id];
    if (!definition) {
      errors.push('Unknown action.');
      continue;
    }
    if (definition.side !== side) errors.push(`${definition.title} is not available to ${side}.`);
    totalMateriel += definition.cost.materiel;
    totalMoney += definition.cost.money;
    if (definition.targeted === 'community' && !order.community && order.id === 'investigate') {
      errors.push(`${definition.title} requires a community.`);
    }
    if (order.community && !COMMUNITIES.includes(order.community)) errors.push('Unknown community.');
    if (definition.targeted === 'node') {
      const target = order.targetNodeId === undefined ? undefined : nodeById(state, order.targetNodeId);
      if (!target || target.capturedUntil !== null || !visible.has(target.id)) {
        errors.push(`${definition.title} requires a visible active node.`);
      }
    }
    if (order.id === 'disruptMateriel' && !hasKnownCommunityNode(state, 'logistical')) {
      errors.push('Disrupt Supply Channels requires an identified visible Logistical node.');
    }
    if (order.id === 'reduceCapacity' && !hasKnownCommunityNode(state, 'operational')) {
      errors.push('Disrupt Operational Capacity requires an identified visible Operational node.');
    }
    if (order.id === 'counterFinance' && !hasKnownCommunityNode(state, 'financial')) {
      errors.push('Freeze Funding requires an identified visible Financial node.');
    }
    if (order.id === 'grow' && state.nodes.length >= 60) errors.push('The network is already at its 60-member limit.');
    if (order.id === 'shrink' && active.length === 0) errors.push('There are no active nodes to remove.');
    if ((order.id === 'pruneKill' || order.id === 'pruneCapture') && active.length === 0) {
      errors.push('There are no active nodes to prune.');
    }
    if (attackBase[order.id] !== undefined && !active.some((node) => node.community === 'operational')) {
      errors.push('A cyberattack requires at least one active Operational node.');
    }
  }
  if (side === 'red' && totalMateriel > state.materiel) errors.push('Insufficient computing resources for the queued actions.');
  if (side === 'red' && totalMoney > state.money) errors.push('Insufficient money for the queued actions.');
  return { valid: errors.length === 0, errors: [...new Set(errors)] };
}

function victoryForCompromise(terror: number): Victory {
  if (terror <= 20) return 'strong-blue';
  if (terror <= 40) return 'weak-blue';
  if (terror <= 60) return 'draw';
  if (terror <= 80) return 'weak-red';
  return 'strong-red';
}

function resultFromVictory(victory: Victory, reasons: string[]): GameResult {
  const data: Record<Victory, { winner: Side | 'draw'; title: string }> = {
    'strong-blue': { winner: 'blue', title: 'Strong Corporation Victory' },
    'weak-blue': { winner: 'blue', title: 'Weak Corporation Victory' },
    draw: { winner: 'draw', title: 'Draw' },
    'weak-red': { winner: 'red', title: 'Weak Hackers Victory' },
    'strong-red': { winner: 'red', title: 'Strong Hackers Victory' },
  };
  return { victory, ...data[victory], reasons };
}

function refund(state: GameState, id: ActionId): void {
  state.materiel += ACTIONS[id].cost.materiel;
  state.money += ACTIONS[id].cost.money;
}

export function resolveTurn(current: GameState, blueOrders: ActionOrder[], redOrders: ActionOrder[]): TurnSummary {
  const blueValidation = validateOrders(current, 'blue', blueOrders);
  const redValidation = validateOrders(current, 'red', redOrders);
  if (!blueValidation.valid || !redValidation.valid) {
    throw new Error([...blueValidation.errors, ...redValidation.errors].join(' '));
  }

  const state = clone(current);
  const before = getMetrics(state);
  const events: GameEvent[] = [];
  const attacks: AttackReport[] = [];
  const emit = (actor: Side | 'system', kind: GameEvent['kind'], text: string) => events.push({ actor, kind, text });
  const redCost = totalCost(redOrders);
  state.materiel -= redCost.materiel;
  state.money -= redCost.money;

  if (blueOrders.length === 0) emit('blue', 'action', 'Corporation holds position.');
  if (redOrders.length === 0) emit('red', 'action', 'Hackers hold position.');

  const presence = countOrders(blueOrders, 'securityPresence');
  const disruptMateriel = countOrders(blueOrders, 'disruptMateriel');
  const reduceCapacity = countOrders(blueOrders, 'reduceCapacity');
  const counterFinance = countOrders(blueOrders, 'counterFinance');

  for (const order of blueOrders) {
    if (order.id === 'informationOps') {
      state.support -= 5;
      emit('blue', 'action', 'Public Relations Campaign reduces hacker support by 5.');
    }
  }

  for (const order of redOrders) {
    if (order.id === 'propaganda') {
      state.support += 5;
      emit('red', 'action', 'Hacktivist Propaganda increases hacker support by 5.');
    }
    if (order.id === 'socialServices') {
      if (counterFinance > 0) {
        refund(state, order.id);
        emit('blue', 'disruption', 'Freeze Funding cancels Digital Mutual Aid; its cost is refunded.');
      } else {
        state.support += 12;
        emit('red', 'action', 'Digital Mutual Aid increases hacker support by 12.');
      }
    }
    if (order.id === 'stealMateriel') {
      if (disruptMateriel > 0) {
        refund(state, order.id);
        emit('blue', 'disruption', 'Disrupt Supply Channels cancels Hijack Computing Resources; its cost is refunded.');
      } else {
        state.materiel += 30;
        emit('red', 'action', 'Hackers hijack 30 computing resources.');
      }
    }
    if (order.id === 'illicitFundraising') {
      if (counterFinance > 0) {
        refund(state, order.id);
        emit('blue', 'disruption', 'Freeze Funding cancels Botnet Monetization; its cost is refunded.');
      } else {
        state.money += 30;
        emit('red', 'action', 'Botnet Monetization generates $30.');
      }
    }
  }

  for (const order of redOrders) {
    if (order.id === 'grow') {
      const amount = growNetwork(state, order.community);
      emit('red', 'action', `Network grows by ${amount} nodes${order.community ? ` in ${order.community}` : ''}.`);
    }
    if (order.id === 'shrink') {
      const amount = shrinkNetwork(state, order.community);
      emit('red', 'action', `Network shrinks by ${amount} nodes${order.community ? ` from ${order.community}` : ''}.`);
    }
    if (order.id === 'centralize') {
      state.centralization += 15;
      adjustLinks(state, true);
      emit('red', 'action', 'Hackers centralize command and control (+15 Centralization).');
    }
    if (order.id === 'decentralize') {
      state.centralization -= 15;
      adjustLinks(state, false);
      emit('red', 'action', 'Hackers decentralize into a more resilient structure (−15 Centralization).');
    }
  }

  const tieDelta: Record<Community, number> = {
    logistical:
      10 * (countOrders(redOrders, 'increaseLogistical') - countOrders(redOrders, 'decreaseLogistical')) -
      disruptMateriel * Math.max(1, Math.round(10 * before.disruption)),
    operational:
      15 * (countOrders(redOrders, 'increaseOperational') - countOrders(redOrders, 'decreaseOperational')) -
      reduceCapacity * Math.max(1, Math.round(15 * before.disruption)),
    financial:
      10 * (countOrders(redOrders, 'increaseFinancial') - countOrders(redOrders, 'decreaseFinancial')) -
      counterFinance * Math.max(1, Math.round(10 * before.disruption)),
  };
  for (const community of COMMUNITIES) {
    state.ties[community] = clamp(state.ties[community] + tieDelta[community], 0, 30);
  }
  if (tieDelta.logistical !== 0) emit(tieDelta.logistical > 0 ? 'red' : 'blue', 'action', `Logistical ties change by ${tieDelta.logistical}.`);
  if (tieDelta.operational !== 0) emit(tieDelta.operational > 0 ? 'red' : 'blue', 'action', `Operational ties change by ${tieDelta.operational}.`);
  if (tieDelta.financial !== 0) emit(tieDelta.financial > 0 ? 'red' : 'blue', 'action', `Financial ties change by ${tieDelta.financial}.`);

  const revealAmount = Math.max(1, Math.round(4 * before.disruption));
  const reveal = (candidates: number[], amount: number, temporary = false): number[] => {
    const visible = new Set(state.visibleNodes);
    const activeIds = new Set(activeNodes(state).map((node) => node.id));
    const available = shuffle(state, [...new Set(candidates)].filter((id) => activeIds.has(id) && !visible.has(id)));
    const selected = available.slice(0, amount);
    state.visibleNodes.push(...selected);
    if (temporary) state.temporaryVisible.push(...selected);
    return selected;
  };

  for (const order of blueOrders) {
    if (order.id === 'intelKnown') {
      const revealed = reveal(neighborsOf(state, state.visibleNodes), revealAmount);
      emit('blue', 'intel', `Known-network intelligence reveals ${revealed.length} nodes and their visible ties.`);
    }
    if (order.id === 'intelUnknown') {
      const revealed = reveal(state.nodes.map((node) => node.id), revealAmount);
      emit('blue', 'intel', `Unknown-network intelligence reveals ${revealed.length} nodes.`);
    }
    if (order.id === 'securityPresence') {
      const revealed = reveal(state.nodes.map((node) => node.id), revealAmount, true);
      emit('blue', 'intel', `Active Cyber Defense reveals ${revealed.length} temporary nodes and halves cyberattack effects.`);
    }
    if (order.id === 'investigate' && order.community) {
      const visible = new Set(state.visibleNodes);
      const known = new Set(state.knownNodes);
      const identified = state.nodes.filter(
        (node) => node.community === order.community && visible.has(node.id) && !known.has(node.id),
      );
      state.knownNodes.push(...identified.map((node) => node.id));
      emit('blue', 'intel', `Community analysis identifies ${identified.length} visible ${order.community} nodes.`);
    }
  }

  const hideOneVisibleNode = () => {
    const candidates = state.visibleNodes.filter((id) => activeNodes(state).some((node) => node.id === id));
    if (candidates.length === 0) return;
    const hidden = pick(state, candidates);
    state.visibleNodes = state.visibleNodes.filter((id) => id !== hidden);
    state.knownNodes = state.knownNodes.filter((id) => id !== hidden);
    state.temporaryVisible = state.temporaryVisible.filter((id) => id !== hidden);
  };

  for (const order of blueOrders) {
    if (order.id === 'pruneKill') {
      const count = Math.max(1, Math.round(activeNodes(state).length * 0.1));
      const ids = leastConnectedIds(state, count);
      removeNodes(state, ids);
      hideOneVisibleNode();
      emit('blue', 'action', `Dismantle Take Down permanently disconnects ${ids.length} least-connected nodes; one intelligence contact is lost.`);
    }
    if (order.id === 'pruneCapture') {
      const count = Math.max(1, Math.round(activeNodes(state).length * 0.1));
      const ids = leastConnectedIds(state, count);
      const candidates = neighborsOf(state, ids);
      for (const id of ids) {
        const node = nodeById(state, id);
        if (node) node.capturedUntil = state.turn + 5;
      }
      const revealed = reveal(candidates, revealAmount);
      recalculateCentrality(state);
      emit('blue', 'intel', `Dismantle Isolate isolates ${ids.length} nodes for five turns and reveals ${revealed.length} contacts.`);
    }
    if (order.id === 'killNode' && order.targetNodeId !== undefined) {
      const target = nodeById(state, order.targetNodeId);
      if (!target || target.capturedUntil !== null) continue;
      const central = isCentralNode(state, target.id);
      removeNodes(state, [target.id]);
      hideOneVisibleNode();
      if (central) {
        state.centralization -= 10;
        emit('blue', 'action', `Central node ${target.id} is taken down; Centralization falls by 10.`);
      } else {
        state.support += 4;
        emit('blue', 'action', `Non-central node ${target.id} is taken down; hacker support rises by 4.`);
      }
    }
    if (order.id === 'captureNode' && order.targetNodeId !== undefined) {
      const target = nodeById(state, order.targetNodeId);
      if (!target || target.capturedUntil !== null) continue;
      const candidates = neighborsOf(state, [target.id]);
      target.capturedUntil = state.turn + 5;
      const revealed = reveal(candidates, revealAmount + 2);
      recalculateCentrality(state);
      emit('blue', 'intel', `Node ${target.id} is isolated for five turns; ${revealed.length} neighboring nodes are revealed.`);
    }
  }

  for (const order of redOrders) {
    const base = attackBase[order.id];
    if (base === undefined) continue;
    const tier = order.id === 'minorAttack' ? 'minor' : order.id === 'majorAttack' ? 'major' : 'massive';
    const terror = Math.ceil(base * before.effectiveness * Math.pow(0.5, presence));
    const supportLoss = attackSupportLoss[order.id]!;
    state.terror += terror;
    state.support -= supportLoss;
    const report: AttackReport = { tier, terror, supportLoss, effectiveness: before.effectiveness };
    attacks.push(report);
    emit('red', 'attack', `${tier[0].toUpperCase()}${tier.slice(1)} cyberattack adds ${terror} Compromise and reduces support by ${supportLoss}.`);
  }

  state.centralization = clamp(state.centralization);
  state.support = clamp(state.support);
  state.terror = clamp(state.terror);
  state.materiel = Math.max(0, state.materiel);
  state.money = Math.max(0, state.money);
  state.supportZeroStreak = state.support === 0 ? state.supportZeroStreak + 1 : 0;

  if (state.nodes.length === 0) {
    state.status = 'finished';
    state.result = resultFromVictory('strong-blue', ['The hacker network has been completely dismantled.']);
    emit('system', 'victory', 'Corporation dismantles the entire network.');
  } else if (state.supportZeroStreak >= 4) {
    state.status = 'finished';
    state.result = resultFromVictory('strong-blue', ['Hackers’ popular support remained at 0% for four consecutive turns.']);
    emit('system', 'victory', 'Corporation wins after four consecutive turns at zero hacker support.');
  } else if (state.turn >= state.maxTurns) {
    const victory = victoryForCompromise(state.terror);
    state.status = 'finished';
    state.result = resultFromVictory(victory, [`The 15-turn campaign ends at ${state.terror}% Compromise.`]);
    emit('system', 'victory', `The campaign ends at ${state.terror}% Compromise.`);
  }

  if (state.status === 'active') {
    state.turn += 1;
    const returned: number[] = [];
    for (const node of state.nodes) {
      if (node.capturedUntil !== null && node.capturedUntil <= state.turn) {
        node.capturedUntil = null;
        returned.push(node.id);
      }
    }
    if (returned.length > 0) {
      recalculateCentrality(state);
      emit('system', 'upkeep', `${returned.length} isolated nodes return to the network.`);
    }
    const previousCompromise = state.terror;
    state.terror = Math.floor(state.terror / 2);
    emit('system', 'upkeep', `Compromise decays from ${previousCompromise}% to ${state.terror}%.`);
    state.materiel += state.ties.logistical;
    state.money += state.ties.financial;
    emit('system', 'upkeep', `Hackers receive ${state.ties.logistical} computing resources and $${state.ties.financial} from external ties.`);
    state.visibleNodes = state.visibleNodes.filter((id) => !state.temporaryVisible.includes(id));
    state.knownNodes = state.knownNodes.filter((id) => !state.temporaryVisible.includes(id));
    state.temporaryVisible = [];
  }

  return {
    state,
    blueOrders: blueOrders.map((order) => ({ ...order })),
    redOrders: redOrders.map((order) => ({ ...order })),
    events,
    attacks,
    before,
    after: getMetrics(state),
  };
}

export function toggleTag(current: GameState, nodeId: number): GameState {
  const state = clone(current);
  state.taggedNodes = state.taggedNodes.includes(nodeId)
    ? state.taggedNodes.filter((id) => id !== nodeId)
    : [...state.taggedNodes, nodeId];
  return state;
}
