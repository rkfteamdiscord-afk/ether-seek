import { ghostTargets, systemPrompt, type GhostReply, type GhostTarget, type GhostTurn } from "./ghost-prompt";

/**
 * Browser fallback for the guide ghost's AI, used when the site runs without a server
 * (static hosting) or without a Groq key. It calls Pollinations, a free text AI that
 * needs no key, with the same rules as the server; any failure returns null and the
 * ghost uses its built-in answers.
 */
const ENDPOINT = "https://text.pollinations.ai/openai";

export async function askGhostInBrowser(question: string, history: GhostTurn[]): Promise<GhostReply> {
  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model: "openai",
        temperature: 0.6,
        messages: [{ role: "system", content: systemPrompt }, ...history.slice(-6), { role: "user", content: question.slice(0, 300) }],
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = payload.choices?.[0]?.message?.content ?? "";
    const json = content.match(/\{[\s\S]*\}/)?.[0];
    const parsed = json ? (JSON.parse(json) as { answer?: unknown; target?: unknown }) : { answer: content };
    const answer = typeof parsed.answer === "string" ? parsed.answer.trim().slice(0, 500) : "";
    if (!answer) return null;
    const target = ghostTargets.includes(parsed.target as GhostTarget) ? (parsed.target as GhostTarget) : "aucun";
    return { answer, target };
  } catch {
    return null;
  }
}
