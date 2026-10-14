import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";

import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/equimarge")({
  head: () => ({
    meta: [
      { title: "EquiMarge — La rentabilité de votre centre équestre, cheval par cheval" },
      {
        name: "description",
        content:
          "EquiMarge aide les gérants de centres équestres, poneys-clubs et écuries de pension à connaître le coût réel de chaque cheval et à fixer le bon prix de leurs pensions et de leurs cours.",
      },
      {
        property: "og:title",
        content: "EquiMarge — Savez-vous combien vous coûte vraiment chaque cheval ?",
      },
      {
        property: "og:description",
        content:
          "En 15 minutes, découvrez ce qui rapporte et ce qui vous fait perdre de l'argent dans votre centre équestre.",
      },
      { name: "theme-color", content: "#f6f1e7" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Source+Sans+3:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  component: EquiMargeLayout,
});

function EquiMargeLayout() {
  // Dialogs and toasts render under <body>: give the whole document the light theme.
  useEffect(() => {
    document.documentElement.classList.add("equimarge-theme");
    return () => document.documentElement.classList.remove("equimarge-theme");
  }, []);

  return (
    <div className="equimarge">
      <Outlet />
      <Toaster position="top-center" richColors closeButton />
    </div>
  );
}
