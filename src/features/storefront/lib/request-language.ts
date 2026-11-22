import { cookies, headers } from "next/headers";
import type { Language } from "./catalog";
import { languageCookie, pickLanguage } from "./language";

/** The language to render this request in (server components only). */
export async function requestLanguage(): Promise<Language> {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  return pickLanguage(
    cookieStore.get(languageCookie)?.value,
    headerStore.get("accept-language"),
  );
}
