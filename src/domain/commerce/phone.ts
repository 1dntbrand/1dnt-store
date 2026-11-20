import {
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js/max";

export const phoneInputMaxLength = 32;

export function parseContactPhone(value: string, country: CountryCode = "PL") {
  const input = value.trim();
  if (input.length > phoneInputMaxLength) return undefined;

  const phone = parsePhoneNumberFromString(
    input.replace(/[\u00a0\u202f]/g, " ").replace(/^00/, "+"),
    {
      defaultCountry: country,
      extract: false,
    },
  );

  return phone?.isValid() && !phone.ext ? phone : undefined;
}
