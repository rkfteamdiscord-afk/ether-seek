// Deletes the signed-in user's account and personal data. Orders are kept for tax records but
// anonymised (email removed, owner unlinked).
import { admin, cors, getUser, json } from "../_shared/util.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  const user = await getUser(req);
  if (!user) return json({ error: "Not signed in" }, 401);
  try {
    const email = encodeURIComponent(user.email.toLowerCase());
    await admin(
      `ay_documents?owner_id=eq.${user.id}&collection=in.(reports,leads,waitlist,subscribers,refund_requests,unlock_clicks)`,
      { method: "DELETE" },
    );
    await admin(
      `ay_documents?collection=in.(leads,waitlist,subscribers)&data->>email=eq.${email}`,
      { method: "DELETE" },
    );
    const orders = await (
      await admin(
        `ay_documents?collection=eq.orders&or=(owner_id.eq.${user.id},data->>email.eq.${email})&select=id,data`,
      )
    ).json();
    for (const row of orders as Array<{ id: string; data: Record<string, unknown> }>) {
      await admin(`ay_documents?collection=eq.orders&id=eq.${encodeURIComponent(row.id)}`, {
        method: "PATCH",
        body: JSON.stringify({
          owner_id: null,
          data: { ...row.data, email: "deleted-user", userId: "" },
        }),
      });
    }
    const url = Deno.env.get("SUPABASE_URL")!;
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const res = await fetch(`${url}/auth/v1/admin/users/${user.id}`, {
      method: "DELETE",
      headers: { apikey: key, authorization: `Bearer ${key}` },
    });
    if (!res.ok) throw new Error(`Auth delete failed: ${res.status}`);
    return json({ ok: true });
  } catch (error) {
    console.error(error);
    return json({ error: "Deletion failed — please contact support." }, 500);
  }
});
