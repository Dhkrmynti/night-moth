/**
 * The moth. One specimen, drawn flat from above with its wings open, used everywhere: resting on
 * the sheet, the portrait on a record, the mark. Every wallet gets one generated from its address;
 * holders can mark their own.
 * Part counts must match MUGSHOT_PARTS in bot/byline.ts (the slot keys are kept for the engine).
 */
import { type CSSProperties } from "react";

export const PARTS = { fur: 5, hat: 5, acc: 6, bg: 6 } as const;
export type Traits = [fur: number, hat: number, acc: number, bg: number];

/** fur = wings, hat = antennae, acc = markings, bg = what is behind the portrait. */
export const PART_NAMES = {
  fur: ["Dusk", "Luna", "Rosy", "Ash", "Tiger"],
  hat: ["Thread antennae", "Feathered antennae", "Pollen-dusted", "Dew-tipped", "Curled antennae"],
  acc: ["Plain", "Eye-spots", "Bands", "Eye-spots + bands", "Moon windows", "Moon windows + bands"],
  bg: ["The sheet", "Lamp glow", "Dusk", "Rain", "Night", "Moonlit"],
};

/** [forewing, hindwing, body, vein] per wing colour. */
const WING: [string, string, string, string][] = [
  ["#8c7257", "#a88b6b", "#5e4a37", "#4a3a2b"],
  ["#a9cf98", "#c7e3b5", "#e9efd9", "#6f9a63"],
  ["#e6a0b5", "#f2d36b", "#f6e08f", "#b9667f"],
  ["#9b9c97", "#b8b8b2", "#6d6e6a", "#585955"],
  ["#d9822b", "#e8b04a", "#3b2a1d", "#8f4f15"],
];
const BEHIND = ["#e8eaf2", "#cbbcff", "#e9a37a", "#9fb6c4", "#151a24", "#2b3550"];
const INK = "#15171d";
const POLLEN = "#f3c74a";
const hasEyes = (acc: number) => acc === 1 || acc === 3;
const hasBands = (acc: number) => acc === 2 || acc === 3 || acc === 5;
const hasWindows = (acc: number) => acc >= 4;

function fnv(s: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** The moth a wallet gets until its owner marks one. */
export function traitsFor(addr: string): Traits {
  const h = fnv(addr.toLowerCase() + ":mugshot");
  return [h % PARTS.fur, Math.floor(h / 7) % PARTS.hat, Math.floor(h / 53) % PARTS.acc, Math.floor(h / 419) % PARTS.bg];
}

export function validTraits(t: unknown): t is Traits {
  const max = [PARTS.fur, PARTS.hat, PARTS.acc, PARTS.bg];
  return Array.isArray(t) && t.length === 4 && t.every((v, i) => Number.isInteger(v) && v >= 0 && v < max[i]);
}

/** A wallet's moth: the parts it picked, else the ones its address generates. */
export function mothOf(addr: string, pp?: number[] | null): Traits {
  return validTraits(pp) ? pp : traitsFor(addr);
}

const line = { stroke: INK, strokeWidth: 1.6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

/** One side of the moth (the left); the right is the same drawing mirrored. */
function Wings({ traits }: { traits: Traits }) {
  const [w, , acc] = traits;
  const [fore, hind, , vein] = WING[w] ?? WING[0];
  return (
    <>
      <g className="moth__hind">
        <path d="M57 52 C 44 54, 22 60, 18 74 C 16 84, 30 92, 42 86 C 50 82, 56 70, 58 58 Z" fill={hind} {...line} />
        {hasEyes(acc) ? (
          <g>
            <circle cx="34" cy="76" r="6.2" fill={POLLEN} stroke={INK} strokeWidth="1.2" />
            <circle cx="34" cy="76" r="3" fill={INK} />
            <circle cx="35.2" cy="74.8" r="0.9" fill="#fff8e6" />
          </g>
        ) : null}
      </g>
      <g className="moth__fore">
        <path d="M58 40 C 46 30, 22 20, 6 22 C 4 32, 16 50, 30 58 C 40 62, 52 58, 58 52 Z" fill={fore} {...line} />
        <path d="M56 44 C 44 38, 26 30, 10 25 M54 48 C 42 46, 28 46, 16 42 M52 52 C 44 54, 36 56, 28 56" fill="none" stroke={vein} strokeWidth="1" strokeOpacity="0.7" strokeLinecap="round" />
        {hasBands(acc) ? <path d="M40 31 C 34 40, 32 48, 34 58" fill="none" stroke={INK} strokeWidth="2.4" strokeOpacity="0.55" strokeLinecap="round" /> : null}
        {hasWindows(acc) ? <path d="M24 34 l6 -3 l3 6 l-6 3 Z" fill="#fbf8ef" fillOpacity="0.85" stroke={INK} strokeWidth="1" /> : null}
      </g>
    </>
  );
}

function Antennae({ hat }: { hat: number }) {
  if (hat === 1)
    return (
      <g fill="none" stroke={INK} strokeWidth="1.2" strokeLinecap="round">
        {[-1, 1].map((s) => (
          <g key={s} transform={s < 0 ? undefined : "translate(120 0) scale(-1 1)"}>
            <path d="M57 22 C 52 14, 46 8, 40 4" strokeWidth="1.6" />
            <path d="M54 17 l-4 -1 M51 13 l-4 -1 M48 10 l-4 -1 M45 7 l-4 -1 M54 17 l-1 -4 M51 13 l-1 -4 M48 10 l-1 -4 M45 7 l-1 -4" />
          </g>
        ))}
      </g>
    );
  const d = hat === 4 ? "M57 22 C 54 12, 44 6, 42 12 C 41 16, 46 16, 46 13" : "M57 22 C 53 14, 47 8, 41 5";
  return (
    <g>
      {[-1, 1].map((s) => (
        <g key={s} transform={s < 0 ? undefined : "translate(120 0) scale(-1 1)"}>
          <path d={d} fill="none" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
          {hat === 3 ? <circle cx="41" cy="5" r="2.6" fill="#d9f1ff" stroke={INK} strokeWidth="1" /> : null}
        </g>
      ))}
      {hat === 2 ? (
        <g fill={POLLEN}>
          {[[52, 26], [66, 25], [58, 20], [63, 31], [55, 33]].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="1.6" />
          ))}
        </g>
      ) : null}
    </g>
  );
}

/**
 * The specimen in a 120 by 100 box, head up at the top. The wings are separate groups so a moth
 * resting on the sheet can twitch them and a moth in flight can beat them.
 */
export function MothBody({ traits, flying = false }: { traits: Traits; flying?: boolean }) {
  const [w, hat] = traits;
  const body = (WING[w] ?? WING[0])[2];
  return (
    <g className={`moth__fig ${flying ? "is-flying" : ""}`}>
      <g className="moth__wing is-l">
        <Wings traits={traits} />
      </g>
      <g className="moth__wing is-r">
        <g transform="translate(120 0) scale(-1 1)">
          <Wings traits={traits} />
        </g>
      </g>
      <Antennae hat={hat} />
      <ellipse cx="60" cy="58" rx="5.2" ry="20" fill={body} {...line} />
      <path d="M56 50 h8 M55.6 56 h8.8 M56 62 h8 M57 68 h6" stroke={INK} strokeOpacity="0.45" strokeWidth="1" />
      <ellipse cx="60" cy="34" rx="6.4" ry="7" fill={body} {...line} />
      <circle cx="60" cy="25" r="4.4" fill={body} {...line} />
      <circle cx="57.6" cy="24.4" r="1.3" fill={INK} />
      <circle cx="62.4" cy="24.4" r="1.3" fill={INK} />
    </g>
  );
}

/** A moth on its own, any size. `heading` turns it (degrees, 0 = head up). */
export function Moth({ traits, size = 64, heading = 0, flying = false, className = "", style }: { traits: Traits; size?: number; heading?: number; flying?: boolean; className?: string; style?: CSSProperties }) {
  return (
    <svg className={`moth ${className}`} viewBox="0 0 120 100" width={size} height={(size * 100) / 120} aria-hidden="true" style={style}>
      <g transform={heading ? `rotate(${heading} 60 50)` : undefined}>
        <MothBody traits={traits} flying={flying} />
      </g>
    </svg>
  );
}

/** The portrait on a record: the moth on whatever its holder chose behind it. */
export function Portrait({ traits, size = 40, className = "", title, style }: { traits: Traits; size?: number; className?: string; title?: string; style?: CSSProperties }) {
  const b = traits[3];
  return (
    <svg className={`portrait ${className}`} viewBox="0 0 100 100" width={size} height={size} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true} style={style}>
      <rect width="100" height="100" fill={BEHIND[b] ?? BEHIND[0]} />
      {b === 0 ? (
        <path d="M0 33 H100 M0 66 H100 M33 0 V100 M66 0 V100" stroke={INK} strokeOpacity="0.06" strokeWidth="1" />
      ) : b === 1 ? (
        <circle cx="50" cy="-6" r="34" fill="#f3f0ff" fillOpacity="0.75" />
      ) : b === 2 ? (
        <circle cx="80" cy="84" r="16" fill="#f2c14e" fillOpacity="0.9" />
      ) : b === 3 ? (
        <path d="M12 4 l-5 14 M32 0 l-5 14 M54 6 l-5 14 M78 0 l-5 14 M96 10 l-5 14 M20 70 l-5 14 M88 66 l-5 14" stroke="#e8eef2" strokeOpacity="0.8" strokeWidth="2" strokeLinecap="round" />
      ) : b === 4 ? (
        <g fill="#e8eaf2">
          <circle cx="16" cy="14" r="1.2" />
          <circle cx="84" cy="22" r="1" />
          <circle cx="70" cy="86" r="1.2" />
          <circle cx="26" cy="80" r="0.9" />
        </g>
      ) : (
        <circle cx="80" cy="18" r="10" fill="#eef1fb" />
      )}
      <g transform="translate(3 4) scale(0.78)">
        <MothBody traits={traits} />
      </g>
    </svg>
  );
}

/** The mark: a moth under the lamp's arc. */
export function Mark({ size = 34, className = "" }: { size?: number; className?: string }) {
  return (
    <svg className={`mark ${className}`} viewBox="0 0 120 120" width={size} height={size} aria-hidden="true">
      <circle cx="60" cy="60" r="56" fill="#e8eaf2" />
      <path d="M22 44 A 40 40 0 0 1 98 44" fill="none" stroke="#7444f5" strokeWidth="7" strokeLinecap="round" />
      <g transform="translate(12 30) scale(0.8)">
        <MothBody traits={[0, 1, 1, 0]} />
      </g>
    </svg>
  );
}

/** The gecko: the dev wallet, flat on the lamp post, head toward the light. 60 by 100 box. */
export function Gecko({ className = "" }: { className?: string }) {
  return (
    <svg className={`gecko ${className}`} viewBox="0 0 60 100" aria-hidden="true">
      <g {...line} strokeWidth={1.4}>
        <path d="M30 70 C 34 80, 40 88, 34 98" fill="none" stroke="#c9b98f" strokeWidth="5" />
        <path d="M30 70 C 34 80, 40 88, 34 98" fill="none" />
        {[
          "M24 34 L10 26 l-4 -2 M10 26 l-2 4",
          "M36 34 L50 26 l4 -2 M50 26 l2 4",
          "M24 60 L10 70 l-4 2 M10 70 l-2 -4",
          "M36 60 L50 70 l4 2 M50 70 l2 -4",
        ].map((d) => (
          <path key={d} d={d} fill="none" stroke="#c9b98f" strokeWidth="4" />
        ))}
        <ellipse cx="30" cy="48" rx="9" ry="22" fill="#c9b98f" />
        <ellipse cx="30" cy="20" rx="8" ry="10" fill="#c9b98f" />
        <circle cx="25" cy="16" r="2.4" fill="#f3c74a" />
        <circle cx="35" cy="16" r="2.4" fill="#f3c74a" />
        <path d="M25 14 v4 M35 14 v4" stroke={INK} strokeWidth="1" />
        <path d="M26 40 h8 M25 48 h10 M26 56 h8" stroke={INK} strokeOpacity="0.35" />
      </g>
    </svg>
  );
}
