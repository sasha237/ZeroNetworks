export type Side = 'blue' | 'red';
export type Community = 'logistical' | 'operational' | 'financial';
export type Category = 'global' | Community;
export type GameStatus = 'active' | 'finished';
export type Victory = 'strong-blue' | 'weak-blue' | 'draw' | 'weak-red' | 'strong-red';

export type ActionId =
  | 'intelKnown'
  | 'intelUnknown'
  | 'pruneKill'
  | 'pruneCapture'
  | 'securityPresence'
  | 'informationOps'
  | 'disruptMateriel'
  | 'reduceCapacity'
  | 'counterFinance'
  | 'investigate'
  | 'killNode'
  | 'captureNode'
  | 'grow'
  | 'shrink'
  | 'centralize'
  | 'decentralize'
  | 'increaseLogistical'
  | 'decreaseLogistical'
  | 'stealMateriel'
  | 'increaseOperational'
  | 'decreaseOperational'
  | 'minorAttack'
  | 'majorAttack'
  | 'massiveAttack'
  | 'propaganda'
  | 'increaseFinancial'
  | 'decreaseFinancial'
  | 'illicitFundraising'
  | 'socialServices';

export interface Cost {
  materiel: number;
  money: number;
}

export interface ActionDefinition {
  id: ActionId;
  side: Side;
  category: Category;
  title: string;
  shortTitle: string;
  description: string;
  cost: Cost;
  targeted?: 'node' | 'community';
}

export interface NetworkNode {
  id: number;
  community: Community;
  x: number;
  y: number;
  links: number[];
  centrality: number;
  capturedUntil: number | null;
}

export interface GameResult {
  victory: Victory;
  winner: Side | 'draw';
  title: string;
  reasons: string[];
}

export interface GameState {
  rulesetVersion: string;
  seed: number;
  rngState: number;
  turn: number;
  maxTurns: number;
  nodes: NetworkNode[];
  centralization: number;
  ties: Record<Community, number>;
  materiel: number;
  money: number;
  support: number;
  terror: number;
  visibleNodes: number[];
  knownNodes: number[];
  taggedNodes: number[];
  temporaryVisible: number[];
  supportZeroStreak: number;
  status: GameStatus;
  result: GameResult | null;
}

export interface ActionOrder {
  id: ActionId;
  targetNodeId?: number;
  community?: Community;
}

export interface GameEvent {
  actor: Side | 'system';
  kind: 'action' | 'attack' | 'intel' | 'upkeep' | 'victory' | 'disruption';
  text: string;
}

export interface AttackReport {
  tier: 'minor' | 'major' | 'massive';
  terror: number;
  supportLoss: number;
  effectiveness: number;
}

export interface TurnSummary {
  state: GameState;
  blueOrders: ActionOrder[];
  redOrders: ActionOrder[];
  events: GameEvent[];
  attacks: AttackReport[];
  before: Metrics;
  after: Metrics;
}

export interface Metrics {
  networkSize: number;
  totalMembers: number;
  operationalSize: number;
  externalTies: number;
  security: number;
  disruption: number;
  effectiveness: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface Snapshot {
  turn: number;
  terror: number;
  support: number;
  centralization: number;
  networkSize: number;
  externalTies: number;
  security: number;
  effectiveness: number;
  materiel: number;
  money: number;
}
