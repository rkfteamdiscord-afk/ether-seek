// "Ask about your report": answers only from the report context the browser sends (built from
// the platform's stored data), with citations; rate-limited per user. The model key lives in the
// GROQ_API_KEY secret (OpenAI-compatible endpoint; override with AY_AI_BASE_URL / AY_AI_MODEL).
import { admin, cors, getUser, json, loadSettings } from "../_shared/util.ts";

const SYSTEM = `You are the AbroadYield report assistant for US taxpayers looking at property abroad.
Rules — follow all of them:
1. Answer ONLY from the REPORT CONTEXT below. Never use outside knowledge, never estimate or invent numbers.
2. End every answer with the source line: Source: "<section name>" section, data last verified on <date from the context>.
3. If the context does not contain the answer, reply exactly: "I don't know — that isn't covered by your report or our verified data." and suggest a qualified professional.
4. Never give personalised tax, legal or investment advice. Never tell the user to buy, sell or choose a specific property or country. For decisions, recommend a US CPA or enrolled agent and a local attorney.
5. Plain English, at most 120 words. Format money as $1,234.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  const user = await getUser(req);
  if (!user) return json({ error: "Please log in to use the assistant." }, 401);
  const key = Deno.env.get("GROQ_API_KEY");
  if (!key) return json({ answer: null });

  const settings = await loadSettings();
  const since = new Date(Date.now() - 3_600_000).toISOString();
  const usage = await admin(`ay_ai_usage?user_id=eq.${user.id}&at=gte.${since}&select=at`, {
    headers: { prefer: "count=exact" },
  });
  const count = Number(usage.headers.get("content-range")?.split("/")[1] ?? "0");
  if (count >= settings.ai.messagesPerHour)
    return json(
      { error: `Rate limit reached: ${settings.ai.messagesPerHour} questions per hour.` },
      429,
    );
  await admin("ay_ai_usage", {
    method: "POST",
    headers: { prefer: "return=minimal" },
    body: JSON.stringify({ user_id: user.id }),
  });

  const body = await req.json();
  const question = String(body.question ?? "").slice(0, 400);
  const context = String(body.reportContext ?? "").slice(0, 16000);
  const history = (Array.isArray(body.history) ? body.history : [])
    .filter(
      (m: { role?: string; content?: unknown }) =>
        (m.role === "user" || m.role === "assistant") && typeof m.content === "string",
    )
    .slice(-6)
    .map((m: { role: string; content: string }) => ({
      role: m.role,
      content: m.content.slice(0, 800),
    }));
  if (!question) return json({ error: "Empty question" }, 400);

  try {
    const res = await fetch(
      `${Deno.env.get("AY_AI_BASE_URL") ?? "https://api.groq.com/openai/v1"}/chat/completions`,
      {
        method: "POST",
        headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
        body: JSON.stringify({
          model: Deno.env.get("AY_AI_MODEL") ?? "llama-3.3-70b-versatile",
          temperature: 0.1,
          max_tokens: 350,
          messages: [
            { role: "system", content: `${SYSTEM}\n\nREPORT CONTEXT:\n${context}` },
            ...history,
            { role: "user", content: question },
          ],
        }),
        signal: AbortSignal.timeout(15000),
      },
    );
    if (!res.ok) return json({ answer: null });
    const payload = await res.json();
    const answer = String(payload.choices?.[0]?.message?.content ?? "")
      .trim()
      .slice(0, 1500);
    return json({ answer: answer || null });
  } catch (error) {
    console.error(error);
    return json({ answer: null });
  }
});
