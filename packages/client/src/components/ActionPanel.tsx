import { useState } from 'react';
import {
  ACTIONS,
  CATEGORIES,
  COMMUNITIES,
  actionsFor,
  validateOrders,
  type ActionOrder,
  type Category,
  type Community,
  type GameState,
  type Side,
} from '@zero-networks/engine';
import { useI18n } from '../i18n';
import { communityName, localizeAction, validationText } from '../i18n/gameText';

export function ActionPanel({
  side,
  game,
  draft,
  onQueue,
  onRemove,
  onSubmit,
}: {
  side: Side;
  game: GameState;
  draft: ActionOrder[];
  onQueue: (order: ActionOrder) => void;
  onRemove: (index: number) => void;
  onSubmit: () => void;
}) {
  const { language, t } = useI18n();
  const [category, setCategory] = useState<Category>('global');
  const [community, setCommunity] = useState<Community>('logistical');
  const validation = validateOrders(game, side, draft);
  const actions = actionsFor(side, category).filter((action) => action.targeted !== 'node');
  const queuedMateriel = draft.reduce((sum, order) => sum + ACTIONS[order.id].cost.materiel, 0);
  const queuedMoney = draft.reduce((sum, order) => sum + ACTIONS[order.id].cost.money, 0);

  return (
    <aside className={`action-panel panel ${side}`}>
      <div className="panel-heading">
        <div><span className="eyebrow">{t(side === 'blue' ? 'actions.stateCommand' : 'actions.networkCommand')}</span><h2>{t('actions.plan')}</h2></div>
        <span className={`side-chip ${side}`}>{t(side === 'blue' ? 'common.blue' : 'common.red')}</span>
      </div>
      <div className="queue-header"><span>{t('actions.turnAction')}</span><span>{t('actions.cost')}</span></div>
      <div className="action-queue">
        {Array.from({ length: 3 }, (_, index) => {
          const order = draft[index];
          if (!order) return (
            <div className="queued-action empty" key={index}><span className="queue-index">{index + 1}</span><span>{t('actions.add')}</span><span className="cost"><b>0</b><b>0</b></span></div>
          );
          const action = localizeAction(ACTIONS[order.id], language);
          return (
            <div className="queued-action" key={`${order.id}-${index}`}>
              <span className="queue-index">{index + 1}</span>
              <span>{action.shortTitle}{order.community ? ` · ${communityName(order.community, language).slice(0, 3).toUpperCase()}` : ''}</span>
              <span className="cost"><b>{action.cost.materiel}</b><b>{action.cost.money}</b></span>
              <button onClick={() => onRemove(index)} aria-label={t('actions.remove', { action: action.title })}>×</button>
            </div>
          );
        })}
      </div>
      {side === 'red' && <div className="queue-total">{t('actions.queuedCost')} <span>{queuedMateriel} {t('common.materiel')} · ${queuedMoney}</span></div>}
      {!validation.valid && <p className="validation-error" role="alert">{validationText(validation.errors[0], language)}</p>}
      <button className={`submit-btn ${side}`} onClick={onSubmit} disabled={!validation.valid}>{t('actions.submit')}</button>

      <div className="action-library">
        <div className="category-tabs" role="tablist" aria-label={t('actions.categories')}>
          {CATEGORIES.map((item) => (
            <button key={item} role="tab" aria-selected={category === item} className={`${category === item ? 'active' : ''} ${item}`} onClick={() => setCategory(item)}>
              {t(`category.${item}`)}
            </button>
          ))}
        </div>
        <label className="community-select">{t('actions.communityFocus')}
          <select value={community} onChange={(event) => setCommunity(event.target.value as Community)}>
            {COMMUNITIES.map((item) => <option key={item} value={item}>{communityName(item, language)}</option>)}
          </select>
        </label>
        <div className="available-actions">
          {actions.map((baseAction) => {
            const action = localizeAction(baseAction, language);
            const order: ActionOrder = { id: action.id, ...(action.targeted === 'community' ? { community } : {}) };
            const check = validateOrders(game, side, [...draft, order]);
            return (
              <button
                key={action.id}
                className="available-action"
                disabled={!check.valid}
                title={check.valid ? action.description : check.errors.map((error) => validationText(error, language)).join(' ')}
                onClick={() => onQueue(order)}
              >
                <span><strong>{action.shortTitle}</strong><small>{action.description}</small></span>
                <span className="action-cost"><b>{action.cost.materiel}</b><b>{action.cost.money}</b></span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
