"use client";

import { Suspense, useEffect, useState } from "react";
import posthog from "posthog-js";
import { useSearchParams } from "next/navigation";

// Build the /qualify URL with prefill params carried forward from Page 1.
// Falls back to bare /qualify if the user landed here without params.
function useQualifyHref(): string {
  const sp = useSearchParams();
  const first_name = sp.get("first_name") || "";
  const last_name = sp.get("last_name") || "";
  const email = sp.get("email") || "";
  const phone = sp.get("phone") || "";
  const params = new URLSearchParams();
  if (first_name) params.set("first_name", first_name);
  if (last_name) params.set("last_name", last_name);
  if (email) params.set("email", email);
  if (phone) params.set("phone", phone);
  const qs = params.toString();
  return qs ? `/qualify?${qs}` : "/qualify";
}
import Logo from "@/components/shared/Logo";
import Wrap from "@/components/shared/Wrap";
import StickyBar from "@/components/shared/StickyBar";
import ApplyBand from "@/components/shared/ApplyBand";
import { Section } from "@/components/shared/H";
import H from "@/components/shared/H";
import Lightbox from "@/components/page2/Lightbox";
import LiveTicker from "@/components/page2/LiveTicker";
import VSLPlayer from "@/components/page2/VSLPlayer";
import RickRossSpotlight from "@/components/page2/RickRossSpotlight";
import CycleSection from "@/components/page2/CycleSection";
import DayVsSwingComparison from "@/components/page2/DayVsSwingComparison";
import ProofTile from "@/components/page2/ProofTile";
import PhotoFrame from "@/components/page2/PhotoFrame";
import InlineYouTube from "@/components/page2/InlineYouTube";
import ReviewCard from "@/components/page2/ReviewCard";
import VideoTestimonialCard from "@/components/page2/VideoTestimonialCard";

/* ─── Data ─────────────────────────────────────────────── */

const REVIEWS = [
  { name: "Nikolay Stoev",     date: "Oct 2024 · 1 month after purchase",   quote: "As a member of his groups since 2021, I'm giving him a rate 10 out of 10! He's dominating every market — Crypto, Forex, Futures, CFDs, you name it. The only LEGIT trader I've stumbled across in this world of scammers." },
  { name: "Ronny Roehrig",     date: "Dec 2024 · 2 months after purchase",  quote: "Cameron is a fin genius. If you don't make money here, you will not make it anywhere. His trading strategies and his results are unique. If you want to make 'wife-changing money,' this is definitively the fastest way." },
  { name: "Renars Bzezinskis", date: "Nov 2024 · 4 days after purchase",    quote: "This is the only person you need to follow or learn from to learn trading and not make mistakes like the rest of the 99% of the market." },
  { name: "Mario Fanto",       date: "Oct 2024 · 21 days after purchase",   quote: "The best decision I've ever made. You'll learn the best trading strategies and earn a lot of money at the same time. And with the Quantum Cipher Report you are prepared for the whole week and know what to do. Simply brilliant." },
  { name: "ShaunNZ",           date: "Oct 2024 · 1 month after purchase",   quote: "Look no further! This guy is the OG. Have been part of the Discord and now here for a while — best decision I've made in this space. Super engaging, unbeatable alpha, and top customer service. Money to be made $$$" },
  { name: "George G.",         date: "Dec 2024 · 1 month after purchase",   quote: "Number one pack, imo. 10 out of 10. Lots of the most useful info you may find. Sometimes I think he has some kind of inside info, but nope — it's just an undeniable skill. Keep running, man." },
  { name: "supremeshot00",     date: "Feb 2025 · 2 days after purchase",    quote: "I have been following Cameron for 5 years. Great leader, good principles, and he respects the art of trading. Everything you've said has checked out — and I've changed my life because of this." },
  { name: "Filip Rodeš",       date: "Dec 2024 · 8 days after purchase",    quote: "It seems like he has a magic ball to predict the future, haha. I swear he gets at least 7 out of 10 trades right. Highly recommend." },
  { name: "NvrPullOut",        date: "Nov 2024 · 4 days after purchase",    quote: "Cameron Fous is the best at teaching technical analysis and keeping you informed every step of the way. I've followed him for years on YouTube — I wish I had joined his course sooner. He is the real deal. Hands down 10 out of 10." },
  { name: "Shay McCusker",     date: "Jan 2025 · 14 days after purchase",   quote: "THE place to go for trading education. All the info you need and nothing you don't. Doesn't hold back with info other traders would never share. 10 stars out of 5." },
  { name: "Kalaveti Mekemeke", date: "Nov 2024 · 16 days after purchase",   quote: "Just joined last week. Subscribed to his strategy and the Quantum Cipher Report, plus the learning videos — it's been a game-changer. 10/10 compared to other sites I've tried before." },
  { name: "Andre Freire",      date: "Dec 2024 · 1 month after purchase",   quote: "Best trading program. Clean analysis, simplistic, and straightforward. Fantastic insights, great community. If you are considering entering crypto or trading in general, I highly recommend signing up." },
  { name: "djordje radulovic", date: "Dec 2024 · 12 days after purchase",   quote: "Cameron's approach to trading and his approach to teaching is second to none. Such a straightforward dude — tells it how it is, always. Transparent about everything. Not some bullshit influencer posting Lambo bullshit and multi-zillion trades." },
  { name: "Jack Deth",         date: "Dec 2024 · 3 months after purchase",  quote: "Excellent course, well worth the price — and a lot more if you're willing to put in the time and effort. The QCR and the glimpse into Cameron's process alone makes this an easy investment. NOTE: this is not a trade-alert group. It's a professional sharing his system." },
  { name: "Simeon Rückert",    date: "Dec 2024 · 1 month after purchase",   quote: "The best overall package in the industry. For everyone who wants to start trading or further internalize the fundamentals. Fous has a simple but very effective trading style. The QCR is the real gold." },
  { name: "Mauricio Bento",    date: "Dec 2024 · 13 days after purchase",   quote: "I've been following his YouTube channel for a long time, and finally decided to join the Wolfpack. I love the courses and the analysis. Cameron rocks. I really enjoy how he's straightforward and far from a used-car salesman." },
  { name: "gary mills",        date: "Nov 2024 · 17 days after purchase",   quote: "Fantastic course and very informative. Best decision I've made since buying crypto. Should have joined years ago. Great community with loads of advice. Cameron has a no-BS approach — tells you how it is. Best guy in my opinion on YouTube." },
  { name: "HF",                date: "Oct 2024 · 15 days after purchase",   quote: "Quantum Cipher Report + video gives you clear buy and sell points for crypto, forex, and futures — so you don't have to guess. Super easy to follow. The Krypton Legacy Course is a huge bonus. 30+ hours of trading education." },
  { name: "Assadour Zomjian",  date: "Dec 2024 · 24 days after purchase",   quote: "Fous doesn't fool you around. One of the best crypto and forex channels ever. Great community, strong signals, even trading courses — all in one subscription." },
  { name: "Mykola Hnatyuk",    date: "Dec 2024 · 2 months after purchase",  quote: "Best one out there. Cameron's Krypton course is great — boosted my knowledge and confidence. The community is great as well, affordable price. Would definitely recommend." },
  { name: "J Mitch TX",        date: "Dec 2025 · 6 days after purchase",    quote: "If you take all classes and do not double your investment, I will pay you myself for your entrance. No one is perfect — however the weekly win ratio is outstanding. It's better to try and succeed than not try." },
  { name: "Branwill Storm",    date: "Feb 2026 · 1 year after purchase",    quote: "Crazy knowledge and value. This guy can flip your whole life around in all areas." },
  { name: "Gábor Földesi",     date: "Oct 2024 · 1 month after purchase",   quote: "This guy is LEGIT. You can learn a lot from his Krypton Legacy Course. You can also check, copy, and study his trades. All the things I searched for." },
  { name: "Crypto85",          date: "Mar 2025 · 5 months after purchase",  quote: "Great trader, great content. He is very active and helps his community. Very happy to be part of it. His trades are very accurate and easy to follow. Highly recommend." },
];

const VIDEOS = [
  { id: "dUIipa1vxAs", h: "I'm Up $3 Million Following Cam Since 2013",     b: "Federal government insider (hiding face for job security) reveals over a decade of profits trading Cam's methods — from Fous4x4 stocks to crypto. Refuses to show his face. The receipts speak louder." },
  { id: "kLxd_D9J7so", h: "I Almost Tripled My Money In 7 Days",            b: "Joined the Wolfpack one week ago. Walked out with nearly 3x his bag. No fluff. A guy who pulled the trigger and watched his account explode in a single week." },
  { id: "BLWlP9AjnEU", h: "Wolfpack Gains Paid For My Trip To Tokyo",       b: "Filmed from the streets of Tokyo. Was losing before finding Cam — now funding international trips from Wolfpack profits. The realest breakdown of why most traders lose this cycle." },
  { id: "EGzswQffvVE", h: "Paid For Itself 10x Over — Just Bought A New Boat", b: "Filmed from his custom lake house with a brand new boat parked behind him. Long-time crypto holder who switched to active trading with Cam and never looked back." },
  { id: "PsFXUIHN1d0", h: "Doubled My Trading Bag In The First 30 Days",   b: "Cuts straight to the point: signed up, doubled his account in a month, done. Calls out every phony guru in crypto and explains why Cam is the only one he trusts with real money." },
  { id: "7n3fCXL8Mjc", h: "67% Win Rate After Just 2 Months",               b: "Followed Cam since 2020, finally pulled the trigger. Two months later: 67% win rate. 'No BS, no hand-holding — when the chart talks, it pays to listen.'" },
  { id: "wyj2ZsyWh8k", h: "19 Years Old — Made $500 In My First Week",      b: "Young trader, fresh to the game, $500 profit in 7 days. 'By far the best crypto community I've ever been part of.' Proof the system works at any age, any account size." },
  { id: "EhY-AlMdbjk", h: "13 Months Ago, Cam Changed My Life",             b: "4-year Cam follower who finally joined the Wolfpack 13 months ago and says it flat-out changed his life. The Quantum Cipher Report is the 'best decision you can make.'" },
  { id: "97eZEmI8qGY", h: "Busy Dad, 2 Kids — Still Crushing Trades",       b: "Full-time entrepreneur with two kids and zero free time. The Wolfpack lets him walk in, see the setups, take the trade, get on with his day. Built for real life." },
  { id: "V6C8JFw7ORw", h: "All The Way From Africa — Growing My Capital With Cam", b: "Global member crushing it from Africa. Praises Cam's 20+ years of multi-asset experience and the edge it gives him across markets. The move of the cycle." },
  { id: "Xa56tineH0A", h: "Owned Cam's Courses For Years — Just Rejoined",  b: "Multi-year Krypton student who sees patterns clearly now thanks to Cam's training. Just rejoined the Wolfpack and is blown away by the Notion trade-plan setups." },
  { id: "WYI-CU3PZfs", h: "+10% On My Account In My First Month As A Beginner", b: "Started trading one month ago. Joined the Wolfpack, read Cam's book, followed the system. Grew her account 10% as a complete beginner. No gatekeeping." },
  { id: "OD5uCL96EsQ", h: "7 Months In And I'll Stay Forever",               b: "Says it's worth every cent, every minute, every second. Plans to renew year after year — even when he no longer needs the signals — because the community is that good." },
  { id: "J1KuhYlTzy0", h: "Multiple Discords — Cam Is The Only Real One",   b: "Veteran crypto trader who's been burned by every fake guru on the internet. Cam is 'top tier' — real trader, real calls, real results. Recommended to multiple people." },
  { id: "OqhncwmHVhc", h: "One Alert Paid For Months Of My Subscription",   b: "Just one Wolfpack alert covered multiple months of membership. 'Stay a sheep and get eaten by the wolves — or become a wolf.' Cam teaches you to be self-sufficient." },
  { id: "KdqrqQb5VHg", h: "Cam Will Double, Triple, Or More Your Portfolio", b: "Multi-year trader vouching for Cam as the most transparent operator in the game. Nobody else in crypto is this honest about wins AND losses — that's why his calls work." },
  { id: "NxdqQCEO2rc", h: "Best Investment I've Ever Made In My Life",       b: "Three-point breakdown: crypto signals, 30+ hours of training, brilliant community. Plus how to profit in bear markets — most communities don't even mention that part." },
  { id: "WDqtoIOIx8M", h: "3 Years Trading Crypto — Should've Joined Cam Sooner", b: "Brazilian trader, 3 years in markets, followed Cam's YouTube for a year before pulling the trigger. The alerts solved his biggest scanner problem instantly." },
  { id: "fL1F49uN6Jc", h: "Following Cam Since 2019 — He Teaches You To Fish", b: "Used to follow YouTube shills and lose money. Found Cam in 2019, took the courses, profitable ever since. Cam doesn't feed you fish — he teaches you to catch them." },
  { id: "iQOEVY3iEUQ", h: "Blew Up My Bag Multiple Times — Then I Found Cam", b: "The brutal truth: easy money in spring, then summer hit and he gave it all back. Multiple blowups. Cam's training + indicators + no-BS mentorship turned everything around." },
];

const WIN_TILES = [
  { src: "uploads/proof/win-01.jpg", handle: "@aulzon",     caption: "Two Gate.io shares in 24 hours — IMXUSDT +147.70% and TAOUSDT +115.29%. 'You either Fous, or you lose.'", dollars: "+147%",    platform: "Gate.io" },
  { src: "uploads/proof/win-02.jpg", handle: "@rick_ross",  caption: "Hit the $2M goal in 2 months. 'Chillin' for now.' Bybit all-perps total.",                                 dollars: "+$2.02M",  platform: "Bybit" },
  { src: "uploads/proof/win-03.jpg", handle: "@nate_smith", caption: "10k → 100k individual challenge. End of month rough, bounced back the first few days.",                   dollars: "+$21,257", platform: "Apex" },
  { src: "uploads/proof/win-04.jpg", handle: "@yevrah1989", caption: "XRPUSDT long — clean cycle play, F1 receipt to prove it.",                                                dollars: "+111.43%", platform: "Gate.io" },
  { src: "uploads/proof/win-05.jpg", handle: "@j_mitch_tx", caption: "ETHUSDT short at 150x — locked gains right into the daily flush. Called the top.",                        dollars: "+36.54%",  platform: "Blofin" },
  { src: "uploads/proof/win-06.jpg", handle: "@aljaz_qc",   caption: "DEEPUSDT 3x long — clean swing, clean exit.",                                                             dollars: "+44.96%",  platform: "Bybit" },
  { src: "uploads/proof/win-07.jpg", handle: "@nate_smith", caption: "FOLKSUSDT short at 10x — sucker punch at the FOMO top.",                                                  dollars: "+52.73%",  platform: "Bitget VIP" },
  { src: "uploads/proof/win-08.jpg", handle: "@ametis_qc",  caption: "AIOZUSDT long at 10x — 'great call, you're a legend bro.'",                                               dollars: "+330.17%", platform: "Bybit" },
  { src: "uploads/proof/win-09.jpg", handle: "@shaunnz",    caption: "AIOZUSDT close-long at 5x — took profits at 4 places on the way up.",                                     dollars: "+131.52%", platform: "MEXC" },
  { src: "uploads/proof/win-10.jpg", handle: "@servio_qc",  caption: "SUPERUSDT long — held 11 days. 'LFG SUPER!' Patience pays.",                                              dollars: "+$14,398", platform: "Bybit" },
  { src: "uploads/proof/win-11.jpg", handle: "@nick_qc",    caption: "ORCAUSDT short at 10x — big shot out to J Mitch TX. Perfect Sucker Punch 1D setup.",                      dollars: "+199.16%", platform: "Bitget VIP" },
  { src: "uploads/proof/win-12.jpg", handle: "@tm_qc",      caption: "AIOZUSDT long at 10x — '+15,956.05 USDT.' Banked before the meme even left orbit.",                       dollars: "+351.72%", platform: "Blofin" },
];

/* ─── MonoLabel helper ──────────────────────────────────── */
function ML({ children, color = "var(--acid)", style }: { children: React.ReactNode; color?: string; style?: React.CSSProperties }) {
  return (
    <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color, letterSpacing: "0.22em", textTransform: "uppercase", ...style }}>
      {children}
    </div>
  );
}

/* ─── PhotoFrame inline ─────────────────────────────────── */
function PF({ src, alt, ratio = "4/3", objectPosition = "center", style }: { src: string; alt: string; ratio?: string; objectPosition?: string; style?: React.CSSProperties }) {
  function openLightbox() {
    window.dispatchEvent(new CustomEvent("qc:lightbox", { detail: { src: `/${src}`, alt } }));
  }
  return (
    <div onClick={openLightbox} style={{ position: "relative", aspectRatio: ratio, background: "var(--bg-2)", border: "1px solid var(--line)", overflow: "hidden", cursor: "zoom-in", ...style }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/${src}`} alt={alt} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition }} />
    </div>
  );
}

/* ─── Hero (reads first_name from URL) ─────────────────── */
function Hero() {
  const searchParams = useSearchParams();
  const firstName = (searchParams.get("first_name") || "").replace(/[^a-zA-Z]/g, "").slice(0, 24);
  const qualifyHref = useQualifyHref();

  return (
    <section className="grid-bg" style={{ position: "relative", padding: "20px 0 64px", borderBottom: "1px solid var(--line)" }}>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(900px 600px at 50% 0%, rgba(191,250,70,0.08), transparent 60%)" }} />
      <Wrap style={{ position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <Logo />
          <div className="qc-hide-mobile" style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span className="pulse" style={{ width: 6, height: 6, background: "var(--acid)", display: "inline-block" }} />
            <ML>· Your training · Loaded</ML>
          </div>
        </div>
        <div style={{ textAlign: "center", maxWidth: 1120, margin: "0 auto" }}>
          {firstName && (
            <ML color="var(--ash)" style={{ marginBottom: 10, letterSpacing: "0.24em" }}>· Welcome, {firstName} — let&rsquo;s get to it ·</ML>
          )}
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 60, lineHeight: 0.98, letterSpacing: "-0.045em", color: "var(--bone)", margin: "0 0 12px" }}>
            True freedom.{" "}
            <em style={{ color: "var(--acid)", fontStyle: "italic", textShadow: "0 0 36px rgba(191,250,70,0.35)" }}>One day per week.</em>
          </h1>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 17, lineHeight: 1.5, color: "var(--ash)", margin: "0 auto 22px", maxWidth: 780, fontWeight: 400 }}>
            The Quantum Cipher Method — built and refined over 21 years of live trading. Mentored personally by Cameron Fous. Crypto, stocks, forex. Bull and bear.
          </p>
        </div>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <VSLPlayer />
        </div>
        <div style={{ marginTop: 28, display: "flex", justifyContent: "center" }}>
          <a href={qualifyHref} className="btn btn-lg" style={{ fontSize: 16, padding: "26px 44px" }}>Apply Now →</a>
        </div>
        <div style={{ marginTop: 40, paddingTop: 28, borderTop: "1px solid var(--line)", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 28, textAlign: "left" }}>
          {[
            { v: "21 yrs",   k: "Live trading experience" },
            { v: "$3M+",     k: "Top student profit" },
            { v: "1 day",    k: "Of work, per week" },
            { v: "Bull/Bear",k: "Both directions" },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 700, color: "var(--acid)", letterSpacing: "-0.03em", lineHeight: 1 }}>{s.v}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ash)", letterSpacing: "0.20em", textTransform: "uppercase", marginTop: 8 }}>· {s.k}</div>
            </div>
          ))}
        </div>
      </Wrap>
    </section>
  );
}

/* ─── PainPoints ────────────────────────────────────────── */
function PainPoints() {
  const pains = [
    "Bought recycled ICT/SMC courses regurgitated to you for $2–7K from fake tradefluencers who learned it last year.",
    "Day traded 5 days a week and made zero profits.",
    "Blown up every prop challenge you've tried.",
    "Copy-cat signal groups — always too late, always the wrong alerts.",
    "Really want to day trade. Just haven't figured it out yet. \"My mentor seems to do it really well!\" 😅",
  ];
  return (
    <Section py={140} style={{ borderBottom: "1px solid var(--line)" }}>
      <div style={{ marginBottom: 36 }}>
        <ML color="var(--pink)" style={{ marginBottom: 14 }}>· The day-trader trap ·</ML>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 64, lineHeight: 1.02, letterSpacing: "-0.035em", color: "var(--bone)", margin: 0, maxWidth: 1180 }}>
          You&rsquo;ve tried day trading.<br />
          Told ICT &amp; SMC were the holy grail.<br />
          <em style={{ color: "var(--pink)" }}>Did it work? Of course not.</em><br />
          Here&rsquo;s why it never will.
        </h2>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 20, lineHeight: 1.55, color: "var(--ash)", margin: "28px 0 0", maxWidth: 1000, fontWeight: 400 }}>
          You were sold a lie. Trade every day. Bet big. Turn a small account into a big one fast. The whole pitch is built so you lose — because when you lose, <em style={{ color: "var(--bone)" }}>they get paid.</em>
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 96 }}>
        {pains.map((p, i) => {
          const span = i === pains.length - 1 && pains.length % 2 === 1 ? 2 : 1;
          return (
            <div key={i} style={{ background: "var(--bg-1)", borderLeft: "3px solid var(--pink)", padding: "22px 26px", display: "flex", alignItems: "center", gap: 18, gridColumn: span === 2 ? "1 / -1" : "auto" }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, color: "var(--pink)", lineHeight: 1, minWidth: 36 }}>×</span>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 500, color: "var(--bone)", letterSpacing: "-0.015em", lineHeight: 1.3 }}>{p}</span>
            </div>
          );
        })}
      </div>

      <div style={{ marginBottom: 32 }}>
        <ML color="var(--pink)" style={{ marginBottom: 14 }}>· Who&rsquo;s making money here ·</ML>
        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 52, lineHeight: 0.98, letterSpacing: "-0.035em", color: "var(--bone)", margin: 0, maxWidth: 1100 }}>
          It&rsquo;s not the day traders. <em style={{ color: "var(--pink)" }}>It&rsquo;s these three.</em>
        </h3>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 96 }}>
        {[
          { num: "01", who: "The Influencer",   hook: "Sells you the course",              tag: "How they make money · Course sales + broker kickbacks", body: "The top \"traders\" on YouTube hook you with buzzwords like ICT and SMC. None of them trade on a real regulated broker. Why? Because almost all their trades are fake — simulated accounts on offshore B-book brokers. Fabricated stories to sell you a \"Day Trading\" course and a broker signup. When they control the back end of MT5, they can fake any trade, deposit, or withdrawal — all to put on a show for you. Pure manipulation." },
          { num: "02", who: "The Offshore Broker", hook: "Pays the influencer to send you in", tag: "How they make money · Your deposits",                   body: "The biggest \"traders\" in Miami aren't rich from trading — they're rich from promoting offshore B-book brokers, often ones they secretly own. Here's how it works: you deposit $10K. They pocket your $10K as revenue and hand you a demo $10K account instead. Why? Because statistically there's a 95% chance you fail, so why bother taking your trades live when they can just pocket your deposit themselves?" },
          { num: "03", who: "The Prop Firm",    hook: "Sells you challenge after challenge", tag: "How they make money · Challenge fees",                    body: "Influencers pitch fast-paced day trading on prop firms. The average prop account lasts 22 days. They want you over-trading, scalping, chasing quick wins. Almost no day traders make money — which is exactly why the day trading course keeps getting pitched. It's a cash cow for them." },
        ].map((p, i) => (
          <div key={i} style={{ background: "var(--bg-1)", border: "1px solid var(--line)", borderTop: "2px solid var(--pink)", padding: "28px 28px 24px", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 18 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "var(--pink)", letterSpacing: "0.22em" }}>· {p.num} ·</span>
              <ML color="var(--ash)" style={{ fontSize: 9 }}>· {p.hook} ·</ML>
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 600, color: "var(--bone)", letterSpacing: "-0.03em", lineHeight: 1.0, marginBottom: 16 }}>{p.who}</div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 15, lineHeight: 1.55, color: "var(--ash)", margin: "0 0 24px", fontWeight: 400, flex: 1 }}>{p.body}</p>
            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 14, fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "var(--pink)", letterSpacing: "0.20em", textTransform: "uppercase" }}>· {p.tag}</div>
          </div>
        ))}
      </div>

      {/* Influencer exposé */}
      <div style={{ marginBottom: 32 }}>
        <ML color="var(--pink)" style={{ marginBottom: 14 }}>· Receipts on the influencers ·</ML>
        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 56, lineHeight: 0.98, letterSpacing: "-0.04em", color: "var(--bone)", margin: 0, maxWidth: 1240 }}>
          Two of the biggest day-trading influencers. <em style={{ color: "var(--pink)" }}>Both fake.</em>
        </h3>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 96 }}>
        {[
          { avatar: "uploads/influencers/tjr.jpg",      handle: "TJR",     tag: "@tjr_trades", loom: "9ec3659115b14efaace92d783ced9a38", evidence: ["Promotes offshore B-book brokers as his 'main' platform.", "Trades on demo accounts. Posts them as live results.", "Demo accounts let him fake deposits, fake withdrawals, and manipulate trades."] },
          { avatar: "uploads/influencers/alexfxg.jpg",  handle: "AlexFXG", tag: "@alexfxg",     loom: "b7c2be1539444abca90d976f61d39536", evidence: ["Sold the story that he turned $100 into $1 million. Fake.", "Trades on demo, promotes it as live, likely owns the offshore B-book broker himself.", "His lawyers told him to add a CFTC Rule 4.41 disclaimer to every YouTube video — required when results are hypothetical or simulated.", "He did it. Quietly. It's now in his video descriptions. That's an admission, in writing, that the trades aren't real."] },
        ].map((p, i) => (
          <div key={i} style={{ background: "var(--bg-1)", border: "1px solid var(--line)", borderTop: "2px solid var(--pink)", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "24px 28px", display: "flex", alignItems: "center", gap: 18, borderBottom: "1px solid var(--line)" }}>
              <div style={{ width: 64, height: 64, flexShrink: 0, background: "var(--bg-2)", border: "1px solid var(--line-2)", overflow: "hidden", borderRadius: "50%" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/${p.avatar}`} alt={p.handle} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 600, color: "var(--bone)", letterSpacing: "-0.025em", lineHeight: 1.0 }}>{p.handle}</div>
                <ML color="var(--ash)" style={{ fontSize: 10, marginTop: 6 }}>· {p.tag} ·</ML>
              </div>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, color: "var(--pink)", letterSpacing: "0.24em", border: "1px solid var(--pink)", padding: "4px 10px" }}>FAKE</span>
            </div>
            <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 14 }}>
              {p.evidence.map((e, j) => (
                <div key={j} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "var(--pink)", letterSpacing: "0.18em", marginTop: 3, minWidth: 22 }}>{String(j + 1).padStart(2, "0")}</span>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 15, lineHeight: 1.55, color: "var(--bone)", fontWeight: 400 }}>{e}</span>
                </div>
              ))}
            </div>
            <div style={{ padding: "0 28px 28px", marginTop: "auto" }}>
              <ML color="var(--ash)" style={{ fontSize: 9, marginBottom: 10 }}>· Video proof · Loom ·</ML>
              <div style={{ position: "relative", aspectRatio: "16/9", background: "var(--bg-2)", border: "1px solid var(--line-2)", overflow: "hidden" }}>
                <iframe src={`https://www.loom.com/embed/${p.loom}?hideEmbedTopBar=true`} title={`${p.handle} — video proof`} frameBorder="0" allowFullScreen style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Hertzberg quote */}
      <div style={{ marginBottom: 32 }}>
        <ML color="var(--pink)" style={{ marginBottom: 14 }}>· What the data actually says ·</ML>
        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 60, lineHeight: 0.96, letterSpacing: "-0.04em", color: "var(--bone)", margin: 0, maxWidth: 1240 }}>
          Tens of thousands of traders. 150 prop firms.<br />
          <em style={{ color: "var(--acid)" }}>The profitable ones aren&rsquo;t day trading.</em>
        </h3>
      </div>

      <div style={{ background: "var(--bg-1)", border: "1px solid var(--line)", display: "grid", gridTemplateColumns: "0.85fr 1.15fr", position: "relative", overflow: "hidden", marginBottom: 64 }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(700px 500px at 0% 50%, rgba(255,45,171,0.06), transparent 60%)" }} />
        <div style={{ position: "relative", borderRight: "1px solid var(--line)", minWidth: 0 }}>
          <PhotoFrame src="uploads/hertzberg-portrait.jpg" alt="Justin D. Hertzberg portrait" ratio="4/5" style={{ border: 0, height: "100%" }} objectPosition="55% center" />
        </div>
        <div style={{ position: "relative", padding: "48px 44px", minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
            <ML>· Justin D. Hertzberg ·</ML>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, color: "var(--acid)", letterSpacing: "0.22em", border: "1px solid var(--acid)", padding: "3px 7px" }}>SOURCE</span>
          </div>
          <p style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 500, fontStyle: "italic", color: "var(--bone)", lineHeight: 1.25, margin: "0 0 18px", letterSpacing: "-0.02em" }}>
            &ldquo;When we analyzed over 10,000 traders across our 150 firms — the traders who are profitable are <em style={{ color: "var(--acid)", fontStyle: "italic" }}>almost all swing traders.</em> The average funded account only lasts <em style={{ color: "var(--pink)", fontStyle: "italic" }}>22 days.</em>&rdquo;
          </p>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "var(--acid)", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 28 }}>
            · Quoted on the Titans of Tomorrow Podcast · Justin as guest ·
          </div>
          <div style={{ paddingTop: 24, borderTop: "1px solid var(--line)" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600, color: "var(--bone)", letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 10 }}>
              Founder of <em style={{ color: "var(--acid)" }}>FPFX Technologies.</em>
            </div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.55, color: "var(--ash)", margin: 0, fontWeight: 400 }}>
              FPFX runs the tech and data behind 150+ prop firms worldwide — tens of thousands of funded traders on their platforms. He sees every fill, every blow-up, every payout.
            </p>
          </div>
        </div>
      </div>

      {/* Hard close */}
      <div style={{ textAlign: "center", maxWidth: 1100, margin: "0 auto 96px", padding: "56px 0", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <p style={{ fontFamily: "var(--font-display)", fontSize: 34, fontWeight: 500, fontStyle: "italic", color: "var(--bone)", lineHeight: 1.25, margin: 0, letterSpacing: "-0.02em" }}>
          Day trading fuels course sales,<br />prop firm fees, and offshore broker affiliate checks.
        </p>
        <p style={{ fontFamily: "var(--font-display)", fontSize: 34, fontWeight: 600, fontStyle: "italic", color: "var(--pink)", lineHeight: 1.25, margin: "18px 0 0", letterSpacing: "-0.02em" }}>
          It does not pay traders. Full stop.
        </p>
      </div>

      {/* Solution reveal */}
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <ML style={{ marginBottom: 14, justifyContent: "center" }}>· There is another way ·</ML>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 120, lineHeight: 0.92, letterSpacing: "-0.05em", color: "var(--bone)", margin: "0 auto", maxWidth: 1280 }}>
          Swing trade. <em style={{ color: "var(--acid)", textShadow: "0 0 40px rgba(191,250,70,0.35)" }}>One day a week.</em>
        </h2>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 22, lineHeight: 1.5, color: "var(--ash)", margin: "32px auto 0", maxWidth: 820, fontWeight: 400 }}>
          The Quantum Cipher Method. Built by Cameron Fous over 21 years of live trading — and the exact style the data says actually works.
        </p>
      </div>

      {/* 7-day calendar */}
      <div style={{ marginBottom: 56, padding: "40px 0", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <ML color="var(--ash)" style={{ fontSize: 10 }}>· Your week, redesigned ·</ML>
          <ML color="var(--acid)" style={{ fontSize: 10 }}>· 1 day on · 6 days free ·</ML>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10 }}>
          {[
            { d: "SUN", on: true,  label: "Plan + place orders" },
            { d: "MON", on: false, label: "Free" },
            { d: "TUE", on: false, label: "Free" },
            { d: "WED", on: false, label: "Free" },
            { d: "THU", on: false, label: "Free" },
            { d: "FRI", on: false, label: "Free" },
            { d: "SAT", on: false, label: "Free" },
          ].map((day, i) => (
            <div key={i} style={{ padding: "26px 18px 22px", background: day.on ? "var(--acid)" : "var(--bg-1)", border: day.on ? "1px solid var(--acid)" : "1px solid var(--line)", boxShadow: day.on ? "0 0 32px rgba(191,250,70,0.25)" : "none", display: "flex", flexDirection: "column", gap: 14 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", color: day.on ? "var(--bg)" : "var(--ash)" }}>· {day.d}</span>
              <span style={{ fontFamily: "var(--font-display)", fontSize: day.on ? 22 : 18, fontWeight: day.on ? 700 : 500, letterSpacing: "-0.02em", lineHeight: 1.1, color: day.on ? "var(--bg)" : "var(--ash)", opacity: day.on ? 1 : 0.7 }}>{day.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3 Steps */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 56 }}>
        {[
          { n: "01", t: "Plan",         d: "One sit-down a week. Walk the charts. Mark the levels. Set the bias. Decide which setups you want to take." },
          { n: "02", t: "Pre-position", d: "Place your limit orders ahead of price. Stops attached. Targets locked. The trade does itself." },
          { n: "03", t: "Walk away",    d: "Close the laptop. Live your life. Let the market come to you. No alerts. No babysitting. No emotion." },
        ].map((s, i) => (
          <div key={i} style={{ background: "var(--bg-1)", border: "1px solid var(--line)", borderTop: "2px solid var(--acid)", padding: "32px 30px 30px", display: "flex", flexDirection: "column" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "var(--acid)", letterSpacing: "0.22em", marginBottom: 18 }}>· STEP {s.n} ·</span>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 48, fontWeight: 600, color: "var(--bone)", letterSpacing: "-0.035em", lineHeight: 1.0, marginBottom: 16 }}>{s.t}</div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 16, lineHeight: 1.55, color: "var(--ash)", margin: 0, fontWeight: 400, flex: 1 }}>{s.d}</p>
          </div>
        ))}
      </div>

      {/* Stats band */}
      <div style={{ background: "var(--bg-1)", border: "1px solid var(--acid)", padding: "40px 48px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 32, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(900px 400px at 50% 50%, rgba(191,250,70,0.08), transparent 60%)" }} />
        {[
          { v: "1 day",     k: "Plan window per week" },
          { v: "0",         k: "Real-time alerts" },
          { v: "21 yrs",    k: "Built by Cameron Fous" },
          { v: "Bull/Bear", k: "Same method · both sides" },
        ].map((s, i) => (
          <div key={i} style={{ position: "relative", minWidth: 0 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 56, fontWeight: 700, color: "var(--acid)", letterSpacing: "-0.04em", lineHeight: 0.95 }}>{s.v}</div>
            <ML color="var(--ash)" style={{ fontSize: 10, marginTop: 12 }}>· {s.k} ·</ML>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 56 }}>
        <DayVsSwingComparison />
      </div>
    </Section>
  );
}

/* ─── ReviewsWall ───────────────────────────────────────── */
function ReviewsWall() {
  const qualifyHref = useQualifyHref();
  return (
    <Section id="reviews" py={140} style={{ borderBottom: "1px solid var(--line)" }}>
      <H num="05" label="Verified Reviews" title={<>4.95★ across <em style={{ color: "var(--acid)" }}>135 verified reviews.</em></>} sub="Every review below is a real, verified purchase posted on Whop — an independent third-party platform. We can't edit them. We can't fake them. We can't even take them down. This is what the community says when nobody is watching." />
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 36, alignItems: "center", padding: "40px 44px", background: "var(--bg-1)", border: "1px solid var(--acid)", marginBottom: 32, boxShadow: "0 0 60px rgba(191,250,70,0.10)" }}>
        <div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 88, fontWeight: 700, color: "var(--acid)", letterSpacing: "-0.04em", lineHeight: 0.9, textShadow: "0 0 32px rgba(191,250,70,0.35)" }}>4.95</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 500, color: "var(--ash)", letterSpacing: "-0.02em" }}>/ 5.00</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 32, borderLeft: "1px solid var(--line)", paddingLeft: 36 }}>
          {[{ v: "135", l: "Verified Reviews" }, { v: "100%", l: "5-Star Average" }, { v: "Whop", l: "Independent Platform" }].map((s, i) => (
            <div key={i}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 600, color: "var(--bone)", letterSpacing: "-0.025em", lineHeight: 1, marginBottom: 8 }}>{s.v}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ash)", letterSpacing: "0.22em", textTransform: "uppercase" }}>{s.l}</div>
            </div>
          ))}
        </div>
        <a href={qualifyHref} className="btn">Join Them →</a>
      </div>
      <div style={{ columnCount: 3, columnGap: 14 }}>
        {REVIEWS.map((r, i) => <ReviewCard key={i} {...r} />)}
      </div>
    </Section>
  );
}

/* ─── WhatsIncluded ─────────────────────────────────────── */
function WhatsIncluded() {
  const groups = [
    { pillar: "I",   label: "The System",    items: [{ t: "Pro Level 1 & 2", d: "Foundational frameworks every operator needs before touching a live chart." }, { t: "Krypton 1.0", d: "The original crypto system that turned $20K into $1.7M in profits during the 2020 bull run." }, { t: "Krypton 2.0", d: "The optimized cycle method — 9 distinct phases, $1.2M in 30 days during the Trump pump." }, { t: "FOUS4x", d: "Swing trading the major forex pairs using institutional-grade analysis. Built for bigger, longer holds." }] },
    { pillar: "II",  label: "The Guidance",  items: [{ t: "Quantum Cipher Report", d: "Weekly written dossier — every top play Fous is planning to trade this week." }, { t: "Quantum Video Analysis", d: "Weekly video walkthrough of upcoming trade plans and current macro forecast." }, { t: "2× / Month Mentor Calls", d: "Live Zoom calls with Fous and his top students — direct access, twice a month." }] },
    { pillar: "III", label: "The Tools",     items: [{ t: "TradingView Indicator Suite", d: "Custom indicators hand-built by Fous. Not sold anywhere outside the mentor program." }, { t: "Quantum Mentor Site", d: "Searchable written + illustrated library of every system and strategy framework." }] },
    { pillar: "IV",  label: "The Community", items: [{ t: "Whop Live Chat", d: "Hundreds of operators sharing trade ideas, wins, losses, and lessons every day." }] },
  ];
  return (
    <Section id="included" py={140} style={{ borderBottom: "1px solid var(--line)" }}>
      <H num="06" label="What's Included" title={<>Everything you get inside <em style={{ color: "var(--acid)" }}>Quantum Cipher.</em></>} sub="One stack. Four pillars. Built and refined over 21 years of live trading. Nothing held back." />
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {groups.map((g, gi) => (
          <div key={gi} style={{ background: "var(--bg-1)", border: "1px solid var(--line)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", padding: "26px 36px", gap: 28, borderBottom: "1px solid var(--line)", alignItems: "baseline" }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 56, fontWeight: 700, color: "var(--acid)", letterSpacing: "-0.04em", lineHeight: 0.85 }}>{g.pillar}</span>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 600, color: "var(--bone)", letterSpacing: "-0.025em" }}>{g.label}</div>
            </div>
            {g.items.map((it, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "100px 1fr 100px", padding: "22px 36px", gap: 28, borderTop: i === 0 ? 0 : "1px solid var(--line)", alignItems: "center" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "var(--acid)", letterSpacing: "0.22em" }}>· INC</span>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, color: "var(--bone)", letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 6 }}>{it.t}</div>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 14.5, lineHeight: 1.55, color: "var(--ash)", margin: 0, maxWidth: 820, fontWeight: 400 }}>{it.d}</p>
                </div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 700, color: "var(--acid)", textAlign: "right" }}>✓</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ─── Footer ────────────────────────────────────────────── */
function Footer() {
  const qualifyHref = useQualifyHref();
  return (
    <footer style={{ borderTop: "1px solid var(--line)", padding: "64px 0 40px" }}>
      <Wrap>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24, marginBottom: 40 }}>
          <Logo />
          <a href={qualifyHref} className="btn">Apply →</a>
        </div>
        <div style={{ padding: "24px 0", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", marginBottom: 24 }}>
          <ML color="var(--pink)" style={{ marginBottom: 12 }}>· Reality check ·</ML>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 12, lineHeight: 1.65, color: "var(--muted)", margin: 0, maxWidth: 1100, fontWeight: 400 }}>
            Results shown reflect individual outcomes — their capital, their risk, their screen time, not yours. Trading involves real risk of loss; most who attempt it lose money. Quantum Cipher is educational and teaches a system; it does not guarantee any outcome. Nothing on this page is financial advice. If you can&rsquo;t afford to lose the capital you trade, do not trade it.
          </p>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", letterSpacing: "0.22em", textTransform: "uppercase" }}>
          <span>© 2026 · Quantum Cipher · All Rights Reserved</span>
          <span>· Decode · Trade · Compound ·</span>
        </div>
      </Wrap>
    </footer>
  );
}

/* ─── Page ──────────────────────────────────────────────── */
function TrainingPageInner() {
  const qualifyHref = useQualifyHref();

  // Track every apply CTA click without touching individual components
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const a = (e.target as HTMLElement).closest("a");
      if (a?.href?.includes("/qualify")) {
        posthog.capture("apply_cta_clicked", { cta_text: a.textContent?.trim() });
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <>
      <Lightbox />
      <StickyBar label="· Q3 cohort · Application Open" cta="Apply Now →" ctaHref={qualifyHref} />

      <Hero />

      <RickRossSpotlight />
      <ApplyBand caption="If Rick can do it · so can you" href={qualifyHref} />

      <PainPoints />
      <ApplyBand caption="Stop chasing influencers · start operating" href={qualifyHref} />

      {/* Bull or Bear intro */}
      <Section py={140} style={{ borderBottom: "1px solid var(--line)" }}>
        <div style={{ textAlign: "center", maxWidth: 1180, margin: "0 auto" }}>
          <ML style={{ marginBottom: 18, justifyContent: "center" }}>· Bull or bear · cashing in ·</ML>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 104, lineHeight: 0.95, letterSpacing: "-0.045em", color: "var(--bone)", margin: 0 }}>
            Quantum Cipher thrives in <em style={{ color: "var(--acid)" }}>both directions.</em>
          </h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 22, lineHeight: 1.5, color: "var(--ash)", margin: "32px auto 0", maxWidth: 820, fontWeight: 400 }}>
            Real trades. Real platforms. Real dates. Same method, bull markets or bear markets. Long or short.
          </p>
        </div>
      </Section>

      {/* 2020 Bull Run */}
      <Section py={120} style={{ borderBottom: "1px solid var(--line)" }}>
        <div style={{ marginBottom: 40 }}>
          <ML style={{ marginBottom: 14 }}>· 2020 bull run · Krypton origin ·</ML>
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 88, lineHeight: 0.95, letterSpacing: "-0.045em", color: "var(--bone)", margin: 0, maxWidth: 1280 }}>
            <em style={{ color: "var(--acid)" }}>$20,000</em> to <em style={{ color: "var(--acid)" }}>$1.7M.</em><br />In 420 days.
          </h3>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 19, lineHeight: 1.55, color: "var(--ash)", margin: "28px 0 0", maxWidth: 880, fontWeight: 400 }}>
            Cameron&rsquo;s first crypto deposit was $20,000. 420 days later it was worth $1.7 million. The system he used — Krypton — is the same one taught inside Quantum Cipher today.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
          <div>
            <ML color="var(--ash)" style={{ marginBottom: 12, fontSize: 9 }}>· The receipt · Portfolio tracker + deposit tweet ·</ML>
            <PF src="uploads/cam/2020-bull-1-7m.jpg" alt="2020 bull run — $20K to $1.7M" ratio="16/9" objectPosition="center top" />
          </div>
          <div>
            <ML color="var(--ash)" style={{ marginBottom: 12, fontSize: 9 }}>· The breakdown · Full story on YouTube ·</ML>
            <InlineYouTube videoId="xWM-EgM36WI" title="$20K to $1.7M — Cameron Fous · 2020 crypto bull run breakdown" start={642} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {[{ v: "420 days", k: "Start → finish" }, { v: "85×", k: "Multiple on capital" }, { v: "$1.7M", k: "Cumulative profit" }].map((s, i) => (
            <div key={i} style={{ background: "var(--bg-1)", border: "1px solid var(--line)", borderTop: "2px solid var(--acid)", padding: "20px 22px" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 700, color: "var(--acid)", letterSpacing: "-0.035em", lineHeight: 1 }}>{s.v}</div>
              <ML color="var(--ash)" style={{ fontSize: 9, marginTop: 10 }}>· {s.k} ·</ML>
            </div>
          ))}
        </div>
      </Section>

      {/* 2024 Trump Pump */}
      <Section py={120} style={{ borderBottom: "1px solid var(--line)" }}>
        <div style={{ marginBottom: 40 }}>
          <ML style={{ marginBottom: 14 }}>· November 2024 · Trump pump ·</ML>
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 88, lineHeight: 0.95, letterSpacing: "-0.045em", color: "var(--bone)", margin: 0, maxWidth: 1280 }}>
            <em style={{ color: "var(--acid)" }}>$1.2M</em> in 30 days.<br />One month. One method.
          </h3>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 19, lineHeight: 1.55, color: "var(--ash)", margin: "28px 0 0", maxWidth: 880, fontWeight: 400 }}>
            November 2024. Cameron banked $1.2 million in a single month trading the Trump pump using Krypton 2.0.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
          <div>
            <ML color="var(--ash)" style={{ marginBottom: 12, fontSize: 9 }}>· The receipt · Bybit · November P&amp;L ·</ML>
            <PF src="uploads/cam/nov-2024-01.jpg" alt="November 2024 — $1.2M Trump pump P&L" ratio="16/9" objectPosition="center top" />
          </div>
          <div>
            <ML color="var(--ash)" style={{ marginBottom: 12, fontSize: 9 }}>· The breakdown · Full story on YouTube ·</ML>
            <InlineYouTube videoId="R_EG8vscTGw" title="$1.2M in 30 days — Cameron Fous · 2024 Trump pump breakdown" />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {[{ v: "$1.2M", k: "Profit window" }, { v: "30 days", k: "Single month" }, { v: "Phase 7", k: "Revival cycle" }].map((s, i) => (
            <div key={i} style={{ background: "var(--bg-1)", border: "1px solid var(--line)", borderTop: "2px solid var(--acid)", padding: "20px 22px" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 700, color: "var(--acid)", letterSpacing: "-0.035em", lineHeight: 1 }}>{s.v}</div>
              <ML color="var(--ash)" style={{ fontSize: 9, marginTop: 10 }}>· {s.k} ·</ML>
            </div>
          ))}
        </div>
      </Section>

      {/* XRP TradeRow */}
      <Section py={120} style={{ borderBottom: "1px solid var(--line)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "center" }}>
          <div>
            <ML style={{ marginBottom: 14 }}>· XRP · Phemex · Cross 10× ·</ML>
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 64, lineHeight: 0.98, letterSpacing: "-0.04em", color: "var(--bone)", margin: 0 }}>
              <em style={{ color: "var(--acid)" }}>$302K</em> single trade. While golfing at Mt. Fuji.
            </h3>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 18, lineHeight: 1.6, color: "var(--ash)", margin: "26px 0 0", fontWeight: 400, maxWidth: 580 }}>
              One position. Entered $2.65, closed $3.47. Held it while playing 18 holes at the base of Mount Fuji. That&rsquo;s the whole point of the method — place the trade, walk away, let it play out.
            </p>
            <div style={{ marginTop: 32, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {[{ v: "$302K", k: "Realized profit" }, { v: "+31%", k: "Price move" }, { v: "10×", k: "Cross leverage" }].map((c, i) => (
                <div key={i} style={{ background: "var(--bg-1)", border: "1px solid var(--line)", borderTop: "2px solid var(--acid)", padding: "16px 18px" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, color: "var(--acid)", letterSpacing: "-0.03em", lineHeight: 1 }}>{c.v}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, color: "var(--ash)", letterSpacing: "0.18em", textTransform: "uppercase", marginTop: 8 }}>· {c.k}</div>
                </div>
              ))}
            </div>
          </div>
          <PhotoFrame src="uploads/cam/xrp-302k-01.jpg" alt="XRP $302K trade" ratio="4/5" />
        </div>
      </Section>

      {/* AVAX TradeRow */}
      <Section py={120} style={{ borderBottom: "1px solid var(--line)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "center" }}>
          <PhotoFrame src="uploads/cam/avax-210k-scene.jpg" alt="AVAX $210K trade" ratio="4/5" />
          <div>
            <ML style={{ marginBottom: 14 }}>· AVAX · Phemex · Cross 10× ·</ML>
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 64, lineHeight: 0.98, letterSpacing: "-0.04em", color: "var(--bone)", margin: 0 }}>
              <em style={{ color: "var(--acid)" }}>$210K</em> on AVAX. Pre-positioned. Walked.
            </h3>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 18, lineHeight: 1.6, color: "var(--ash)", margin: "26px 0 0", fontWeight: 400, maxWidth: 580 }}>
              Long entry $25.41. Closed $29.30. Orders placed days in advance. No watching the screen. No real-time alerts. Plan, place, walk away.
            </p>
            <div style={{ marginTop: 32, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {[{ v: "$210K", k: "Realized profit" }, { v: "+15.3%", k: "Price move" }, { v: "10×", k: "Cross leverage" }].map((c, i) => (
                <div key={i} style={{ background: "var(--bg-1)", border: "1px solid var(--line)", borderTop: "2px solid var(--acid)", padding: "16px 18px" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, color: "var(--acid)", letterSpacing: "-0.03em", lineHeight: 1 }}>{c.v}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, color: "var(--ash)", letterSpacing: "0.18em", textTransform: "uppercase", marginTop: 8 }}>· {c.k}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <ApplyBand caption="Both directions · same playbook" href={qualifyHref} />

      {/* 2025 Top Call */}
      <Section py={140} style={{ borderBottom: "1px solid var(--line)" }}>
        <div style={{ marginBottom: 48 }}>
          <ML color="var(--pink)" style={{ marginBottom: 14 }}>· October 2025 · short side ·</ML>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 84, lineHeight: 0.95, letterSpacing: "-0.045em", color: "var(--bone)", margin: 0, maxWidth: 1280 }}>
            Called the 2025 bull-market top.<br />
            <em style={{ color: "var(--acid)" }}>$237K banked in one day</em> on the biggest liquidation event in crypto history.
          </h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 20, lineHeight: 1.5, color: "var(--ash)", margin: "28px 0 0", maxWidth: 980, fontWeight: 400 }}>
            Cameron posted the short plan publicly — major bulltrap at the all-time high, next stop daily demand. A few days later the market had its biggest liquidation event on record.
          </p>
        </div>

        <div style={{ marginBottom: 28 }}>
          <ML color="var(--ash)" style={{ marginBottom: 12, fontSize: 9 }}>· The alert · Posted to Quantum Cipher Lab Trade Alerts · Oct 9, 2025 ·</ML>
          <PF src="uploads/cam/btc-2025-top-01.jpg" alt="Short BTC alert — Cameron Fous, October 9 2025" ratio="16/9" objectPosition="center top" />
        </div>

        <div style={{ marginBottom: 28 }}>
          <ML color="var(--ash)" style={{ marginBottom: 12, fontSize: 9 }}>· The receipts · 6 of the trades closed that day · Phemex ·</ML>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
            {[
              { src: "uploads/top-call/btc-2.jpg", ticker: "BTC short",  amount: "+$54,176", note: "Open 122,823 · Close 115,981" },
              { src: "uploads/top-call/eth.jpg",   ticker: "ETH short",  amount: "+$67,902", note: "Open 4,674 · Close 3,994" },
              { src: "uploads/top-call/sui.jpg",   ticker: "SUI short",  amount: "+$63,326", note: "Open 3.50 · Close 2.87" },
              { src: "uploads/top-call/spx.jpg",   ticker: "SPX short",  amount: "+$34,160", note: "Open 1.51 · Close 1.19" },
              { src: "uploads/top-call/deep.jpg",  ticker: "DEEP short", amount: "+$9,671",  note: "Open 0.14 · Close 0.10" },
              { src: "uploads/top-call/btc-1.jpg", ticker: "BTC short",  amount: "+$8,547",  note: "Open 124,978 · Close 123,261" },
            ].map((t, i) => (
              <div key={i} style={{ background: "var(--bg-1)", border: "1px solid var(--line)", overflow: "hidden" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--acid)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--line)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
              >
                <PF src={t.src} alt={`${t.ticker} ${t.amount}`} ratio="1/1" objectPosition="center top" style={{ border: 0, borderBottom: "1px solid var(--line)" }} />
                <div style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, color: "var(--bone)", letterSpacing: "-0.015em", lineHeight: 1 }}>{t.ticker}</div>
                    <ML color="var(--ash)" style={{ fontSize: 8, marginTop: 6 }}>· {t.note}</ML>
                  </div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--acid)", letterSpacing: "-0.02em", lineHeight: 1 }}>{t.amount}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "var(--bg-1)", border: "1px solid var(--acid)", padding: "32px 40px", display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 32, alignItems: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(700px 300px at 50% 50%, rgba(191,250,70,0.10), transparent 60%)" }} />
          <div style={{ position: "relative" }}>
            <ML style={{ marginBottom: 10, fontSize: 10 }}>· Day total · Oct 11, 2025 ·</ML>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 72, fontWeight: 700, color: "var(--acid)", letterSpacing: "-0.045em", lineHeight: 0.9, textShadow: "0 0 32px rgba(191,250,70,0.3)" }}>$237K+</div>
            <ML color="var(--ash)" style={{ marginTop: 12, fontSize: 10 }}>· Sum across the 6 trades above ·</ML>
          </div>
          <div style={{ position: "relative", textAlign: "center" }}>
            <div style={{ width: 1, height: 80, background: "var(--line)", margin: "0 auto" }} />
          </div>
          <div style={{ position: "relative", textAlign: "right" }}>
            <ML color="var(--ash)" style={{ fontSize: 10, marginBottom: 10, justifyContent: "flex-end", display: "flex" }}>· Bull-market top · called publicly ·</ML>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 600, color: "var(--bone)", letterSpacing: "-0.025em", lineHeight: 1.15 }}>
              Biggest crypto liquidation event<br /><em style={{ color: "var(--pink)" }}>on record.</em>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 28 }}>
          <ML color="var(--ash)" style={{ marginBottom: 14, fontSize: 9 }}>· The breakdown · How the call was made · YouTube ·</ML>
          <InlineYouTube videoId="e2WK6gO0ZsU" title="Cameron Fous · How I called the 2025 bull-market top and banked $237K in a single day" />
        </div>
      </Section>

      <ApplyBand caption="Tops · bottoms · everything in between" href={qualifyHref} />

      {/* Cinematic Porsche divider */}
      <section style={{ borderBottom: "1px solid var(--line)" }}>
        <div style={{ position: "relative", aspectRatio: "21/9", background: "var(--bg-1)", overflow: "hidden" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/uploads/lifestyle/porsche-side-tall.jpg" alt="Porsche 911 Targa GTS · paid in profit" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(270deg, rgba(6,7,10,0.92) 0%, rgba(6,7,10,0.4) 50%, rgba(6,7,10,0.0) 100%)" }} />
          <Wrap style={{ position: "absolute", inset: 0, padding: "0 48px", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
            <div style={{ maxWidth: 540, textAlign: "right" }}>
              <ML style={{ marginBottom: 18, justifyContent: "flex-end", display: "flex" }}>· Closed out the year ·</ML>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 60, lineHeight: 0.98, letterSpacing: "-0.045em", color: "var(--bone)" }}>
                Picked up in cash.<br />
                <em style={{ color: "var(--acid)", textShadow: "0 0 36px rgba(191,250,70,0.35)" }}>End of cycle.</em>
              </div>
            </div>
          </Wrap>
        </div>
      </section>

      <CycleSection />

      {/* Lifestyle grid */}
      <Section py={120} style={{ borderBottom: "1px solid var(--line)" }}>
        <div style={{ marginBottom: 48, maxWidth: 1100 }}>
          <ML style={{ marginBottom: 14 }}>· What the work funds ·</ML>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 64, lineHeight: 0.98, letterSpacing: "-0.04em", color: "var(--bone)", margin: 0 }}>
            Plan once a week.<br /><em style={{ color: "var(--acid)" }}>Live everywhere else.</em>
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[
            { src: "uploads/lifestyle/porsche-walk-back.jpg", ratio: "16/10", tag: "The Porsche", line: "911 Targa GTS · paid in cash" },
            { src: "uploads/lifestyle/bentley-wide.jpg",       ratio: "16/10", tag: "The Bentley", line: "Bentayga · family rig" },
            { src: "uploads/lifestyle/deck-trading.jpg",       ratio: "4/5",   tag: "Sunset deck", line: "Sunday plan · paradise office" },
            { src: "uploads/lifestyle/alpine-1.jpg",           ratio: "4/5",   tag: "French Alps", line: "Travel planned a week ago" },
          ].map((c, i) => (
            <div key={i} style={{ background: "var(--bg-1)", border: "1px solid var(--line)", overflow: "hidden" }}>
              <PhotoFrame src={c.src} alt={c.tag} ratio={c.ratio} objectPosition="center" style={{ border: 0, borderBottom: "1px solid var(--line)" }} />
              <div style={{ padding: "16px 22px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                <ML color="var(--bone)" style={{ fontSize: 10 }}>· {c.tag}</ML>
                <ML color="var(--ash)" style={{ fontSize: 9 }}>· {c.line} ·</ML>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <ApplyBand caption="Your turn · same method" href={qualifyHref} />

      {/* Student Wins */}
      <Section id="wins" py={140} style={{ borderBottom: "1px solid var(--line)" }}>
        <H num="04" label="Student Wins" title={<>It&rsquo;s not just Cam. <em style={{ color: "var(--acid)" }}>The students eat too.</em></>} sub="Real handles. Real platforms. Real dollar figures. Posted in the live Quantum Cipher room every week — 12 of hundreds." />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          {WIN_TILES.map((t, i) => <ProofTile key={i} {...t} />)}
        </div>
      </Section>

      <ApplyBand caption="100s of operators · already inside" href={qualifyHref} />

      <ReviewsWall />

      <ApplyBand caption="100s of operators · already inside" href={qualifyHref} />

      <WhatsIncluded />

      <ApplyBand caption="Everything · one stack · one application" href={qualifyHref} />

      {/* Video Testimonials */}
      <Section id="videos" py={140} style={{ borderBottom: "1px solid var(--line)" }}>
        <H num="07" label="Video Testimonials" title={<>20 real faces. <em style={{ color: "var(--acid)" }}>Zero scripts.</em></>} sub="Unedited video testimonials from real Wolfpack members. Different countries, different starting capital, different ages. Same system. Click any one to play." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          {VIDEOS.map((v, i) => <VideoTestimonialCard key={i} videoId={v.id} headline={v.h} body={v.b} />)}
        </div>
      </Section>

      {/* Final CTA */}
      <Section id="apply" py={140}>
        <div style={{ background: "var(--bg-1)", border: "1px solid var(--acid)", padding: "88px 64px", position: "relative", overflow: "hidden", boxShadow: "0 0 80px rgba(191,250,70,0.12)", textAlign: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/uploads/lifestyle/porsche-back-cine.jpg" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", opacity: 0.35 }} />
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(180deg, rgba(6,7,10,0.85) 0%, rgba(6,7,10,0.75) 100%), radial-gradient(900px 600px at 50% 50%, rgba(191,250,70,0.08), transparent 60%)" }} />
          <div style={{ position: "relative" }}>
            <ML style={{ marginBottom: 24, justifyContent: "center" }}>· Apply for your seat · 2026 cohort ·</ML>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 108, lineHeight: 0.93, letterSpacing: "-0.045em", color: "var(--bone)", margin: 0 }}>
              You&rsquo;ve seen the receipts.<br /><em style={{ color: "var(--acid)" }}>Now apply.</em>
            </h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 20, lineHeight: 1.6, color: "var(--ash)", margin: "32px auto 44px", maxWidth: 760, fontWeight: 400 }}>
              Application-only. Cohort capped at 60 operators. Reviewed personally — most don&rsquo;t pass that step. If the program is right for you, the operator call is your next move.
            </p>
            <a href={qualifyHref} className="btn btn-lg" style={{ fontSize: 16, padding: "28px 52px" }}>File My Application →</a>
            <div style={{ marginTop: 48, paddingTop: 32, borderTop: "1px solid var(--line)", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, maxWidth: 920, margin: "48px auto 0" }}>
              {[["Reviewed", "Personally · weekly"], ["Decision", "Within 7 days"], ["Call", "30-min operator chat"], ["Cohort", "Capped at 60"]].map(([k, v], i) => (
                <div key={i}>
                  <ML color="var(--ash)" style={{ fontSize: 9 }}>· {k}</ML>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: "var(--bone)", letterSpacing: "-0.015em", marginTop: 6 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Footer />
    </>
  );
}

export default function TrainingPage() {
  return (
    <Suspense fallback={null}>
      <TrainingPageInner />
    </Suspense>
  );
}
