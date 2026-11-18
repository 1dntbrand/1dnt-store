"use client";
import { collarMeasurements } from "../data/measurements";
import { useStorefront } from "../storefront-context";
import { Dialog } from "./dialog";

export function CollarGuide() {
  const { t, closeDialog, guideSize } = useStorefront((state) => ({
    t: state.t,
    closeDialog: state.closeDialog,
    guideSize: state.guideSize,
  }));
  return (
    <Dialog
      id="collarSizeGuide"
      className="size-guide"
      labelledBy="collarGuideTitle"
    >
      <div className="panel-top">
        <h2 id="collarGuideTitle">{t("collarGuideTitle")}</h2>
        <button
          type="button"
          className="size-guide-button size-guide-close"
          onClick={closeDialog}
        >
          {t("guideClose")}
        </button>
      </div>
      <div className="size-table-wrap">
        <table>
          <thead>
            <tr>
              <th scope="col">{t("sizeOnly")}</th>
              <th scope="col">{t("neckCm")}</th>
              <th scope="col">{t("collarWidthMm")}</th>
            </tr>
          </thead>
          <tbody>
            {collarMeasurements.map((item) => (
              <tr
                key={item.size}
                data-guide-size={item.size}
                aria-current={guideSize === item.size}
              >
                <th scope="row">{item.size}</th>
                <td>{item.neck}</td>
                <td>{item.widthMm}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="measure-layout">
        <div className="measure-instructions">
          <h3>{t("measureTitle")}</h3>
          <p>{t("measureCollar")}</p>
        </div>
        <figure className="measure-figure">
          <svg
            viewBox="60 30 470 350"
            role="img"
            aria-labelledby="collarMeasureTitle"
          >
            <title id="collarMeasureTitle">{t("measureCollarGraphic")}</title>
            <path
              d="M102 112 L125 108 Q130 80 152 76 L163 51 Q181 55 180 79 Q199 90 200 112 L224 158 Q244 171 278 168 L382 165 Q426 163 443 194 L470 168 Q494 143 485 120 Q510 156 487 184 L451 220 L445 267 L429 303 L431 356 L404 356 L399 294 L379 258 Q316 277 249 260 L231 296 L232 356 L204 356 L201 278 Q178 260 179 228 L173 193 L153 159 L130 151 L106 145 L88 128 Q82 117 92 114 Z"
              fill="#e1e2d9"
              stroke="#53564c"
              strokeWidth="2.5"
              strokeLinejoin="round"
            ></path>
            <path
              d="M151 84 Q166 101 153 130 Q144 132 138 114"
              fill="#d0d2c7"
              stroke="#53564c"
              strokeWidth="2"
            ></path>
            <circle cx="126" cy="111" r="3" fill="#252622"></circle>
            <path d="M88 119 L99 118 L97 126 L89 125Z" fill="#252622"></path>
            <path
              d="M109 138 Q123 140 133 135 M212 280 L216 345 M418 302 L418 345"
              fill="none"
              stroke="#7c8073"
              strokeWidth="1.5"
            ></path>
            <g transform="translate(194 168) rotate(45)">
              <ellipse
                rx="13"
                ry="44"
                fill="none"
                stroke="#efeee8"
                strokeWidth="7"
              ></ellipse>
              <path
                d="M0 -44 A13 44 0 0 0 0 44"
                fill="none"
                stroke="#62684f"
                strokeWidth="3.5"
                strokeDasharray="7 5"
                opacity=".6"
              ></path>
              <path
                d="M0 44 A13 44 0 0 0 0 -44"
                fill="none"
                stroke="#62684f"
                strokeWidth="4"
                strokeDasharray="7 5"
              ></path>
            </g>
            <path
              d="M163 197 L132 205 L106 205"
              fill="none"
              stroke="#62684f"
              strokeWidth="1.5"
            ></path>
            <circle cx="91" cy="205" r="14" fill="#62684f"></circle>
            <text
              x="91"
              y="209"
              fill="white"
              textAnchor="middle"
              fontFamily="Arial,sans-serif"
              fontSize="12"
            >
              {"A"}
            </text>
          </svg>
          <figcaption className="measure-legend">
            <span>
              <i className="measure-key" aria-hidden="true">
                {"A"}
              </i>
              <span>{t("measureNeckLabel")}</span>
            </span>
          </figcaption>
        </figure>
      </div>
    </Dialog>
  );
}
