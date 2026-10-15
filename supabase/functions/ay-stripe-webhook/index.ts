// Stripe webhook: records paid orders and refunds. Deploy with --no-verify-jwt; authenticity is
// checked with the Stripe signature (STRIPE_WEBHOOK_SECRET).
import { getDoc, json, loadSettings, putDoc, stripe } from "../_shared/util.ts";

async function verify(payload: string, header: string, secret: string): Promise<boolean> {
  const parts = Object.fromEntries(
    header.split(",").map((kv) => kv.split("=") as [string, string]),
  );
  const timestamp = parts["t"];
  const signatures = header
    .split(",")
    .filter((p) => p.startsWith("v1="))
    .map((p) => p.slice(3));
  if (!timestamp || !signatures.length) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${timestamp}.${payload}`)),
  );
  const expected = Array.from(mac, (b) => b.toString(16).padStart(2, "0")).join("");
  return signatures.some((sig) => sig.length === expected.length && timingSafeEqual(sig, expected));
}

function timingSafeEqual(a: string, b: string) {
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

Deno.serve(async (req) => {
  const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!secret) return json({ error: "Webhook not configured" }, 500);
  const payload = await req.text();
  if (!(await verify(payload, req.headers.get("stripe-signature") ?? "", secret)))
    return json({ error: "Invalid signature" }, 400);
  const event = JSON.parse(payload);

  try {
    if (
      event.type === "checkout.session.completed" &&
      event.data.object.payment_status === "paid"
    ) {
      const s = event.data.object;
      if (await getDoc("orders", s.id)) return json({ received: true, duplicate: true });
      const settings = await loadSettings();
      const product = s.metadata?.product === "pass" ? "pass" : "report";
      let promoCode = "";
      if (s.total_details?.amount_discount > 0) {
        const full = await stripe<{ discounts?: Array<{ promotion_code?: { code?: string } }> }>(
          `checkout/sessions/${s.id}?expand[]=discounts.promotion_code`,
          undefined,
          "GET",
        ).catch(() => null);
        promoCode = full?.discounts?.[0]?.promotion_code?.code ?? "";
      }
      const created = new Date(s.created * 1000);
      await putDoc(
        "orders",
        s.id,
        {
          id: s.id,
          createdAt: created.toISOString(),
          userId: s.metadata?.user_id ?? "",
          email: (s.customer_details?.email ?? s.customer_email ?? "").toLowerCase(),
          product,
          amountUsd: (s.amount_total ?? 0) / 100,
          status: "paid",
          countryIds: (s.metadata?.countries ?? "").split(",").filter(Boolean),
          promoCode,
          stripeSessionId: s.id,
          paymentIntent: s.payment_intent ?? "",
          expiresAt:
            product === "pass"
              ? new Date(
                  created.getTime() + settings.pricing.explorerPassDays * 86_400_000,
                ).toISOString()
              : "",
        },
        s.metadata?.user_id || null,
      );
    }
    if (event.type === "charge.refunded") {
      const intent = event.data.object.payment_intent;
      const sessions = await stripe<{ data: Array<{ id: string }> }>(
        `checkout/sessions?payment_intent=${intent}`,
        undefined,
        "GET",
      );
      for (const s of sessions.data) {
        const order = await getDoc<Record<string, unknown>>("orders", s.id);
        if (order)
          await putDoc(
            "orders",
            s.id,
            { ...order, status: "refunded" },
            (order["userId"] as string) || null,
          );
      }
    }
    return json({ received: true });
  } catch (error) {
    console.error(error);
    return json({ error: "Webhook handling failed" }, 500);
  }
});
