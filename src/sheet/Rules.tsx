/**
 * The rules of the sheet, four lines said large, each lit as the reader reaches it, and the count
 * of wallets that flew off so far. Then the recorder's camera flashes: the record comes next.
 */
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { amount, type Status } from "../lib/api";
import { prefersReducedMotion } from "../lib/motion";
import { TICKER } from "../lib/brand";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function Rules({ status }: { status: Status | null }) {
  const root = useRef<HTMLElement>(null);
  const min = amount(status?.rules.minBalance ?? "100000");
  const out = status?.tokenAddress ? status.counts.hopped : 0;
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      // each rule comes into the light as it reaches the middle of the screen, and stays lit
      gsap.utils.toArray<HTMLElement>(".rule").forEach((el) =>
        gsap.fromTo(el, { opacity: 0.18, filter: "blur(3px)" }, { opacity: 1, filter: "blur(0px)", ease: "none", scrollTrigger: { trigger: el, start: "top 85%", end: "top 50%", scrub: 0.4 } }),
      );
    },
    { scope: root },
  );
  return (
    <section className="sec rules" id="rules" ref={root} aria-labelledby="rules-head">
      <div className="wrap">
        <h2 className="h2 rules__h" id="rules-head">
          Four rules at the sheet
        </h2>
        <ol className="rulelist">
          <li className="rule">
            <span className="rule__big">
              Hold {min} {TICKER}
            </span>
            <span className="rule__note">to land on the sheet at all.</span>
          </li>
          <li className="rule">
            <span className="rule__big">The biggest holder</span>
            <span className="rule__note">rests on the glass, closest to the lamp.</span>
          </li>
          <li className="rule">
            <span className="rule__big">The ten nearest the light</span>
            <span className="rule__note">share every Reward, in ETH.</span>
          </li>
          <li className="rule is-ember">
            <span className="rule__big">Never fly off.</span>
            <span className="rule__note">Sell once and you are gone. For good.</span>
          </li>
        </ol>
        <p className="rules__out">
          <b className="num">{out}</b> flew off so far. Moving between your own wallets is not a sale.
        </p>
      </div>
    </section>
  );
}

/** The recorder's camera: one hard flash, the whole page in negative for a beat, as the record comes up. */
export function Flash() {
  const el = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (prefersReducedMotion()) return;
    const fire = () =>
      gsap
        .timeline()
        .set(el.current, { opacity: 1 })
        .to(el.current, { opacity: 0, duration: 0.45, ease: "expo.out", delay: 0.06 });
    ScrollTrigger.create({ trigger: "#card", start: "top 70%", onEnter: fire, onEnterBack: undefined });
  });
  return <div className="flash" ref={el} aria-hidden="true" />;
}
