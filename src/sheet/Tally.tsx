/**
 * The tally: the same ten moths as on the sheet above, written up close. No. 1 is on the glass;
 * No. 1-5 are the inner ring and No. 6-10 the outer ring (the two reward tiers); 11-50 are still
 * in the grass, with the gap to the light. When ranks move, entries glide to their new lines.
 */
import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { DEFAULT_TIERS, compact, splitInheritance, usd, type Pond, type PondRow, type Status } from "../lib/api";
import { nameFor } from "../lib/alias";
import { prefersReducedMotion } from "../lib/motion";
import { TICKER } from "../lib/brand";
import { Face, XCheck, XLink } from "./Bits";
import { openRecord } from "./Record";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function Who({ addr, nickname, pp, x, size = 28 }: { addr: string; nickname?: string; pp?: number[] | null; x?: PondRow["x"]; size?: number }) {
  const who = nameFor(addr, nickname, x ?? null);
  return (
    <span className="who">
      {size > 0 ? <Face addr={addr} pp={pp ?? null} x={x ?? null} size={size} className="who__face" /> : null}
      {x ? <XLink x={x} className="who__x" /> : null}
      <button type="button" className="who__name" onClick={() => openRecord(addr)} aria-label={`Open the record of ${who.name}`}>
        {who.name}
      </button>
      {x ? <XCheck x={x} /> : null}
    </span>
  );
}

export function Tally({ status, pond }: { status: Status | null; pond: Pond | null }) {
  const root = useRef<HTMLElement>(null);
  const live = !!status?.tokenAddress;
  const rows = live ? (pond?.rows ?? []).slice(0, 50) : [];
  const tiers = status?.rules.tiers ?? DEFAULT_TIERS;
  const reward = parseFloat(status?.cycle.steps.find((s) => s.kind === "feeding")?.thresholdETH ?? "0.02");
  const share = splitInheritance(reward, rows.filter((r) => r.inTop).map((r) => parseFloat(r.balance)), tiers);
  const px = status?.price?.tokenUSD ?? 0;
  const worth = (b: string) => (px > 0 ? usd(parseFloat(b) * px) : "");
  const bar = rows.length >= 10 ? parseFloat(rows[9].balance) : 0;
  const ten = Array.from({ length: 10 }, (_, i) => rows[i]);
  const far = rows.slice(10);
  const one = ten[0];

  // Entries glide to their new lines when ranks move (FLIP, keyed by wallet). Offsets ignore
  // transforms and scrolling, so only a real change of place is animated; a change of width is not.
  const last = useRef(new Map<string, { x: number; y: number; w: number }>());
  const prevOne = useRef<string | undefined>(undefined);
  const [taken, setTaken] = useState(0);
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const w = el.offsetWidth;
    const now = new Map<string, { x: number; y: number; w: number }>();
    el.querySelectorAll<HTMLElement>("[data-key]").forEach((n) => now.set(n.dataset.key!, { x: n.offsetLeft, y: n.offsetTop, w }));
    if (!prefersReducedMotion())
      el.querySelectorAll<HTMLElement>("[data-key]").forEach((n) => {
        const a = last.current.get(n.dataset.key!);
        const b = now.get(n.dataset.key!);
        if (!a || !b || a.w !== b.w || (Math.abs(a.x - b.x) < 2 && Math.abs(a.y - b.y) < 2)) return;
        gsap.fromTo(n, { x: a.x - b.x, y: a.y - b.y, zIndex: 3 }, { x: 0, y: 0, duration: 1.1, ease: "power2.inOut", clearProps: "transform,zIndex" });
      });
    last.current = now;
    const k = rows[0]?.addr;
    if (prevOne.current && k && k !== prevOne.current) setTaken((s) => s + 1);
    prevOne.current = k;
  });

  // a new moth is on the glass: say so once
  useGSAP(
    () => {
      if (!taken || prefersReducedMotion()) return;
      gsap.fromTo(".taken", { yPercent: 120, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.5, ease: "expo.out" });
      gsap.to(".taken", { opacity: 0, delay: 2.6, duration: 0.4 });
    },
    { scope: root, dependencies: [taken] },
  );

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      // the leader lines are drawn out to each amount as the rings come into view
      gsap.from(".ringrow__lead", { scaleX: 0, transformOrigin: "0 50%", duration: 0.9, ease: "expo.out", stagger: 0.05, scrollTrigger: { trigger: ".rings2", start: "top 80%" } });
      gsap.from(".glass__arc path", { strokeDashoffset: 1, duration: 1.4, ease: "expo.out", stagger: 0.12, scrollTrigger: { trigger: ".glass", start: "top 85%" } });
    },
    { scope: root, dependencies: [rows.length > 0] },
  );

  const line = (r: PondRow | undefined, rank: number) => (
    <li key={r?.addr ?? `open-${rank}`} data-key={r?.addr} className={`ringrow ${r ? "" : "is-open"}`}>
      <span className="ringrow__n num">{rank}</span>
      {r ? (
        <>
          <Who addr={r.addr} nickname={r.nickname} pp={r.pp} x={r.x} size={36} />
          <span className="ringrow__bal num">
            {compact(r.balance)}
            {worth(r.balance) ? ` · ${worth(r.balance)}` : ""}
          </span>
          <i className="ringrow__lead" aria-hidden="true" />
          <span className="ringrow__eth num">+{(share[rank - 1] ?? 0).toFixed(4)} ETH</span>
        </>
      ) : (
        <span className="ringrow__open">Free spot. {bar > 0 ? "Hold more than No. 10 to take it." : `Hold 100,000 ${TICKER} to take it.`}</span>
      )}
    </li>
  );

  return (
    <section className="sec tally" id="sheet" ref={root} aria-labelledby="sheet-head">
      <div className="wrap">
        <h2 className="h2" id="sheet-head">
          Who is nearest the light
        </h2>
        <p className="deck">
          {live ? `${(pond?.total ?? 0).toLocaleString("en-US")} holders on the sheet.` : "Opens at launch."}
          {px > 0 ? ` 1 ${TICKER} is about $${px < 0.01 ? px.toPrecision(3) : px.toFixed(4)}.` : ""}
        </p>

        <div className={`glass ${one ? "" : "is-open"}`} data-key={one?.addr}>
          <svg className="glass__arc" viewBox="0 0 400 120" aria-hidden="true">
            <path d="M10 118 A 190 110 0 0 1 390 118" pathLength={1} />
            <path d="M60 118 A 140 80 0 0 1 340 118" pathLength={1} />
            <path d="M110 118 A 90 52 0 0 1 290 118" pathLength={1} />
          </svg>
          {one ? (
            <>
              <Who addr={one.addr} nickname={one.nickname} pp={one.pp} x={one.x} size={92} />
              <p className="glass__bal num">
                on the glass · {compact(one.balance)} {TICKER}
                {worth(one.balance) ? ` · ${worth(one.balance)}` : ""}
              </p>
              <p className="glass__eth num">next Reward +{(share[0] ?? 0).toFixed(4)} ETH</p>
            </>
          ) : (
            <p className="glass__bal">Nobody yet. The biggest holder lands here.</p>
          )}
        </div>

        <div className="rings2">
          <div className="ring">
            <h3 className="ring__h">Inner ring</h3>
            <p className="ring__k">
              No. 1-5 share <b className="num">{tiers[0]?.eth ?? "0.014"} ETH</b> of every {reward} ETH Reward, by balance.
            </p>
            <ol className="ring__list">{ten.slice(1, 5).map((r, i) => line(r, i + 2))}</ol>
          </div>
          <div className="ring is-outer">
            <h3 className="ring__h">Outer ring</h3>
            <p className="ring__k">
              No. 6-10 share <b className="num">{tiers[1]?.eth ?? "0.006"} ETH</b>.
            </p>
            <ol className="ring__list">{ten.slice(5).map((r, i) => line(r, i + 6))}</ol>
          </div>
        </div>

        {live && (pond?.house || pond?.waiting?.length || pond?.out?.length) ? (
          <div className="margin">
            {pond?.house ? (
              <p className="margin__row">
                <b>The gecko</b>
                <Who addr={pond.house.addr} nickname={pond.house.nickname} pp={pond.house.pp} x={pond.house.x} size={24} />
                <span>
                  <span className="num">{compact(pond.house.balance)}</span>. The dev wallet: watches from the post, never on the sheet, never paid.
                </span>
              </p>
            ) : null}
            {pond?.waiting?.length ? (
              <p className="margin__row">
                <b>Warming up</b>
                {pond.waiting.map((w) => (
                  <Who key={w.addr} addr={w.addr} nickname={w.nickname} pp={w.pp} x={w.x} size={22} />
                ))}
              </p>
            ) : null}
            {pond?.out?.length ? (
              <p className="margin__row">
                <b className="is-ember">Flew off</b>
                {pond.out.map((w) => (
                  <span key={w.addr} className="margin__gone">
                    {nameFor(w.addr, w.nickname, w.x).name}
                  </span>
                ))}
              </p>
            ) : null}
          </div>
        ) : null}

        {far.length ? (
          <div className="grass">
            <h3 className="grass__h">In the grass</h3>
            <p className="grass__k">No. 11-50. Pass No. 10's balance and you are on the sheet.</p>
            <ol className="grass__list" start={11} aria-label="No. 11 to 50">
              {far.map((r) => {
                const gap = bar - parseFloat(r.balance);
                return (
                  <li key={r.addr} data-key={r.addr}>
                    <span className="grass__n num">{r.rank}</span>
                    <Who addr={r.addr} nickname={r.nickname} pp={r.pp} x={r.x} size={22} />
                    <span className="grass__sub num">
                      {compact(r.balance)} · {gap > 0 ? `+${compact(gap + 1)} to the light` : "next up"}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        ) : null}
        {taken ? (
          <p className="taken" aria-live="polite">
            A new moth is on the glass.
          </p>
        ) : null}
      </div>
      <svg className="hem" viewBox="0 0 1440 40" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 0 H1440 V18 C 1300 34, 1180 6, 1040 22 C 900 38, 780 8, 640 24 C 500 40, 380 10, 240 26 C 140 36, 60 18, 0 28 Z" />
      </svg>
    </section>
  );
}
