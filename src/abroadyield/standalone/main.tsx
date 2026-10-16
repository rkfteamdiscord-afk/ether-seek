/**
 * Standalone build of AbroadYield: the same pages and components, rendered client-side with an
 * in-memory router and the in-browser demo backend, bundled into one HTML file
 * (`bun run ay:standalone`). Used to share an interactive preview without a server.
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Link,
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../../styles.css";

import { Route as Layout } from "../../routes/abroadyield";
import { Route as Home } from "../../routes/abroadyield/index";
import { Route as Account } from "../../routes/abroadyield/account";
import { Route as Admin } from "../../routes/abroadyield/admin";
import { Route as Checkout } from "../../routes/abroadyield/checkout";
import { Route as Experts } from "../../routes/abroadyield/experts";
import { Route as Methodology } from "../../routes/abroadyield/methodology";
import { Route as Report } from "../../routes/abroadyield/report";
import { Route as Results } from "../../routes/abroadyield/results";
import { Route as Start } from "../../routes/abroadyield/start";
import { Route as BlogIndex } from "../../routes/abroadyield/blog.index";
import { Route as BlogPost } from "../../routes/abroadyield/blog.$slug";
import { Route as GuidesIndex } from "../../routes/abroadyield/guides.index";
import { Route as Guide } from "../../routes/abroadyield/guides.$slug";
import { Route as Legal } from "../../routes/abroadyield/legal.$page";

const queryClient = new QueryClient();

const root = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  ),
  notFoundComponent: () => (
    <div style={{ padding: 48, fontFamily: "system-ui" }}>
      <p>Page not found.</p>
      <Link to="/abroadyield">Back to AbroadYield</Link>
    </div>
  ),
});

/* eslint-disable @typescript-eslint/no-explicit-any */
const attach = (route: any, id: string, parent: any) =>
  route.update({ id, path: id, getParentRoute: () => parent } as any);

const layout = attach(Layout, "/abroadyield", root);
const children = [
  attach(Home, "/", layout),
  attach(Start, "/start", layout),
  attach(Results, "/results", layout),
  attach(Report, "/report", layout),
  attach(Checkout, "/checkout", layout),
  attach(Account, "/account", layout),
  attach(Admin, "/admin", layout),
  attach(Experts, "/experts", layout),
  attach(Methodology, "/methodology", layout),
  attach(GuidesIndex, "/guides/", layout),
  attach(Guide, "/guides/$slug", layout),
  attach(BlogIndex, "/blog/", layout),
  attach(BlogPost, "/blog/$slug", layout),
  attach(Legal, "/legal/$page", layout),
];
const routeTree = root.addChildren([layout.addChildren(children)]);
/* eslint-enable @typescript-eslint/no-explicit-any */

const router = createRouter({
  routeTree,
  history: createMemoryHistory({ initialEntries: ["/abroadyield"] }),
  scrollRestoration: true,
});

// Scroll to the top on every page change (the memory router has no browser scroll to restore).
router.subscribe("onResolved", ({ pathChanged }) => {
  if (pathChanged) window.scrollTo({ top: 0 });
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
