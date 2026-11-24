import { ACTIONS, type ActionDefinition, type ActionId, type Community, type GameEvent, type GameResult, type Side } from '@zero-networks/engine';
import type { Language } from './messages';

interface ActionText {
  title: string;
  shortTitle: string;
  description: string;
}

const russianActions: Record<ActionId, ActionText> = {
  intelKnown: { title: 'Киберразведка (известная сеть)', shortTitle: 'Разведка: известная', description: 'Раскрывает скрытые соседние узлы и связи вокруг видимых узлов.' },
  intelUnknown: { title: 'Киберразведка (неизвестная сеть)', shortTitle: 'Разведка: неизвестная', description: 'Раскрывает узлы в других частях скрытой хакерской сети.' },
  pruneKill: { title: 'Разрушение сети — отключение', shortTitle: 'Разрушение: отключение', description: 'Навсегда отключает 10% узлов, начиная с наименее связанных.' },
  pruneCapture: { title: 'Разрушение сети — изоляция', shortTitle: 'Разрушение: изоляция', description: 'Изолирует 10% узлов на пять ходов и раскрывает разведданные.' },
  securityPresence: { title: 'Активная киберзащита', shortTitle: 'Киберзащита', description: 'Вдвое снижает эффект кибератак в этом ходу и даёт временные разведданные.' },
  informationOps: { title: 'PR-кампания корпорации', shortTitle: 'PR-кампания', description: 'Снижает народную поддержку хакеров на 5.' },
  disruptMateriel: { title: 'Срыв каналов поставок', shortTitle: 'Срыв поставок', description: 'Сокращает логистические связи и отменяет захват вычислительных мощностей в этом ходу.' },
  reduceCapacity: { title: 'Подрыв оперативного потенциала', shortTitle: 'Снижение потенциала', description: 'Сокращает внешние оперативные связи.' },
  counterFinance: { title: 'Заморозка финансирования', shortTitle: 'Заморозка финансов', description: 'Сокращает финансовые связи и отменяет монетизацию ботнета и цифровую взаимопомощь.' },
  investigate: { title: 'Анализ сообщества сети', shortTitle: 'Анализ сообщества', description: 'Устанавливает принадлежность видимых узлов к сообществам.' },
  killNode: { title: 'Отключение выбранного узла', shortTitle: 'Отключение узла', description: 'Навсегда отключает видимый узел. Отключение нецентрального узла повышает поддержку хакеров.' },
  captureNode: { title: 'Изоляция выбранного узла', shortTitle: 'Изоляция узла', description: 'Изолирует видимый узел на пять ходов и раскрывает его окружение.' },
  grow: { title: 'Вербовка хакеров', shortTitle: 'Вербовка', description: 'Добавляет 10 узлов вплоть до предела в 60 участников.' },
  shrink: { title: 'Сокращение сети', shortTitle: 'Сокращение', description: 'Удаляет 10 узлов с низкой центральностью для повышения безопасности.' },
  centralize: { title: 'Централизация', shortTitle: 'Централизация', description: 'Повышает централизацию на 15 и добавляет связи с центральными узлами.' },
  decentralize: { title: 'Децентрализация', shortTitle: 'Децентрализация', description: 'Снижает централизацию на 15 и добавляет распределённые связи.' },
  increaseLogistical: { title: 'Усиление логистических связей', shortTitle: '+ Логистические связи', description: 'Добавляет 10 логистических связей для будущего дохода вычислительных мощностей.' },
  decreaseLogistical: { title: 'Ослабление логистических связей', shortTitle: '− Логистические связи', description: 'Удаляет 10 логистических связей для повышения безопасности.' },
  stealMateriel: { title: 'Захват вычислительных мощностей', shortTitle: 'Захват мощностей', description: 'Немедленно даёт 30 вычислительных мощностей. Может быть отменён срывом каналов поставок.' },
  increaseOperational: { title: 'Усиление оперативных связей', shortTitle: '+ Оперативные связи', description: 'Добавляет 15 оперативных связей для усиления кибератак.' },
  decreaseOperational: { title: 'Ослабление оперативных связей', shortTitle: '− Оперативные связи', description: 'Удаляет 15 оперативных связей для повышения безопасности.' },
  minorAttack: { title: 'Небольшая кибератака', shortTitle: 'Небольшая кибератака', description: 'Базово добавляет 20 пунктов компрометации; снижает народную поддержку на 2.' },
  majorAttack: { title: 'Крупная кибератака', shortTitle: 'Крупная кибератака', description: 'Базово добавляет 40 пунктов компрометации; снижает народную поддержку на 4.' },
  massiveAttack: { title: 'Масштабная кибератака', shortTitle: 'Масштабная кибератака', description: 'Базово добавляет 80 пунктов компрометации; снижает народную поддержку на 8.' },
  propaganda: { title: 'Хактивистская пропаганда', shortTitle: 'Пропаганда', description: 'Повышает народную поддержку хакеров на 5.' },
  increaseFinancial: { title: 'Усиление финансовых связей', shortTitle: '+ Финансовые связи', description: 'Добавляет 10 финансовых связей для будущего дохода денег.' },
  decreaseFinancial: { title: 'Ослабление финансовых связей', shortTitle: '− Финансовые связи', description: 'Удаляет 10 финансовых связей для повышения безопасности.' },
  illicitFundraising: { title: 'Монетизация ботнета', shortTitle: 'Монетизация ботнета', description: 'Превращает 30 вычислительных мощностей в $30. Может быть отменена заморозкой финансирования.' },
  socialServices: { title: 'Цифровая взаимопомощь', shortTitle: 'Взаимопомощь', description: 'Даёт 12 народной поддержки. Может быть отменена заморозкой финансирования.' },
};

const russianCommunities: Record<Community, string> = {
  logistical: 'Логистическое',
  operational: 'Оперативное',
  financial: 'Финансовое',
};

const russianCommunityPrepositional: Record<Community, string> = {
  logistical: 'логистическом',
  operational: 'оперативном',
  financial: 'финансовом',
};

const russianCommunityAdjective: Record<Community, string> = {
  logistical: 'логистические',
  operational: 'оперативные',
  financial: 'финансовые',
};

export function localizeAction(action: ActionDefinition, language: Language): ActionDefinition {
  return language === 'ru' ? { ...action, ...russianActions[action.id] } : action;
}

export function communityName(community: Community, language: Language): string {
  if (language === 'en') return community[0].toUpperCase() + community.slice(1);
  return russianCommunities[community];
}

export function sideName(side: Side, language: Language): string {
  if (language === 'en') return side === 'blue' ? 'Corporation' : 'Hackers';
  return side === 'blue' ? 'Корпорация' : 'Хакеры';
}

function plural(count: number, forms: [string, string, string]): string {
  const lastTwo = count % 100;
  const last = count % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return forms[2];
  if (last === 1) return forms[0];
  if (last >= 2 && last <= 4) return forms[1];
  return forms[2];
}

function nodes(count: number): string {
  return plural(count, ['узел', 'узла', 'узлов']);
}

const exactRussianEvents: Record<string, string> = {
  'Corporation holds position.': 'Корпорация воздерживается от действий.',
  'Hackers hold position.': 'Хакеры воздерживаются от действий.',
  'Public Relations Campaign reduces hacker support by 5.': 'PR-кампания снижает поддержку хакеров на 5.',
  'Hacktivist Propaganda increases hacker support by 5.': 'Хактивистская пропаганда повышает поддержку хакеров на 5.',
  'Freeze Funding cancels Digital Mutual Aid; its cost is refunded.': 'Заморозка финансирования отменяет действие «Цифровая взаимопомощь»; его стоимость возвращена.',
  'Digital Mutual Aid increases hacker support by 12.': 'Цифровая взаимопомощь повышает поддержку хакеров на 12.',
  'Disrupt Supply Channels cancels Hijack Computing Resources; its cost is refunded.': 'Срыв каналов поставок отменяет захват вычислительных мощностей; его стоимость возвращена.',
  'Hackers hijack 30 computing resources.': 'Хакеры захватывают 30 вычислительных мощностей.',
  'Freeze Funding cancels Botnet Monetization; its cost is refunded.': 'Заморозка финансирования отменяет монетизацию ботнета; её стоимость возвращена.',
  'Botnet Monetization generates $30.': 'Монетизация ботнета приносит $30.',
  'Hackers centralize command and control (+15 Centralization).': 'Хакеры централизуют командование и управление (+15 к централизации).',
  'Hackers decentralize into a more resilient structure (−15 Centralization).': 'Хакеры переходят к более устойчивой децентрализованной структуре (−15 к централизации).',
  'Corporation dismantles the entire network.': 'Корпорация полностью разрушает хакерскую сеть.',
  'Corporation wins after four consecutive turns at zero hacker support.': 'Корпорация побеждает: поддержка хакеров оставалась нулевой четыре хода подряд.',
};

export function gameEventText(event: GameEvent, language: Language): string {
  const text = event.text;
  if (language === 'en') return text;
  if (exactRussianEvents[text]) return exactRussianEvents[text];

  let match = text.match(/^Network grows by (\d+) nodes(?: in (\w+))?\.$/);
  if (match) return `Сеть расширяется на ${match[1]} ${nodes(Number(match[1]))}${match[2] ? ` в ${russianCommunityPrepositional[match[2] as Community]} сообществе` : ''}.`;
  match = text.match(/^Network shrinks by (\d+) nodes(?: from (\w+))?\.$/);
  if (match) return `Сеть сокращается на ${match[1]} ${nodes(Number(match[1]))}${match[2] ? ` в ${russianCommunityPrepositional[match[2] as Community]} сообществе` : ''}.`;
  match = text.match(/^(Logistical|Operational|Financial) ties change by (−?-?\d+)\.$/);
  if (match) {
    const community = match[1].toLowerCase() as Community;
    return `${russianCommunityAdjective[community][0].toUpperCase()}${russianCommunityAdjective[community].slice(1)} связи: изменение на ${match[2]}.`;
  }
  match = text.match(/^Known-network intelligence reveals (\d+) nodes and their visible ties\.$/);
  if (match) return `Разведка известной сети раскрывает ${match[1]} ${nodes(Number(match[1]))} и их видимые связи.`;
  match = text.match(/^Unknown-network intelligence reveals (\d+) nodes\.$/);
  if (match) return `Разведка неизвестной сети раскрывает ${match[1]} ${nodes(Number(match[1]))}.`;
  match = text.match(/^Active Cyber Defense reveals (\d+) temporary nodes and halves cyberattack effects\.$/);
  if (match) return `Активная киберзащита временно раскрывает ${match[1]} ${nodes(Number(match[1]))} и вдвое снижает эффект кибератак.`;
  match = text.match(/^Community analysis identifies (\d+) visible (\w+) nodes\.$/);
  if (match) return `Анализ идентифицирует видимые узлы в ${russianCommunityPrepositional[match[2] as Community]} сообществе: ${match[1]}.`;
  match = text.match(/^Dismantle Take Down permanently disconnects (\d+) least-connected nodes; one intelligence contact is lost\.$/);
  if (match) return `Разрушение сети навсегда отключает наименее связанные узлы: ${match[1]}. Один разведывательный контакт потерян.`;
  match = text.match(/^Dismantle Isolate isolates (\d+) nodes for five turns and reveals (\d+) contacts\.$/);
  if (match) return `Разрушение сети изолирует узлы на пять ходов: ${match[1]}. Раскрыто контактов: ${match[2]}.`;
  match = text.match(/^Central node (\d+) is taken down; Centralization falls by 10\.$/);
  if (match) return `Центральный узел ${match[1]} отключен; централизация снижается на 10.`;
  match = text.match(/^Non-central node (\d+) is taken down; hacker support rises by 4\.$/);
  if (match) return `Нецентральный узел ${match[1]} отключен; поддержка хакеров повышается на 4.`;
  match = text.match(/^Node (\d+) is isolated for five turns; (\d+) neighboring nodes are revealed\.$/);
  if (match) return `Узел ${match[1]} изолирован на пять ходов; раскрыто соседних узлов: ${match[2]}.`;
  match = text.match(/^(Minor|Major|Massive) cyberattack adds (\d+) Compromise and reduces support by (\d+)\.$/);
  if (match) {
    const tier = { Minor: 'Небольшая', Major: 'Крупная', Massive: 'Масштабная' }[match[1]];
    return `${tier} кибератака добавляет ${match[2]} пунктов компрометации и снижает поддержку на ${match[3]}.`;
  }
  match = text.match(/^The campaign ends at (\d+)% Compromise\.$/);
  if (match) return `Кампания завершается при уровне компрометации ${match[1]}%.`;
  match = text.match(/^(\d+) isolated nodes return to the network\.$/);
  if (match) return `Изолированные узлы возвращаются в сеть: ${match[1]}.`;
  match = text.match(/^Compromise decays from (\d+)% to (\d+)%\.$/);
  if (match) return `Уровень компрометации снижается с ${match[1]}% до ${match[2]}%.`;
  match = text.match(/^Hackers receive (\d+) computing resources and \$(\d+) from external ties\.$/);
  if (match) return `Хакеры получают от внешних связей вычислительные мощности: ${match[1]}; деньги: $${match[2]}.`;
  return text;
}

const exactRussianErrors: Record<string, string> = {
  'The game is already finished.': 'Игра уже завершена.',
  'You can queue at most three actions per turn.': 'Можно назначить не более трёх действий за ход.',
  'Unknown action.': 'Неизвестное действие.',
  'Unknown community.': 'Неизвестное сообщество.',
  'Disrupt Supply Channels requires an identified visible Logistical node.': 'Для срыва каналов поставок нужен идентифицированный видимый логистический узел.',
  'Disrupt Operational Capacity requires an identified visible Operational node.': 'Для подрыва оперативного потенциала нужен идентифицированный видимый оперативный узел.',
  'Freeze Funding requires an identified visible Financial node.': 'Для заморозки финансирования нужен идентифицированный видимый финансовый узел.',
  'The network is already at its 60-member limit.': 'Сеть уже достигла предела в 60 участников.',
  'There are no active nodes to remove.': 'Нет активных узлов, которые можно удалить.',
  'There are no active nodes to prune.': 'Нет активных узлов для сокращения сети.',
  'A cyberattack requires at least one active Operational node.': 'Для кибератаки нужен хотя бы один активный оперативный узел.',
  'Insufficient computing resources for the queued actions.': 'Недостаточно вычислительных мощностей для выбранных действий.',
  'Insufficient money for the queued actions.': 'Недостаточно денег для выбранных действий.',
};

export function validationText(error: string, language: Language): string {
  if (language === 'en') return error;
  if (exactRussianErrors[error]) return exactRussianErrors[error];
  for (const action of Object.values(ACTIONS)) {
    if (error === `${action.title} is not available to blue.`) return `Действие «${russianActions[action.id].title}» недоступно Корпорации.`;
    if (error === `${action.title} is not available to red.`) return `Действие «${russianActions[action.id].title}» недоступно Хакерам.`;
    if (error === `${action.title} requires a community.`) return `Для действия «${russianActions[action.id].title}» нужно выбрать сообщество.`;
    if (error === `${action.title} requires a visible active node.`) return `Для действия «${russianActions[action.id].title}» нужен видимый активный узел.`;
  }
  return error;
}

export function resultTitle(result: GameResult, language: Language): string {
  if (language === 'en') return result.title;
  return {
    'strong-blue': 'Убедительная победа Корпорации',
    'weak-blue': 'Небольшая победа Корпорации',
    draw: 'Ничья',
    'weak-red': 'Небольшая победа Хакеров',
    'strong-red': 'Убедительная победа Хакеров',
  }[result.victory];
}

export function resultReason(reason: string, language: Language): string {
  if (language === 'en') return reason;
  if (reason === 'The hacker network has been completely dismantled.') return 'Хакерская сеть полностью разрушена.';
  if (reason === 'Hackers’ popular support remained at 0% for four consecutive turns.') return 'Народная поддержка хакеров оставалась на уровне 0% четыре хода подряд.';
  const match = reason.match(/^The 15-turn campaign ends at (\d+)% Compromise\.$/);
  if (match) return `Кампания из 15 ходов завершается при уровне компрометации ${match[1]}%.`;
  return reason;
}
