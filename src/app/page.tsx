import { Storefront } from "@/features/storefront/storefront";
import { requestLanguage } from "@/features/storefront/lib/request-language";

// Rendered per request in the shopper's language (cookie, then
// Accept-Language), so nobody sees English first.
export const instant = false;

export default async function HomePage() {
  return <Storefront language={await requestLanguage()} />;
}
