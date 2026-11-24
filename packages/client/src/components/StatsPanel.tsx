import { getMetrics, type Side } from '@zero-networks/engine';
import type { StoreState } from '../game/store';
import { useI18n } from '../i18n';
import { communityName } from '../i18n/gameText';

function Gauge({ label, value, tone, large = false }: { label: string; value: number; tone: string; large?: boolean }) {
  const { t } = useI18n();
  const circumference = 2 * Math.PI * 44;
  return (
    <div className={`gauge ${tone}${large ? ' large' : ''}`}>
      <svg viewBox="0 0 110 110" aria-label={t('stats.gaugeLabel', { label, value })}>
        <circle className="gauge-track" cx="55" cy="55" r="44" />
        <circle className="gauge-value" cx="55" cy="55" r="44" strokeDasharray={`${circumference * value / 100} ${circumference}`} />
      </svg>
      <strong>{value}%</strong><span>{label}</span>
    </div>
  );
}

function Meter({ label, value, max, tone }: { label: string; value: number; max: number; tone: string }) {
  return (
    <div className="metric-meter">
      <div><span>{label}</span><strong>{value}{max === 100 ? '%' : ` / ${max}`}</strong></div>
      <div className="meter-track"><span className={tone} style={{ width: `${Math.max(0, Math.min(100, value / max * 100))}%` }} /></div>
    </div>
  );
}

export function StatsPanel({ store, side }: { store: StoreState; side: Side }) {
  const { language, t } = useI18n();
  const game = store.game;
  const metrics = getMetrics(game);
  const known = game.knownNodes.filter((id) => game.visibleNodes.includes(id)).length;
  const history = [store.initialSnapshot, ...store.history];
  const latest = history.at(-1)!;
  const plot = { left: 26, right: 210, top: 12, bottom: 126 };
  const turnTicks = [...new Set([0, 5, 10, game.maxTurns])].filter((turn) => turn <= game.maxTurns);
  const x = (turn: number) => plot.left + turn / game.maxTurns * (plot.right - plot.left);
  const y = (value: number) => plot.bottom - value / 100 * (plot.bottom - plot.top);
  const pathFor = (metric: 'security' | 'effectiveness') => history.map((point, index) => `${index === 0 ? 'M' : 'L'}${x(point.turn)} ${y(point[metric])}`).join(' ');
  return (
    <aside className="stats-column">
      <section className="panel status-panel">
        <div className="panel-subheading"><span>{t('stats.terrorSupport')}</span><span>{t('stats.live')}</span></div>
        <div className="gauges">
          <Gauge label={t('stats.terrorLevel')} value={game.terror} tone="terror" large />
          <Gauge label={t('stats.terroristSupport')} value={game.support} tone="support" />
        </div>
        <Meter label={t('common.centralization')} value={game.centralization} max={100} tone="central" />
        <Meter label={t('stats.networkSize')} value={metrics.networkSize} max={60} tone="size" />
        <Meter label={t('common.externalTies')} value={metrics.externalTies} max={90} tone="ties" />
        <div className="tie-breakdown">
          <span className="logistical">{communityName('logistical', language)[0]} <b>{game.ties.logistical}</b></span>
          <span className="operational">{communityName('operational', language)[0]} <b>{game.ties.operational}</b></span>
          <span className="financial">{communityName('financial', language)[0]} <b>{game.ties.financial}</b></span>
        </div>
      </section>
      <section className="panel resource-panel">
        {side === 'red' ? (
          <><div className="panel-subheading"><span>{t('stats.resources')}</span><span>{t('stats.available')}</span></div>
            <div className="resource-values"><span><small>{t('stats.materiel')}</small><strong>{game.materiel}</strong></span><span><small>{t('stats.money')}</small><strong>${game.money}</strong></span></div>
            <p className="resource-income">{t('stats.nextUpkeep', { materiel: game.ties.logistical, money: game.ties.financial })}</p></>
        ) : (
          <><div className="panel-subheading"><span>{t('stats.intelligence')}</span><span>{t('stats.partialView')}</span></div>
            <div className="resource-values"><span><small>{t('stats.visible')}</small><strong>{game.visibleNodes.length}</strong></span><span><small>{t('stats.identified')}</small><strong>{known}</strong></span></div>
            <p className="resource-income">{t('stats.hiddenNodes', { count: Math.max(0, game.nodes.length - game.visibleNodes.length) })}</p></>
        )}
      </section>
      <section className="panel balance-panel">
        <div className="panel-subheading"><span>{t('stats.securityEffectiveness')}</span><span>{t('stats.history')}</span></div>
        <svg className="balance-chart" viewBox="0 0 220 160" aria-label={t('stats.chartLabel', { security: Math.round(latest.security), effectiveness: Math.round(latest.effectiveness) })}>
          <path className="chart-grid" d={[100, 50, 0].map((value) => `M${plot.left} ${y(value)}H${plot.right}`).join(' ')} />
          <path className="chart-grid" d={turnTicks.map((turn) => `M${x(turn)} ${plot.top}V${plot.bottom}`).join(' ')} />
          {[100, 50, 0].map((value) => <text key={value} x="21" y={y(value) + 2} textAnchor="end">{value}</text>)}
          {turnTicks.map((turn) => <text key={turn} x={x(turn)} y="140" textAnchor="middle">{turn}</text>)}
          <line className="chart-marker" x1={x(latest.turn)} x2={x(latest.turn)} y1={plot.top} y2={plot.bottom} />
          <path className="security-curve" d={pathFor('security')} />
          <path className="effectiveness-curve" d={pathFor('effectiveness')} />
          {history.map((point) => (
            <g key={point.turn}>
              <circle className="security-point" cx={x(point.turn)} cy={y(point.security)} r={point.turn === latest.turn ? 4 : 2.5}>
                <title>{t('stats.pointTitle', { turn: point.turn, security: Math.round(point.security), effectiveness: Math.round(point.effectiveness) })}</title>
              </circle>
              <circle className="effectiveness-point" cx={x(point.turn)} cy={y(point.effectiveness)} r={point.turn === latest.turn ? 4 : 2.5}>
                <title>{t('stats.pointTitle', { turn: point.turn, security: Math.round(point.security), effectiveness: Math.round(point.effectiveness) })}</title>
              </circle>
            </g>
          ))}
          <text x="26" y="155">{t('stats.securityShort')} {Math.round(latest.security)}%</text>
          <text x="210" y="155" textAnchor="end">{t('stats.effectivenessShort')} {Math.round(latest.effectiveness)}%</text>
        </svg>
      </section>
    </aside>
  );
}
