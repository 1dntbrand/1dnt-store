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
  const [submitted, setSubmitted] = useState(false);
  const neckCm = readMeasurement(neck);
  const chestCm = readMeasurement(chest);
  const neckInvalid = submitted && neckCm === null;
  const chestInvalid = submitted && kind === "harness" && chestCm === null;
  const valid = !neckInvalid && !chestInvalid;

  const matches =
    !submitted || neckCm === null
      ? []
      : kind === "collar"
        ? collarMeasurements.filter((item) =>
            includesMeasurement(item.neck, neckCm),
          )
        : chestCm === null
          ? []
          : harnessMeasurements.filter(
              (item) =>
                includesMeasurement(item.neck, neckCm) &&
                includesMeasurement(item.chest, chestCm),
            );

  function checkFit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
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
            onChange={(event) => {
              setNeck(event.target.value);
              setSubmitted(false);
            }}
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
              onChange={(event) => {
                setChest(event.target.value);
                setSubmitted(false);
              }}
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
      <p className="fit-status" role="status">
        {submitted && valid
          ? t(matches.length ? "fitMatches" : "fitNoMatch")
          : null}
      </p>
      {submitted &&
        valid &&
        (matches.length ? (
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
        ))}
    </form>
  );
}
