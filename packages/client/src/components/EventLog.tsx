import type { StoreState } from '../game/store';
import { useI18n } from '../i18n';
import { gameEventText } from '../i18n/gameText';

export function EventLog({ store }: { store: StoreState }) {
  const { language, t } = useI18n();
  const records = [...store.history].reverse().slice(0, 4);
  return (
    <section className="event-log panel">
      <div className="panel-subheading"><span>{t('log.title')}</span><span>{t('log.resolved', { count: store.history.length })}</span></div>
      <div className="event-scroll" aria-live="polite">
        {records.length === 0 && <p className="empty-log">{t('log.empty')}</p>}
        {records.map((record) => (
          <article className="event-turn" key={record.turn}>
            <h3>{t('log.turn', { turn: record.turn })}</h3>
            <div>
              {record.events.map((event, index) => (
                <p key={`${record.turn}-${index}`} className={`event ${event.actor}`}>
                  <span className="event-marker" />{gameEventText(event, language)}
                </p>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
