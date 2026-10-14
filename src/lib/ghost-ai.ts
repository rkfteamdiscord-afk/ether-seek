import { createServerFn } from "@tanstack/react-start";
import { ghostTargets, systemPrompt, type GhostReply, type GhostTarget, type GhostTurn } from "./ghost-prompt";

export type { GhostReply, GhostTarget, GhostTurn };

/**
 * The guide ghost's small AI. Runs only on the server so the Groq key never reaches
 * the browser: it is read from the GROQ_API_KEY environment variable (GROQ_MODEL and
 * GROQ_BASE_URL are optional overrides). Returns null whenever the AI is unavailable,
 * and the ghost then falls back to its built-in answers.
 */

function validate(input: unknown): { question: string; history: GhostTurn[] } {
  const value = (input ?? {}) as { question?: unknown; history?: unknown };
  const question = typeof value.question === "string" ? value.question.trim().slice(0, 300) : "";
  if (!question) throw new Error("Question manquante");
  const history = (Array.isArray(value.history) ? value.history : [])
    .filter((turn): turn is GhostTurn => !!turn && (turn.role === "user" || turn.role === "assistant") && typeof turn.content === "string")
    .slice(-6)
    .map((turn) => ({ role: turn.role, content: turn.content.slice(0, 400) }));
  return { question, history };
}

export const askGhost = createServerFn({ method: "POST" })
  .validator(validate)
  .handler(async ({ data }): Promise<GhostReply> => {
    const key = process.env["GROQ_API_KEY"];
    if (!key) return null;
    const base = process.env["GROQ_BASE_URL"] ?? "https://api.groq.com/openai/v1";
    try {
      const response = await fetch(`${base}/chat/completions`, {
        method: "POST",
        headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
        body: JSON.stringify({
          model: process.env["GROQ_MODEL"] ?? "llama-3.3-70b-versatile",
          temperature: 0.6,
          max_tokens: 220,
          response_format: { type: "json_object" },
          messages: [{ role: "system", content: systemPrompt }, ...data.history, { role: "user", content: data.question }],
        }),
        signal: AbortSignal.timeout(12000),
      });
      if (!response.ok) {
        console.error("Ghost AI request failed", response.status);
        return null;
      }
      const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
      const parsed = JSON.parse(payload.choices?.[0]?.message?.content ?? "{}") as { answer?: unknown; target?: unknown };
      const answer = typeof parsed.answer === "string" ? parsed.answer.trim().slice(0, 500) : "";
      if (!answer) return null;
      const target = ghostTargets.includes(parsed.target as GhostTarget) ? (parsed.target as GhostTarget) : "aucun";
      return { answer, target };
    } catch (error) {
      console.error("Ghost AI unavailable", error);
      return null;
    }
  });
