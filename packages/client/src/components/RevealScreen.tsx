import { ACTIONS, type ActionOrder, type Side } from '@zero-networks/engine';
import type { StoreState } from '../game/store';
import { useI18n } from '../i18n';
import { communityName, gameEventText, localizeAction } from '../i18n/gameText';

function Orders({ side, orders }: { side: Side; orders: ActionOrder[] }) {
  const { language, t } = useI18n();
  return (
    <section className={`revealed-orders ${side}`}>
      <span className="eyebrow">{t(side === 'blue' ? 'reveal.stateOrders' : 'reveal.networkOrders')}</span>
      {orders.length === 0 && <p>{t('reveal.holdPosition')}</p>}
      {orders.map((order, index) => {
        const action = localizeAction(ACTIONS[order.id], language);
        return (
          <div key={`${order.id}-${index}`}><span>{index + 1}</span><strong>{action.title}</strong><small>{order.community ? communityName(order.community, language) : (order.targetNodeId !== undefined ? `${t('common.node')} ${order.targetNodeId}` : '')}</small></div>
        );
      })}
    </section>
  );
}

export function RevealScreen({ store, onContinue }: { store: StoreState; onContinue: () => void }) {
  const { language, t } = useI18n();
  if (store.phase.kind !== 'reveal') return null;
  const { summary } = store.phase;
  const resolvedTurn = summary.state.turn - (summary.state.status === 'active' ? 1 : 0);
  return (
    <main className="reveal-screen">
      <div className="reveal-heading"><span className="eyebrow">{t('reveal.simultaneous')}</span><h1>{t('reveal.turnResolved', { turn: resolvedTurn })}</h1><p>{t('reveal.description')}</p></div>
      <div className="reveal-orders-grid"><Orders side="blue" orders={summary.blueOrders} /><Orders side="red" orders={summary.redOrders} /></div>
      {summary.attacks.length > 0 && (
        <div className="attack-reports">
          {summary.attacks.map((attack, index) => <div key={index}><span>{t(`reveal.${attack.tier}Attack`)}</span><strong>+{attack.terror}%</strong><small>{t('reveal.terror')}</small></div>)}
        </div>
      )}
      <section className="reveal-events panel">
        <div className="panel-subheading"><span>{t('reveal.feed')}</span><span>{t('reveal.events', { count: summary.events.length })}</span></div>
        <div>{summary.events.map((event, index) => <p key={index} className={`event ${event.actor}`}><span className="event-marker" />{gameEventText(event, language)}</p>)}</div>
      </section>
      <div className="reveal-metrics">
        <span>{t('common.network')} <strong>{summary.before.networkSize} → {summary.after.networkSize}</strong></span>
        <span>{t('common.externalTies')} <strong>{summary.before.externalTies} → {summary.after.externalTies}</strong></span>
        <span>{t('common.security')} <strong>{Math.round(summary.before.security)}% → {Math.round(summary.after.security)}%</strong></span>
        <span>{t('common.effectiveness')} <strong>{Math.round(summary.before.effectiveness * 100)}% → {Math.round(summary.after.effectiveness * 100)}%</strong></span>
      </div>
      <button className="submit-btn blue continue-btn" onClick={onContinue}>{summary.state.status === 'finished' ? t('reveal.viewResult') : t('reveal.continue', { turn: summary.state.turn })}</button>
    </main>
  );
}
