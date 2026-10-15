import { Download, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { formatDate, formatPct, formatUsd } from "../../engine";
import { FUNNEL } from "../../lib/analytics";
import { getBackend } from "../../store";
import { useCollection, useSiteData } from "../../store/hooks";
import type {
  AnalyticsEvent,
  AuditEntry,
  BlogPost,
  ExpertCategory,
  Lead,
  LeadStatus,
  Order,
  Partner,
  WaitlistEntry,
} from "../../types";
import { EXPERT_CATEGORIES } from "../ExpertForm";
import { Button, Pill, Stat } from "../ui";
import {
  AField,
  AdminSection,
  SaveStatus,
  TextBox,
  TextIn,
  downloadCsv,
  today,
  useSaver,
} from "./shared";
import { useQueryClient } from "@tanstack/react-query";

const LEAD_STATUSES: LeadStatus[] = ["new", "sent", "contacted", "converted"];
const categoryLabel = (c: ExpertCategory) => EXPERT_CATEGORIES.find((x) => x.key === c)?.label ?? c;

export function PartnersAdmin() {
  const { countries } = useSiteData();
  const partners = useCollection<Partner>("partners");
  const leads = useCollection<Lead>("leads");
  const { save, remove, status } = useSaver();
  const [filter, setFilter] = useState<LeadStatus | "all">("all");
  const partnerList = partners.data ?? [];
  const leadList = (leads.data ?? [])
    .filter((l) => filter === "all" || l.status === filter)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const counts = Object.fromEntries(
    LEAD_STATUSES.map((s) => [s, (leads.data ?? []).filter((l) => l.status === s).length]),
  );

  return (
    <div className="space-y-6">
      <AdminSection
        title="Leads"
        description="Route each request to a partner and track its status for partner billing."
        actions={
          <>
            <SaveStatus status={status} />
            <Button
              variant="secondary"
              onClick={() =>
                downloadCsv(
                  `leads-${today()}.csv`,
                  (leads.data ?? []).map((l) => ({
                    ...l,
                    partner: partnerList.find((p) => p.id === l.partnerId)?.name ?? "",
                  })),
                )
              }
            >
              <Download aria-hidden className="size-4" /> Export CSV
            </Button>
          </>
        }
      >
        <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filter by status">
          {(["all", ...LEAD_STATUSES] as const).map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={filter === s}
              onClick={() => setFilter(s)}
              className={`min-h-10 rounded-full border px-3 text-sm ${filter === s ? "border-ay-navy bg-ay-navy text-white" : "border-ay-line"}`}
            >
              {s === "all" ? `All (${leads.data?.length ?? 0})` : `${s} (${counts[s] ?? 0})`}
            </button>
          ))}
        </div>
        {leadList.length === 0 ? (
          <p className="text-ay-slate">No leads yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-ay-line text-ay-slate">
                  <th scope="col" className="py-2">
                    Date
                  </th>
                  <th scope="col">Contact</th>
                  <th scope="col">Need</th>
                  <th scope="col">Budget / timeline</th>
                  <th scope="col">Partner</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {leadList.map((l) => (
                  <tr key={l.id} className="border-b border-ay-line/60 align-top">
                    <td className="py-2 pr-2">{formatDate(l.createdAt)}</td>
                    <td className="pr-2">
                      <span className="font-semibold">{l.name}</span>
                      <span className="block">{l.email}</span>
                      {l.phone ? <span className="block">{l.phone}</span> : null}
                      {l.message ? (
                        <span className="block max-w-xs text-ay-slate">“{l.message}”</span>
                      ) : null}
                    </td>
                    <td className="pr-2">
                      {categoryLabel(l.category)}
                      <span className="block text-ay-slate">
                        {countries.find((c) => c.id === l.countryId)?.name ?? l.countryId}
                      </span>
                    </td>
                    <td className="pr-2">
                      {l.budget}
                      <span className="block text-ay-slate">{l.timeline}</span>
                    </td>
                    <td className="pr-2">
                      <select
                        aria-label={`Partner for ${l.name}`}
                        className="min-h-9 rounded-lg border border-[#c9d0db] px-2"
                        value={l.partnerId}
                        onChange={(e) => void save("leads", { ...l, partnerId: e.target.value })}
                      >
                        <option value="">Unassigned</option>
                        {partnerList
                          .filter((p) => p.category === l.category)
                          .map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                      </select>
                    </td>
                    <td>
                      <select
                        aria-label={`Status for ${l.name}`}
                        className="min-h-9 rounded-lg border border-[#c9d0db] px-2"
                        value={l.status}
                        onChange={(e) =>
                          void save("leads", { ...l, status: e.target.value as LeadStatus })
                        }
                      >
                        {LEAD_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminSection>

      <AdminSection
        title="Partners"
        actions={
          <Button
            variant="secondary"
            onClick={() =>
              void save(
                "partners",
                {
                  id: `p-${Date.now().toString(36)}`,
                  name: "New partner",
                  category: "tax",
                  countries: [],
                  email: "",
                  active: false,
                  referralTerms: "",
                } satisfies Partner,
                "Added",
              )
            }
          >
            <Plus aria-hidden className="size-4" /> Add partner
          </Button>
        }
      >
        <div className="space-y-4">
          {partnerList.map((p) => (
            <PartnerRow
              key={p.id}
              partner={p}
              countries={countries.map((c) => ({ id: c.id, name: c.name }))}
              onSave={(next) => void save("partners", next)}
              onDelete={() => void remove("partners", p.id)}
            />
          ))}
        </div>
      </AdminSection>
    </div>
  );
}

function PartnerRow({
  partner,
  countries,
  onSave,
  onDelete,
}: {
  partner: Partner;
  countries: Array<{ id: string; name: string }>;
  onSave: (p: Partner) => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState(partner);
  useEffect(() => setDraft(partner), [partner]);
  return (
    <div className="rounded-xl border border-ay-line p-4">
      <div className="grid gap-3 md:grid-cols-4">
        <AField label="Name">
          <TextIn value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} />
        </AField>
        <AField label="Category">
          <select
            className="block min-h-10 w-full rounded-lg border border-[#c9d0db] px-2"
            value={draft.category}
            onChange={(e) => setDraft({ ...draft, category: e.target.value as ExpertCategory })}
          >
            {EXPERT_CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
        </AField>
        <AField label="Routing email">
          <TextIn
            type="email"
            value={draft.email}
            onChange={(v) => setDraft({ ...draft, email: v })}
          />
        </AField>
        <AField label="Status">
          <select
            className="block min-h-10 w-full rounded-lg border border-[#c9d0db] px-2"
            value={draft.active ? "active" : "paused"}
            onChange={(e) => setDraft({ ...draft, active: e.target.value === "active" })}
          >
            <option value="active">Active</option>
            <option value="paused">Paused</option>
          </select>
        </AField>
        <fieldset className="md:col-span-4">
          <legend className="text-sm font-semibold">Countries covered</legend>
          <div className="mt-1 flex flex-wrap gap-3">
            {countries.map((c) => (
              <label key={c.id} className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  className="size-4 accent-ay-navy"
                  checked={draft.countries.includes(c.id)}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      countries: e.target.checked
                        ? [...draft.countries, c.id]
                        : draft.countries.filter((x) => x !== c.id),
                    })
                  }
                />
                {c.name}
              </label>
            ))}
          </div>
        </fieldset>
        <AField label="Referral terms (internal)" className="md:col-span-4">
          <TextBox
            rows={2}
            value={draft.referralTerms}
            onChange={(v) => setDraft({ ...draft, referralTerms: v })}
          />
        </AField>
      </div>
      <div className="mt-3 flex gap-2">
        <Button className="min-h-9 py-1 text-sm" onClick={() => onSave(draft)}>
          Save partner
        </Button>
        <Button variant="danger" className="min-h-9 py-1 text-sm" onClick={onDelete}>
          <Trash2 aria-hidden className="size-4" /> Delete
        </Button>
      </div>
    </div>
  );
}

export function OrdersAdmin() {
  const orders = useCollection<Order>("orders");
  const refunds = useCollection<{ id: string; orderId: string; email: string; createdAt: string }>(
    "refund_requests",
  );
  const waitlist = useCollection<WaitlistEntry>("waitlist");
  const clicks = useCollection<{ id: string }>("unlock_clicks");
  const client = useQueryClient();
  const [message, setMessage] = useState("");
  const list = [...(orders.data ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const paid = list.filter((o) => o.status === "paid");
  const revenue = paid.reduce((s, o) => s + o.amountUsd, 0);
  const refunded = list.filter((o) => o.status === "refunded").reduce((s, o) => s + o.amountUsd, 0);
  const pendingRefunds = (refunds.data ?? []).filter(
    (r) => list.find((o) => o.id === r.orderId)?.status !== "refunded",
  );

  async function refund(orderId: string) {
    setMessage("");
    try {
      await getBackend().refundOrder(orderId);
      await client.invalidateQueries({ queryKey: ["ay"] });
      setMessage("Refund issued.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Refund failed");
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Stat
          label="Net revenue"
          value={formatUsd(revenue)}
          hint={`${paid.length} paid orders`}
          emphasis
        />
        <Stat label="Refunded" value={formatUsd(refunded)} />
        <Stat
          label="Demo orders"
          value={String(list.filter((o) => o.status === "demo").length)}
          hint="Not counted as revenue"
        />
        <Stat
          label="Waitlist sign-ups"
          value={String(waitlist.data?.length ?? 0)}
          hint="Validation mode"
        />
        <Stat label="Unlock clicks" value={String(clicks.data?.length ?? 0)} />
      </div>
      {message ? <p role="status">{message}</p> : null}
      {pendingRefunds.length ? (
        <AdminSection title={`Refund requests (${pendingRefunds.length})`}>
          <ul className="space-y-2">
            {pendingRefunds.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-ay-line p-3"
              >
                <span>
                  {r.email} · order {r.orderId} · {formatDate(r.createdAt)}
                </span>
                <Button className="min-h-9 py-1 text-sm" onClick={() => void refund(r.orderId)}>
                  Refund now
                </Button>
              </li>
            ))}
          </ul>
        </AdminSection>
      ) : null}
      <AdminSection
        title="Orders"
        actions={
          <Button
            variant="secondary"
            onClick={() =>
              downloadCsv(
                `orders-${today()}.csv`,
                list as unknown as Array<Record<string, unknown>>,
              )
            }
          >
            <Download aria-hidden className="size-4" /> Export CSV
          </Button>
        }
      >
        {list.length === 0 ? (
          <p className="text-ay-slate">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-ay-line text-ay-slate">
                  <th scope="col" className="py-2">
                    Date
                  </th>
                  <th scope="col">Customer</th>
                  <th scope="col">Product</th>
                  <th scope="col" className="text-right">
                    Amount
                  </th>
                  <th scope="col">Status</th>
                  <th scope="col" />
                </tr>
              </thead>
              <tbody>
                {list.map((o) => (
                  <tr key={o.id} className="border-b border-ay-line/60">
                    <td className="py-2">{formatDate(o.createdAt)}</td>
                    <td>{o.email}</td>
                    <td>
                      {o.product === "pass" ? "Explorer Pass" : "Full Report"}{" "}
                      <span className="text-ay-slate">{o.countryIds.join(", ").toUpperCase()}</span>
                      {o.promoCode ? (
                        <span className="block text-ay-slate">Promo {o.promoCode}</span>
                      ) : null}
                    </td>
                    <td className="text-right tabular-nums">{formatUsd(o.amountUsd)}</td>
                    <td>
                      <Pill
                        tone={
                          o.status === "paid" ? "good" : o.status === "demo" ? "warn" : "neutral"
                        }
                      >
                        {o.status}
                      </Pill>
                    </td>
                    <td className="text-right">
                      {o.status !== "refunded" ? (
                        <Button
                          variant="ghost"
                          className="min-h-9 py-1 text-sm"
                          onClick={() => void refund(o.id)}
                        >
                          Refund
                        </Button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminSection>
      <AdminSection
        title="Waitlist (validation mode)"
        actions={
          <Button
            variant="secondary"
            onClick={() =>
              downloadCsv(
                `waitlist-${today()}.csv`,
                (waitlist.data ?? []) as unknown as Array<Record<string, unknown>>,
              )
            }
          >
            <Download aria-hidden className="size-4" /> Export CSV
          </Button>
        }
      >
        <p className="text-ay-slate">{waitlist.data?.length ?? 0} people joined the waitlist.</p>
      </AdminSection>
    </div>
  );
}

export function AnalyticsAdmin() {
  const events = useCollection<AnalyticsEvent>("events");
  const [days, setDays] = useState(30);
  const recent = useMemo(() => {
    const since = Date.now() - days * 86_400_000;
    return (events.data ?? []).filter((e) => Date.parse(e.at) >= since);
  }, [events.data, days]);
  const sessionsFor = (name: string) =>
    new Set(recent.filter((e) => e.name === name).map((e) => e.sessionId)).size;
  const steps = FUNNEL.map((f) => ({ ...f, count: sessionsFor(f.name) }));
  const visitors = steps[0]?.count ?? 0;
  const byDay = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of recent)
      if (e.name === "landing_view")
        map.set(e.at.slice(0, 10), (map.get(e.at.slice(0, 10)) ?? 0) + 1);
    return [...map.entries()].sort();
  }, [recent]);
  const max = Math.max(1, ...byDay.map(([, n]) => n));
  const rate = (a: number, b: number) => (b ? formatPct(a / b) : "—");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2" role="group" aria-label="Period">
        {[7, 30, 90].map((d) => (
          <button
            key={d}
            type="button"
            aria-pressed={days === d}
            onClick={() => setDays(d)}
            className={`min-h-10 rounded-full border px-3 text-sm ${days === d ? "border-ay-navy bg-ay-navy text-white" : "border-ay-line"}`}
          >
            Last {d} days
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Visitors"
          value={String(visitors)}
          hint="Unique sessions on the landing page"
        />
        <Stat
          label="Questionnaire completion"
          value={rate(sessionsFor("questionnaire_complete"), sessionsFor("questionnaire_start"))}
          hint="Completed ÷ started"
        />
        <Stat
          label="Purchase conversion"
          value={rate(sessionsFor("purchase"), sessionsFor("results_view"))}
          hint="Purchases ÷ results viewed"
        />
        <Stat
          label="Expert requests"
          value={String(recent.filter((e) => e.name === "expert_request").length)}
        />
      </div>
      <AdminSection title="Funnel" description="Unique sessions reaching each step.">
        <ol className="space-y-2">
          {steps.map((s) => (
            <li
              key={s.name}
              className="grid grid-cols-[1fr_auto] items-center gap-3 sm:grid-cols-[220px_1fr_auto]"
            >
              <span>{s.label}</span>
              <span className="hidden h-3 rounded-full bg-ay-mist sm:block" aria-hidden>
                <span
                  className="block h-3 rounded-full bg-ay-navy"
                  style={{ width: `${visitors ? Math.max(2, (s.count / visitors) * 100) : 0}%` }}
                />
              </span>
              <span className="tabular-nums">
                {s.count} <span className="text-sm text-ay-slate">({rate(s.count, visitors)})</span>
              </span>
            </li>
          ))}
        </ol>
      </AdminSection>
      <AdminSection title="Landing views per day">
        {byDay.length === 0 ? (
          <p className="text-ay-slate">No visits recorded in this period.</p>
        ) : (
          <div
            className="flex h-40 items-end gap-1"
            role="img"
            aria-label={`Landing views per day: ${byDay.map(([d, n]) => `${d} ${n}`).join(", ")}`}
          >
            {byDay.map(([day, n]) => (
              <div
                key={day}
                className="flex-1 rounded-t bg-ay-navy-2"
                style={{ height: `${(n / max) * 100}%` }}
                title={`${day}: ${n}`}
              />
            ))}
          </div>
        )}
      </AdminSection>
    </div>
  );
}

export function BlogAdmin() {
  const { blog } = useSiteData();
  const { save, remove, status } = useSaver();
  const [selectedId, setSelectedId] = useState(blog[0]?.id ?? "");
  const selected = blog.find((p) => p.id === selectedId);
  const [draft, setDraft] = useState<BlogPost | undefined>(selected);
  useEffect(() => setDraft(selected), [selected]);

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <div className="space-y-1">
        {blog.map((p) => (
          <button
            key={p.id}
            type="button"
            aria-current={p.id === selectedId}
            onClick={() => setSelectedId(p.id)}
            className={`block min-h-11 w-full rounded-lg px-3 py-2 text-left ${p.id === selectedId ? "bg-ay-navy text-white" : "hover:bg-ay-mist"}`}
          >
            {p.title} {p.published ? "" : "(draft)"}
          </button>
        ))}
        <Button
          variant="secondary"
          className="mt-3 w-full"
          onClick={() => {
            const post: BlogPost = {
              id: `b-${Date.now().toString(36)}`,
              slug: `new-post-${Date.now().toString(36)}`,
              title: "New post",
              excerpt: "",
              body: "",
              publishedAt: today(),
              published: false,
              author: "AbroadYield Research",
            };
            void save("blog", post, "Created").then(() => setSelectedId(post.id));
          }}
        >
          <Plus aria-hidden className="size-4" /> New post
        </Button>
      </div>
      {draft ? (
        <AdminSection
          title="Edit post"
          description="Markdown subset: ## headings, - lists, **bold**, [links](https://…)."
          actions={
            <>
              <SaveStatus status={status} />
              <Button onClick={() => void save("blog", draft)}>Save post</Button>
            </>
          }
        >
          <div className="grid gap-4 md:grid-cols-2">
            <AField label="Title">
              <TextIn value={draft.title} onChange={(v) => setDraft({ ...draft, title: v })} />
            </AField>
            <AField label="Slug">
              <TextIn
                value={draft.slug}
                onChange={(v) =>
                  setDraft({ ...draft, slug: v.toLowerCase().replace(/[^a-z0-9-]/g, "-") })
                }
              />
            </AField>
            <AField label="Author">
              <TextIn value={draft.author} onChange={(v) => setDraft({ ...draft, author: v })} />
            </AField>
            <AField label="Publish date">
              <TextIn
                type="date"
                value={draft.publishedAt}
                onChange={(v) => setDraft({ ...draft, publishedAt: v })}
              />
            </AField>
            <AField label="Excerpt" className="md:col-span-2">
              <TextBox
                value={draft.excerpt}
                onChange={(v) => setDraft({ ...draft, excerpt: v })}
                rows={2}
              />
            </AField>
            <AField label="Body" className="md:col-span-2">
              <TextBox
                value={draft.body}
                onChange={(v) => setDraft({ ...draft, body: v })}
                rows={16}
              />
            </AField>
          </div>
          <label className="mt-4 flex items-center gap-2">
            <input
              type="checkbox"
              className="size-5 accent-ay-navy"
              checked={draft.published}
              onChange={(e) => setDraft({ ...draft, published: e.target.checked })}
            />{" "}
            Published
          </label>
          <Button
            variant="danger"
            className="mt-4"
            onClick={() =>
              void remove("blog", draft.id).then(() =>
                setSelectedId(blog.find((p) => p.id !== draft.id)?.id ?? ""),
              )
            }
          >
            <Trash2 aria-hidden className="size-4" /> Delete post
          </Button>
        </AdminSection>
      ) : null}
    </div>
  );
}

export function AuditAdmin() {
  const audit = useCollection<AuditEntry>("audit");
  const list = [...(audit.data ?? [])].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 300);
  return (
    <AdminSection
      title="Audit log"
      description="Every create, update and delete on countries, cities, tax parameters, settings, partners, blog posts, leads and orders."
    >
      {list.length === 0 ? (
        <p className="text-ay-slate">No edits recorded yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-ay-line text-ay-slate">
                <th scope="col" className="py-2">
                  When
                </th>
                <th scope="col">Who</th>
                <th scope="col">Action</th>
                <th scope="col">Record</th>
              </tr>
            </thead>
            <tbody>
              {list.map((e) => (
                <tr key={e.id} className="border-b border-ay-line/60">
                  <td className="py-2">{new Date(e.at).toLocaleString("en-US")}</td>
                  <td>{e.actor}</td>
                  <td>{e.action}</td>
                  <td>
                    {e.collection}/{e.entityId}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminSection>
  );
}
