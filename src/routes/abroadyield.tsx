import { Outlet, createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/abroadyield/components/Layout";
import { AuthProvider } from "@/abroadyield/store/hooks";

export const Route = createFileRoute("/abroadyield")({
  head: () => ({
    meta: [
      { title: "AbroadYield — Real after-tax returns on property abroad for Americans" },
      {
        name: "description",
        content:
          "Free country ranking in 3 minutes. After-tax returns, financing options and risks for buying rental property abroad — built for US taxpayers.",
      },
      { property: "og:site_name", content: "AbroadYield" },
      { property: "og:title", content: "AbroadYield — See what you'll actually earn abroad" },
      {
        property: "og:description",
        content:
          "After-tax returns, financing options and risks for property abroad, built for US taxpayers.",
      },
      { property: "og:type", content: "website" },
      { name: "theme-color", content: "#12284b" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600;700&family=Source+Sans+3:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  component: AbroadYieldLayout,
});

function AbroadYieldLayout() {
  return (
    <AuthProvider>
      <SiteLayout>
        <Outlet />
      </SiteLayout>
    </AuthProvider>
  );
}
