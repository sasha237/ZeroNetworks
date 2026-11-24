import { useReducer, useState } from 'react';
import { initStore, reducer, type Mode } from './game/store';
import { GameOverScreen } from './components/GameOverScreen';
import { HandoffScreen } from './components/HandoffScreen';
import { HelpModal } from './components/HelpModal';
import { ModeScreen } from './components/ModeScreen';
import { PlanningScreen } from './components/PlanningScreen';
import { RevealScreen } from './components/RevealScreen';
import { TopBar } from './components/TopBar';

function GameApp({ mode, onMenu, onHelp }: { mode: Mode; onMenu: () => void; onHelp: () => void }) {
  const [store, dispatch] = useReducer(reducer, mode, (selectedMode) => initStore(selectedMode));
  return (
    <div className={`app ${store.phase.kind === 'planning' ? store.phase.side : ''}`}>
      <TopBar store={store} onHelp={onHelp} onMenu={onMenu} />
      {store.phase.kind === 'planning' && <PlanningScreen key={`${store.game.turn}-${store.phase.side}`} store={store} dispatch={dispatch} />}
      {store.phase.kind === 'handoff' && <HandoffScreen nextSide={store.phase.nextSide} onConfirm={() => dispatch({ type: 'confirmHandoff' })} />}
      {store.phase.kind === 'reveal' && <RevealScreen store={store} onContinue={() => dispatch({ type: 'finishReveal' })} />}
      {store.phase.kind === 'gameover' && <GameOverScreen store={store} onRematch={() => dispatch({ type: 'reset' })} onMenu={onMenu} />}
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState<Mode | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  return (
    <>
      {mode === null ? <ModeScreen onStart={setMode} onHelp={() => setHelpOpen(true)} onMenu={() => setMode(null)} /> : <GameApp key={mode} mode={mode} onMenu={() => setMode(null)} onHelp={() => setHelpOpen(true)} />}
      {helpOpen && <HelpModal onClose={() => setHelpOpen(false)} />}
    </>
  );
}
