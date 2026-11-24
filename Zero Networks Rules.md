# Zero Networks — Game Rules

## Overview

**Zero Networks** is a turn-based strategy game about a conflict between a **Corporation** and a clandestine **Hacker network**. It is a thematic adaptation of the reconstructed Dark Networks ruleset: the setting and action names have changed, while the underlying mechanics remain intact.

- A campaign lasts **15 turns**.
- Each side queues up to **three actions per turn**.
- Players plan secretly; both sides’ orders resolve simultaneously.
- The Corporation initially sees only a small part of the hacker network.
- The Hackers see their entire network.
- The Hackers want a high final **Compromise Level**. The Corporation wants to suppress it.
- Both interfaces display **Hackers’ Popular Support**.

The central trade-off is:

- Larger, centralized, externally connected networks are more effective but easier to detect and disrupt.
- Smaller, decentralized, isolated networks are more secure but less effective.
- Popular support improves both effectiveness and security.

## 1. Network and resources

The hacker network contains up to **60 nodes**, divided among three communities:

- **Purple — Logistical:** produces computing resources.
- **Yellow — Operational:** conducts cyberattacks.
- **Cyan — Financial:** produces money.

Node size represents **betweenness centrality**: how often a node lies on shortest paths between other nodes. Overall centralization measures how strongly the network depends on central actors.

External ties are separate from internal node-to-node links:

- Logistical, Operational, and Financial ties each range from **0–30**.
- More external ties improve resources or cyberattacks but reduce security.

### Starting state

| Attribute | Initial value |
|---|---:|
| Network size | 30–45 nodes |
| Centralization | 0–50% |
| Each external-tie track | 5–15 |
| Computing resources | 40–90 |
| Money | $20–45 |
| Hackers’ Popular Support | 30–60% |
| Compromise Level | 0–20% |
| Corporation visibility | A few nodes |

Additional setup rules:

- **[H]** The Corporation starts with three random visible nodes. Their community membership remains unknown until analyzed.
- **[H]** The Corporation can see aggregate network statistics but not the hidden graph.
- **[H]** Resources have no upper cap. Support, Compromise, and Centralization are clamped to 0–100%.

## 2. Turn sequence

The study guide confirms three choices and simultaneous resolution. The detailed sequence below is **[H]**:

1. **Planning**
   - Each player queues up to three actions.
   - Actions may be repeated; empty slots count as passing.
   - Targeted Take Down and Isolate each consume one Corporation action slot.
   - The Hackers must be able to pay the combined cost of queued actions.

2. **Resolution**
   - Reveal both players’ choices.
   - Apply support effects, structural changes, external-tie changes, intelligence, disruption, and node removal.
   - Resolve cyberattacks using the **start-of-turn** network values.
   - Active Cyber Defense affects cyberattacks this turn.
   - Changed ties and network structure affect income and cyberattacks from the next turn.
   - Costs for disrupted Hacker resource actions are refunded.

3. **End of turn and upkeep**
   - Check the four-turn support victory condition.
   - Return isolated nodes whose five-turn isolation has ended.
   - Reduce Compromise to `floor(Compromise / 2)`.
   - Gain computing resources equal to current Logistical ties.
   - Gain money equal to current Financial ties.
   - Remove temporary intelligence granted by Active Cyber Defense.
   - Update centrality, network statistics, history charts, and the event log.

Using start-of-turn values for cyberattacks rewards preparing the network one turn before an operation and avoids making action-slot order decisive.

## 3. Corporation actions

Corporation actions consume action slots but have no separate resource pool.

### Global

| Action | Effect |
|---|---|
| Network Intelligence — Known Network | Reveal hidden neighbors and visible ties around known nodes. |
| Network Intelligence — Unknown Network | Reveal nodes elsewhere in the hidden network. |
| Dismantle Network — Take Down | Permanently disconnect 10% of active nodes, beginning with the least connected. |
| Dismantle Network — Isolate | Isolate 10% of active nodes for five turns, beginning with the least connected; reveal intelligence. |
| Active Cyber Defense | Halve cyberattack effects this turn and temporarily reveal additional nodes. |
| Public Relations Campaign | Reduce Hackers’ Popular Support by **5**. **[H]** |
| Analyze Network Community | Identify community membership for visible nodes in the selected community. |

**[H]** Dismantle actions target `max(1, round(network size × 10%))` nodes.

### Logistical, Operational, and Financial

| Action | Category | Effect |
|---|---|---|
| Disrupt Supply Channels | Logistical | Reduce Logistical ties and cancel Hijack Computing Resources this turn. |
| Disrupt Operational Capacity | Operational | Reduce Operational external ties. |
| Freeze Funding | Financial | Reduce Financial ties and cancel Monetize Botnet and Digital Mutual Aid. |

Each disruption action requires at least one identified, visible, active node in the corresponding community.

### Targeted node actions

Clicking a visible node offers Tag, Isolate, and Take Down:

- **Tag:** Player annotation only; no game effect.
- **Isolate Targeted Node:** Remove that node for five turns and reveal nearby contacts.
- **Take Down Targeted Node:** Permanently disconnect a visible node and recalculate network metrics.

**[H]** A node is central if it is in the top 20% by betweenness centrality.

- Taking down a central node additionally removes **10 Centralization points**.
- Taking down a non-central node gives the Hackers **+4 support**.
- Every Corporation takedown hides one other random visible node, representing a lost intelligence contact.
- Targeted isolation reveals nearby nodes and does not cause these penalties.

## 4. Hacker actions

### Global

| Action | Effect |
|---|---|
| Recruit Hackers | Add 10 nodes, up to the 60-member limit. |
| Reduce Network | Remove 10 low-centrality nodes to improve security. |
| Centralize | Increase Centralization by **15** and add hub links. **[H]** |
| Decentralize | Reduce Centralization by **15** and add distributed links. **[H]** |

Centralization changes stop at the nearest achievable boundary. The Hackers choose the community focus for recruitment and reduction.

### Logistical

| Action | Cost | Effect |
|---|---:|---|
| Increase Logistical Ties | Free | Add **10** Logistical ties, increasing future computing-resource income and reducing security. |
| Decrease Logistical Ties | Free | Remove **10** Logistical ties to improve security. **[H]** |
| Hijack Computing Resources | $15 | Immediately gain **30** computing resources. **[H]** Can be cancelled by Disrupt Supply Channels. |

### Operational

| Action | Cost | Effect |
|---|---:|---|
| Increase Operational Ties | Free | Add **15** Operational ties, strengthening cyberattacks and reducing security. |
| Decrease Operational Ties | Free | Remove **15** Operational ties to improve security. |
| Minor Cyberattack | 30 computing resources + $30 | Base **20 Compromise**; lose **2 support**. |
| Major Cyberattack | 60 computing resources + $45 | Base **40 Compromise**; lose **4 support**. |
| Massive Cyberattack | 120 computing resources + $60 | Base **80 Compromise**; lose **8 support**. |
| Hacktivist Propaganda | Free | Increase Hackers’ Popular Support by **5**. **[H]** |

Cyberattacks depend on overall network size, Operational community size, Operational ties, Centralization, and Popular Support. Each queued cyberattack is resolved and paid for separately.

### Financial

| Action | Cost | Effect |
|---|---:|---|
| Increase Financial Ties | Free | Add **10** Financial ties, increasing future money income and reducing security. |
| Decrease Financial Ties | Free | Remove **10** Financial ties to improve security. **[H]** |
| Monetize Botnet | 30 computing resources | Gain **$30**. **[H]** Can be cancelled by Freeze Funding. |
| Digital Mutual Aid | $30 | Gain **12 popular support**. **[H]** Can be cancelled by Freeze Funding. |

## 5. Numerical engine

These formulas are all **[H]**, designed to preserve the documented relationships while remaining deterministic and implementable.

Let:

- `N` = active network size
- `Op` = active Operational nodes, capped at 20 for the cyberattack formula
- `C` = Centralization percentage
- `L`, `O`, `F` = external-tie tracks
- `X = L + O + F`
- `S` = Hackers’ Popular Support

### Network security

```text
Security Q =
25 × [(1 − N/60) + (1 − C/100) + (1 − X/90) + S/100]
```

Clamp `Q` to 0–100. Small, decentralized, isolated, popular networks therefore have high security.

Corporation disruption and intelligence effectiveness:

```text
D = 1 − Q/200
```

The Corporation retains 50–100% effectiveness depending on Hacker security.

- Disrupt Supply Channels removes `max(1, round(10 × D))` Logistical ties.
- Freeze Funding removes `max(1, round(10 × D))` Financial ties.
- Disrupt Operational Capacity removes `max(1, round(15 × D))` Operational ties.
- Each intelligence action reveals `max(1, round(4 × D))` nodes.

Intelligence targeting:

- Known Network selects hidden neighbors of visible nodes.
- Unknown Network selects random hidden nodes.
- Dismantle Isolate selects neighbors of isolated nodes.
- Targeted Isolate reveals the normal amount plus two additional neighboring nodes.
- Active Cyber Defense reveals the normal amount temporarily.

### Cyberattacks

Calculate effectiveness from start-of-turn values:

```text
E = 0.5 + 0.1 ×
    [N/60 + min(Op/20, 1) + O/30 + C/100 + S/100]
```

`E` ranges from 0.5 to 1.0.

If the Corporation used `P` Active Cyber Defense actions:

```text
Compromise gained = ceil(Base × E × 0.5^P)
```

| Cyberattack | Base Compromise | Support loss |
|---|---:|---:|
| Minor | 20 | −2 |
| Major | 40 | −4 |
| Massive | 80 | −8 |

## 6. Victory

### Early victory

The source material confirms an early victory after popular support remains too low for four consecutive turns, but gives no threshold.

- **[H]** If Hacker support is **0% at the end of four consecutive turns**, the Corporation wins immediately.
- Any support above 0% resets the streak.
- **[H]** The Corporation also wins immediately if no active or isolated network members remain.

### Final scoring

After turn 15, use final Compromise Level:

- **0–20:** strong Corporation victory
- **21–40:** weak Corporation victory
- **41–60:** draw
- **61–80:** weak Hackers victory
- **81–100:** strong Hackers victory

The exact boundary assignments are **[H]** because the original bands overlap at 20, 40, 60, and 80. No early Hacker victory at 100% is documented, so none is added.

## 7. Design assessment

The system preserves the source game’s strongest ideas:

- **Hackers:** build an economy through Logistical and Financial ties, then choose when to expose the network by recruiting, centralizing, and expanding Operational capacity.
- **Corporation:** balance intelligence against disruption, active defense, and public-pressure operations.
- **Isolation versus Take Down:** Isolation provides intelligence and avoids backlash; Take Down is permanent but can reduce visibility and strengthen Hacker support.
- **Timing:** Compromise decays, so the Hackers must sustain operations rather than rely on one large cyberattack. The Corporation must decide whether to mitigate cyberattacks now or weaken the network’s future capacity.

The result is playable and implementation-ready, but the **[H]** values require playtesting before being considered balanced or faithful to the unavailable original engine.
