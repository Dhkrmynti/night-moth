/**
 * The night log: every step the engine ran, newest first, each with the transaction that proves it.
 * Kept like a recorder's log through the night: the time first, then what happened. The line down
 * the side is drawn as you read.
 */
import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { STEP, dateWib, demoRounds, eth, txUrl, usePoll, type RoundRow, type Status } from "../lib/api";
import { prefersReducedMotion } from "../lib/motion";
import { useMedia } from "./Bits";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function Log({ status }: { status: Status | null }) {
  const root = useRef<HTMLElement>(null);
  const live = !!status?.tokenAddress;
  const { data: rounds } = usePoll<RoundRow[]>(live ? "/api/rounds" : null, 30000, demoRounds);
  const narrow = useMedia("(max-width: 760px)");
  const [more, setMore] = useState(false);
  const all = (rounds ?? []).filter((r) => r.stage !== "failed" && STEP[r.kind]).slice(0, 12);
  const shown = more ? all : all.slice(0, narrow ? 4 : 6);
  const t = status?.totals;

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(".logbook__spine", { scaleY: 0 }, { scaleY: 1, ease: "none", transformOrigin: "50% 0", scrollTrigger: { trigger: ".logbook", start: "top 75%", end: "bottom 60%", scrub: 0.5 } });
      ScrollTrigger.batch(".logline", {
        start: "top 88%",
        once: true,
        onEnter: (els) => gsap.from(els, { x: -18, opacity: 0, duration: 0.7, ease: "expo.out", stagger: 0.07 }),
      });
    },
    { scope: root, dependencies: [shown.length] },
  );

  return (
    <section className="sec logsec" id="log" ref={root} aria-labelledby="log-head">
      <div className="wrap">
        <h2 className="h2" id="log-head">
          Night log
        </h2>
        <p className="totals">
          <span>
            <b className="num">{eth(t?.fedETH ?? "0")}</b> paid to the ten on the sheet.
          </span>
          <span>
            <b className="num">{eth(t?.keeperETH ?? "0")}</b> to the treasury.
          </span>
        </p>
        {shown.length ? (
          <ol className="logbook">
            <i className="logbook__spine" aria-hidden="true" />
            {shown.map((r) => {
              const done = r.stage === "done";
              const what = r.kind === "feeding" ? `paid to ${r.recipients || 10} holders` : "to the treasury wallet";
              const value = r.kind === "feeding" && done ? r.fedETH : r.spentETH;
              const tx = r.kind === "feeding" ? r.claimTx : r.treasuryTx;
              return (
                <li key={r.n} className={`logline is-${r.kind} ${done ? "" : "is-open"}`}>
                  <span className="logline__when num">{dateWib(r.at)}</span>
                  <span className="logline__what">
                    <span className="num">#{r.n}</span> <b>{STEP[r.kind].name}</b> {what}
                  </span>
                  <span className="logline__eth num">{parseFloat(value).toFixed(4)} ETH</span>
                  {done && tx ? (
                    <a className="logline__tx num" href={txUrl(tx)} target="_blank" rel="noreferrer">
                      {tx.slice(0, 8)}… <ArrowUpRight weight="bold" aria-hidden="true" />
                    </a>
                  ) : (
                    <span className="logline__tx is-pending num">pending</span>
                  )}
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="logsec__empty">Nothing logged yet. The first Reward runs when the creator fees reach {status?.cycle.steps[0].thresholdETH ?? "0.02"} ETH.</p>
        )}
        {all.length > shown.length ? (
          <button type="button" className="btn is-line logsec__more" onClick={() => setMore(true)}>
            Show {all.length - shown.length} earlier
          </button>
        ) : null}
      </div>
    </section>
  );
}
