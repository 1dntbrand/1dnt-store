import { languages, type Language } from "./catalog";

/**
 * The shopper's language travels in a first-party cookie so the server can
 * render it straight away. It stores only the choice the shopper made
 * (or the browser's own preference), nothing else.
 */
export const languageCookie = "lang";
const oneYear = 60 * 60 * 24 * 365;

export function isLanguage(value: unknown): value is Language {
  return typeof value === "string" && languages.includes(value as Language);
}

/** Saved choice first, then the browser's Accept-Language, then English. */
export function pickLanguage(
  saved: string | undefined,
  acceptLanguage: string | null,
): Language {
  if (isLanguage(saved)) return saved;
  const preferred = (acceptLanguage ?? "")
    .split(",")
    .map((part) => {
      const [tag, quality] = part.trim().split(";q=");
      return {
        code: tag.toLowerCase().split("-")[0],
        weight: quality ? Number(quality) : 1,
      };
    })
    .filter(({ weight }) => weight > 0)
    .sort((a, b) => b.weight - a.weight);
  return (
    (preferred.find(({ code }) => isLanguage(code))?.code as Language) ?? "en"
  );
}

/** Browser side: the language the server rendered with, if it had a cookie. */
export function readLanguageCookie(): Language | null {
  try {
    const value = document.cookie
      .split("; ")
      .find((entry) => entry.startsWith(`${languageCookie}=`))
      ?.slice(languageCookie.length + 1);
    return isLanguage(value) ? value : null;
  } catch {
    return null;
  }
}

/** Browser side: remember the language for the next server render. */
export function rememberLanguage(language: Language) {
  try {
    document.cookie = `${languageCookie}=${language}; Path=/; Max-Age=${oneYear}; SameSite=Lax${
      location.protocol === "https:" ? "; Secure" : ""
    }`;
  } catch {
    /* Cookies can be blocked; the page still works in the chosen language. */
  }
}
