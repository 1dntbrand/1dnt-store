"use client";

import Image from "next/image";
import { blurProps } from "../lib/image-placeholder";

export interface MeasureLoop {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  rotate: number;
}

export interface MeasureBadge {
  label: string;
  x: number;
  y: number;
  /** Point on the loop the badge points to. */
  from: [number, number];
}

const ACCENT = "#e0702f";
const PAPER = "#f6f5f1";

/**
 * A real photo with the measuring tape drawn on it. Coordinates are in the
 * photo's own pixels; `crop` frames the part worth showing.
 */
export function MeasurePhoto({
  src,
  width,
  height,
  crop,
  loops,
  badges,
  alt,
}: {
  src: string;
  width: number;
  height: number;
  crop: { x: number; y: number; w: number; h: number };
  loops: readonly MeasureLoop[];
  badges: readonly MeasureBadge[];
  alt: string;
}) {
  return (
    <div
      className="measure-photo"
      role="img"
      aria-label={alt}
      style={{ aspectRatio: `${crop.w} / ${crop.h}` }}
    >
      <div
        className="measure-photo-canvas"
        style={{
          width: `${(width / crop.w) * 100}%`,
          height: `${(height / crop.h) * 100}%`,
          left: `${(-crop.x / crop.w) * 100}%`,
          top: `${(-crop.y / crop.h) * 100}%`,
        }}
      >
        <Image
          src={src}
          alt=""
          fill
          sizes="(max-width: 800px) 140vw, 640px"
          {...blurProps(src)}
        />
        <svg
          viewBox={`0 0 ${width} ${height}`}
          aria-hidden="true"
          fill="none"
          strokeLinecap="round"
        >
          {loops.map(({ cx, cy, rx, ry, rotate }) => {
            const back = `M ${-rx} 0 A ${rx} ${ry} 0 0 1 ${rx} 0`;
            const front = `M ${rx} 0 A ${rx} ${ry} 0 0 1 ${-rx} 0`;
            return (
              <g
                key={`${cx}-${cy}`}
                transform={`translate(${cx} ${cy}) rotate(${rotate})`}
              >
                <path
                  d={back}
                  stroke={PAPER}
                  strokeWidth="4"
                  strokeDasharray="12 10"
                  opacity="0.55"
                />
                <path
                  d={front}
                  stroke={PAPER}
                  strokeWidth="14"
                  opacity="0.85"
                />
                <path
                  className="measure-tape"
                  d={front}
                  stroke={ACCENT}
                  strokeWidth="7"
                  strokeDasharray="18 10"
                />
              </g>
            );
          })}
          {badges.map(({ label, x, y, from }) => (
            <g key={label}>
              <path
                d={`M ${from[0]} ${from[1]} L ${x} ${y}`}
                stroke={PAPER}
                strokeWidth="7"
              />
              <path
                d={`M ${from[0]} ${from[1]} L ${x} ${y}`}
                stroke={ACCENT}
                strokeWidth="3"
              />
              <circle
                cx={from[0]}
                cy={from[1]}
                r="9"
                fill={ACCENT}
                stroke={PAPER}
                strokeWidth="4"
              />
              <circle
                cx={x}
                cy={y}
                r="38"
                fill={ACCENT}
                stroke={PAPER}
                strokeWidth="6"
              />
              <text
                x={x}
                y={y + 15}
                fill="#fff"
                fontSize="42"
                fontWeight="700"
                textAnchor="middle"
                fontFamily="Arial, Helvetica, sans-serif"
              >
                {label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

/** Letter keys under a measuring photo. */
export function MeasureLegend({
  items,
}: {
  items: readonly { label: string; text: string }[];
}) {
  return (
    <ul className="measure-legend">
      {items.map(({ label, text }) => (
        <li key={label}>
          <span className="measure-badge" aria-hidden="true">
            {label}
          </span>
          {text}
        </li>
      ))}
    </ul>
  );
}
