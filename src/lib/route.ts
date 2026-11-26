import { useEffect, useState } from "react";

/** Tiny hash router: "#/case/<slug>" and "#/notes/<slug>" are pages; any other hash is a section on the home page. */
export type Route = { page: "home" } | { page: "case"; slug: string } | { page: "note"; slug: string };

export function parse(hash: string): Route {
  const m = hash.match(/^#\/(case|notes)\/([\w-]+)/);
  if (!m) return { page: "home" };
  return m[1] === "case" ? { page: "case", slug: m[2] } : { page: "note", slug: m[2] };
}

export function useRoute() {
  const [route, setRoute] = useState<Route>(() => parse(location.hash));
  useEffect(() => {
    const on = () => {
      const next = parse(location.hash);
      setRoute((prev) => {
        if (next.page !== "home") scrollTo(0, 0);
        else if (prev.page !== "home") {
          // coming back from a page: wait for the home page to mount, then jump to the section
          const id = location.hash.slice(1);
          requestAnimationFrame(() => requestAnimationFrame(() => (id ? document.getElementById(id)?.scrollIntoView() : scrollTo(0, 0))));
        }
        return next;
      });
    };
    addEventListener("hashchange", on);
    return () => removeEventListener("hashchange", on);
  }, []);
  return route;
}

/** Keeps the document title and description in step with the current page. */
export function usePageMeta(title: string, description: string) {
  useEffect(() => {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const prevTitle = document.title;
    const prevDesc = meta?.content ?? "";
    document.title = title;
    if (meta) meta.content = description;
    return () => {
      document.title = prevTitle;
      if (meta) meta.content = prevDesc;
    };
  }, [title, description]);
}
