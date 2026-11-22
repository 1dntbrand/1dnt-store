"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { collarMeasurements, harnessMeasurements } from "../data/measurements";
import { useStorefront } from "../storefront-context";

function readMeasurement(value: string) {
  const normalized = value.trim().replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(normalized)) return null;
  const number = Number(normalized);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function includesMeasurement(range: string, number: number) {
  const [min, max] = range.split("–").map(Number);
  return number >= min && number <= max;
}

export function FitFinder({ kind }: { kind: "collar" | "harness" }) {
  const { t, applyGuideSize, openService } = useStorefront((state) => ({
    t: state.t,
    applyGuideSize: state.applyGuideSize,
    openService: state.openService,
  }));
  const id = useId();
  const neckInput = useRef<HTMLInputElement>(null);
  const chestInput = useRef<HTMLInputElement>(null);
  const [neck, setNeck] = useState("");
  const [chest, setChest] = useState("");
  // The result belongs to the last check: typing a new value keeps it on
  // screen until the shopper checks again, so nothing collapses mid-typing.
  const [checked, setChecked] = useState<{
    neck: number | null;
    chest: number | null;
    count: number;
  } | null>(null);
  const neckInvalid = checked !== null && checked.neck === null;
  const chestInvalid =
    checked !== null && kind === "harness" && checked.chest === null;
  const valid = !neckInvalid && !chestInvalid;
  const checkedNeck = checked?.neck ?? null;
  const checkedChest = checked?.chest ?? null;

  const matches =
    !checked || checkedNeck === null
      ? []
      : kind === "collar"
        ? collarMeasurements.filter((item) =>
            includesMeasurement(item.neck, checkedNeck),
          )
        : checkedChest === null
          ? []
          : harnessMeasurements.filter(
              (item) =>
                includesMeasurement(item.neck, checkedNeck) &&
                includesMeasurement(item.chest, checkedChest),
            );

  function checkFit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const neckCm = readMeasurement(neck);
    const chestCm = readMeasurement(chest);
    setChecked({
      neck: neckCm,
      chest: chestCm,
      count: (checked?.count ?? 0) + 1,
    });
    if (neckCm === null) neckInput.current?.focus();
    else if (kind === "harness" && chestCm === null)
      chestInput.current?.focus();
  }

  return (
    <form className="fit-finder" onSubmit={checkFit} noValidate>
      <div className="fit-form-fields">
        <label>
          {t("neckCm")}
          <input
            name="fitNeck"
            ref={neckInput}
            inputMode="decimal"
            autoComplete="off"
            maxLength={7}
            required
            value={neck}
            aria-invalid={neckInvalid}
            aria-describedby={neckInvalid ? `${id}-error` : undefined}
            onChange={(event) => setNeck(event.target.value)}
          />
        </label>
        {kind === "harness" && (
          <label>
            {t("chestCm")}
            <input
              name="fitChest"
              ref={chestInput}
              inputMode="decimal"
              autoComplete="off"
              maxLength={7}
              required
              value={chest}
              aria-invalid={chestInvalid}
              aria-describedby={chestInvalid ? `${id}-error` : undefined}
              onChange={(event) => setChest(event.target.value)}
            />
          </label>
        )}
      </div>
      <p id={`${id}-error`} className="field-error" role="status">
        {valid ? null : t("fitInvalid")}
      </p>
      <button className="btn" type="submit">
        {t("fitCheck")}
      </button>
      {checked && valid && (
        // Keyed by the check, so each new answer fades in once.
        <div className="fit-outcome" key={checked.count}>
          <p className="fit-status" role="status">
            {t(matches.length ? "fitMatches" : "fitNoMatch")}
          </p>
          {matches.length ? (
            <div className="fit-results">
              {matches.map((item) => (
                <button
                  key={item.size}
                  type="button"
                  className="fit-result"
                  onClick={() => applyGuideSize(item.size)}
                >
                  <strong>
                    {t("sizeOnly")} {item.size}
                  </strong>
                  <span>
                    {item.neck}
                    {"chest" in item ? ` / ${item.chest}` : ""}{" "}
                    {t("centimetreUnit")}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <button
              className="text-button"
              type="button"
              onClick={() => openService("contact")}
            >
              {t("fitAskHelp")}
            </button>
          )}
        </div>
      )}
    </form>
  );
}
