import {
  chooseAiOrders,
  createGame,
  getMetrics,
  resolveTurn,
  toggleTag,
  validateOrders,
  type ActionOrder,
  type GameEvent,
  type GameState,
  type Side,
  type Snapshot,
  type TurnSummary,
} from '@zero-networks/engine';

export type Mode = 'hotseat' | 'ai-blue' | 'ai-red';

export type Phase =
  | { kind: 'planning'; side: Side }
  | { kind: 'handoff'; nextSide: Side }
  | { kind: 'reveal'; summary: TurnSummary }
  | { kind: 'gameover'; summary: TurnSummary };

export interface TurnRecord extends Snapshot {
  events: GameEvent[];
  blueOrders: ActionOrder[];
  redOrders: ActionOrder[];
}

export interface StoreState {
  mode: Mode;
  seed: number;
  phase: Phase;
  game: GameState;
  draft: ActionOrder[];
  pendingFirstOrders: ActionOrder[] | null;
  revealedOrders: Record<Side, ActionOrder[]> | null;
  initialSnapshot: Snapshot;
  history: TurnRecord[];
}

export type Action =
  | { type: 'queue'; order: ActionOrder }
  | { type: 'remove'; index: number }
  | { type: 'submit' }
  | { type: 'confirmHandoff' }
  | { type: 'finishReveal' }
  | { type: 'tag'; nodeId: number }
  | { type: 'reset' };

function snapshot(game: GameState): Snapshot {
  const metrics = getMetrics(game);
  return {
    turn: game.turn,
    terror: game.terror,
    support: game.support,
    centralization: game.centralization,
    networkSize: metrics.networkSize,
    externalTies: metrics.externalTies,
    security: metrics.security,
    effectiveness: metrics.effectiveness * 100,
    materiel: game.materiel,
    money: game.money,
  };
}

export function initStore(mode: Mode = 'hotseat', seed = Date.now()): StoreState {
  const game = createGame(seed);
  return {
    mode,
    seed: game.seed,
    phase: { kind: 'planning', side: mode === 'ai-red' ? 'red' : 'blue' },
    game,
    draft: [],
    pendingFirstOrders: null,
    revealedOrders: null,
    initialSnapshot: { ...snapshot(game), turn: 0 },
    history: [],
  };
}

export function humanSide(mode: Mode): Side | null {
  return mode === 'ai-blue' ? 'blue' : mode === 'ai-red' ? 'red' : null;
}

function finishTurn(state: StoreState, blueOrders: ActionOrder[], redOrders: ActionOrder[]): StoreState {
  const summary = resolveTurn(state.game, blueOrders, redOrders);
  const record: TurnRecord = {
    ...snapshot(summary.state),
    turn: state.game.turn,
    events: summary.events,
    blueOrders,
    redOrders,
  };
  return {
    ...state,
    game: summary.state,
    draft: [],
    pendingFirstOrders: null,
    revealedOrders: { blue: blueOrders, red: redOrders },
    history: [...state.history, record],
    phase: { kind: 'reveal', summary },
  };
}

export function reducer(state: StoreState, action: Action): StoreState {
  switch (action.type) {
    case 'reset':
      return initStore(state.mode);
    case 'queue': {
      if (state.phase.kind !== 'planning' || state.draft.length >= 3) return state;
      return { ...state, draft: [...state.draft, action.order] };
    }
    case 'remove': {
      if (state.phase.kind !== 'planning') return state;
      return { ...state, draft: state.draft.filter((_, index) => index !== action.index) };
    }
    case 'submit': {
      if (state.phase.kind !== 'planning') return state;
      const side = state.phase.side;
      if (!validateOrders(state.game, side, state.draft).valid) return state;
      if (state.mode === 'hotseat') {
        if (side === 'blue') {
          return {
            ...state,
            pendingFirstOrders: state.draft,
            draft: [],
            phase: { kind: 'handoff', nextSide: 'red' },
          };
        }
        return finishTurn(state, state.pendingFirstOrders ?? [], state.draft);
      }
      const blueOrders = side === 'blue' ? state.draft : chooseAiOrders(state.game, 'blue');
      const redOrders = side === 'red' ? state.draft : chooseAiOrders(state.game, 'red');
      return finishTurn(state, blueOrders, redOrders);
    }
    case 'confirmHandoff':
      return state.phase.kind === 'handoff'
        ? { ...state, phase: { kind: 'planning', side: state.phase.nextSide } }
        : state;
    case 'finishReveal': {
      if (state.phase.kind !== 'reveal') return state;
      if (state.game.status === 'finished') return { ...state, phase: { kind: 'gameover', summary: state.phase.summary } };
      const side = humanSide(state.mode) ?? 'blue';
      return { ...state, phase: { kind: 'planning', side }, revealedOrders: null };
    }
    case 'tag':
      return { ...state, game: toggleTag(state.game, action.nodeId) };
    default:
      return state;
  }
}

export function selectValidation(state: StoreState) {
  return state.phase.kind === 'planning'
    ? validateOrders(state.game, state.phase.side, state.draft)
    : { valid: false, errors: [] };
}

export function currentEvents(state: StoreState): GameEvent[] {
  return state.history.at(-1)?.events ?? [];
}
