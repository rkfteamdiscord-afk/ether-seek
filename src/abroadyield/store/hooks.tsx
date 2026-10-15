import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { seedBlog, seedSettings, seedUsTax } from "../data/config";
import { seedCities, seedCountries } from "../data/countries";
import { emptyProfile } from "../profile";
import type {
  BlogPost,
  City,
  Country,
  Order,
  Profile,
  SavedReport,
  Settings,
  UsTaxParams,
} from "../types";
import { getBackend, type AuthUser, type Collection } from "./index";

export interface SiteData {
  countries: Country[];
  cities: City[];
  settings: Settings;
  usTax: UsTaxParams;
  blog: BlogPost[];
}

const SEED: SiteData = {
  countries: seedCountries,
  cities: seedCities,
  settings: seedSettings,
  usTax: seedUsTax,
  blog: seedBlog,
};

async function loadSiteData(): Promise<SiteData> {
  const backend = getBackend();
  const [countries, cities, config, blog] = await Promise.all([
    backend.list<Country>("countries"),
    backend.list<City>("cities"),
    backend.list<Settings | UsTaxParams>("config"),
    backend.list<BlogPost>("blog"),
  ]);
  const settings = config?.find((c): c is Settings => c.id === "settings");
  const usTax = config?.find((c): c is UsTaxParams => c.id === "us_tax");
  return {
    countries: countries ?? SEED.countries,
    cities: cities ?? SEED.cities,
    // New settings fields added in later versions fall back to their seed defaults.
    settings: settings
      ? {
          ...SEED.settings,
          ...settings,
          pricing: { ...SEED.settings.pricing, ...settings.pricing },
        }
      : SEED.settings,
    usTax: usTax ?? SEED.usTax,
    blog: blog ?? SEED.blog,
  };
}

/** Countries, cities, tax parameters, settings and blog. Server renders with the seed; the browser loads saved data. */
export function useSiteData(): SiteData & { isLoading: boolean } {
  const query = useQuery({
    queryKey: ["ay", "site"],
    queryFn: loadSiteData,
    initialData: SEED,
    initialDataUpdatedAt: 0,
    staleTime: 60_000,
  });
  return { ...query.data, isLoading: query.isFetching };
}

export function useInvalidateSite() {
  const client = useQueryClient();
  return useCallback(() => client.invalidateQueries({ queryKey: ["ay"] }), [client]);
}

/** Admin/owner collections loaded on demand. */
export function useCollection<T>(collection: Collection, enabled = true) {
  return useQuery({
    queryKey: ["ay", "collection", collection],
    queryFn: async () =>
      (await getBackend().list<T>(collection)) ??
      ((await import("./seed")).seedCollection(collection) as T[] | null) ??
      [],
    enabled,
    staleTime: 10_000,
  });
}

// ---------------- auth ----------------

interface AuthState {
  user: AuthUser | null;
  ready: boolean;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  ready: false,
  refresh: async () => undefined,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);
  const refresh = useCallback(async () => {
    try {
      setUser(await getBackend().currentUser());
    } finally {
      setReady(true);
    }
  }, []);
  useEffect(() => {
    const backend = getBackend();
    void backend
      .completeMagicLink()
      .catch(() => null)
      .then(refresh);
    return backend.onAuthChange(() => void refresh());
  }, [refresh]);
  const value = useMemo(() => ({ user, ready, refresh }), [user, ready, refresh]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

// ---------------- questionnaire profile ----------------

const PROFILE_KEY = "ay.v1.profile";

export function loadProfile(): Profile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    return raw ? { ...emptyProfile, ...(JSON.parse(raw) as Partial<Profile>) } : null;
  } catch {
    return null;
  }
}

export function saveProfile(profile: Profile) {
  try {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // Private mode: the questionnaire still works for this visit.
  }
}

/** The visitor's questionnaire answers (kept in their browser; never sold or shared). */
export function useProfile(): { profile: Profile | null; ready: boolean } {
  const [state, setState] = useState<{ profile: Profile | null; ready: boolean }>({
    profile: null,
    ready: false,
  });
  useEffect(() => setState({ profile: loadProfile(), ready: true }), []);
  return state;
}

// ---------------- purchases ----------------

export function orderCovers(order: Order, countryIds: string[], now = Date.now()): boolean {
  if (order.status !== "paid" && order.status !== "demo") return false;
  if (order.product === "pass") return Date.parse(order.expiresAt) > now;
  return countryIds.every((id) => order.countryIds.includes(id));
}

/** Orders that belong to the signed-in user or to this browser's guest checkout email. */
export function useMyOrders() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["ay", "orders", user?.id ?? "guest"],
    queryFn: async () => {
      const all = (await getBackend().list<Order>("orders")) ?? [];
      const guestEmail = loadProfile()?.email?.toLowerCase();
      return all.filter(
        (o) =>
          (user && (o.userId === user.id || o.email === user.email)) ||
          (!!guestEmail && o.email.toLowerCase() === guestEmail),
      );
    },
  });
}

export function useMyReports() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["ay", "reports", user?.id ?? "guest"],
    queryFn: async () => {
      const all = (await getBackend().list<SavedReport>("reports")) ?? [];
      const guestEmail = loadProfile()?.email?.toLowerCase();
      return all.filter(
        (r) =>
          (user && r.userId === user.id) ||
          (!!guestEmail && r.profile.email.toLowerCase() === guestEmail),
      );
    },
  });
}
