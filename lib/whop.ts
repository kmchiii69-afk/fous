// Whop revenue — shared by the analytics + funnel routes.
//
// The v2 payments endpoint does NOT return newest-first (confirmed Jun 2026:
// page 1 spans weeks out of order), so any "break on first old payment" loop
// massively undercounts. We instead page until the window is provably
// exhausted. We sum `final_amount` (the actually-charged total; `subtotal`
// is the pre-discount list price and is wrong for revenue) on `status=paid`,
// and subtract `refunded_amount`.
//
// Whop's dashboard "net" figure is this minus Whop's ~10% platform fee,
// which the per-payment API doesn't expose — so we report gross collected
// and net-of-refunds, clearly labelled, plus a per-product breakdown the
// user can reconcile against Whop directly.

const PRODUCT_NAME_CACHE: Record<string, string> = {};

// Product → funnel bucket. Matched on the resolved product name.
export function funnelForProduct(name: string): "vsl" | "wolfpack" | "other" {
  const n = name.toLowerCase();
  if (n.includes("quantum cipher")) return "vsl"; // high-ticket call closes
  if (n.includes("wolf pack") || n.includes("wolfpack")) return "wolfpack";
  return "other";
}

async function resolveProductName(id: string, headers: Record<string, string>): Promise<string> {
  if (!id || !id.startsWith("prod_")) return id || "—";
  if (PRODUCT_NAME_CACHE[id]) return PRODUCT_NAME_CACHE[id];
  try {
    const res = await fetch(`https://api.whop.com/api/v2/products/${id}`, { headers, next: { revalidate: 86400 } });
    if (res.ok) {
      const d = await res.json();
      const name = d.name || d.title || id;
      PRODUCT_NAME_CACHE[id] = name;
      return name;
    }
  } catch {
    /* fall through */
  }
  return id;
}

export type Seg = { count: number; revenue: number };
export type WhopRevenue = {
  gross: number;
  net: number; // gross − refunds
  refunds: number;
  count: number;
  byFunnel: { vsl: number; wolfpack: number; other: number };
  byProduct: { name: string; count: number; revenue: number; funnel: string }[];
  // ── granular segmentation ──
  oneTime: Seg; // billing_reason one_time / subscription_create
  recurring: Seg; // subscription_cycle renewals
  quantum: Seg; // VSL high-ticket (Quantum Cipher + Mentorship), all payments
  // Quantum decomposed honestly: a real close = one-time ≥ $2,500 (survey's
  // call-routing threshold). Below = partial/deposit/downsell. Recurring =
  // existing payment-plan installments, NOT new closes.
  quantumClose: Seg;
  quantumPartial: Seg;
  quantumRecurring: Seg;
  // membership ids of the close buyers — used to attribute closes back to
  // their lead source (e.g. did this close come from the free course?).
  quantumCloseMems: string[];
  wolfWesternMems: string[];
  wolfNewWestern: Seg; // Wolfpack one-time at full price ($997 tier)
  wolfNewIntl: Seg; // Wolfpack one-time at geo price ($297 tier)
  wolfRecurring: Seg; // Wolfpack legacy monthly subscriptions
  segments: { product: string; kind: "one-time" | "recurring"; price: number; count: number; revenue: number; funnel: string }[];
};

const addSeg = (s: Seg, amt: number) => {
  s.count++;
  s.revenue += amt;
};

// ── Long-range trends: monthly revenue split + membership churn ──
// Heavy (walks ~8 months of payments); cache aggressively at the route.
export type WhopTrends = {
  monthly: { month: string; oneTime: number; recurring: number; total: number; count: number }[];
  memberships: { active: number; canceled: number; expired: number; completed: number };
};

export async function fetchWhopTrends(months: number): Promise<WhopTrends | null> {
  const apiKey = process.env.WHOP_API_KEY || "";
  if (!apiKey) return null;
  const headers = { Authorization: `Bearer ${apiKey}`, Accept: "application/json" };
  const floor = Math.floor(Date.now() / 1000) - months * 31 * 86_400;

  type Pay = { status?: string; final_amount?: number; paid_at?: number; created_at?: number; billing_reason?: string };
  const buckets: Record<string, { oneTime: number; recurring: number; count: number }> = {};

  for (let page = 1; page <= 90; page++) {
    const res = await fetch(`https://api.whop.com/api/v2/payments?page=${page}&per=50`, { headers, next: { revalidate: 3600 } });
    if (!res.ok) break;
    const items: Pay[] = (await res.json()).data ?? [];
    if (items.length === 0) break;
    for (const p of items) {
      const ts = p.paid_at ?? p.created_at ?? 0;
      if (ts < floor || p.status !== "paid") continue;
      const month = new Date(ts * 1000).toISOString().slice(0, 7);
      const b = (buckets[month] ??= { oneTime: 0, recurring: 0, count: 0 });
      const amt = p.final_amount ?? 0;
      const reason = p.billing_reason ?? "";
      if (reason === "one_time" || reason === "subscription_create") b.oneTime += amt;
      else b.recurring += amt;
      b.count++;
    }
    if (Math.min(...items.map((p) => p.paid_at ?? p.created_at ?? 0)) < floor) break;
  }

  const monthly = Object.entries(buckets)
    .map(([month, b]) => ({ month, oneTime: Math.round(b.oneTime), recurring: Math.round(b.recurring), total: Math.round(b.oneTime + b.recurring), count: b.count }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const memberships = { active: 0, canceled: 0, expired: 0, completed: 0 };
  await Promise.all(
    (["active", "canceled", "expired", "completed"] as const).map(async (st) => {
      const r = await fetch(`https://api.whop.com/api/v2/memberships?page=1&per=1&status=${st}`, { headers, next: { revalidate: 3600 } });
      if (r.ok) memberships[st] = (await r.json()).pagination?.total_count ?? 0;
    }),
  );

  return { monthly, memberships };
}

export async function fetchWhopRevenue(days: number): Promise<WhopRevenue | null> {
  const apiKey = process.env.WHOP_API_KEY || "";
  if (!apiKey) return null;
  const headers = { Authorization: `Bearer ${apiKey}`, Accept: "application/json" };
  const cutoff = Math.floor(Date.now() / 1000) - days * 86_400;
  const hardFloor = Math.floor(Date.now() / 1000) - (days + 15) * 86_400; // stop paging this far back

  type Pay = {
    status?: string;
    final_amount?: number;
    refunded_amount?: number;
    paid_at?: number;
    created_at?: number;
    product?: string;
    access_pass?: string;
    billing_reason?: string;
    membership?: string;
  };
  const quantumCloseMems: string[] = [];
  const wolfWesternMems: string[] = [];

  // NB: this endpoint ignores `per_page` (returns 10); the honored param is
  // `per`, capped at 50. And ordering is NOT monotonic — a single page mixes
  // recent + weeks-old rows — so we can't stop on the first old row, only
  // once the WHOLE page is past the window floor.
  const inWindow: Pay[] = [];
  for (let page = 1; page <= 80; page++) {
    const res = await fetch(
      `https://api.whop.com/api/v2/payments?page=${page}&per=50`,
      { headers, next: { revalidate: 300 } },
    );
    if (!res.ok) break;
    const items: Pay[] = (await res.json()).data ?? [];
    if (items.length === 0) break;
    for (const p of items) {
      const ts = p.paid_at ?? p.created_at ?? 0;
      if (ts >= cutoff && p.status === "paid") inWindow.push(p);
    }
    const oldest = Math.min(...items.map((p) => p.paid_at ?? p.created_at ?? 0));
    if (oldest < hardFloor) break;
  }

  let gross = 0;
  let refunds = 0;
  const prodAgg: Record<string, { id: string; count: number; revenue: number }> = {};
  for (const p of inWindow) {
    const amt = p.final_amount ?? 0;
    gross += amt;
    refunds += p.refunded_amount ?? 0;
    const pid = (typeof p.product === "string" ? p.product : "") || (typeof p.access_pass === "string" ? p.access_pass : "") || "—";
    if (!prodAgg[pid]) prodAgg[pid] = { id: pid, count: 0, revenue: 0 };
    prodAgg[pid].count++;
    prodAgg[pid].revenue += amt;
  }

  // Resolve names + bucket by funnel
  const byFunnel = { vsl: 0, wolfpack: 0, other: 0 };
  const byProduct: WhopRevenue["byProduct"] = [];
  for (const agg of Object.values(prodAgg)) {
    const name = await resolveProductName(agg.id, headers);
    const funnel = funnelForProduct(name);
    byFunnel[funnel] += agg.revenue;
    byProduct.push({ name, count: agg.count, revenue: Math.round(agg.revenue), funnel });
  }
  byProduct.sort((a, b) => b.revenue - a.revenue);

  // ── granular segmentation ──
  const oneTime: Seg = { count: 0, revenue: 0 };
  const recurring: Seg = { count: 0, revenue: 0 };
  const quantum: Seg = { count: 0, revenue: 0 };
  const quantumClose: Seg = { count: 0, revenue: 0 };
  const quantumPartial: Seg = { count: 0, revenue: 0 };
  const quantumRecurring: Seg = { count: 0, revenue: 0 };
  const wolfNewWestern: Seg = { count: 0, revenue: 0 };
  const wolfNewIntl: Seg = { count: 0, revenue: 0 };
  const wolfRecurring: Seg = { count: 0, revenue: 0 };
  const segAgg: Record<string, { product: string; kind: "one-time" | "recurring"; price: number; pid: string; count: number; revenue: number }> = {};

  for (const p of inWindow) {
    const amt = p.final_amount ?? 0;
    if (amt <= 0) continue; // skip $0 comps/free
    const pid = (typeof p.product === "string" ? p.product : "") || "—";
    const name = await resolveProductName(pid, headers);
    const funnel = funnelForProduct(name);
    const reason = p.billing_reason ?? "";
    const isOneTime = reason === "one_time" || reason === "subscription_create";
    if (isOneTime) addSeg(oneTime, amt);
    else addSeg(recurring, amt);

    if (funnel === "vsl") {
      addSeg(quantum, amt); // total
      if (!isOneTime) addSeg(quantumRecurring, amt); // payment-plan installment
      else if (amt >= 2500) { addSeg(quantumClose, amt); if (p.membership) quantumCloseMems.push(p.membership); } // real high-ticket close
      else addSeg(quantumPartial, amt); // deposit / downsell / partial
    }
    if (funnel === "wolfpack") {
      if (isOneTime) {
        // $297 geo tier vs $997 western tier, split on price
        if (amt <= 400) addSeg(wolfNewIntl, amt);
        else { addSeg(wolfNewWestern, amt); if (p.membership) wolfWesternMems.push(p.membership); }
      } else {
        addSeg(wolfRecurring, amt);
      }
    }

    // Key by NAME (not product id) so multiple plan/product ids that resolve
    // to the same display name + price merge into one row.
    const price = Math.round(amt);
    const key = `${name}|${isOneTime ? "one-time" : "recurring"}|${price}`;
    if (!segAgg[key]) segAgg[key] = { product: name, kind: isOneTime ? "one-time" : "recurring", price, pid, count: 0, revenue: 0 };
    segAgg[key].count++;
    segAgg[key].revenue += amt;
  }

  const segments = Object.values(segAgg)
    .map((s) => ({ product: s.product, kind: s.kind, price: s.price, count: s.count, revenue: Math.round(s.revenue), funnel: funnelForProduct(s.product) }))
    .sort((a, b) => b.revenue - a.revenue);

  const rnd = (s: Seg): Seg => ({ count: s.count, revenue: Math.round(s.revenue) });

  return {
    gross: Math.round(gross),
    net: Math.round(gross - refunds),
    refunds: Math.round(refunds),
    count: inWindow.length,
    byFunnel: {
      vsl: Math.round(byFunnel.vsl),
      wolfpack: Math.round(byFunnel.wolfpack),
      other: Math.round(byFunnel.other),
    },
    byProduct,
    oneTime: rnd(oneTime),
    recurring: rnd(recurring),
    quantum: rnd(quantum),
    quantumClose: rnd(quantumClose),
    quantumPartial: rnd(quantumPartial),
    quantumRecurring: rnd(quantumRecurring),
    quantumCloseMems,
    wolfWesternMems,
    wolfNewWestern: rnd(wolfNewWestern),
    wolfNewIntl: rnd(wolfNewIntl),
    wolfRecurring: rnd(wolfRecurring),
    segments,
  };
}
