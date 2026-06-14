// Free-course funnel ROI — the #1 question: does the lead magnet produce sales?
//
// There's no single event that links a free-course opt-in to a purchase
// (signup is Kit/PostHog, purchase is Whop), so we cross-reference by EMAIL:
// free-course form subscribers (Kit) ∩ paid Whop buyers (resolved via
// membership email). Returns the buyers, revenue, and whether ANY was
// high-ticket. Heavy (membership lookups) → cache hard at the route.

const FUNNEL = (name: string): "vsl" | "wolfpack" | "other" => {
  const n = name.toLowerCase();
  if (n.includes("quantum cipher")) return "vsl";
  if (n.includes("wolf pack") || n.includes("wolfpack")) return "wolfpack";
  return "other";
};
const PROD: Record<string, string> = {
  prod_23wyE3QA7YRM1: "Quantum Cipher", prod_zPbyprkRGFKVD: "Wolf Pack Pro",
  prod_nEYd6ZU4cVPQe: "Mentorship ELITE", prod_1Ln4PQ5j7488O: "Wolf Pack Elite",
  prod_35r2vblVV9Cm0: "Degenr8", prod_HuxK6oXW2q1X3: "Wolf Pack Zero",
};

export type FreeCourseRoi = {
  signups: number;
  buyers: number;
  revenue: number;
  highTicketBuyers: number; // bought a VSL/Quantum offer
  details: { masked: string; revenue: number; product: string }[];
};

export async function freeCourseEmails(): Promise<Set<string>> {
  const sec = process.env.KIT_API_SECRET || "";
  const fid = process.env.KIT_FREE_COURSE_FORM_ID || "";
  const out = new Set<string>();
  if (!sec || !fid) return out;
  for (let page = 1; page <= 30; page++) {
    const res = await fetch(`https://api.convertkit.com/v3/forms/${fid}/subscriptions?api_secret=${sec}&page=${page}`, { next: { revalidate: 3600 } });
    if (!res.ok) break;
    const d = await res.json();
    for (const s of (d.subscriptions ?? []) as { subscriber?: { email_address?: string } }[]) {
      const em = s.subscriber?.email_address;
      if (em) out.add(em.trim().toLowerCase());
    }
    if (page >= (d.total_pages ?? 1)) break;
  }
  return out;
}

// Of a specific set of close-buyer membership ids, how many originated from
// a free-course signup (by email)? Cheap — only resolves the close buyers.
export async function attributeClosesToFreeCourse(quantumMems: string[], wolfMems: string[]): Promise<{ quantumFromFree: number; wolfFromFree: number } | null> {
  const apiKey = process.env.WHOP_API_KEY || "";
  if (!apiKey) return null;
  const headers = { Authorization: `Bearer ${apiKey}`, Accept: "application/json" };
  const free = await freeCourseEmails();
  if (free.size === 0) return { quantumFromFree: 0, wolfFromFree: 0 };

  const resolve = async (mems: string[]): Promise<number> => {
    const uniq = [...new Set(mems)];
    let hits = 0;
    for (let i = 0; i < uniq.length; i += 12) {
      const batch = uniq.slice(i, i + 12);
      const res = await Promise.all(batch.map((m) => fetch(`https://api.whop.com/api/v2/memberships/${m}`, { headers, next: { revalidate: 3600 } }).then((r) => (r.ok ? r.json() : null)).catch(() => null)));
      for (const d of res) {
        const e = d?.email ? String(d.email).trim().toLowerCase() : "";
        if (e && free.has(e)) hits++;
      }
    }
    return hits;
  };

  const [quantumFromFree, wolfFromFree] = await Promise.all([resolve(quantumMems), resolve(wolfMems)]);
  return { quantumFromFree, wolfFromFree };
}

export async function fetchFreeCourseRoi(days: number): Promise<FreeCourseRoi | null> {
  const apiKey = process.env.WHOP_API_KEY || "";
  if (!apiKey) return null;
  const headers = { Authorization: `Bearer ${apiKey}`, Accept: "application/json" };
  const wget = async (u: string) => {
    const r = await fetch(u, { headers, next: { revalidate: 3600 } });
    return r.ok ? r.json() : null;
  };

  const freeEmails = await freeCourseEmails();
  if (freeEmails.size === 0) return null;

  // paid payments in the window → membership + amount + funnel
  const cutoff = Math.floor(Date.now() / 1000) - days * 86_400;
  type Pay = { status?: string; final_amount?: number; paid_at?: number; created_at?: number; membership?: string; product?: string };
  const pays: { mem: string; amt: number; funnel: string; product: string }[] = [];
  for (let pg = 1; pg <= 80; pg++) {
    const d = await wget(`https://api.whop.com/api/v2/payments?page=${pg}&per=50`);
    const items: Pay[] = d?.data ?? [];
    if (items.length === 0) break;
    for (const p of items) {
      const ts = p.paid_at ?? p.created_at ?? 0;
      if (ts >= cutoff && p.status === "paid" && (p.final_amount ?? 0) > 0 && p.membership) {
        const name = PROD[(typeof p.product === "string" ? p.product : "") ?? ""] ?? "other";
        pays.push({ mem: p.membership, amt: p.final_amount ?? 0, funnel: FUNNEL(name), product: name });
      }
    }
    if (Math.min(...items.map((p) => p.paid_at ?? p.created_at ?? 0)) < cutoff - 15 * 86_400) break;
  }

  // resolve unique membership emails in parallel batches (bounded latency)
  const memIds = [...new Set(pays.map((p) => p.mem))].slice(0, 400);
  const memEmail: Record<string, string> = {};
  for (let i = 0; i < memIds.length; i += 12) {
    const batch = memIds.slice(i, i + 12);
    const res = await Promise.all(batch.map((m) => wget(`https://api.whop.com/api/v2/memberships/${m}`).catch(() => null)));
    res.forEach((d, j) => {
      if (d?.email) memEmail[batch[j]] = String(d.email).trim().toLowerCase();
    });
  }

  // buyer email → revenue + best product/funnel
  const buyer: Record<string, { revenue: number; product: string; vsl: boolean }> = {};
  for (const p of pays) {
    const e = memEmail[p.mem];
    if (!e) continue;
    const b = (buyer[e] ??= { revenue: 0, product: p.product, vsl: false });
    b.revenue += p.amt;
    if (p.funnel === "vsl") b.vsl = true;
    if (p.amt > 0 && p.product !== "other") b.product = p.product;
  }

  const details: FreeCourseRoi["details"] = [];
  let revenue = 0, highTicketBuyers = 0;
  for (const [email, b] of Object.entries(buyer)) {
    if (!freeEmails.has(email)) continue;
    revenue += b.revenue;
    if (b.vsl) highTicketBuyers++;
    const [u, dom] = email.split("@");
    details.push({ masked: `${u.slice(0, 3)}***@${dom ?? ""}`, revenue: Math.round(b.revenue), product: b.product });
  }
  details.sort((a, b) => b.revenue - a.revenue);

  return { signups: freeEmails.size, buyers: details.length, revenue: Math.round(revenue), highTicketBuyers, details };
}
