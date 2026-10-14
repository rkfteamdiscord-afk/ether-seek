import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Info, Loader2, MailCheck } from "lucide-react";

import { Logo, StableScene } from "@/components/equimarge/Illustrations";
import { Field } from "@/components/equimarge/ui";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import { offer } from "@/lib/equimarge/catalog";
import { getStore } from "@/lib/equimarge/store";
import { cn } from "@/lib/utils";

type Mode = "connexion" | "inscription" | "oubli";

export const Route = createFileRoute("/equimarge/connexion")({
  validateSearch: (search: Record<string, unknown>): { mode?: Mode } => {
    const mode = search["mode"];
    return mode === "inscription" || mode === "oubli" || mode === "connexion" ? { mode } : {};
  },
  head: () => ({ meta: [{ title: "Connexion — EquiMarge" }] }),
  component: AuthPage,
});

function AuthPage() {
  const { mode = "connexion" } = Route.useSearch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void getStore()
      .currentAccount()
      .then((account) => {
        if (account) void navigate({ to: "/equimarge/app" });
      });
  }, [navigate]);

  useEffect(() => {
    setError(null);
    setInfo(null);
  }, [mode]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setInfo(null);
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Indiquez une adresse e-mail valide, par exemple nom@exemple.fr.");
      return;
    }
    if (mode !== "oubli" && password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    setBusy(true);
    try {
      const store = getStore();
      if (mode === "inscription") {
        const { needsConfirmation } = await store.signUp(email.trim(), password);
        if (needsConfirmation) {
          setInfo(
            "Votre compte est créé ! Cliquez sur le lien que nous venons de vous envoyer par e-mail pour l'activer.",
          );
          return;
        }
        await navigate({ to: "/equimarge/app" });
      } else if (mode === "oubli") {
        await store.sendPasswordReset(email.trim());
        setInfo(
          "Si un compte existe avec cette adresse, vous allez recevoir un lien pour choisir un nouveau mot de passe.",
        );
      } else {
        await store.signIn(email.trim(), password);
        await navigate({ to: "/equimarge/app" });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Une erreur est survenue.");
    } finally {
      setBusy(false);
    }
  }

  const titles: Record<Mode, { title: string; intro: string; button: string }> = {
    inscription: {
      title: "Créez votre compte",
      intro: `${offer.trialDays} jours d'essai gratuit, sans carte bancaire.`,
      button: "Créer mon compte",
    },
    connexion: {
      title: "Bon retour parmi nous",
      intro: "Connectez-vous pour retrouver les chiffres de votre structure.",
      button: "Se connecter",
    },
    oubli: {
      title: "Mot de passe oublié",
      intro: "Indiquez votre e-mail, nous vous envoyons un lien pour en choisir un nouveau.",
      button: "Recevoir le lien",
    },
  };
  const copy = titles[mode];

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col px-4 py-6 sm:px-8">
        <Link to="/equimarge" className="self-start" aria-label="Retour à l'accueil EquiMarge">
          <Logo />
        </Link>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          {mode !== "oubli" && (
            <div
              className="mb-6 grid grid-cols-2 rounded-full bg-secondary p-1"
              role="tablist"
              aria-label="Choix"
            >
              {(["inscription", "connexion"] as const).map((m) => (
                <Link
                  key={m}
                  to="/equimarge/connexion"
                  search={{ mode: m }}
                  role="tab"
                  aria-selected={mode === m}
                  className={cn(
                    "flex min-h-11 items-center justify-center rounded-full font-semibold transition-colors",
                    mode === m ? "bg-card shadow-sm" : "text-muted-foreground",
                  )}
                >
                  {m === "inscription" ? "Inscription" : "Connexion"}
                </Link>
              ))}
            </div>
          )}

          <h1 className="text-3xl font-semibold">{copy.title}</h1>
          <p className="mt-2 text-muted-foreground">{copy.intro}</p>

          {!isSupabaseConfigured && (
            <p className="mt-4 flex gap-2 rounded-xl bg-[var(--em-warn-soft)] px-4 py-3 text-[0.95rem] text-[oklch(0.4_0.09_60)]">
              <Info className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              Mode démonstration : la base de données n'est pas encore branchée, votre compte et vos
              chiffres restent enregistrés dans ce navigateur uniquement.
            </p>
          )}

          {info ? (
            <div
              className="mt-6 flex gap-3 rounded-2xl border border-border bg-card p-5"
              role="status"
            >
              <MailCheck className="h-6 w-6 shrink-0 text-primary" aria-hidden="true" />
              <p>{info}</p>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 flex flex-col gap-4" noValidate>
              <Field label="Adresse e-mail" htmlFor="email">
                <input
                  id="email"
                  type="email"
                  className="em-input"
                  autoComplete="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field>
              {mode !== "oubli" && (
                <Field
                  label="Mot de passe"
                  htmlFor="password"
                  hint={mode === "inscription" ? "Au moins 8 caractères." : undefined}
                >
                  <input
                    id="password"
                    type="password"
                    className="em-input"
                    autoComplete={mode === "inscription" ? "new-password" : "current-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </Field>
              )}
              {error && (
                <p
                  role="alert"
                  className="rounded-xl bg-[var(--em-bad-soft)] px-4 py-3 text-[var(--em-bad)]"
                >
                  {error}
                </p>
              )}
              <Button
                type="submit"
                disabled={busy}
                className="h-12 rounded-full text-base font-semibold"
              >
                {busy && <Loader2 className="animate-spin" aria-hidden="true" />}
                {copy.button}
              </Button>
            </form>
          )}

          <div className="mt-5 text-center text-[0.95rem]">
            {mode === "connexion" && (
              <Link
                to="/equimarge/connexion"
                search={{ mode: "oubli" }}
                className="text-primary underline-offset-4 hover:underline"
              >
                Mot de passe oublié ?
              </Link>
            )}
            {mode === "oubli" && (
              <Link
                to="/equimarge/connexion"
                search={{ mode: "connexion" }}
                className="text-primary underline-offset-4 hover:underline"
              >
                Retour à la connexion
              </Link>
            )}
          </div>
        </div>
      </div>
      <aside className="hidden items-center justify-center bg-secondary/70 p-10 lg:flex">
        <div className="max-w-lg">
          <StableScene className="h-auto w-full" />
          <p className="mt-6 font-serif-em text-2xl leading-snug">
            En 15 minutes, voyez quelles pensions couvrent vraiment leurs frais et quels chevaux
            vous coûtent plus qu'ils ne rapportent.
          </p>
          <p className="mt-2 text-muted-foreground">
            Un centre d'exemple de 15 chevaux est prêt dès l'inscription.
          </p>
        </div>
      </aside>
    </div>
  );
}
