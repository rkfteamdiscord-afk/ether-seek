import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import { activeHorses, currentMonth } from "@/lib/equimarge/calc";
import { plans } from "@/lib/equimarge/catalog";
import { buildDemoData } from "@/lib/equimarge/demo";
import { getStore, type Account, type WorkspaceData } from "@/lib/equimarge/store";
import type {
  Expense,
  Horse,
  MonthKey,
  Revenue,
  Structure,
  Workspace,
} from "@/lib/equimarge/types";

type Status = "loading" | "signed-out" | "onboarding" | "ready";

interface WorkspaceContextValue {
  status: Status;
  account: Account | null;
  workspace: Workspace | null;
  mode: "cloud" | "local";
  month: MonthKey;
  setMonth: (month: MonthKey) => void;
  reload: () => Promise<void>;
  signOut: () => Promise<void>;
  saveStructure: (structure: Structure) => Promise<void>;
  saveHorse: (horse: Horse) => Promise<boolean>;
  deleteHorse: (id: string) => Promise<void>;
  saveExpense: (expense: Expense) => Promise<boolean>;
  deleteExpense: (id: string) => Promise<void>;
  saveRevenue: (revenue: Revenue) => Promise<boolean>;
  deleteRevenue: (id: string) => Promise<void>;
  replaceData: (data: WorkspaceData, isDemo: boolean) => Promise<void>;
  loadDemo: () => Promise<void>;
  clearData: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function useWorkspace() {
  const value = useContext(WorkspaceContext);
  if (!value) throw new Error("useWorkspace must be used inside WorkspaceProvider");
  return value;
}

/** Same as useWorkspace, for pages that only render once the structure exists. */
export function useReadyWorkspace() {
  const value = useWorkspace();
  if (!value.workspace) throw new Error("Workspace not loaded");
  return { ...value, workspace: value.workspace };
}

function upsert<T extends { id: string }>(list: T[], item: T) {
  return list.some((x) => x.id === item.id)
    ? list.map((x) => (x.id === item.id ? item : x))
    : [...list, item];
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Une erreur est survenue.";
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const store = useMemo(() => getStore(), []);
  const [status, setStatus] = useState<Status>("loading");
  const [account, setAccount] = useState<Account | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [month, setMonth] = useState<MonthKey>(currentMonth());

  const reload = useCallback(async () => {
    const current = await store.currentAccount();
    setAccount(current);
    if (!current) {
      setWorkspace(null);
      setStatus("signed-out");
      return;
    }
    try {
      const ws = await store.load();
      setWorkspace(ws);
      setStatus(ws?.structure.onboarded ? "ready" : "onboarding");
    } catch (error) {
      toast.error(errorMessage(error));
      setStatus("onboarding");
    }
  }, [store]);

  useEffect(() => {
    void reload();
    return store.onAccountChange((next) => {
      setAccount((previous) => {
        if (previous?.id !== next?.id) void reload();
        return next;
      });
    });
  }, [reload, store]);

  /** Runs a store call, applies the change locally and reports errors in plain French. */
  const run = useCallback(
    async (action: () => Promise<void>, apply: (ws: Workspace) => Workspace, success?: string) => {
      try {
        await action();
        setWorkspace((ws) => (ws ? apply(ws) : ws));
        if (success) toast.success(success);
        return true;
      } catch (error) {
        toast.error(errorMessage(error));
        return false;
      }
    },
    [],
  );

  const value: WorkspaceContextValue = {
    status,
    account,
    workspace,
    mode: store.mode,
    month,
    setMonth,
    reload,
    async signOut() {
      await store.signOut();
      setWorkspace(null);
      setAccount(null);
      setStatus("signed-out");
    },
    async saveStructure(structure) {
      try {
        await store.saveStructure(structure);
        setWorkspace((ws) =>
          ws ? { ...ws, structure } : { structure, horses: [], expenses: [], revenues: [] },
        );
        if (structure.onboarded) setStatus("ready");
      } catch (error) {
        toast.error(errorMessage(error));
        throw error;
      }
    },
    async saveHorse(horse) {
      if (workspace) {
        const isNew = !workspace.horses.some((h) => h.id === horse.id);
        const limit = plans[workspace.structure.plan].horseLimit;
        if (
          isNew &&
          limit !== null &&
          activeHorses(workspace.horses, currentMonth()).length >= limit
        ) {
          toast.error(
            `L'offre Essentiel est limitée à ${limit} chevaux. Passez à l'offre Pro dans les paramètres pour en ajouter d'autres.`,
          );
          return false;
        }
      }
      return run(
        () => store.saveHorse(horse),
        (ws) => ({ ...ws, horses: upsert(ws.horses, horse) }),
        `Fiche de ${horse.name} enregistrée.`,
      );
    },
    async deleteHorse(id) {
      await run(
        () => store.deleteHorse(id),
        (ws) => ({
          ...ws,
          horses: ws.horses.filter((h) => h.id !== id),
          expenses: ws.expenses.filter((e) => e.horseId !== id),
        }),
        "Cheval supprimé.",
      );
    },
    saveExpense(expense) {
      return run(
        () => store.saveExpense(expense),
        (ws) => ({ ...ws, expenses: upsert(ws.expenses, expense) }),
        "Dépense enregistrée.",
      );
    },
    async deleteExpense(id) {
      await run(
        () => store.deleteExpense(id),
        (ws) => ({ ...ws, expenses: ws.expenses.filter((e) => e.id !== id) }),
        "Dépense supprimée.",
      );
    },
    saveRevenue(revenue) {
      return run(
        () => store.saveRevenue(revenue),
        (ws) => ({ ...ws, revenues: upsert(ws.revenues, revenue) }),
        "Recette enregistrée.",
      );
    },
    async deleteRevenue(id) {
      await run(
        () => store.deleteRevenue(id),
        (ws) => ({ ...ws, revenues: ws.revenues.filter((r) => r.id !== id) }),
        "Recette supprimée.",
      );
    },
    async replaceData(data, isDemo) {
      if (!workspace) return;
      const structure = { ...workspace.structure, isDemo };
      await run(
        async () => {
          await store.replaceData(data);
          await store.saveStructure(structure);
        },
        (ws) => ({ ...ws, ...data, structure }),
      );
    },
    async loadDemo() {
      await value.replaceData(buildDemoData(currentMonth()), true);
      setMonth(currentMonth());
      toast.success("Le centre d'exemple est chargé.");
    },
    async clearData() {
      await value.replaceData({ horses: [], expenses: [], revenues: [] }, false);
      toast.success("Les données d'exemple sont effacées. À vous de jouer !");
    },
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}
