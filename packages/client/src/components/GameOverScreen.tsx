import type { StoreState } from '../game/store';
import { useI18n } from '../i18n';
import { resultReason, resultTitle } from '../i18n/gameText';
import { Logo } from './Logo';

export function GameOverScreen({ store, onRematch, onMenu }: { store: StoreState; onRematch: () => void; onMenu: () => void }) {
  const { language, t } = useI18n();
  const result = store.game.result!;
  return (
    <main className="center-screen">
      <section className={`gameover-card ${result.winner}`}>
        <Logo compact />
        <p className="eyebrow">{t('gameover.complete')}</p>
        <h1>{resultTitle(result, language)}</h1>
        <div className="final-score"><span>{store.game.terror}%</span><small>{t('gameover.finalTerror')}</small></div>
        {result.reasons.map((reason) => <p key={reason}>{resultReason(reason, language)}</p>)}
        <div className="gameover-stats">
          <span>{t('common.network')} <strong>{store.game.nodes.filter((node) => node.capturedUntil === null).length}/60</strong></span>
          <span>{t('common.support')} <strong>{store.game.support}%</strong></span>
          <span>{t('common.centralization')} <strong>{store.game.centralization}%</strong></span>
        </div>
        <div className="button-row">
          <button className="submit-btn blue" onClick={onRematch}>{t('gameover.newCampaign')}</button>
          <button className="ghost-btn" onClick={onMenu}>{t('common.mainMenu')}</button>
        </div>
      </section>
    </main>
  );
}
