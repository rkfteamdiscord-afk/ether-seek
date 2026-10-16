import { Link, createFileRoute } from "@tanstack/react-router";
import { FileText, LogOut, Mail, Shield, Trash2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { EXPERT_CATEGORIES } from "@/abroadyield/components/ExpertForm";
import {
  Button,
  Card,
  Container,
  Field,
  Pill,
  SectionHeading,
  TextInput,
  buttonClass,
} from "@/abroadyield/components/ui";
import { formatDate, formatUsd } from "@/abroadyield/engine";
import { LocalBackend, getBackend, newId } from "@/abroadyield/store";
import {
  loadProfile,
  useAuth,
  useCollection,
  useMyOrders,
  useMyReports,
  useSiteData,
} from "@/abroadyield/store/hooks";
import type { Lead } from "@/abroadyield/types";

export const Route = createFileRoute("/abroadyield/account")({
  head: () => ({
    meta: [{ title: "My account — AbroadYield" }, { name: "robots", content: "noindex" }],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { user, ready } = useAuth();
  if (!ready) return <Container className="py-20 text-ay-slate">Loading…</Container>;
  return <Container className="py-10 sm:py-14">{user ? <Dashboard /> : <AuthForms />}</Container>;
}

function AuthForms() {
  const [mode, setMode] = useState<"login" | "signup" | "magic">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<{
    tone: "error" | "info";
    text: string;
    link?: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const { refresh } = useAuth();

  async function submit() {
    setMessage(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()))
      return setMessage({ tone: "error", text: "Enter a valid email address." });
    if (mode !== "magic" && password.length < (mode === "signup" ? 10 : 1))
      return setMessage({
        tone: "error",
        text:
          mode === "signup"
            ? "Use at least 10 characters for your password."
            : "Enter your password.",
      });
    setBusy(true);
    const backend = getBackend();
    try {
      if (mode === "login") await backend.signIn(email.trim(), password);
      else if (mode === "signup") {
        const result = await backend.signUp(email.trim(), password);
        if (result.needsConfirmation)
          setMessage({
            tone: "info",
            text: "Check your inbox to confirm your email, then log in.",
          });
      } else {
        const result = await backend.sendMagicLink(email.trim(), "/abroadyield/account");
        setMessage(
          result.demoLink
            ? {
                tone: "info",
                text: "Demo mode: no email is sent. Use this link to sign in:",
                link: result.demoLink,
              }
            : {
                tone: "info",
                text: `We sent a sign-in link to ${email.trim()}. It expires in 1 hour.`,
              },
        );
      }
      await refresh();
    } catch (error) {
      setMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "Something went wrong.",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <SectionHeading
        level={1}
        title={mode === "signup" ? "Create your account" : "Log in"}
        intro="Save your reports and purchases, and pick up where you left off on any device."
      />
      <div
        role="tablist"
        aria-label="Sign-in method"
        className="mt-8 grid grid-cols-3 gap-1 rounded-xl bg-ay-mist p-1"
      >
        {(
          [
            ["login", "Password"],
            ["magic", "Magic link"],
            ["signup", "Sign up"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={mode === key}
            onClick={() => (setMode(key), setMessage(null))}
            className={cn(
              "min-h-11 rounded-lg font-semibold",
              mode === key ? "bg-white text-ay-ink shadow-sm" : "text-ay-slate hover:text-ay-ink",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <form
        noValidate
        className="mt-6 space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <Field id="auth-email" label="Email">
          <TextInput
            id="auth-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        {mode !== "magic" ? (
          <Field
            id="auth-password"
            label="Password"
            hint={mode === "signup" ? "At least 10 characters." : undefined}
          >
            <TextInput
              id="auth-password"
              type="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
        ) : null}
        {message ? (
          <div
            role={message.tone === "error" ? "alert" : "status"}
            className={cn(
              "rounded-lg p-3",
              message.tone === "error" ? "bg-ay-bad-bg text-ay-bad" : "bg-ay-sky text-ay-ink",
            )}
          >
            <p>{message.text}</p>
            {message.link ? (
              <button
                type="button"
                className="mt-1 inline-flex min-h-11 items-center font-semibold underline"
                onClick={async () => {
                  const backend = getBackend();
                  const token = new URLSearchParams(message.link?.split("?")[1] ?? "").get(
                    "demo_magic",
                  );
                  if (backend instanceof LocalBackend && token) {
                    await backend.signInWithDemoToken(token);
                    await refresh();
                  }
                }}
              >
                Sign in with the demo link
              </button>
            ) : null}
          </div>
        ) : null}
        <Button type="submit" className="w-full" disabled={busy} aria-busy={busy}>
          {mode === "magic" ? <Mail aria-hidden className="size-5" /> : null}
          {busy
            ? "Please wait…"
            : mode === "login"
              ? "Log in"
              : mode === "signup"
                ? "Create account"
                : "Email me a sign-in link"}
        </Button>
      </form>
    </div>
  );
}

function Dashboard() {
  const { user, refresh } = useAuth();
  const { countries, settings } = useSiteData();
  const orders = useMyOrders();
  const reports = useMyReports();
  const leads = useCollection<Lead>("leads");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [notice, setNotice] = useState("");
  const myLeads = (leads.data ?? []).filter(
    (l) => l.userId === user?.id || l.email === user?.email,
  );
  const name = (id: string) => countries.find((c) => c.id === id)?.name ?? id;

  async function requestRefund(orderId: string) {
    await getBackend().insert("refund_requests", {
      id: newId("rr"),
      orderId,
      email: user?.email ?? loadProfile()?.email ?? "",
      createdAt: new Date().toISOString(),
    });
    setNotice(
      "Refund requested. We'll process it within 5 business days and email you a confirmation.",
    );
  }

  async function deleteAccount() {
    await getBackend().deleteAccount();
    try {
      window.localStorage.removeItem("ay.v1.profile");
    } catch {
      // ignore
    }
    await refresh();
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading level={1} eyebrow="My account" title={user?.email ?? ""} />
        <div className="flex flex-wrap gap-2">
          {user?.role === "admin" ? (
            <Link to="/abroadyield/admin" className={buttonClass("secondary")}>
              <Shield aria-hidden className="size-5" /> Admin panel
            </Link>
          ) : null}
          <Button variant="ghost" onClick={() => void getBackend().signOut().then(refresh)}>
            <LogOut aria-hidden className="size-5" /> Log out
          </Button>
        </div>
      </div>

      {notice ? (
        <p role="status" className="rounded-lg bg-ay-sky p-3">
          {notice}
        </p>
      ) : null}

      <Card as="section">
        <h2 className="text-xl font-semibold">My reports</h2>
        {reports.data?.length ? (
          <ul className="mt-4 divide-y divide-ay-line">
            {reports.data.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <span className="flex items-center gap-2">
                  <FileText aria-hidden className="size-5 text-ay-navy" />{" "}
                  {r.countryIds.map(name).join(", ")}{" "}
                  <span className="text-sm text-ay-slate">· {formatDate(r.createdAt)}</span>
                </span>
                <Link
                  to="/abroadyield/report"
                  search={{ countries: r.countryIds.join(",") }}
                  className="font-semibold text-ay-navy-2 underline underline-offset-4"
                >
                  Open
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-ay-slate">
            No saved reports yet.{" "}
            <Link to="/abroadyield/results" className="underline">
              See your free ranking
            </Link>
            .
          </p>
        )}
      </Card>

      <Card as="section">
        <h2 className="text-xl font-semibold">My purchases</h2>
        {orders.data?.length ? (
          <ul className="mt-4 divide-y divide-ay-line">
            {orders.data.map((o) => {
              const refundable =
                o.status !== "refunded" &&
                Date.now() - Date.parse(o.createdAt) < settings.refundDays * 86_400_000;
              return (
                <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <span>
                    <span className="font-semibold">
                      {o.product === "pass" ? "Explorer Pass" : "Full Report"}
                    </span>{" "}
                    · {formatUsd(o.amountUsd)} · {formatDate(o.createdAt)}
                    <span className="block text-sm text-ay-slate">
                      {o.product === "pass"
                        ? `Valid until ${formatDate(o.expiresAt)}`
                        : o.countryIds.map(name).join(", ")}
                    </span>
                  </span>
                  <span className="flex items-center gap-2">
                    <Pill
                      tone={
                        o.status === "refunded" ? "neutral" : o.status === "demo" ? "warn" : "good"
                      }
                    >
                      {o.status === "demo" ? "Demo" : o.status === "refunded" ? "Refunded" : "Paid"}
                    </Pill>
                    {refundable ? (
                      <Button variant="ghost" onClick={() => void requestRefund(o.id)}>
                        Request refund
                      </Button>
                    ) : null}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-2 text-ay-slate">No purchases yet.</p>
        )}
      </Card>

      <Card as="section">
        <h2 className="text-xl font-semibold">My expert requests</h2>
        {myLeads.length ? (
          <ul className="mt-4 divide-y divide-ay-line">
            {myLeads.map((l) => (
              <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <span>
                  {EXPERT_CATEGORIES.find((c) => c.key === l.category)?.label} · {name(l.countryId)}{" "}
                  <span className="text-sm text-ay-slate">· {formatDate(l.createdAt)}</span>
                </span>
                <Pill>
                  {l.status === "new"
                    ? "Received"
                    : l.status === "sent"
                      ? "Sent to partner"
                      : l.status === "contacted"
                        ? "Partner contacted you"
                        : "Completed"}
                </Pill>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-ay-slate">
            None yet.{" "}
            <Link to="/abroadyield/experts" className="underline">
              Talk to an expert
            </Link>
            .
          </p>
        )}
      </Card>

      <Card as="section" className="border-ay-bad/30">
        <h2 className="text-xl font-semibold">Delete my account and data</h2>
        <p className="mt-2 text-ay-slate">
          This permanently deletes your account, questionnaire answers, saved reports and expert
          requests. Payment records we must keep for tax law are anonymised.
        </p>
        {confirmDelete ? (
          <div className="mt-4 flex flex-wrap gap-3">
            <Button variant="danger" onClick={() => void deleteAccount()}>
              <Trash2 aria-hidden className="size-5" /> Yes, delete everything
            </Button>
            <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button variant="danger" className="mt-4" onClick={() => setConfirmDelete(true)}>
            Delete my account
          </Button>
        )}
      </Card>
    </div>
  );
}
