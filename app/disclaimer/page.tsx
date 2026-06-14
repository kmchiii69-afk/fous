import LegalShell, { H2, P, UL, LI, Callout } from "@/components/legal/LegalShell";

export const metadata = {
  title: "Disclaimer · Quantum Cipher Lab",
  description: "Risk disclosure for trading education and Quantum Cipher Lab content.",
};

export default function DisclaimerPage() {
  return (
    <LegalShell kicker="Legal" title="Disclaimer" effectiveDate="May 18, 2026">
      <Callout>
        Trading the financial markets — including but not limited to cryptocurrencies, stocks, forex, futures, options, and CFDs — involves <strong style={{ color: "var(--bone)" }}>substantial risk of loss</strong> and is not suitable for every investor. You can lose all of the capital you commit, and in some products, more than your initial deposit. Past performance is not indicative of future results.
      </Callout>

      <H2>1. Educational Content Only</H2>
      <P>
        All content published by <strong style={{ color: "var(--bone)" }}>iknkfx inc</strong>, operating under the brand <strong style={{ color: "var(--bone)" }}>Quantum Cipher Lab</strong> — including but not limited to websites, courses, videos, livestreams, podcasts, written materials, software, indicators, scripts, frameworks, social media posts, and one-on-one coaching — is provided strictly for <strong style={{ color: "var(--bone)" }}>educational and informational purposes</strong>.
      </P>
      <P>
        Nothing we publish should be construed as personalized investment advice or a recommendation to buy, sell, or hold any financial instrument.
      </P>

      <H2>2. Not Financial, Investment, Tax, or Legal Advice</H2>
      <P>
        We are <strong style={{ color: "var(--bone)" }}>not</strong>:
      </P>
      <UL>
        <LI>A registered investment adviser (RIA)</LI>
        <LI>A broker-dealer</LI>
        <LI>A licensed financial planner</LI>
        <LI>A certified public accountant (CPA) or tax professional</LI>
        <LI>An attorney</LI>
        <LI>A fiduciary of any kind for any user, viewer, student, or client</LI>
      </UL>
      <P>
        You should consult qualified, licensed professionals before making any financial, investment, tax, or legal decision. Any reliance you place on our content is strictly at your own risk.
      </P>

      <H2>3. Trading Risk Disclosure</H2>
      <P>
        Trading and investing carry inherent and substantial risk:
      </P>
      <UL>
        <LI><strong style={{ color: "var(--bone)" }}>Most retail traders lose money.</strong> The majority of people who attempt to trade actively lose some or all of their capital.</LI>
        <LI><strong style={{ color: "var(--bone)" }}>You can lose more than your initial deposit</strong> in leveraged products such as futures, options, perpetuals, and margin accounts.</LI>
        <LI><strong style={{ color: "var(--bone)" }}>Cryptocurrencies are highly volatile</strong> and largely unregulated. Many tokens go to zero.</LI>
        <LI><strong style={{ color: "var(--bone)" }}>No system, strategy, or methodology — including ours — guarantees profit.</strong> Markets change, edges erode, and execution is your responsibility.</LI>
        <LI>Only trade with capital you can afford to lose completely.</LI>
      </UL>

      <H2>4. Hypothetical and Past Performance</H2>
      <P>
        Any references to charts, trade examples, backtests, hypothetical results, or historical performance are presented for educational illustration only. <strong style={{ color: "var(--bone)" }}>Past performance is not a reliable indicator of future results.</strong> Hypothetical or simulated results have inherent limitations and may not reflect the impact of real market conditions, slippage, liquidity, fees, or psychology.
      </P>

      <H2>5. Testimonial Disclaimer</H2>
      <P>
        Student testimonials, case studies, screenshots of P&amp;L, video reviews, and other social proof shown on our website or in our marketing represent <strong style={{ color: "var(--bone)" }}>individual experiences</strong>. These results are not typical, not guaranteed, and depend on a wide range of factors including but not limited to capital, risk management, market conditions, time commitment, discipline, and prior experience.
      </P>
      <P>
        Most students do not achieve results comparable to those featured. Some students lose money. Featured testimonials may have been compensated in some form, such as receiving free or discounted access to a program.
      </P>

      <H2>6. Income Disclaimer</H2>
      <P>
        Any references to income, profit, or financial success that you may earn or generate from trading, our programs, or applying our methodology are illustrative only. We make <strong style={{ color: "var(--bone)" }}>no representation, warranty, or guarantee</strong> that you will achieve any specific income or result. The success of any individual depends on numerous factors outside our control.
      </P>

      <H2>7. Forward-Looking Statements</H2>
      <P>
        Our content may contain forward-looking statements about market conditions, trends, or strategies. These statements reflect our opinion at a point in time and are subject to risks, uncertainties, and assumptions. Actual results may differ materially.
      </P>

      <H2>8. Third-Party Content and Affiliations</H2>
      <P>
        We may reference third-party brokers, exchanges, prop firms, tools, or services. We do not endorse, guarantee, or take responsibility for the accuracy, safety, or performance of any third party. We may receive compensation or affiliate commissions from some third parties we mention.
      </P>

      <H2>9. No Solicitation</H2>
      <P>
        Nothing on our website or in our content is an offer or solicitation to buy or sell any security, derivative, or financial instrument in any jurisdiction in which such offer or solicitation would be unlawful.
      </P>

      <H2>10. Your Responsibility</H2>
      <P>
        By engaging with any of our content, products, or services, you acknowledge and agree that:
      </P>
      <UL>
        <LI>You are solely responsible for your trading and investment decisions.</LI>
        <LI>You have read and understood this Disclaimer in its entirety.</LI>
        <LI>You will not hold iknkfx inc or any of its officers, employees, contractors, or affiliates liable for any losses, damages, or costs arising from your use of our content or your trading activity.</LI>
        <LI>You understand that any decisions you make are yours alone.</LI>
      </UL>

      <H2>11. Contact</H2>
      <P>
        Questions about this Disclaimer:<br />
        <strong style={{ color: "var(--bone)" }}>iknkfx inc</strong><br />
        Submit a request through our contact form at <a href="https://quantumcipherlab.com/contact" style={{ color: "var(--acid)" }}>quantumcipherlab.com/contact</a>.
      </P>

      <Callout>
        This disclaimer is a starting template tuned for trading education. The trading education space attracts heightened scrutiny from the SEC, FTC, CFTC, state regulators, and class-action attorneys. Have this reviewed by an attorney familiar with FTC endorsement rules, securities advertising rules, and any state-specific obligations before going live.
      </Callout>
    </LegalShell>
  );
}
