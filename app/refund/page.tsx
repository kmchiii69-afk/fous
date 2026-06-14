import LegalShell, { H2, P, UL, LI, Callout } from "@/components/legal/LegalShell";

export const metadata = {
  title: "Refund Policy · Quantum Cipher Lab",
  description: "Refund eligibility, conditions, and how to request a refund.",
};

export default function RefundPage() {
  return (
    <LegalShell kicker="Legal" title="Refund Policy" effectiveDate="May 18, 2026">
      <P>
        This Refund Policy explains when and how you may request a refund for products and services purchased from <strong style={{ color: "var(--bone)" }}>iknkfx inc</strong>, operating under the brand <strong style={{ color: "var(--bone)" }}>Quantum Cipher Lab</strong>. By purchasing any product or service from us, you agree to this policy.
      </P>

      <Callout>
        Trading involves substantial risk of loss. Our products are educational and do not guarantee profit. A refund request based on the fact that trading is risky, that you did not make money, or that the markets moved against you will not be approved. Risk is a feature of trading, not a defect of our education.
      </Callout>

      <H2>1. All Sales Final by Default</H2>
      <P>
        Because our products consist primarily of digital educational content, live sessions, community access, and proprietary methodology — all of which are delivered instantly and cannot be &ldquo;returned&rdquo; — <strong style={{ color: "var(--bone)" }}>all sales are final unless otherwise stated in this policy or in the specific product&rsquo;s purchase terms</strong>.
      </P>

      <H2>2. Limited 7-Day Refund Window</H2>
      <P>
        For certain flagship paid programs, we offer a <strong style={{ color: "var(--bone)" }}>7-day refund window</strong> from the date of purchase, subject to <strong style={{ color: "var(--bone)" }}>all</strong> of the following conditions:
      </P>
      <UL>
        <LI>The refund request is submitted through our contact form at <a href="https://quantumcipherlab.com/contact" style={{ color: "var(--acid)" }}>quantumcipherlab.com/contact</a> within seven (7) calendar days of the original purchase date.</LI>
        <LI>You have consumed less than 20% of the program&rsquo;s content (measured by lessons viewed, modules accessed, or sessions attended).</LI>
        <LI>You have not downloaded, screen-captured, or redistributed any proprietary materials.</LI>
        <LI>You have not violated the <a href="/terms" style={{ color: "var(--acid)" }}>Terms of Service</a>.</LI>
      </UL>
      <P>
        We reserve the right to deny refund requests that do not meet every condition above. Decisions are made at our sole discretion.
      </P>

      <H2>3. Non-Refundable Products</H2>
      <P>The following are <strong style={{ color: "var(--bone)" }}>not eligible for a refund under any circumstance</strong>:</P>
      <UL>
        <LI>One-on-one coaching, mentorship sessions, or strategy calls, once scheduled or completed</LI>
        <LI>Live events, workshops, retreats, and in-person experiences, once booked</LI>
        <LI>Lifetime-access products beyond the 7-day window</LI>
        <LI>Subscriptions after the first billing period</LI>
        <LI>Digital downloads (PDFs, indicators, scripts, worksheets, etc.) once accessed</LI>
        <LI>Free trials that convert to paid subscriptions (cancel before conversion to avoid charges)</LI>
        <LI>Discounted, promotional, or bundled offers (unless the offer specifically states otherwise)</LI>
      </UL>

      <H2>4. Subscriptions</H2>
      <P>
        Recurring subscriptions auto-renew at the end of each billing period. To stop future charges, cancel before your next renewal date. Cancelling stops future billing but does not refund the current billing period. Partial-month refunds are not provided.
      </P>

      <H2>5. Chargebacks and Disputes</H2>
      <P>
        If you have a billing concern, <strong style={{ color: "var(--bone)" }}>contact us first</strong> before filing a chargeback with your bank or card issuer. Filing a chargeback without first attempting to resolve the matter with us is a violation of these terms and may result in:
      </P>
      <UL>
        <LI>Immediate termination of your access to all our products and services, without refund</LI>
        <LI>Permanent banning from future purchases</LI>
        <LI>Recovery of associated fees, costs, and reasonable attorneys&rsquo; fees in collections or litigation</LI>
      </UL>

      <H2>6. How to Request a Refund</H2>
      <P>To request a refund, submit a ticket through our contact form at <a href="https://quantumcipherlab.com/contact" style={{ color: "var(--acid)" }}>quantumcipherlab.com/contact</a> with:</P>
      <UL>
        <LI>The full name on the order</LI>
        <LI>The email address used at purchase</LI>
        <LI>The order ID or receipt number</LI>
        <LI>The product or program name</LI>
        <LI>A brief reason for the request</LI>
      </UL>
      <P>
        We aim to respond within 3 business days. Approved refunds are processed back to the original payment method within 5–10 business days. Your bank may take additional time to post the credit.
      </P>

      <H2>7. Changes to This Policy</H2>
      <P>
        We may update this Refund Policy from time to time. The &ldquo;Effective&rdquo; date at the top reflects the latest revision. The policy in effect at the time of your purchase governs that purchase.
      </P>

      <H2>8. Contact</H2>
      <P>
        Refund-related questions:<br />
        <strong style={{ color: "var(--bone)" }}>iknkfx inc</strong><br />
        Submit a ticket through our contact form at <a href="https://quantumcipherlab.com/contact" style={{ color: "var(--acid)" }}>quantumcipherlab.com/contact</a>.
      </P>

      <Callout>
        This refund policy is a starting template. Confirm refund windows and conditions match your actual offers, payment processor requirements (Stripe, etc.), and any consumer protection laws in jurisdictions where you sell.
      </Callout>
    </LegalShell>
  );
}
