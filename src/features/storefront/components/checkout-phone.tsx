"use client";

import {
  parseContactPhone,
  phoneInputMaxLength,
} from "@/domain/commerce/phone";
import {
  getCountries,
  getCountryCallingCode,
  type CountryCode,
} from "libphonenumber-js/max";
import { useMemo, type ClipboardEvent } from "react";
import { useStorefront } from "../storefront-context";

const countries = getCountries();

function countryFlag(country: CountryCode) {
  return String.fromCodePoint(
    ...Array.from(country, (letter) => letter.charCodeAt(0) + 127397),
  );
}

function formatLocalPart(
  phone: NonNullable<ReturnType<typeof parseContactPhone>>,
) {
  return phone
    .formatInternational()
    .slice(phone.countryCallingCode.length + 1)
    .trimStart();
}

export function CheckoutPhone({
  id,
  country,
  value,
  invalid,
  onCountryChange,
  onChange,
  onLeave,
}: {
  id: string;
  country: CountryCode;
  value: string;
  invalid: boolean;
  onCountryChange: (country: CountryCode) => void;
  onChange: (value: string) => void;
  /** Called when the field loses focus, after formatting. */
  onLeave?: () => void;
}) {
  const { t, language } = useStorefront((state) => ({
    t: state.t,
    language: state.language,
  }));
  const options = useMemo(() => {
    const regionNames = new Intl.DisplayNames(language, { type: "region" });
    const collator = new Intl.Collator(language);
    return countries
      .map((code) => ({
        code,
        name: regionNames.of(code) ?? code,
        dialCode: getCountryCallingCode(code),
      }))
      .sort((a, b) => collator.compare(a.name, b.name));
  }, [language]);

  function pastePhone(event: ClipboardEvent<HTMLInputElement>) {
    const text = event.clipboardData.getData("text").trim();
    if (!/^(?:\+|00)/.test(text)) return;

    const phone = parseContactPhone(text);
    if (!phone?.country) return;
    event.preventDefault();
    onCountryChange(phone.country);
    onChange(formatLocalPart(phone));
  }

  function formatPhone() {
    const phone = parseContactPhone(value, country);
    if (phone?.country === country) onChange(formatLocalPart(phone));
  }

  return (
    <div className="checkout-phone">
      <label htmlFor={id}>{t("phone")}</label>
      <div className="checkout-phone-control">
        <div className="checkout-phone-country">
          <span aria-hidden="true">{countryFlag(country)}</span>
          <span aria-hidden="true">+{getCountryCallingCode(country)}</span>
          <span className="disclosure-chevron" aria-hidden="true" />
          <select
            aria-label={t("phoneCountry")}
            value={country}
            onChange={(event) =>
              onCountryChange(event.target.value as CountryCode)
            }
          >
            {options.map(({ code, name, dialCode }) => (
              <option key={code} value={code}>
                {name} (+{dialCode})
              </option>
            ))}
          </select>
        </div>
        <input
          id={id}
          type="tel"
          name="phone"
          autoComplete="tel-national"
          maxLength={phoneInputMaxLength}
          required
          value={value}
          aria-invalid={invalid}
          aria-describedby={invalid ? `${id}-error` : undefined}
          onChange={(event) => onChange(event.target.value)}
          onPaste={pastePhone}
          onBlur={() => {
            formatPhone();
            onLeave?.();
          }}
        />
      </div>
      <span id={`${id}-error`} className="field-error" aria-live="polite">
        {invalid && <span className="state-in">{t("validPhone")}</span>}
      </span>
    </div>
  );
}
