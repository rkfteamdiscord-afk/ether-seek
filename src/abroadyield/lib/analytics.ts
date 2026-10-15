import { getBackend, newId } from "../store";
import type { AnalyticsEvent, FunnelEvent } from "../types";

/**
 * Funnel event tracking. Events are anonymous (a random per-tab session id, no IP, no email)
 * and stored in the same backend as everything else so the admin dashboard can count them.
 */

const SESSION_KEY = "ay.v1.analytics-session";

function sessionId(): string {
  try {
    let id = window.sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = newId("s");
      window.sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "anonymous";
  }
}

export function track(name: FunnelEvent, props: AnalyticsEvent["props"] = {}) {
  if (typeof window === "undefined") return;
  const event: AnalyticsEvent = {
    id: newId("evt"),
    name,
    at: new Date().toISOString(),
    sessionId: sessionId(),
    props,
  };
  void getBackend()
    .insert("events", event)
    .catch(() => undefined);
  const layer = (window as unknown as { dataLayer?: unknown[] }).dataLayer;
  if (Array.isArray(layer)) layer.push({ event: `ay_${name}`, ...props });
}

/** Funnel order used by the analytics dashboard. */
export const FUNNEL: Array<{ name: FunnelEvent; label: string }> = [
  { name: "landing_view", label: "Visitors (landing views)" },
  { name: "questionnaire_start", label: "Started questionnaire" },
  { name: "questionnaire_complete", label: "Completed questionnaire" },
  { name: "results_view", label: "Viewed free results" },
  { name: "unlock_click", label: "Clicked “Unlock”" },
  { name: "checkout_start", label: "Started checkout" },
  { name: "purchase", label: "Purchased" },
  { name: "expert_request", label: "Expert requests" },
];
