"use client";
/**
 * I18n stub — Vercel Deploy Doctor ships English-only in MVP.
 * Replaces the previous full i18next setup with a passthrough.
 */
import type { ReactNode } from "react";
import { createContext, useContext } from "react";

export type Locale = "en" | "zh" | string;

type Dict = Record<string, string>;

const DEFAULT: Dict = {
  "header.search": "Search checks, reports, rules…",
  "header.notifications": "Notifications",
  "header.help": "Help",
  "header.userMenu": "User menu",
  "header.plan": "plan",
  "nav.dashboard": "Deploy Checks",
  "nav.pricing": "Pricing",
  "nav.profile": "Profile",
  "nav.billing": "Billing",
  "nav.admin": "Admin",
  "nav.signOut": "Sign out",
};

type I18nCtx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, fallback?: string) => string;
};

const Ctx = createContext<I18nCtx>({
  locale: "en",
  setLocale: () => {},
  t: (k, fb) => (DEFAULT[k] ?? fb ?? k),
});

export function I18nProvider({ children }: { children: ReactNode }) {
  return (
    <Ctx.Provider
      value={{
        locale: "en",
        setLocale: () => {},
        t: (k, fb) => DEFAULT[k] ?? fb ?? k,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useI18n() {
  return useContext(Ctx);
}
