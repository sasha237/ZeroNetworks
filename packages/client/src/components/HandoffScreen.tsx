import type { Side } from '@zero-networks/engine';
import { useI18n } from '../i18n';
import { sideName } from '../i18n/gameText';
import { Logo } from './Logo';

export function HandoffScreen({ nextSide, onConfirm }: { nextSide: Side; onConfirm: () => void }) {
  const { language, t } = useI18n();
  return (
    <main className="center-screen">
      <section className={`handoff-card ${nextSide}`}>
        <Logo compact />
        <p className="eyebrow">{t('handoff.ordersLocked')}</p>
        <h1>{t('handoff.passDevice', { side: t(nextSide === 'blue' ? 'common.state' : 'common.networkSide') })}</h1>
        <p>{t('handoff.description', { side: sideName(nextSide, language) })}</p>
        <button className={`submit-btn ${nextSide}`} onClick={onConfirm}>{t('handoff.begin', { side: sideName(nextSide, language) })}</button>
      </section>
    </main>
  );
}
