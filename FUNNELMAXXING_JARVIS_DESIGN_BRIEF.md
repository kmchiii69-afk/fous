# Funnelmaxxing Pro → "JARVIS" — Design Brief

**For:** Claude Design
**From:** Cameron Fous (Quantum Cipher Lab) via Claude Code
**Goal:** Turn an existing, fully-wired analytics dashboard into a cinematic, living, JARVIS-style command center — epic motion, a funnel you can *watch people flow through in real time*, and an AI assistant HUD that tells the operator what to do next.
**Hand-back:** Design specs + mockups + motion specs + any vector/Lottie assets. Claude Code will build the production React from your handoff. **You are designing the experience; you are not shipping the code.** See §7 for exactly what to send back.

> **⚠️ REVISED SCOPE (read before anything):** You are designing the **AESTHETIC SYSTEM ONLY** — the *look, motion, and components' styling*: the living-funnel art direction, the JARVIS orb, palette, type, glow/shadow recipes, gauge faces, the visual treatment of cards/tables/tickers. **You are NOT responsible for deciding which data appears or how much of it shows — Claude Code owns the data layout and guarantees all 100+ metrics survive.** So: give us a gorgeous, dense, reusable HUD style system and styled component examples; do **not** hand back a simplified or summarized version of the dashboard. Density is fixed and non-negotiable (see ⛔ below); your job is to make that density look like the future. Style the wall of numbers — never thin it out.

---

## ⛔ READ THIS FIRST — THE ONE WAY THIS DESIGN FAILS

**This is a DATA-MAXIMALIST command center. It is NOT a summary dashboard. It is NOT a clean, minimal, breathing-room landing page.**

The existing dashboard surfaces **100+ distinct live metrics across 14 sections** (every one is enumerated in §4.2 and §5.7). The operator fought for months to get every single one of those numbers on the page. **A previous design attempt compressed all of it into a tiny, pretty summary — that is the #1 failure mode and it is an automatic rejection.**

Hard rules, no exceptions:

1. **If your design shows fewer numbers than the current page, it has failed.** Period. More density, never less.
2. **"Minimal," "clean," "simplified," "summarized," "at-a-glance only," "representative sample"** — all WRONG framings here. The reference points are a **Bloomberg terminal, NASA mission control, a Stark HUD**: dense walls of live numbers that *also* look cinematic. **Density IS the aesthetic.** Make the density beautiful — do not reduce it.
3. **The cinematic layer (living funnel, JARVIS, glow, motion) is ADDITIVE.** It sits *on top of* and *around* every existing number. It never replaces a metric, never collapses a section, never swaps a vibe for a value.
4. **Every item in §5.7 must be visibly present and legible in your mockups** — every count, every conversion %, every drop-off, every dollar figure, every split, every table (with all its rows), every time-series, every per-rep and per-broadcast and per-source breakdown. All 14 sections survive.
5. **Do not pick a "representative subset" of the data to show.** Show the structure for ALL of it. If a table has N rows in real life, design the table, not three example rows with an implied "etc."

**Before handing anything back, run the completeness checklist in §7.2. If even one §5.7 line is missing from your mockups, it is not done.** When in doubt: show more, not less.

---

## 0. TL;DR of the ask

Make this thing look and feel like Tony Stark's heads-up display for a sales funnel. Specifically Cameron asked for:

- **"crazy epic visuals"** — a premium, dark, holographic command-center aesthetic.
- **"moving flows showing how the funnel works"** — the funnel is alive: edges glow and pulse, volume moves.
- **"visualizations of users traveling through the funnel in loops"** — animated particles, each one a person/lead, streaming from traffic sources down through the funnel, splitting at the qualify gate, dropping off where the funnel leaks, and bursting gold when they close. Continuous, looping, ambient.
- **"fully interactive JARVIS AI assistant"** — a HUD persona that narrates the funnel, surfaces the day's priorities, and answers "what should I fix?" in plain language.

The data is **already real and already wired** (see §4). Your job is the experience layer on top of it. Design to the real numbers, not lorem ipsum.

---

## 1. Who this is for & what it's for

**Operator:** One person — Cameron. He runs a crypto-trading education business. He logs in once or twice a day to answer one question: **"Is the funnel working, and what do I fix right now?"** He is impatient with pretty-but-useless dashboards. Every pixel must either (a) show truth or (b) point at an action. "Looks sick" AND "tells me what to do" — both, not either.

**The business in one breath:** Cold traffic (YouTube / IG / X / email) → two funnels (a free course + a VSL) → a qualification survey → either a **high-ticket call** ($7,500 / $4,500 one-time, "Quantum") or a **self-serve product** ($997 western / $297 low-PPP geo, "Wolf Pack"). Revenue is currently **reach-constrained** — more eyeballs = more money, near-linearly. The recurring/low-ticket model was deliberately retired; high-ticket one-time is the present.

**The dashboard's job:** Make the whole machine legible at a glance, then drill to atomic detail on demand, and always answer "what's the next dollar-moving action."

---

## 2. The current state (what exists today)

A working Next.js dashboard at `/analytics` (dark theme, lime-green accent). It already renders, in this order:

1. **Morning Report** — last-24h summary, resets at 5am in the viewer's local timezone, deltas vs the prior window, a mini funnel.
2. **Action Center** — ranked list of the biggest leaks, each with a dollar impact and a prescribed fix. (Just built. This is the soul of the thing — see §3.)
3. **Scoreboard** — six headline tiles (net revenue, one-time cash, recurring, new leads, dials, closes).
4. **The Board** — an SVG "whiteboard" of the entire funnel: traffic → free lane + VSL lane → Quantum path + Wolf path → revenue. Hover any node for drop-off. *This is the thing most begging to become the living, animated hero.*
5. **Daily lead volume** — interactive bar chart.
6. **Revenue, sliced every way** — one-time vs recurring, Quantum closes vs partials, $997 vs $297, product table.
7. **Free-course funnel** detail + **Broker order-bump** (Hydra vs BloFin affiliate split).
8. **VSL detail**, **Quantum booking sub-funnel** (booked → showed → closed, with a 3-way "how they booked" split), **Wolf path** ($997 / $297).
9. **Team** (one closer + setters), **email nurture** + broadcasts, **traffic sources**.
10. **Growth trends** (monthly revenue, churn, attribution).
11. **Live Feed** — Twitter-style real-time stream of every funnel event (now pinned to the bottom of the page).

It's *informationally* complete and honest. It is **not** cinematic, and the funnel is static. That's the gap you're closing.

---

## 3. The Action Center (read this — it's the design north star)

Every redesign decision should serve this principle: **data is evidence; the product is a decision.** The Action Center is the page's opening move — a ranked list where each row is:

> **[rank] [severity]  Title** — `~$X on the table`
> *The problem, in one sentence, with the real numbers.*
> **FIX →** the single highest-leverage move.
> *the metric it moves*

Live examples it's generating from real data right now:

1. **HIGH · No-shows are eating your closes** — `~$7,313 on the table`. 47% of booked calls no-show or cancel — only 8 of 15 showed. **FIX →** SMS + email reminders and a confirm-or-deposit step. *show rate 53% → 75% target.*
2. **HIGH · Qualified leads who don't book get nothing** — `~$5,850 on the table`. 12 call-qualified leads never grabbed a time; 0 recovered. **FIX →** a "you qualified but didn't book" sequence.
3. **MED · Your free course barely feeds the money funnel** — only 7% of 347 free signups cross to the VSL; $0 high-ticket traced back. **FIX →** rework the first 3 nurture emails.
4. **LOW · $297 geo tier is starved, not broken** — 1 low-PPP visitor reached the page. **FIX →** it's a traffic decision, not a pricing one.

**Design implication:** the JARVIS assistant (see §5.2) is essentially the *voice* of the Action Center. The hero funnel (§5.1) is the *evidence* behind it. They should feel like one organism: the assistant points, the funnel shows why.

---

## 4. THE DATA CONTRACT (design to this — it's all real)

Everything below is live data already returned by existing API endpoints. **Design components as bindings to these fields** so the build is a 1:1 mapping. **Every field listed here must have a home in the design** — this contract is the minimum, not a menu to pick from. The example numbers are illustrative of a 30-day window; the real design renders the *full live dataset* — every table row, every rep, every day, every broadcast, every segment — never a representative subset.

### 4.1 The funnel topology (the spine of the hero viz)

```
TRAFFIC SOURCES                    (YouTube @cameronfous, IG @cameron.fous, X @cameronfous, email, direct)
      │
      ├─────────────────────────────┬───────────────────────────────┐
      ▼                             ▼                                 │
  FREE COURSE FUNNEL            VSL FUNNEL                            │  (crossover: free→VSL ~7%)
  free.quantumcipherlab.com     quantumcipherlab.com                 │
      │                             │                                 │
  Visit                         Visit                                 │
   → Signup (email)              → Opt-in (lead)                      │
   → Broker order-bump           → Started application (survey)       │
      (Hydra / BloFin / skip)     → QUALIFIED ───────────────┐        │
   → Reached the course                                      │        │
                                                             ▼        ▼
                                                   ┌──────────────────────────────┐
                                                   │   THE QUALIFY GATE (splits)   │
                                                   └──────────────────────────────┘
                                                       │                      │
                                       routing = "book"│                      │ routing = "wolfpack"
                                  (≥$2,500 tier)        ▼                      ▼  (budget tier)
                                          QUANTUM PATH                   WOLF PATH
                                          → /book (calendar)             ├─ western → /wolfpack  ($997)
                                          → Booked call                  └─ low-PPP → /wolfpack-global ($297)
                                          → Showed
                                          → CLOSED  ($7,500 / $4,500)
```

**Closes carry an origin tag:** each close is attributed to *"from the free course"* vs *"cold/direct VSL."* (Currently ~0 of closes trace to the free course — a key truth the viz should make visible, not hide.)

### 4.2 Every metric available, by section

**Scoreboard / revenue** (`/api/analytics/funnel` → `revenue`, live from Whop):
- `net`, `gross`, `refunds`, `count` (payments)
- `oneTime {count,revenue}`, `recurring {count,revenue}`
- `quantumClose {count,revenue}` — real high-ticket closes (one-time ≥ $2,500)
- `quantumPartial {count,revenue}` — deposits/downsells
- `quantumRecurring {count,revenue}` — payment-plan installments
- `wolfNewWestern {count,revenue}` ($997), `wolfNewIntl {count,revenue}` ($297), `wolfRecurring {count,revenue}` (legacy)
- `byFunnel {vsl, wolfpack, other}`, `byProduct [{name,count,revenue,funnel}]`, `segments [{product,kind,price,count,revenue,funnel}]`

**Funnel steps** (`free[]`, `vsl[]` → each `{id,label,count,note}`), **crossover** `{freeTotal, vslTotal, crossed}`.

**Qualify split** (`vslSplit`): `quantum`, `wolf`, `intl`, `bookViewed`, `wolfpackViewed`, `globalViewed`, `quantumFromFree`, `wolfFromFree`.

**Broker order-bump** (`broker`): `viewed`, `clicked`, `hydra`, `blofin`, `skipped`, `confirmed`.

**Booking sub-funnel** (`booking`): `booked`, `immediateBooked` (self-booked on landing), `setterRescued`, `laterBooked` (email/later), `selfBooked`, `meetings`, `showed`, `canceled`. → derive **show rate** & **close rate**.

**Team** (`team[]`): `{name, calls, answered, connectPct, talkMin}` — one closer (Jesus Benitez) + setters.

**Email nurture** (`nurture`): `enrolled`, `toVsl`, `toQualified`, `avgDays`, `within7`. **Broadcasts** (`broadcasts[]`): `{subject, date, recipients, openRate, clickRate, clicks}`.

**Daily volume** (`daily[]`): `{date, free, vsl}`.

**Sources** (`sources[]`): `{source, content, visitors, freeSignups, surveys}`.

**Morning Report** (`/api/analytics/morning?since=<local-5am-ISO>`): `current` & `previous` windows of `{visitors, free_views, free_signups, vsl_leads, apps_started, qualified, quantum, wolf, broker_clicks, book_views, booked, callbacks}` + `revenue {net,count,highTicket,highTicketRev}` + `windowHours`.

**Live Feed** (`/api/analytics/live?after=<ISO>`): newest-first events `{event, ts, who, routing, broker, tier, country, host}`. Event types to give distinct visual identities:
`free_course_submitted`, `free_course_confirm_viewed`, `lead_submitted`, `qualify_form_started`, `qualify_form_submitted` (routing book|wolfpack), `qualify_intl_offer`, `broker_offers_viewed`, `broker_offer_clicked` (broker hydra|blofin), `broker_offers_skipped`, `book_page_viewed`, `book_fallback_requested`, `call_booked`.

**Trends** (`/api/analytics/trends`): monthly revenue (stacked one-time/recurring), membership churn, weekly trend, SegMetrics attribution (by channel, first-touch / last-touch, top campaigns), free-course ROI.

> **The point:** the funnel particle counts, gauge values, and assistant narration should all be **driven by these exact fields**. When you mock a number, pull it from here so the build is a swap, not a re-spec.

---

## 5. What to design (the screens, prioritized)

### 5.1 ⭐ THE LIVING FUNNEL — the hero (highest priority)

The centerpiece. The static "Board" becomes a **continuously animated flow simulation.**

- **Layout:** the topology in §4.1 as a left-to-right (or top-down) holographic flow map. Traffic sources on the left feed a hub; the hub splits into the Free lane and VSL lane; the VSL lane funnels into the Qualify Gate; the gate forks into the Quantum path (call → close) and the Wolf path ($997 / $297).
- **Particles = people.** A continuous stream of luminous dots flows along the edges. **Flow rate at each edge is proportional to the real conversion volume** (e.g., 72 visitors → 10 leads → 6 applied → 4 qualified → 2 booked → 0 closed = a fat stream up top thinning dramatically toward the close). At each gate, particles **split** by the real ratio and the ones that don't convert **drop / dissipate** downward (visualizing the leak). Closes **burst into gold** at the end.
- **Looping & ambient:** the simulation runs continuously ("users traveling through the funnel in loops") so the page feels alive even when idle. It is *representative motion*, seeded by real ratios — not a literal 1:1 replay (though see §5.5 for hooking real live events into it).
- **Leaks glow red.** Wherever drop-off is worst (e.g., the no-show stage, the qualify→book gap), the edge should pulse in the alert color and ideally carry a small "$X leaking" tag — tying the hero directly to the Action Center.
- **Interactive:** hover/click a node → it expands with the real numbers (count, conversion %, drop-off, $). Clicking a path could filter the whole page to that path (Quantum-only / Wolf-only). Scrubbing a time range (7/30/90d, already in the header) re-seeds the flow.
- **Tech reality for the build:** this will be SVG or Canvas/WebGL in React. Design it so it degrades gracefully (a static but beautiful state if motion is reduced / `prefers-reduced-motion`). Give us the particle behavior, easing, colors, glow, and node anatomy as specs.

### 5.2 ⭐ THE JARVIS ASSISTANT (HUD persona)

A persistent assistant presence — the "voice" of the dashboard. Iron-Man-HUD energy: concentric rings, scanlines, a soft reactive glow, a waveform/orb that pulses on activity.

- **Resting state:** an ambient orb/ring in a corner or as a docked side panel. Subtle idle animation.
- **Briefing mode:** on load it "speaks" (text, typewriter reveal is fine — no audio required) the morning briefing and the #1 directive: *"Good morning. 72 visitors since 5am, 1 call booked, no close yet. Your biggest leak today is no-shows — 47%. Fix that and there's ~$7.3k on the table."*
- **Reactive:** pulses / flickers when a live event lands (a new lead, a booked call, a close). A close should trigger a celebratory flare.
- **Ask-it:** an input where the operator can type "what should I fix?", "how's the Wolf path?", "where did today's leads come from?" and JARVIS answers from the data. (Design the conversation UI; the answering logic is Claude Code's problem.)
- **Tone:** confident, terse, a little cocky — matches Cameron. Not corporate.

This panel is effectively the **Action Center + Morning Report rendered as a character.** Design how those two existing data structures (§3, §4.2) become JARVIS's speech and visuals.

### 5.3 The Daily Briefing (Morning Report, reimagined)

The §4.2 morning data as a **"daily briefing" HUD card** — arrival animation, delta arrows that count up, the mini funnel as a glowing micro-version of the hero. Resets 5am local.

### 5.4 Priority Directives (Action Center, reimagined)

The §3 ranked list as **mission-style directives** — severity as threat-level styling (HIGH = red alert glow), the dollar impact as the headline number, the FIX as a clear command. Should feel like targets to take out.

### 5.5 Live Telemetry (Live Feed, reimagined)

The §4.2 event stream as a **telemetry ticker** — each event type with its own icon/color (free opt-in, VSL opt-in, Wolf qual, Quantum qual, broker click, booked call…). New events flash in. **Bonus dream:** when a live event arrives, fire a real particle through the hero funnel (§5.1) at the matching stage — so the live feed and the living funnel are the same nervous system. Pinned to the bottom of the page per current layout, but design it to optionally dock alongside JARVIS.

### 5.6 Gauges & instruments

- **Radial/arc HUD gauges** for every key rate: opt-in rate, qualify rate, free→VSL crossover, book rate, show rate, close rate, broker click rate. These are the "instruments" — make them plentiful, not a token few.

> The deep sections below are **not** "more conventional" filler — they are the bulk of the value and must get the same density and art direction as the hero. §5.7 is the binding list.

### 5.7 ⛔ MANDATORY DATA INVENTORY — every element must appear in your mockups

This is the checklist the design is graded against. Each bullet is a thing that must be **visibly present and legible** in the delivered design. Design beautiful HUD treatments for these — but **do not drop or merge them away.** Group/lay them out however looks best; just don't lose anything.

**A. Daily Briefing (Morning Report)** — all of: revenue collected + payment count; high-ticket closes + their $; new leads (free+VSL) with Δ vs prior window; free signups + Δ; VSL opt-ins + Δ; qualified (+ quantum/wolf split) + Δ; calls booked (+ callback reqs) + Δ; broker clicks + Δ; the 6-stage mini funnel (visitors→leads→applied→qualified→booked→closed); the timezone + window-hours label; the narrative headline.

**B. Priority Directives (Action Center)** — the ranked list (variable length, design for 1–6 rows); per row: rank #, severity badge (HIGH/MED/LOW), title, the `~$X on the table` figure, the one-sentence problem with real numbers, the FIX line, and the metric it moves; plus the "total $ on the table across all leaks" header line.

**C. Scoreboard** — all 6 headline tiles: net revenue (+payment count), one-time cash (+new-sale count), recurring/MRR-ish (+renewal count), new leads (free+VSL), dials (+conversations), VSL closes (+$). Each tile is a number AND its sub-stat.

**D. The Living Funnel board (hero)** — every node with its count AND its conversion %/drop-off vs the prior node: traffic total; per-source breakdown (≥4 sources w/ visitor counts); FREE lane: visited → signed up → broker offers → reached course; VSL lane: visited → opt-in → started application → qualified; the crossover figure (free→VSL count + %); QUANTUM path: qualified → book-page viewed → booked → showed → closed (+ close $ + "X of Y from free course / Z from cold-direct" attribution); WOLF path: wolf-qualified → wolfpack page → $997 western (count+$) AND geo: wolfpack-global → $297 (count+$). Leak tags ($ leaking) at the worst drop-offs.

**E. Daily lead volume** — the full time-series bar chart (free vs VSL stacked/grouped) across the whole period with a real y-axis, gridlines, per-day hover breakdown, and the period total.

**F. Revenue, sliced every way** — all of: gross, net, refunds, payment count; one-time vs recurring (count+$ each); Quantum closes (≥$2.5k, count+$) vs Quantum partials (count+$) vs Quantum recurring installments (count+$); Wolf $997 western (count+$), Wolf $297 geo (count+$), Wolf recurring legacy (count+$); revenue by funnel (vsl/wolfpack/other); **the full product table** — every product row with name, type (one-time/recurring), price, revenue, sales count; plus the explainer note distinguishing "closes" from "payments."

**G. Free course funnel detail** — step-by-step (visited → signed up → reached course) with counts + drop-off %, including the note about email re-visits.

**H. Broker order-bump** — viewed; clicked; **Hydra count vs BloFin count (split out, not merged)**; skipped; confirmed; plus click-through rate.

**I. VSL funnel detail + qualify split** — the VSL steps with counts; the routing split: quantum vs wolf vs intl; book-page viewed; wolfpack viewed; global (geo) viewed; quantum-from-free vs wolf-from-free attribution counts.

**J. Quantum booking sub-funnel** — qualified → booked → showed → closed with show-rate and close-rate; the **3-way "how they booked" split**: immediate self-book vs setter-rescued vs email/later; meetings, canceled, callbacks.

**K. Sales team** — the closer (Jesus Benitez) and **every setter as its own row**: name, dials, answered/conversations, connect %, talk-minutes. Don't collapse the team into one stat.

**L. Email nurture + broadcasts** — enrolled, →VSL, →qualified, avg days, within-7-days conversion; **the broadcast table — every broadcast row**: subject, date, recipients, open rate, click rate, clicks.

**M. Traffic sources** — **every source as its own row**: source, content/handle, visitors, free signups, surveys. Plus the YouTube/IG/X channel honesty context.

**N. Growth trends** — monthly revenue trend (stacked one-time/recurring bars, all months); membership churn panel (with the "winding down by design" framing); weekly trend; SegMetrics attribution (by-channel table, first-touch vs last-touch comparison, top campaigns); free-course ROI pathway (signups → bought → high-ticket → $, including the honest $0 if that's the truth).

**The honest-truth rule:** where a number is bad or zero ($0 from the free course, 53% show rate, 1 geo visitor), **show it loudly** — do not hide, round away, or beautify it into looking fine. The leaks are the point.

---

## 6. Art direction & motion language

### 6.1 Palette (current — evolve it, keep it dark & premium)
| Token | Hex | Use |
|---|---|---|
| ACID (primary) | `#BFFA46` | hero accents, money, success, "on the table" |
| BLUE | `#8FD0FF` | VSL / Quantum path, info |
| PURP | `#C9A8FF` | geo / callbacks / secondary |
| AMBER | `#F59E0B` | broker / order-bump |
| DROP (alert) | `#F0826D` | leaks, no-shows, HIGH severity |
| BONE | `#F2F0E6` | primary text |
| ASH | `#9AA0AC` | secondary text |
| DIM | `#6B7280` | tertiary / labels |
| CARD | `#0E0F13` | surfaces |
| LINE | `#23252E` | borders |
Background is near-black. The lime `#BFFA46` is the signature — money and wins glow lime. Red `#F0826D` is *only* for things bleeding money. Feel free to introduce a glass/holographic treatment, subtle grain, scanlines, and depth — but stay legible and fast.

### 6.2 Typography
Currently system-ui. You may propose a more "HUD" display face for headlines/numbers (a technical/mono or a sharp geometric sans) while keeping body text clean and readable. Numbers are the stars — give them weight and a tabular feel.

### 6.3 Motion principles
- **Ambient, not annoying.** Continuous gentle motion in the hero; everything else animates on enter / on data-change / on event — then rests.
- **Event-reactive.** New leads, bookings, and closes should produce visible, proportionate reactions (the bigger the win, the bigger the flare).
- **Honest motion.** Flow thickness, particle density, and gauge fill must encode real ratios. Don't animate a fat "close" stream when closes are near zero — the leak *is* the story.
- **Respect `prefers-reduced-motion`** with a beautiful static fallback.
- **Performance:** this runs in a browser tab the operator leaves open. Particle systems must be GPU-friendly and idle-cheap. Design with a particle budget in mind and tell us what it is.

### 6.4 References to channel
Iron Man / JARVIS HUD; Bloomberg-terminal-meets-spaceship; high-end fintech (dark, glowing, data-dense but calm); flow-field / particle-network visualizations. Premium, expensive, *alive*.

---

## 7. What to hand back to Claude Code (deliverable spec)

### 7.1 Deliverables

So the build is a faithful, fast translation — please return:

1. **Annotated mockups** for each screen/component in §5 — desktop first (operator is on a large screen), plus a sensible responsive/mobile take on at least the Briefing + Directives + Live Telemetry. **The mockups must show real, dense data per §5.7 — not three placeholder rows and an "etc."**
2. **The hero funnel spec in depth:** node anatomy, edge/flow behavior, particle appearance + budget, the split & drop-off behavior, hover/click/filter states, the reduced-motion fallback, and exactly which §4 fields drive which visual quantity.
3. **JARVIS spec:** resting / briefing / reactive / ask-it states, the orb/ring construction, pulse-on-event behavior, the conversation UI, and copy/tone samples for its narration (built from the morning + action data).
4. **Motion specs:** durations, easings, triggers, loop behavior — enough that we don't have to guess timing.
5. **Exact tokens:** finalized colors (hex), type scale (px/weight/letter-spacing), spacing, radii, glow/shadow recipes, gauge geometry.
6. **Any assets:** SVGs, Lottie/JSON, sprite or icon set for the event types in §4.2, the JARVIS orb, gauge faces. Vector preferred. Note anything that must be WebGL/Canvas vs DOM/SVG.
7. **A component inventory** mapping each designed component → the §4 data fields it binds to. This is the most important handoff artifact: it's what makes the build a swap, not a re-interpretation.

### 7.2 ⛔ COMPLETENESS CHECKLIST — do not hand back until every box is true

Go through §5.7 letter by letter. The design is **not done** unless you can honestly check all of these:

- [ ] **A–N all present:** every one of the 14 sections in §5.7 appears in the mockups, none dropped or merged into a vibe.
- [ ] **Every metric shows its sub-stat:** counts carry their conversion %/drop-off; revenue figures carry their counts; tiles carry their secondary number.
- [ ] **Tables are real tables:** product table, broadcast table, team table, and sources table each show the full row structure (designed for N rows), not 2–3 sample rows.
- [ ] **Splits stay split:** Hydra vs BloFin; $997 vs $297; quantum vs wolf vs intl; immediate vs setter-rescued vs email-later; per-setter rows; per-source rows — none collapsed into a single number.
- [ ] **Close attribution visible:** "from free course vs cold/direct VSL" shown on the close nodes.
- [ ] **Bad numbers shown loudly:** $0 free-course revenue, 53% show rate, 1 geo visitor — present and honest, not hidden.
- [ ] **Density gut-check:** your mockups contain *at least as many distinct numbers as the three "before" screenshots* attached with this brief. If they contain fewer, go back.

**If any box is unchecked, the design has regressed to a summary — fix it before sending.**

**Constraints to respect:** target stack is Next.js (React, dark theme, inline-styled today — open to a styling approach you recommend); all data is real and arrives from the four endpoints in §4; nothing should require data we don't have (if you want a new metric, flag it — don't assume it). Keep the operator's one question front and center: *is it working, and what do I fix?* — but answer it **on top of** the full data, never instead of it.

---

*Built on top of a live, honest data layer. Make it look like the future without lying about the numbers. — Claude Code*
