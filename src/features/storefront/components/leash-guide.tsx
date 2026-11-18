"use client";
import { useStorefront } from "../storefront-context";
import { Dialog } from "./dialog";

export function LeashGuide() {
  const { t, closeDialog, guideSize } = useStorefront((state) => ({
    t: state.t,
    closeDialog: state.closeDialog,
    guideSize: state.guideSize,
  }));
  return (
    <Dialog
      id="leashSizeGuide"
      className="size-guide leash-size-guide"
      labelledBy="leashGuideTitle"
    >
      <div className="panel-top">
        <h2 id="leashGuideTitle">{t("leashGuideTitle")}</h2>
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
              <th>{t("leashTotalLength")}</th>
              <th scope="col">{t("collarWidthMm")}</th>
              <th>{t("leashUse")}</th>
            </tr>
          </thead>
          <tbody>
            <tr data-guide-size="1.5" aria-current={guideSize === "1.5"}>
              <td data-guide-length="1.5">{"1.5 m"}</td>
              <td>{"19"}</td>
              <td>
                <span>{t("handHeldOnly")}</span>
              </td>
            </tr>
            <tr data-guide-size="2.5" aria-current={guideSize === "2.5"}>
              <td data-guide-length="2.5">{"2.5 m"}</td>
              <td>{"19"}</td>
              <td>
                <span>{t("convertibleUse")}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="leash-guide-note" id="selectedLeashGuideNote">
        {t(guideSize === "2.5" ? "longGuideNote" : "shortGuideNote")}
      </p>
      <div data-leash-long={true} hidden={guideSize !== "2.5"}>
        <h3>{t("leashModesHeading")}</h3>
        <div className="leash-diagram-grid">
          <figure className="leash-diagram">
            <h3>{t("leashFixedTitle")}</h3>
            <svg
              viewBox="0 0 330 150"
              role="img"
              aria-labelledby="leashDiagram0Title"
            >
              <title id="leashDiagram0Title">{t("fixedLeashGraphic")}</title>
              <path
                d="M100 91 C77 91 38 84 38 61 C38 38 78 41 100 91 L266 91"
                fill="none"
                stroke="#62684f"
                strokeWidth="6"
                strokeLinecap="round"
              ></path>
              <path d="M91 81 L98 91" stroke="#252622" strokeWidth="3"></path>
              <g transform="translate(266 91)">
                <rect
                  x="0"
                  y="-6"
                  width="13"
                  height="12"
                  rx="3"
                  fill="none"
                  stroke="#252622"
                  strokeWidth="3"
                ></rect>
                <path
                  d="M13 0 L18 0 C18 -15 38 -15 38 -2 C38 12 22 11 22 4"
                  fill="none"
                  stroke="#252622"
                  strokeWidth="4"
                  strokeLinecap="round"
                ></path>
              </g>
              <path
                d="M35 116 H306 M35 111 V121 M306 111 V121"
                fill="none"
                stroke="#92958a"
                strokeWidth="1.5"
              ></path>
              <text
                x="170"
                y="141"
                textAnchor="middle"
                fontFamily="Arial,sans-serif"
                fontSize="14"
                fill="#252622"
              >
                {"2.50 m"}
              </text>
            </svg>
            <figcaption>{t("leashFixedCaption")}</figcaption>
          </figure>
          <figure className="leash-diagram">
            <h3>{t("leashLongTitle")}</h3>
            <svg
              viewBox="0 0 330 150"
              role="img"
              aria-labelledby="leashDiagram1Title"
            >
              <title id="leashDiagram1Title">{t("longLeashGraphic")}</title>
              <path
                d="M140 91 C90 91 25 85 25 47 C25 9 100 20 140 77"
                fill="none"
                stroke="#62684f"
                strokeWidth="6"
                strokeLinecap="round"
              ></path>
              <path d="M140 91 H266" stroke="#62684f" strokeWidth="6"></path>
              <circle
                cx="140"
                cy="91"
                r="9"
                fill="#efeee8"
                stroke="#c06a38"
                strokeWidth="3"
              ></circle>
              <path
                d="M140 77 L140 84 M135 78 Q126 83 133 90"
                fill="none"
                stroke="#252622"
                strokeWidth="3"
              ></path>
              <g transform="translate(266 91)">
                <rect
                  x="0"
                  y="-6"
                  width="13"
                  height="12"
                  rx="3"
                  fill="none"
                  stroke="#252622"
                  strokeWidth="3"
                ></rect>
                <path
                  d="M13 0 L18 0 C18 -15 38 -15 38 -2 C38 12 22 11 22 4"
                  fill="none"
                  stroke="#252622"
                  strokeWidth="4"
                  strokeLinecap="round"
                ></path>
              </g>
              <path
                d="M123 72 L145 43 H185"
                fill="none"
                stroke="#c06a38"
                strokeWidth="1.5"
              ></path>
              <circle cx="195" cy="43" r="9" fill="#c06a38"></circle>
              <text
                x="195"
                y="47"
                textAnchor="middle"
                fontSize="11"
                fill="white"
              >
                {"↙"}
              </text>
              <text
                x="170"
                y="141"
                textAnchor="middle"
                fontFamily="Arial,sans-serif"
                fontSize="14"
                fill="#252622"
              >
                {"2.00 m"}
              </text>
            </svg>
            <figcaption>{t("leashLongCaption")}</figcaption>
          </figure>
          <figure className="leash-diagram">
            <h3>{t("leashHandsFreeTitle")}</h3>
            <svg
              viewBox="0 -30 330 220"
              role="img"
              aria-labelledby="leashDiagram2Title"
            >
              <title id="leashDiagram2Title">{t("handsFreeGraphic")}</title>
              <g
                stroke="#a3a69b"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M64 25 V37 L37 47 Q28 53 28 74 L31 153 M79 25 V37 L105 47 Q114 54 113 76 L113 153 M43 73 L47 131 L40 176 M98 73 L93 131 L102 176 M47 131 H93"></path>
                <path d="M64 25 Q48 7 57 -7 Q72 -24 86 -7 Q96 7 79 25"></path>
              </g>
              <path
                d="M78 36 Q109 82 95 128 Q62 111 43 73"
                fill="none"
                stroke="#62684f"
                strokeWidth="6"
              ></path>
              <circle
                cx="95"
                cy="128"
                r="8"
                fill="#efeee8"
                stroke="#c06a38"
                strokeWidth="3"
              ></circle>
              <path d="M91 119 L96 126" stroke="#252622" strokeWidth="3"></path>
              <path
                d="M101 132 Q145 149 196 133"
                fill="none"
                stroke="#62684f"
                strokeWidth="5"
              ></path>
              <path
                d="M199 132 l9 -2 q-1 -13 9 -14 q12 -2 14 8 q3 12 -8 13 l-5 -3"
                fill="none"
                stroke="#252622"
                strokeWidth="3"
              ></path>
              <path
                d="M240 130 l10 -17 l16 -2 l9 6 l23 2 l11 -13 l-4 20 l-9 10 l-1 21 h-9 l-3 -16 h-22 l-5 16 h-9 l-1 -23 l-10 -4 Z"
                fill="#e1e2d9"
                stroke="#53564c"
                strokeWidth="2"
              ></path>
              <path
                d="M101 116 L139 77 H177"
                fill="none"
                stroke="#c06a38"
                strokeWidth="1.5"
              ></path>
              <circle cx="187" cy="77" r="9" fill="#c06a38"></circle>
              <text
                x="187"
                y="81"
                textAnchor="middle"
                fontSize="11"
                fill="white"
              >
                {"↙"}
              </text>
              <text
                x="185"
                y="57"
                textAnchor="middle"
                fontFamily="Arial,sans-serif"
                fontSize="14"
                fill="#252622"
              >
                {"↻ 150 cm"}
              </text>
            </svg>
            <figcaption>{t("leashHandsFreeCaption")}</figcaption>
          </figure>
        </div>
        <p className="leash-guide-note">{t("leashHandsFreeNote")}</p>
      </div>
      <div data-leash-short={true} hidden={guideSize !== "1.5"}>
        <figure className="leash-diagram">
          <h3>{"1.5 m"}</h3>
          <svg
            viewBox="0 0 330 150"
            role="img"
            aria-labelledby="shortLeashDiagramTitle"
          >
            <title id="shortLeashDiagramTitle">{t("shortDiagramTitle")}</title>
            <path
              d="M100 91 C77 91 38 84 38 61 C38 38 78 41 100 91 L266 91"
              fill="none"
              stroke="#62684f"
              strokeWidth="6"
              strokeLinecap="round"
            ></path>
            <path d="M91 81 L98 91" stroke="#252622" strokeWidth="3"></path>
            <g transform="translate(266 91)">
              <rect
                x="0"
                y="-6"
                width="13"
                height="12"
                rx="3"
                fill="none"
                stroke="#252622"
                strokeWidth="3"
              ></rect>
              <path
                d="M13 0 L18 0 C18 -15 38 -15 38 -2 C38 12 22 11 22 4"
                fill="none"
                stroke="#252622"
                strokeWidth="4"
                strokeLinecap="round"
              ></path>
            </g>
            <path
              d="M35 116 H306 M35 111 V121 M306 111 V121"
              fill="none"
              stroke="#92958a"
              strokeWidth="1.5"
            ></path>
            <text
              x="170"
              y="141"
              textAnchor="middle"
              fontFamily="Arial,sans-serif"
              fontSize="14"
              fill="#252622"
            >
              {"1.50 m"}
            </text>
          </svg>
          <figcaption>{t("shortLeashGuideCaption")}</figcaption>
        </figure>
      </div>
    </Dialog>
  );
}
