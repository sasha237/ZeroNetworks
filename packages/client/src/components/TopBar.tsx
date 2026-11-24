import type { StoreState } from '../game/store';
import { useI18n } from '../i18n';
import { LanguageToggle } from './LanguageToggle';
import { Logo } from './Logo';

export function TopBar({ store, onHelp, onMenu }: { store: StoreState; onHelp: () => void; onMenu: () => void }) {
  const { t } = useI18n();
  const side = store.phase.kind === 'planning' ? store.phase.side : null;
  return (
    <header className="topbar">
      <button className="brand-button" onClick={onMenu} aria-label={t('top.returnToMenu')}>
        <Logo />
      </button>
      <div className="turn-track" aria-label={t('top.turnTrack', { current: store.game.turn, max: store.game.maxTurns })}>
        <span className="turn-label">{t('top.turn')}</span>
        {Array.from({ length: store.game.maxTurns }, (_, index) => index + 1).map((turn) => (
          <span key={turn} className={`turn-cell${turn === store.game.turn ? ' current' : ''}${turn < store.game.turn ? ' past' : ''}`}>
            {turn}
          </span>
        ))}
        <span className="turn-cell end">{t('top.end')}</span>
      </div>
      <div className="topbar-actions">
        {side && <span className={`changes-counter ${side}`}>{t('top.actions', { count: store.draft.length })}</span>}
        <button className="ghost-btn" onClick={onHelp} aria-label={t('common.openRules')}>?</button>
        <LanguageToggle />
        <button className="ghost-btn" onClick={onMenu}>{t('common.menu')}</button>
      </div>
    </header>
  );
}
