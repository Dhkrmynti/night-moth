/**
 * The opening: a sheet strung up in a dark field under a lamp, and the ten moths resting on it are
 * the live top ten. No. 1 sits just under the lamp, No. 2-5 in the inner ring of light, No. 6-10
 * in the outer ring; every head points at the light. The gecko on the post is the dev wallet: it
 * watches, never lands on the sheet, never paid.
 * Scrolling walks you up to the sheet until it is all you can see.
 */
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowDown } from "@phosphor-icons/react";
import { DEFAULT_STEPS, DEMO, STEP, compact, type Pond, type Status } from "../lib/api";
import { nameFor } from "../lib/alias";
import { prefersReducedMotion } from "../lib/motion";
import { TICKER } from "../lib/brand";
import { BuyButton } from "./Bits";
import { Gecko, Moth, mothOf, type Traits } from "./Moth";
import { openRecord } from "./Record";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Where each rank rests on the sheet, in % of its width and height. The lamp hangs above the top centre. */
const SPOTS: [number, number][] = [
  [50, 16],
  [31, 32],
  [69, 32],
  [17, 50],
  [83, 50],
  [38, 63],
  [62, 66],
  [14, 79],
  [86, 79],
  [50, 86],
];
const LAMP: [number, number] = [50, -8];
/** Every moth faces the light. */
const headingOf = ([x, y]: [number, number]) => Math.round((Math.atan2(LAMP[0] - x, y - LAMP[1]) * 180) / Math.PI);

type Rest = { id: string; addr: string; name: string; short: string; balance: string; traits: Traits };

/** What a phone callout prints: a claimed name cut to 9 letters, else the address's first 6 characters. */
const shortName = (addr: string, nickname?: string, x?: { username: string } | null) => {
  const n = x ? `@${x.username}` : nickname || "";
  return n ? (n.length > 9 ? n.slice(0, 8) + "…" : n) : addr.slice(0, 6);
};

/** A ruler, lit as far as the fees have come toward the next step. */
export function Charge({ status, live }: { status: Status | null; live: boolean }) {
  const steps = status?.cycle.steps ?? DEFAULT_STEPS;
  const next = status ? steps[status.cycle.index] ?? steps[0] : steps[0];
  const escrow = live ? parseFloat(status?.escrowETH ?? "0") : 0;
  const target = parseFloat(next.thresholdETH);
  const pct = target > 0 ? Math.max(0, Math.min(1, escrow / target)) : 0;
  return (
    <div className="charge" role="status">
      <p className="charge__k">
        Lamp charging toward the next <b>{STEP[next.kind].name}</b>
      </p>
      <div className="charge__rule" role="meter" aria-valuemin={0} aria-valuemax={target} aria-valuenow={escrow} aria-label={`Fees collected toward the next ${STEP[next.kind].name.toLowerCase()}`}>
        {Array.from({ length: 21 }, (_, i) => (
          <i key={i} className={`${i % 5 === 0 ? "is-major" : ""} ${i / 20 <= pct && pct > 0 ? "is-lit" : ""}`} />
        ))}
      </div>
      <p className="charge__read num">
        <span>{escrow.toFixed(4)}</span> / {next.thresholdETH} ETH
      </p>
    </div>
  );
}

export function Hero({ status, pond, offline }: { status: Status | null; pond: Pond | null; offline: boolean }) {
  const wrap = useRef<HTMLDivElement>(null);
  const live = !!status?.tokenAddress;
  const top = live ? (pond?.rows ?? []).slice(0, 10) : [];
  const rows: Rest[] = useMemo(
    () => top.map((r) => ({ id: r.addr.toLowerCase(), addr: r.addr, name: nameFor(r.addr, r.nickname, r.x).name, short: shortName(r.addr, r.nickname, r.x), balance: r.balance, traits: mothOf(r.addr, r.pp) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pond, live],
  );
  const house = live ? pond?.house : null;
  // the token is live but the board has not arrived yet: say nothing about an empty sheet until it has
  const empty = rows.length === 0 && !(live && !pond);

  // everyone the engine ever reported as sold stays in the set, so a late board update still sends the right moth off
  const soldSet = useRef(new Set<string>());
  for (const a of pond?.sold ?? []) soldSet.current.add(a.toLowerCase());
  for (const o of pond?.out ?? []) soldSet.current.add(o.addr.toLowerCase());

  // a moth that sold and dropped off the ten gets one last moment: it flies off into the dark
  const prev = useRef<{ row: Rest; at: number }[]>([]);
  const [gone, setGone] = useState<{ row: Rest; at: number; dir: number }[]>([]);
  const alive = useRef(true);
  useEffect(() => () => void (alive.current = false), []);
  useEffect(() => {
    const now = new Set(rows.map((r) => r.id));
    const left = prev.current.filter((p) => !now.has(p.row.id) && soldSet.current.has(p.row.id)).map((p) => ({ ...p, dir: SPOTS[p.at]?.[0] < 50 ? -1 : 1 }));
    prev.current = rows.map((row, at) => ({ row, at }));
    if (!left.length) return;
    setGone((l) => [...l, ...left]);
    window.setTimeout(() => alive.current && setGone((l) => l.filter((x) => !left.includes(x))), 1900);
  }, [rows]);

  // When ranks move, each moth crawls to its new place (FLIP, keyed by wallet). Measured by offset
  // inside the sheet, never on screen, so scrolling or a resize is not read as a move.
  const last = useRef(new Map<string, { x: number; y: number; w: number }>());
  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const now = new Map<string, { x: number; y: number; w: number }>();
    const w = el.querySelector<HTMLElement>(".sheet")?.offsetWidth ?? 0;
    el.querySelectorAll<HTMLElement>(".spot[data-key]").forEach((n) => {
      const b = { x: n.offsetLeft, y: n.offsetTop, w };
      now.set(n.dataset.key!, b);
      const a = last.current.get(n.dataset.key!);
      if (!a || a.w !== b.w || prefersReducedMotion() || (Math.abs(a.x - b.x) < 2 && Math.abs(a.y - b.y) < 2)) return;
      gsap.fromTo(n, { x: a.x - b.x, y: a.y - b.y }, { x: 0, y: 0, duration: 1.8, ease: "power2.inOut", clearProps: "transform" });
    });
    last.current = now;
  });

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ wide: "(min-width: 900px) and (min-height: 560px)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
        const { wide, reduce } = ctx.conditions as { wide: boolean; reduce: boolean };
        if (reduce) return;
        // arriving: the lamp comes on, the sheet catches the light, then the words
        gsap
          .timeline({ delay: 0.15 })
          .from(".lamp__glow", { opacity: 0, scale: 0.6, duration: 1.1, ease: "expo.out" })
          .from(".lamp__bulb", { opacity: 0.2, duration: 0.18, repeat: 3, yoyo: true, ease: "steps(1)" }, 0)
          .from(".sheet__light", { opacity: 0, duration: 1.2, ease: "power2.out" }, 0.2)
          .from(".hero__copy > *", { y: 26, opacity: 0, duration: 0.7, ease: "expo.out", stagger: 0.08 }, 0.35);
        if (!wide) return;
        // leaving: you walk up to the sheet. The lamp rises out of view, the words fall behind,
        // and the sheet grows until it is the whole screen, the ground of the tally below.
        const sheet = wrap.current!.querySelector<HTMLElement>(".sheet")!;
        const hero = wrap.current!.querySelector<HTMLElement>(".hero")!;
        const fit = () => {
          const r = sheet.getBoundingClientRect();
          const h = hero.getBoundingClientRect();
          const cx = r.left - h.left + r.width / 2;
          const cy = r.top - h.top + r.height / 2;
          return { x: h.width / 2 - cx, y: h.height / 2 - cy, s: Math.max(h.width / r.width, h.height / r.height) * 1.12 };
        };
        let f = fit();
        gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: { trigger: hero, start: "top top", end: "+=120%", pin: true, scrub: 0.6, invalidateOnRefresh: true, onRefreshInit: () => void gsap.set(sheet, { clearProps: "transform" }), onRefresh: () => void (f = fit()) },
          })
          .to(".hero__copy", { yPercent: -18, opacity: 0, duration: 0.3 }, 0)
          .to(".spot__tag, .gecko-btn, .post", { opacity: 0, duration: 0.2 }, 0)
          .to(".lamp", { yPercent: -160, opacity: 0, duration: 0.5 }, 0.05)
          .to(".cord", { opacity: 0, duration: 0.3 }, 0.1)
          .to(sheet, { x: () => f.x, y: () => f.y, scale: () => f.s, duration: 1, ease: "power2.in" }, 0)
          .to(".spot", { opacity: 0, duration: 0.25 }, 0.62)
          .to(".hero__fill", { opacity: 1, duration: 0.12 }, 0.88);
      });
      return () => mm.revert();
    },
    { scope: wrap },
  );

  useGSAP(
    () => {
      if (prefersReducedMotion() || !rows.length) return;
      // Each moth flutters in out of the dark and settles. On first load they wait for the lamp;
      // when the live board arrives later they come at once.
      gsap.from(".spot[data-key] > button", {
        x: (i: number) => (SPOTS[i]?.[0] < 50 ? -1 : 1) * (180 + i * 24),
        y: (i: number) => 120 + (i % 3) * 60,
        rotation: (i: number) => (i % 2 ? 40 : -40),
        opacity: 0,
        duration: 1.3,
        ease: "expo.out",
        stagger: 0.06,
        delay: performance.now() < 1600 ? 0.9 : 0.05,
      });
    },
    { scope: wrap, dependencies: [rows.length > 0] },
  );

  return (
    <div className="herowrap" ref={wrap}>
      <section className="hero" id="top" aria-label="The sheet under the lamp">
        <div className="hero__field" aria-hidden="true" />
        <div className="hero__copy">
          <h1 className="hero__h">{empty ? "The sheet is empty." : "Stay in the light."}</h1>
          <p className="hero__sub">
            {offline
              ? "The lamp is off for a moment."
              : empty
                ? live
                  ? `The first holder of 100,000 ${TICKER} lands on the glass.`
                  : `Opens at launch. The first holder of 100,000 ${TICKER} lands on the glass.`
                : `The ten biggest holders rest nearest the lamp and are paid ETH from every trade. Sell once and you fly off for good.`}
            {DEMO ? <em className="demo"> Demo data.</em> : null}
          </p>
          <Charge status={status} live={live} />
          <div className="hero__acts">
            <BuyButton status={status} />
            <a className="btn is-line" href="#card">
              Find your moth <ArrowDown weight="bold" aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="hero__scene">
          <i className="cord" aria-hidden="true" />
          <i className="post is-l" aria-hidden="true" />
          <i className="post is-r" aria-hidden="true" />
          <div className="lamp" aria-hidden="true">
            <i className="lamp__glow" />
            <svg className="lamp__bulb" viewBox="0 0 60 90">
              <path d="M30 0 V18" stroke="#c7cad6" strokeWidth="2" />
              <rect x="20" y="16" width="20" height="12" rx="2" fill="#2a2e38" stroke="#15171d" strokeWidth="1.6" />
              <path d="M18 28 H42 C 50 40, 50 62, 30 80 C 10 62, 10 40, 18 28 Z" fill="#f4f1ff" stroke="#d9d0ff" strokeWidth="1.4" />
              <path d="M24 38 C 22 48, 23 58, 28 66" fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" strokeOpacity="0.9" />
            </svg>
          </div>

          <div className="sheet">
            <i className="sheet__light" aria-hidden="true" />
            <i className="sheet__pin is-l" aria-hidden="true" />
            <i className="sheet__pin is-m" aria-hidden="true" />
            <i className="sheet__pin is-r" aria-hidden="true" />
            <ol className="spots" aria-label="The ten nearest the lamp">
              {SPOTS.map((p, i) => {
                const r = rows[i];
                const ring = i === 0 ? "is-one" : i < 5 ? "is-inner" : "is-outer";
                // labels point inward at the edges so they stay on the sheet
                const side = p[0] < 25 ? "is-right" : p[0] > 75 ? "is-left" : p[0] < 50 ? "is-left" : "is-right";
                const style = { left: `${p[0]}%`, top: `${p[1]}%`, "--d": `${(-i * 1.37).toFixed(2)}s` } as CSSProperties;
                return r ? (
                  <li key={r.id} data-key={r.id} className={`spot ${ring} ${side}`} style={style}>
                    <button type="button" onClick={() => openRecord(r.addr)} aria-label={`No. ${i + 1}, ${r.name}. Open the record`}>
                      <Moth traits={r.traits} heading={headingOf(p)} size={120} className="spot__moth" />
                    </button>
                    <span className="spot__tag" aria-hidden="true">
                      <b className="num">No. {i + 1}</b>
                      <span className="spot__name">{r.name}</span>
                      <span className="spot__short">{r.short}</span>
                      <span className="spot__bal num">{compact(r.balance)}</span>
                    </span>
                  </li>
                ) : (
                  <li key={`open-${i}`} className={`spot ${ring} ${side} is-open`} style={style}>
                    <span className="spot__ghost" aria-hidden="true" />
                    <span className="spot__tag">
                      <b className="num">No. {i + 1}</b>
                      <span className="spot__name">free</span>
                    </span>
                  </li>
                );
              })}
              {gone.map(({ row, at, dir }) => (
                <li key={`gone-${row.id}`} className={`spot is-gone ${dir < 0 ? "is-left" : "is-right"}`} style={{ left: `${SPOTS[at]?.[0] ?? 50}%`, top: `${SPOTS[at]?.[1] ?? 50}%` }} aria-hidden="true">
                  <Moth traits={row.traits} size={120} flying className="spot__moth" />
                </li>
              ))}
            </ol>
          </div>

          {house ? (
            <button type="button" className="gecko-btn" onClick={() => openRecord(house.addr)} aria-label={`The gecko, ${nameFor(house.addr, house.nickname, house.x).name}. Open the record`}>
              <Gecko />
              <span className="gecko-btn__tag">
                The gecko <b>{nameFor(house.addr, house.nickname, house.x).name}</b>
              </span>
            </button>
          ) : null}
        </div>
        <i className="hero__fill" aria-hidden="true" />
      </section>
    </div>
  );
}
