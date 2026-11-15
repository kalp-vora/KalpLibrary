import { NavTab } from "@/components/Navbar";

export const APP_ROUTES = {
  home: "/",
  concierge: "/",
  library: "/library",
  theater: "/theater",
  theatre: "/theater",
  lists: "/lists",
  journey: "/journey",
  completed: "/journey",
  login: "/login",
} as const;

export const TAB_ROUTE_MAP: Record<NavTab, string> = {
  concierge: APP_ROUTES.concierge,
  library: APP_ROUTES.library,
  theatre: APP_ROUTES.theater,
  lists: APP_ROUTES.lists,
  journey: APP_ROUTES.journey,
  completed: APP_ROUTES.journey,
  mood: "/#mood",
};

export const PATH_TAB_ENTRIES: Array<{ prefix: string; tab: NavTab }> = [
  { prefix: "/library", tab: "library" },
  { prefix: "/theater", tab: "theatre" },
  { prefix: "/theatre", tab: "theatre" },
  { prefix: "/lists", tab: "lists" },
  { prefix: "/journey", tab: "journey" },
  { prefix: "/completed", tab: "journey" },
  { prefix: "/concierge", tab: "concierge" },
  { prefix: "/", tab: "concierge" },
];

export function resolveTabFromPathname(pathname: string | null | undefined): NavTab {
  if (!pathname) return "concierge";
  const matched = PATH_TAB_ENTRIES.find((entry) =>
    entry.prefix === "/" ? pathname === "/" : pathname.startsWith(entry.prefix)
  );
  return matched?.tab || "concierge";
}
