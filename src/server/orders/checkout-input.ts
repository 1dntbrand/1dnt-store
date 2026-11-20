import {
  parseContactPhone,
  phoneInputMaxLength,
} from "@/domain/commerce/phone";
import { quoteCart } from "@/domain/commerce/quote-cart";
import { z } from "zod";

/*
 * TODO(02) Реализуй parseCheckoutInput(input: unknown).
 * Вход — attemptId, items, contact { firstName, lastName, email, phone },
 * language и pickupPointId.
 * Выход — { ok: true, value } с нормализованным контактом, результатом
 * quoteCart и страной PL либо { ok: false, code, field? }.
 * Пример — имя " Anna " становится "Anna", PL задаётся на сервере.
 * Проверь пустой pickupPointId и неверный email. Точку проверим в 09.
 */

export const parseCheckoutInput = (input: unknown) => {
  const contractSchema = z.object({
    firstName: z.string().trim().min(2).max(99),
    lastName: z.string().trim().min(2).max(99),
    email: z.string().trim().min(2).max(99).pipe(z.email()),
    phone: z
      .string()
      .trim()
      .max(phoneInputMaxLength)
      .transform((value, ctx) => {
        const phone = parseContactPhone(value);
        if (!phone) {
          ctx.addIssue({
            code: "custom",
            message: "Enter a valid phone number.",
          });
          return z.NEVER;
        }
        return phone.number;
      }),
  });

  const checkoutSchema = z.object({
    attemptId: z.uuid(),
    contact: contractSchema,
    language: z.enum(["pl", "en", "ru", "uk"]),
    items: z.unknown(),
    pickupPointId: z.string().trim().min(1).max(99),
  });

  const parsedResult = checkoutSchema.safeParse(input);

  if (!parsedResult.success) {
    const field = parsedResult.error.issues[0]?.path.join(".");

    return {
      ok: false as const,
      code: "invalid_input",
      ...(field ? { field } : {}),
    };
  }

  const quote = quoteCart(parsedResult.data.items);

  if (!quote.ok) return quote;

  return {
    ok: true as const,
    value: {
      ...parsedResult.data,
      items: quote.items,
      pricing: quote.pricing,
      shippingCountry: "PL",
    },
  };
};
