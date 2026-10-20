/** The end of the night: one line, the buy, the address, and one moth landing on the last light. */
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight, XLogo } from "@phosphor-icons/react";
import { DEMO, X_URL, dexUrl, type Status } from "../lib/api";
import { prefersReducedMotion } from "../lib/motion";
import { CHAIN, NAME, TICKER } from "../lib/brand";
import { BuyButton, CaCopy, useMedia } from "./Bits";
import { Mark, Moth } from "./Moth";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function Close({ status }: { status: Status | null }) {
  const root = useRef<HTMLElement>(null);
  const narrow = useMedia("(max-width: 760px)");
  const ca = DEMO ? "" : status?.tokenAddress;
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      // the last moth comes in out of the dark and lands by the bulb; the line is said a word at a time
      gsap.from(".close__moth", {
        x: () => window.innerWidth * 0.4,
        y: 180,
        rotation: 70,
        ease: "power1.out",
        scrollTrigger: { trigger: root.current, start: "top 85%", end: "top 25%", scrub: 0.8 },
      });
      gsap.from(".close__h span", { yPercent: 80, opacity: 0, duration: 0.8, ease: "expo.out", stagger: 0.1, scrollTrigger: { trigger: ".close__h", start: "top 88%" } });
    },
    { scope: root },
  );
  return (
    <footer className="sec close" id="closing" ref={root} aria-label="Closing">
      <div className="close__light" aria-hidden="true">
        <i className="close__glow" />
        <i className="close__bulb" />
        <Moth traits={[1, 1, 4, 0]} size={86} heading={-12} className="close__moth" />
      </div>
      <div className="wrap">
        <p className="close__h">
          <span>Don't</span> <span>fly</span> <span>off.</span>
        </p>
        <div className="close__acts">
          <BuyButton status={status} />
          <CaCopy status={status} compact={narrow} />
        </div>
        <nav className="close__links" aria-label="Elsewhere">
          {X_URL ? (
            <a href={X_URL} target="_blank" rel="noreferrer">
              <XLogo weight="bold" aria-hidden="true" /> {NAME} on X <ArrowUpRight weight="bold" aria-hidden="true" />
            </a>
          ) : null}
          {ca ? (
            <a href={dexUrl(ca)} target="_blank" rel="noreferrer">
              Chart <ArrowUpRight weight="bold" aria-hidden="true" />
            </a>
          ) : null}
          <a href="#rules">Rules</a>
          <a href="#log">Night log</a>
        </nav>
        <p className="close__sig">
          <Mark size={22} /> {NAME} · {TICKER} · {CHAIN}
        </p>
      </div>
    </footer>
  );
}
