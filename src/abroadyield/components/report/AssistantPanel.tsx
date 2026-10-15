import { Bot, Send } from "lucide-react";
import { useRef, useState } from "react";
import { track } from "../../lib/analytics";
import {
  contextForAi,
  consumeRateLimit,
  groundedAnswer,
  isAdviceRequest,
  ADVICE_REFUSAL,
  type KnowledgeChunk,
} from "../../lib/assistant";
import { getBackend } from "../../store";
import { Button, TextInput } from "../ui";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "How much will I keep after taxes?",
  "Do I need to file an FBAR?",
  "What are the closing costs?",
  "Can I get a mortgage?",
  "What are the main risks?",
];

/** "Ask about your report" chat. Answers only from the report's data, with citations. */
export function AssistantPanel({
  chunks,
  limitPerHour,
  countryName,
}: {
  chunks: KnowledgeChunk[];
  limitPerHour: number;
  countryName: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const listRef = useRef<HTMLOListElement>(null);

  async function ask(text: string) {
    const q = text.trim().slice(0, 400);
    if (!q || busy) return;
    const limit = consumeRateLimit(limitPerHour);
    if (!limit.allowed) {
      setNotice(
        `You've reached the limit of ${limitPerHour} questions per hour. Please try again later.`,
      );
      return;
    }
    setNotice("");
    setQuestion("");
    const history = [...messages, { role: "user" as const, content: q }];
    setMessages(history);
    setBusy(true);
    track("assistant_question", { country: countryName });
    let answer: string | null = null;
    if (isAdviceRequest(q)) {
      answer = ADVICE_REFUSAL;
    } else {
      try {
        answer = await getBackend().askAssistant({
          question: q,
          reportContext: contextForAi(chunks),
          history: messages.slice(-6),
        });
      } catch (error) {
        if (error instanceof Error && /rate limit/i.test(error.message)) setNotice(error.message);
      }
      answer ??= groundedAnswer(q, chunks).answer;
    }
    setMessages([...history, { role: "assistant", content: answer }]);
    setBusy(false);
    requestAnimationFrame(() =>
      listRef.current?.lastElementChild?.scrollIntoView({ block: "nearest" }),
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2">
        <Bot aria-hidden className="size-6 text-ay-navy" />
        <h2 className="text-xl font-semibold">Ask about your report</h2>
      </div>
      <p className="mt-1 text-sm text-ay-slate">
        Answers come only from your report and our stored data, with the section and date cited.
        Your questions may be processed by an AI service. Not tax, legal or investment advice.
      </p>

      <ol
        ref={listRef}
        className="mt-4 max-h-96 min-h-24 space-y-3 overflow-y-auto"
        aria-live="polite"
      >
        {messages.length === 0 ? (
          <li className="text-ay-slate">Try one of these:</li>
        ) : (
          messages.map((m, i) => (
            <li
              key={i}
              className={
                m.role === "user"
                  ? "ml-8 rounded-xl bg-ay-navy px-4 py-2.5 text-white"
                  : "mr-4 whitespace-pre-line rounded-xl bg-ay-mist px-4 py-2.5 text-ay-ink"
              }
            >
              <span className="sr-only">{m.role === "user" ? "You asked: " : "Assistant: "}</span>
              {m.content}
            </li>
          ))
        )}
        {busy ? (
          <li className="mr-4 rounded-xl bg-ay-mist px-4 py-2.5 text-ay-slate">
            Looking it up in your report…
          </li>
        ) : null}
      </ol>

      {messages.length === 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => void ask(s)}
              className="min-h-11 rounded-full border border-ay-line bg-white px-3 text-sm text-ay-ink hover:bg-ay-mist"
            >
              {s}
            </button>
          ))}
        </div>
      ) : null}

      {notice ? (
        <p role="alert" className="mt-3 text-sm font-medium text-ay-warn">
          {notice}
        </p>
      ) : null}

      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void ask(question);
        }}
      >
        <label htmlFor="assistant-q" className="sr-only">
          Your question
        </label>
        <TextInput
          id="assistant-q"
          value={question}
          maxLength={400}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. How is the Foreign Tax Credit calculated?"
        />
        <Button
          type="submit"
          disabled={busy || !question.trim()}
          aria-label="Send question"
          className="px-4"
        >
          <Send aria-hidden className="size-5" />
        </Button>
      </form>
    </div>
  );
}
