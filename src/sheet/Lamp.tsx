/**
 * The lamp: the loop the engine runs, drawn as the orbit a moth flies round a light. Each step
 * owns its share of the circle; the step being charged now is lit as far as the fees have come.
 * No buyback, no burn: the engine never buys or destroys the token.
 * A moth flies the orbit as you scroll past.
 */
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { DEFAULT_STEPS, DEFAULT_TIERS, STEP, addrUrl, short, stepShare, type RoundKind, type Status } from "../lib/api";
import { prefersReducedMotion } from "../lib/motion";
import { TICKER } from "../lib/brand";
import { Moth } from "./Moth";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const R = 170;
const GAP = 4; // degrees between steps
const pt = (deg: number, r = R) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [Math.cos(a) * r, Math.sin(a) * r] as const;
};
function arc(a0: number, a1: number, r = R) {
  const [x0, y0] = pt(a0, r);
  const [x1, y1] = pt(a1, r);
  return `M${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}

export function Lamp({ status }: { status: Status | null }) {
  const root = useRef<HTMLElement>(null);
  const steps = status?.cycle.steps ?? DEFAULT_STEPS;
  const tiers = status?.rules.tiers ?? DEFAULT_TIERS;
  const live = !!status?.tokenAddress;
  const at = live ? status!.cycle.index : -1;
  const escrow = parseFloat(status?.escrowETH ?? "0");
  const treasury = live ? status?.treasuryAddress : "";
  const total = steps.reduce((t, s) => t + parseFloat(s.thresholdETH), 0) || 1;
  let cursor = 0;
  const segs = steps.map((s, i) => {
    const span = (parseFloat(s.thresholdETH) / total) * 360;
    const a0 = cursor + GAP / 2;
    const a1 = cursor + span - GAP / 2;
    cursor += span;
    const level = parseFloat(s.thresholdETH);
    const fill = at === i ? Math.max(0, Math.min(1, escrow / level)) : 0;
    return { s, i, a0, a1, mid: (a0 + a1) / 2, level, fill };
  });

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from(".orbit__seg", { strokeDashoffset: 1, duration: 1.6, ease: "expo.out", stagger: 0.2, scrollTrigger: { trigger: ".orbit", start: "top 75%" } });
      // the moth flies the orbit as the section passes
      gsap.fromTo(".orbit__flyer", { rotation: -30 }, { rotation: 330, ease: "none", svgOrigin: "0 0", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 0.8 } });
      gsap.utils.toArray<HTMLElement>(".stepnote").forEach((el) =>
        gsap.from(el, { y: 30, opacity: 0, duration: 0.8, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 85%" } }),
      );
    },
    { scope: root },
  );

  const does = (kind: RoundKind) =>
    kind === "feeding"
      ? `ETH straight to the ten on the sheet. No. 1-5 split ${tiers[0]?.eth ?? "0.014"}, No. 6-10 split ${tiers[1]?.eth ?? "0.006"}, by balance in each ring.`
      : "ETH to the treasury wallet. Every transfer is in the night log below.";

  return (
    <section className="sec lampsec" id="lamp" ref={root} aria-labelledby="lamp-head">
      <div className="wrap lampsec__grid">
        <figure className="orbit" aria-hidden="true">
          <svg viewBox="-320 -235 640 470">
            <defs>
              <radialGradient id="lampglow">
                <stop offset="0" stopColor="#f4f1ff" />
                <stop offset="0.18" stopColor="#cbbcff" stopOpacity="0.85" />
                <stop offset="0.55" stopColor="#7444f5" stopOpacity="0.18" />
                <stop offset="1" stopColor="#7444f5" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle r="150" fill="url(#lampglow)" />
            <circle r="16" fill="#f4f1ff" />
            <circle r={R} className="orbit__track" />
            {segs.map(({ s, i, a0, a1, fill }) => (
              <g key={i}>
                <path d={arc(a0, a1)} className={`orbit__seg is-${s.kind}`} pathLength={1} />
                {fill > 0 ? <path d={arc(a0, a0 + (a1 - a0) * fill, R + 14)} className="orbit__fill" /> : null}
              </g>
            ))}
            {segs.map(({ s, i, mid, level }) => {
              const [x, y] = pt(mid, R + 40);
              return (
                <text key={`t${i}`} x={x} y={y} className="orbit__label" textAnchor={x > 4 ? "start" : x < -4 ? "end" : "middle"}>
                  <tspan x={x} dy="0">{STEP[s.kind].name}</tspan>
                  <tspan x={x} dy="18" className="orbit__eth">{level} ETH</tspan>
                </text>
              );
            })}
            <g className="orbit__flyer">
              <g transform={`translate(-24 ${-R - 20})`}>
                <Moth traits={[0, 1, 1, 0]} size={48} heading={90} flying />
              </g>
            </g>
          </svg>
        </figure>

        <div className="lampsec__text">
          <h2 className="h2" id="lamp-head">
            The lamp runs on fees.
          </h2>
          <p className="deck">Each trade's creator fee builds up in the Pons fee escrow. When it reaches the next step's level, the engine collects it and runs that step. Then the next, then round again.</p>
          <ol className="steps">
            {segs.map(({ s, i, level, fill }) => (
              <li key={i} className={`stepnote is-${s.kind} ${at === i ? "is-now" : ""}`} aria-current={at === i ? "step" : undefined}>
                <h3 className="stepnote__name">
                  {STEP[s.kind].name} <span className="num">{level} ETH</span>
                </h3>
                <p className="stepnote__line">{does(s.kind)}</p>
                <p className="stepnote__state num">
                  {at === i ? `Charging now: ${escrow.toFixed(4)} / ${level} ETH (${Math.round(fill * 100)}%)` : live ? "Waiting its turn." : "Starts at launch."}
                </p>
              </li>
            ))}
          </ol>
          <p className="sum">
            Over one full loop: <b className="num">{stepShare(steps, "feeding")}%</b> to the ten on the sheet, <b className="num">{stepShare(steps, "keeper")}%</b> to the treasury.
          </p>
          <p className="plain">
            No buyback and no burn: the engine never buys, sells or destroys {TICKER}.
            {treasury ? (
              <>
                {" "}
                Treasury wallet:{" "}
                <a href={addrUrl(treasury)} target="_blank" rel="noreferrer" className="num">
                  {short(treasury)} <ArrowUpRight weight="bold" aria-hidden="true" />
                </a>
              </>
            ) : null}
          </p>
        </div>
      </div>
    </section>
  );
}
