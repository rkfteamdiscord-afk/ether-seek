import { Link, createFileRoute } from "@tanstack/react-router";
import { Container, buttonClass } from "@/abroadyield/components/ui";
import { formatDate } from "@/abroadyield/engine";
import { Markdown } from "@/abroadyield/lib/markdown";
import { DISCLAIMER } from "@/abroadyield/profile";
import { useSiteData } from "@/abroadyield/store/hooks";
import type { Settings } from "@/abroadyield/types";

/**
 * Legal pages. These are starting templates written for the product as built; they must be
 * reviewed by a qualified attorney (company name, address, governing law) before launch.
 */
const PAGES: Record<string, { title: string; body: (s: Settings) => string }> = {
  terms: {
    title: "Terms of Service",
    body: (
      s,
    ) => `These terms govern your use of AbroadYield ("we", "us"). By using the site you agree to them.

## Educational estimates only
${DISCLAIMER} Figures are estimates based on stored parameters that may be incomplete, out of date or labelled as sample data. You are responsible for your own decisions.

## Accounts
You must give accurate information and keep your password secure. You must be at least 18 years old.

## Purchases
Full Reports ($${s.pricing.fullReportUsd}) and the Explorer Pass ($${s.pricing.explorerPassUsd}, ${s.pricing.explorerPassDays} days) are one-time purchases for personal use. Reports may not be resold or redistributed. Our [refund policy](/abroadyield/legal/refunds) applies.

## Expert introductions
Partners are independent businesses. We do not supervise or guarantee their services, and any agreement you make with them is between you and the partner. See our [partner disclosure](/abroadyield/legal/partner-disclosure).

## AI assistant
The report assistant answers only from your report data and may be wrong. It does not give advice.

## Liability
To the extent permitted by law, our total liability is limited to the amount you paid us in the 12 months before the claim.

## Changes
We may update these terms and will post the date of the latest version on this page.`,
  },
  privacy: {
    title: "Privacy Policy",
    body: () => `We collect only what we need to give you your results, and we never sell your personal information.

## What we collect
- **Questionnaire answers**: citizenship, residence and state, income bracket, filing status, cash, budget, goals and preferences. Financial inputs are encrypted at rest.
- **Account data**: email address and a securely hashed password, or a sign-in link.
- **Purchases**: product, amount and date. Card details are handled by Stripe and never reach our servers.
- **Expert requests**: the details you choose to send, shared with one partner only after you tick the consent box.
- **Usage events**: anonymous funnel events (for example "questionnaire completed") with a random session ID, no IP address.

## How we use it
To calculate your ranking and reports, deliver purchases and receipts, route expert requests you ask for, prevent abuse, and improve the product. Marketing emails are sent only if you opted in, and you can unsubscribe at any time.

## AI processing
If you use the report assistant, your question and the relevant parts of your report are sent to an AI service provider to generate an answer. They are not used to train models under our agreement and are not stored by us.

## Your California privacy rights (CCPA/CPRA)
California residents have the right to know what personal information we collect, to delete it, to correct it, to opt out of its sale or sharing (we do not sell or share it for cross-context advertising), to limit use of sensitive personal information, and not to be discriminated against for exercising these rights. You can delete your account and data at any time from your account page, or email us. We will verify and respond within 45 days.

## Retention
We keep your data while your account is active. When you delete your account we delete your answers, reports and expert requests; we keep anonymised payment records as required by tax law.

## Security
Data is encrypted in transit and at rest, access is restricted by role, and administrative edits are logged.

## Contact
Privacy requests: privacy@abroadyield.example (replace before launch).`,
  },
  cookies: {
    title: "Cookie Policy",
    body: () => `We use as few cookies and similar technologies as possible.

## Strictly necessary
- **Sign-in session** (browser storage): keeps you logged in.
- **Questionnaire answers** (browser storage): so your ranking is there when you come back.
- **Payment** (Stripe): Stripe sets cookies on its own checkout page to prevent fraud.

## Analytics
We record anonymous funnel events with a random session ID stored for the current tab only. We do not use advertising cookies or cross-site trackers.

## Your choices
You can clear browser storage at any time; you will be signed out and your saved answers on this device will be removed.`,
  },
  refunds: {
    title: "Refund Policy",
    body: (s) => `If a report doesn't help you, we'll refund it.

## ${s.refundDays}-day money-back guarantee
Ask for a full refund within ${s.refundDays} days of purchase from your account page ("Request refund") or by replying to your receipt email. No questions asked.

## How refunds are paid
Refunds go back to the original payment method through Stripe and usually appear within 5–10 business days. Access to the refunded report or pass ends when the refund is issued.

## Explorer Pass
The same ${s.refundDays}-day guarantee applies from the date of purchase.`,
  },
  "partner-disclosure": {
    title: "Partner Disclosure",
    body: () => `AbroadYield introduces users to independent experts: US expat tax firms, international mortgage brokers, local real estate agents and local attorneys.

## How introductions work
We only share your details with a partner after you submit a request and tick "I agree to share this information with the selected partner." We share them with one partner per request.

## Referral fees
AbroadYield may receive a referral fee or commission from partners when we introduce a client or when a client becomes a customer. This never increases the price you pay the partner.

## Independence
Partners do not pay to influence country scores, report numbers or rankings, which are calculated by the same formulas for everyone. Partner fees are recorded separately from report data.

## Vetting
We check licences and professional standing before adding a partner, but partners remain independent and responsible for their own services.`,
  },
};

export const Route = createFileRoute("/abroadyield/legal/$page")({
  head: ({ params }) => ({
    meta: [{ title: `${PAGES[params.page]?.title ?? "Legal"} — AbroadYield` }],
  }),
  component: LegalPage,
});

function LegalPage() {
  const { page } = Route.useParams();
  const { settings } = useSiteData();
  const content = PAGES[page];
  if (!content) {
    return (
      <Container className="py-20">
        <h1 className="text-3xl font-semibold">Page not found</h1>
        <Link to="/abroadyield" className={buttonClass("primary", "mt-6")}>
          Home
        </Link>
      </Container>
    );
  }
  return (
    <Container className="max-w-3xl py-10 sm:py-14">
      <h1 className="text-3xl font-semibold sm:text-4xl">{content.title}</h1>
      <p className="mt-2 text-ay-slate">Last updated {formatDate(settings.siteLastUpdated)}</p>
      <div className="mt-8 text-lg">
        <Markdown source={content.body(settings)} />
      </div>
    </Container>
  );
}
