// Admin-only: refunds an order through Stripe and marks it refunded.
import { cors, getDoc, getUser, isAdmin, json, putDoc, stripe } from "../_shared/util.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  const user = await getUser(req);
  if (!user || !(await isAdmin(user.token))) return json({ error: "Admin access required" }, 403);
  try {
    const { orderId } = await req.json();
    const order = await getDoc<Record<string, unknown>>("orders", String(orderId));
    if (!order) return json({ error: "Order not found" }, 404);
    if (order["status"] === "refunded") return json({ ok: true });
    if (order["status"] === "paid" && order["paymentIntent"]) {
      await stripe("refunds", {
        payment_intent: String(order["paymentIntent"]),
        "metadata[refunded_by]": user.email,
      });
    }
    await putDoc(
      "orders",
      String(orderId),
      { ...order, status: "refunded", refundedAt: new Date().toISOString() },
      (order["userId"] as string) || null,
    );
    return json({ ok: true });
  } catch (error) {
    console.error(error);
    return json({ error: error instanceof Error ? error.message : "Refund failed" }, 500);
  }
});
