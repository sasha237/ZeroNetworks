import type { ActionDefinition, ActionId, Category, Community, Side } from './types.js';

const free = { materiel: 0, money: 0 };

export const ACTIONS: Record<ActionId, ActionDefinition> = {
  intelKnown: { id: 'intelKnown', side: 'blue', category: 'global', title: 'Network Intelligence (Known Network)', shortTitle: 'Intel: Known', description: 'Reveal hidden neighboring nodes and ties around visible nodes.', cost: free },
  intelUnknown: { id: 'intelUnknown', side: 'blue', category: 'global', title: 'Network Intelligence (Unknown Network)', shortTitle: 'Intel: Unknown', description: 'Reveal nodes elsewhere in the hidden hacker network.', cost: free },
  pruneKill: { id: 'pruneKill', side: 'blue', category: 'global', title: 'Dismantle Network — Take Down', shortTitle: 'Dismantle: Take Down', description: 'Permanently disconnect 10% of nodes, starting with the least connected.', cost: free },
  pruneCapture: { id: 'pruneCapture', side: 'blue', category: 'global', title: 'Dismantle Network — Isolate', shortTitle: 'Dismantle: Isolate', description: 'Isolate 10% of nodes for five turns and reveal intelligence.', cost: free },
  securityPresence: { id: 'securityPresence', side: 'blue', category: 'global', title: 'Active Cyber Defense', shortTitle: 'Cyber Defense', description: 'Halve cyberattack effects this turn and gain temporary intelligence.', cost: free },
  informationOps: { id: 'informationOps', side: 'blue', category: 'global', title: 'Public Relations Campaign', shortTitle: 'PR Campaign', description: 'Reduce hackers’ popular support by 5.', cost: free },
  disruptMateriel: { id: 'disruptMateriel', side: 'blue', category: 'logistical', title: 'Disrupt Supply Channels', shortTitle: 'Disrupt Supply', description: 'Reduce Logistical ties and cancel Hijack Computing Resources this turn.', cost: free },
  reduceCapacity: { id: 'reduceCapacity', side: 'blue', category: 'operational', title: 'Disrupt Operational Capacity', shortTitle: 'Disrupt Capacity', description: 'Reduce Operational external ties.', cost: free },
  counterFinance: { id: 'counterFinance', side: 'blue', category: 'financial', title: 'Freeze Funding', shortTitle: 'Freeze Funding', description: 'Reduce Financial ties and cancel Botnet Monetization and Digital Mutual Aid.', cost: free },
  investigate: { id: 'investigate', side: 'blue', category: 'global', title: 'Analyze Network Community', shortTitle: 'Analyze Community', description: 'Identify community membership for visible nodes.', cost: free, targeted: 'community' },
  killNode: { id: 'killNode', side: 'blue', category: 'global', title: 'Take Down Targeted Node', shortTitle: 'Take Down Node', description: 'Permanently disconnect a visible node. Taking down a non-central node increases hacker support.', cost: free, targeted: 'node' },
  captureNode: { id: 'captureNode', side: 'blue', category: 'global', title: 'Isolate Targeted Node', shortTitle: 'Isolate Node', description: 'Isolate a visible node for five turns and reveal its neighborhood.', cost: free, targeted: 'node' },
  grow: { id: 'grow', side: 'red', category: 'global', title: 'Recruit Hackers', shortTitle: 'Recruit', description: 'Add 10 nodes, up to the 60-member limit.', cost: free, targeted: 'community' },
  shrink: { id: 'shrink', side: 'red', category: 'global', title: 'Reduce Network', shortTitle: 'Reduce Network', description: 'Remove 10 low-centrality nodes to improve security.', cost: free, targeted: 'community' },
  centralize: { id: 'centralize', side: 'red', category: 'global', title: 'Centralize', shortTitle: 'Centralize', description: 'Increase centralization by 15 and add hub links.', cost: free },
  decentralize: { id: 'decentralize', side: 'red', category: 'global', title: 'Decentralize', shortTitle: 'Decentralize', description: 'Reduce centralization by 15 and add distributed links.', cost: free },
  increaseLogistical: { id: 'increaseLogistical', side: 'red', category: 'logistical', title: 'Increase Logistical Ties', shortTitle: '+ Logistical Ties', description: 'Add 10 Logistical ties for future computing-resource income.', cost: free },
  decreaseLogistical: { id: 'decreaseLogistical', side: 'red', category: 'logistical', title: 'Decrease Logistical Ties', shortTitle: '− Logistical Ties', description: 'Remove 10 Logistical ties to improve security.', cost: free },
  stealMateriel: { id: 'stealMateriel', side: 'red', category: 'logistical', title: 'Hijack Computing Resources', shortTitle: 'Hijack Resources', description: 'Gain 30 computing resources immediately. Disrupt Supply Channels cancels it.', cost: { materiel: 0, money: 15 } },
  increaseOperational: { id: 'increaseOperational', side: 'red', category: 'operational', title: 'Increase Operational Ties', shortTitle: '+ Operational Ties', description: 'Add 15 Operational ties to strengthen cyberattacks.', cost: free },
  decreaseOperational: { id: 'decreaseOperational', side: 'red', category: 'operational', title: 'Decrease Operational Ties', shortTitle: '− Operational Ties', description: 'Remove 15 Operational ties to improve security.', cost: free },
  minorAttack: { id: 'minorAttack', side: 'red', category: 'operational', title: 'Minor Cyberattack', shortTitle: 'Minor Cyberattack', description: 'Base 20 Compromise; lose 2 popular support.', cost: { materiel: 30, money: 30 } },
  majorAttack: { id: 'majorAttack', side: 'red', category: 'operational', title: 'Major Cyberattack', shortTitle: 'Major Cyberattack', description: 'Base 40 Compromise; lose 4 popular support.', cost: { materiel: 60, money: 45 } },
  massiveAttack: { id: 'massiveAttack', side: 'red', category: 'operational', title: 'Massive Cyberattack', shortTitle: 'Massive Cyberattack', description: 'Base 80 Compromise; lose 8 popular support.', cost: { materiel: 120, money: 60 } },
  propaganda: { id: 'propaganda', side: 'red', category: 'operational', title: 'Hacktivist Propaganda', shortTitle: 'Propaganda', description: 'Increase hackers’ popular support by 5.', cost: free },
  increaseFinancial: { id: 'increaseFinancial', side: 'red', category: 'financial', title: 'Increase Financial Ties', shortTitle: '+ Financial Ties', description: 'Add 10 Financial ties for future money income.', cost: free },
  decreaseFinancial: { id: 'decreaseFinancial', side: 'red', category: 'financial', title: 'Decrease Financial Ties', shortTitle: '− Financial Ties', description: 'Remove 10 Financial ties to improve security.', cost: free },
  illicitFundraising: { id: 'illicitFundraising', side: 'red', category: 'financial', title: 'Monetize Botnet', shortTitle: 'Monetize Botnet', description: 'Convert 30 computing resources into $30. Freeze Funding cancels it.', cost: { materiel: 30, money: 0 } },
  socialServices: { id: 'socialServices', side: 'red', category: 'financial', title: 'Digital Mutual Aid', shortTitle: 'Mutual Aid', description: 'Gain 12 popular support. Freeze Funding cancels it.', cost: { materiel: 0, money: 30 } },
};

export const COMMUNITIES: Community[] = ['logistical', 'operational', 'financial'];
export const CATEGORIES: Category[] = ['global', 'logistical', 'operational', 'financial'];

export function actionsFor(side: Side, category: Category): ActionDefinition[] {
  return Object.values(ACTIONS).filter((action) => action.side === side && action.category === category);
}

export function actionCategoryForInvestigation(community: Community): Category {
  return community;
}
