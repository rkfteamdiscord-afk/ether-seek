// Creates a Stripe Checkout Session. Prices are read from the database, never from the browser.
import { cors, getUser, json, loadSettings, stripe } from "../_shared/util.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const user = await getUser(req);
    if (!user) return json({ error: "Please log in to continue to payment." }, 401);
    const body = await req.json();
    const product = body.product === "pass" ? "pass" : "report";
    const countryIds: string[] = Array.isArray(body.countryIds)
      ? body.countryIds.filter(
          (c: unknown) => typeof c === "string" && /^[a-z0-9-]{1,12}$/.test(c as string),
        )
      : [];
    const origin = String(body.origin ?? "");
    const allowedOrigin = Deno.env.get("AY_SITE_URL");
    if (allowedOrigin && origin !== allowedOrigin) return json({ error: "Invalid origin" }, 400);

    const settings = await loadSettings();
    if (settings.validationMode)
      return json({ error: "Payments are paused while we validate demand." }, 409);
    if (
      product === "report" &&
      (countryIds.length < 1 || countryIds.length > settings.pricing.maxCountriesPerReport)
    ) {
      return json(
        { error: `Choose 1 to ${settings.pricing.maxCountriesPerReport} countries.` },
        400,
      );
    }
    const amount =
      product === "pass" ? settings.pricing.explorerPassUsd : settings.pricing.fullReportUsd;
    const name =
      product === "pass"
        ? `AbroadYield Explorer Pass (${settings.pricing.explorerPassDays} days)`
        : `AbroadYield Full Report (${countryIds.join(", ").toUpperCase()})`;
    const safePath = (p: unknown, fallback: string) =>
      typeof p === "string" && p.startsWith("/abroadyield/") ? p : fallback;
    const success = `${origin}${safePath(body.successPath, "/abroadyield/checkout?status=success")}&session_id={CHECKOUT_SESSION_ID}`;
    const cancel = `${origin}${safePath(body.cancelPath, "/abroadyield/results?checkout=cancelled")}`;

    const params: Record<string, string> = {
      mode: "payment",
      "line_items[0][quantity]": "1",
      "line_items[0][price_data][currency]": "usd",
      "line_items[0][price_data][unit_amount]": String(Math.round(amount * 100)),
      "line_items[0][price_data][product_data][name]": name,
      customer_email: user.email,
      "payment_intent_data[receipt_email]": user.email,
      success_url: success,
      cancel_url: cancel,
      client_reference_id: user.id,
      "metadata[user_id]": user.id,
      "metadata[product]": product,
      "metadata[countries]": countryIds.join(","),
    };
    if (settings.allowPromotionCodes) params["allow_promotion_codes"] = "true";
    const session = await stripe<{ url: string }>("checkout/sessions", params);
    return json({ url: session.url });
  } catch (error) {
    console.error(error);
    return json({ error: error instanceof Error ? error.message : "Checkout failed" }, 500);
  }
});
