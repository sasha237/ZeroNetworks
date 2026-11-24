import { useMemo, useState } from 'react';
import {
  GRAPH_HEIGHT,
  GRAPH_WIDTH,
  activeNodes,
  isCentralNode,
  nodeById,
  type ActionOrder,
  type Community,
  type GameState,
  type Side,
} from '@zero-networks/engine';
import { useI18n } from '../i18n';
import { communityName } from '../i18n/gameText';

const colors: Record<Community, string> = {
  logistical: '#c084fc',
  operational: '#facc15',
  financial: '#22d3ee',
};

export function NetworkGraph({
  game,
  side,
  canQueue,
  onQueue,
  onTag,
}: {
  game: GameState;
  side: Side;
  canQueue: boolean;
  onQueue: (order: ActionOrder) => void;
  onTag: (nodeId: number) => void;
}) {
  const { t } = useI18n();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const visible = useMemo(
    () => side === 'red' ? game.nodes : game.nodes.filter((node) => game.visibleNodes.includes(node.id)),
    [game, side],
  );
  const visibleIds = new Set(visible.map((node) => node.id));
  const known = new Set(side === 'red' ? game.nodes.map((node) => node.id) : game.knownNodes);
  const selected = selectedId === null ? undefined : nodeById(game, selectedId);
  const activeIds = new Set(activeNodes(game).map((node) => node.id));
  const getCommunity = (community: Community) => t(`community.${community}`);

  return (
    <section className={`network-panel panel ${side}`}>
      <div className="network-heading">
        <div><span className="eyebrow">{t(side === 'blue' ? 'graph.intelligenceMap' : 'graph.organizationMap')}</span><h2>{t(side === 'blue' ? 'graph.knownNetwork' : 'graph.darkNetwork')}</h2></div>
        <div className="network-legend">
          <span className="logistical">{t('community.logistical')}</span><span className="operational">{t('community.operational')}</span><span className="financial">{t('community.financial')}</span>
        </div>
      </div>
      <div className="network-canvas">
        <svg className="network-graph" viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`} role="group" aria-label={t(side === 'blue' ? 'graph.visibleNetwork' : 'graph.fullNetwork')}>
          <defs>
            <radialGradient id="graph-radar"><stop offset="0%" stopColor="#22d3ee" stopOpacity=".05" /><stop offset="100%" stopColor="#22d3ee" stopOpacity="0" /></radialGradient>
          </defs>
          <circle cx="500" cy="320" r="290" fill="url(#graph-radar)" />
          <g className="radar-rings" aria-hidden="true">
            {[105, 195, 285].map((radius) => <circle key={radius} cx="500" cy="320" r={radius} />)}
            <path d="M70 320H930M500 25V605" />
          </g>
          <g className="network-links" aria-hidden="true">
            {visible.flatMap((node) => node.links.filter((id) => visibleIds.has(id) && id > node.id).map((id) => {
              const other = nodeById(game, id)!;
              const identified = known.has(node.id) && known.has(other.id);
              const color = identified && node.community === other.community ? colors[node.community] : '#7890a0';
              return <line key={`${node.id}-${id}`} x1={node.x} y1={node.y} x2={other.x} y2={other.y} stroke={color} className="network-link" />;
            }))}
          </g>
          <g>
            {visible.map((node) => {
              const identified = known.has(node.id);
              const radius = 6 + Math.min(14, Math.sqrt(node.centrality) * 18);
              const central = activeIds.has(node.id) && isCentralNode(game, node.id);
              const classes = [
                'network-node',
                identified ? node.community : 'unknown',
                node.capturedUntil !== null ? 'captured' : '',
                game.taggedNodes.includes(node.id) ? 'tagged' : '',
                central ? 'central' : '',
                selectedId === node.id ? 'selected' : '',
              ].filter(Boolean).join(' ');
              const role = identified ? getCommunity(node.community) : t('graph.unknownCommunity');
              const captured = node.capturedUntil !== null ? `, ${t('graph.captured')}` : '';
              const returns = node.capturedUntil !== null ? ` · ${t('graph.returnsTurn', { turn: node.capturedUntil })}` : '';
              return (
                <g
                  key={node.id}
                  className={classes}
                  transform={`translate(${node.x} ${node.y})`}
                  role="button"
                  tabIndex={0}
                  aria-label={t('graph.nodeLabel', { id: node.id, community: role, centrality: Math.round(node.centrality * 100), captured })}
                  onClick={() => setSelectedId(node.id)}
                  onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setSelectedId(node.id); }}
                >
                  <title>{t('graph.nodeTitle', { id: node.id, community: role, centrality: Math.round(node.centrality * 100), return: returns })}</title>
                  {central && <circle r={radius + 5} className="centrality-ring" />}
                  <circle r={radius + 3} className="node-halo" />
                  <circle r={radius} fill={identified ? colors[node.community] : '#d9e6ec'} className="node-core" />
                  <text y={radius + 14} textAnchor="middle">{node.id}</text>
                </g>
              );
            })}
          </g>
          <g className="graph-caption" aria-hidden="true">
            <text x="24" y="34">{t(side === 'blue' ? 'graph.nodesUnresolved' : 'graph.activeNodes', { count: side === 'blue' ? game.nodes.length - game.visibleNodes.length : activeIds.size })}</text>
            <text x="976" y="604" textAnchor="end">{t('graph.nodeSize')}</text>
          </g>
        </svg>
        {selected && (
          <div className="node-inspector">
            <button className="node-close" onClick={() => setSelectedId(null)} aria-label={t('graph.closeNode')}>×</button>
            <span className="eyebrow">{t('graph.node', { id: selected.id })}</span>
            <strong>{known.has(selected.id) ? getCommunity(selected.community).toUpperCase() : t('graph.unknownCommunity').toUpperCase()}</strong>
            <dl>
              <div><dt>{t('graph.centrality')}</dt><dd>{Math.round(selected.centrality * 100)}%</dd></div>
              <div><dt>{t('graph.directTies')}</dt><dd>{selected.links.filter((id) => activeIds.has(id)).length}</dd></div>
              <div><dt>{t('graph.status')}</dt><dd>{selected.capturedUntil === null ? t('graph.active') : t('graph.capturedUntil', { turn: selected.capturedUntil })}</dd></div>
            </dl>
            {side === 'blue' && (
              <div className="node-actions">
                <button onClick={() => onTag(selected.id)}>{t(game.taggedNodes.includes(selected.id) ? 'graph.untag' : 'graph.tag')}</button>
                <button disabled={!canQueue || selected.capturedUntil !== null} onClick={() => onQueue({ id: 'captureNode', targetNodeId: selected.id })}>{t('graph.capture')}</button>
                <button className="danger" disabled={!canQueue || selected.capturedUntil !== null} onClick={() => onQueue({ id: 'killNode', targetNodeId: selected.id })}>{t('graph.kill')}</button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
