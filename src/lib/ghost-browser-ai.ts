import { ghostTargets, systemPrompt, type GhostReply, type GhostTarget, type GhostTurn } from "./ghost-prompt";

/**
 * Browser fallback for the guide ghost's AI, used when the site runs without a server
 * (static hosting) or without a Groq key. It calls Pollinations, a free text AI that
 * needs no key, with the same rules as the server; any failure returns null and the
 * ghost uses its built-in answers.
 */
const ENDPOINT = "https://text.pollinations.ai/openai";
const TEXT_ENDPOINT = "https://text.pollinations.ai";

function parseReply(content: string): GhostReply {
  const json = content.match(/\{[\s\S]*\}/)?.[0];
  let parsed: { answer?: unknown; target?: unknown } = { answer: content };
  try { if (json) parsed = JSON.parse(json) as typeof parsed; } catch { /* plain text answer */ }
  const answer = typeof parsed.answer === "string" ? parsed.answer.trim().slice(0, 500) : "";
  if (!answer) return null;
  const target = ghostTargets.includes(parsed.target as GhostTarget) ? (parsed.target as GhostTarget) : "aucun";
  return { answer, target };
}

/** First the chat-style endpoint, then the plain text one; null if both fail. */
export async function askGhostInBrowser(question: string, history: GhostTurn[]): Promise<GhostReply> {
  const asked = question.slice(0, 300);
  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ model: "openai", messages: [{ role: "system", content: systemPrompt }, ...history.slice(-6), { role: "user", content: asked }] }),
      signal: AbortSignal.timeout(15000),
    });
    if (response.ok) {
      const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
      const reply = parseReply(payload.choices?.[0]?.message?.content ?? "");
      if (reply) return reply;
    }
  } catch { /* try the plain endpoint */ }
  try {
    const url = `${TEXT_ENDPOINT}/${encodeURIComponent(asked)}?model=openai&system=${encodeURIComponent(systemPrompt)}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    return response.ok ? parseReply(await response.text()) : null;
  } catch {
    return null;
  }
}
