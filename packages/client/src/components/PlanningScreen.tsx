import type { StoreState, Action } from '../game/store';
import { ActionPanel } from './ActionPanel';
import { EventLog } from './EventLog';
import { NetworkGraph } from './NetworkGraph';
import { StatsPanel } from './StatsPanel';

export function PlanningScreen({ store, dispatch }: { store: StoreState; dispatch: (action: Action) => void }) {
  if (store.phase.kind !== 'planning') return null;
  const side = store.phase.side;
  return (
    <main className={`planning-grid ${side}`}>
      <ActionPanel
        side={side}
        game={store.game}
        draft={store.draft}
        onQueue={(order) => dispatch({ type: 'queue', order })}
        onRemove={(index) => dispatch({ type: 'remove', index })}
        onSubmit={() => dispatch({ type: 'submit' })}
      />
      <div className="center-column">
        <NetworkGraph
          game={store.game}
          side={side}
          canQueue={store.draft.length < 3}
          onQueue={(order) => dispatch({ type: 'queue', order })}
          onTag={(nodeId) => dispatch({ type: 'tag', nodeId })}
        />
        <EventLog store={store} />
      </div>
      <StatsPanel store={store} side={side} />
    </main>
  );
}
