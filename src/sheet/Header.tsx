/** The bar across the top: the name, the parts of the night and the way in. Its bottom edge is lit as far as the lamp is charged. */
import { useEffect, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { XLogo } from "@phosphor-icons/react";
import { DEFAULT_STEPS, X_URL, type Status } from "../lib/api";
import { NAME, TICKER } from "../lib/brand";
import { BuyButton, ConnectButton } from "./Bits";
import { Mark } from "./Moth";

export const NAV: [string, string][] = [
  ["sheet", "The sheet"],
  ["lamp", "The lamp"],
  ["rules", "Rules"],
  ["card", "Your moth"],
  ["log", "Night log"],
];

export function Header({ status }: { status: Status | null }) {
  const [on, setOn] = useState("");
  useEffect(() => {
    const st = NAV.map(([id]) => ScrollTrigger.create({ trigger: `#${id}`, start: "top 55%", end: "bottom 55%", onToggle: (s) => s.isActive && setOn(id) }));
    const top = ScrollTrigger.create({ trigger: "#top", start: "top top", end: "bottom 55%", onToggle: (s) => s.isActive && setOn("") });
    return () => [...st, top].forEach((s) => s.kill());
  }, []);
  const live = !!status?.tokenAddress;
  const steps = status?.cycle.steps ?? DEFAULT_STEPS;
  const next = status ? steps[status.cycle.index] ?? steps[0] : steps[0];
  const pct = live ? Math.max(0, Math.min(1, parseFloat(status!.escrowETH) / parseFloat(next.thresholdETH))) : 0;
  return (
    <header className="head">
      <a className="head__brand" href="#top" aria-label={`${NAME}, back to the top`}>
        <Mark size={32} />
        <span className="head__word">{NAME}</span>
        <span className="head__tick num">{TICKER}</span>
      </a>
      <nav className="nav" aria-label="Sections">
        {NAV.map(([id, label]) => (
          <a key={id} href={`#${id}`} className={on === id ? "is-on" : ""} aria-current={on === id ? "location" : undefined}>
            {label}
          </a>
        ))}
      </nav>
      <div className="head__acts">
        {X_URL ? (
          <a className="head__x" href={X_URL} target="_blank" rel="noreferrer noopener" aria-label={`${NAME} on X`} title={`${NAME} on X`}>
            <XLogo weight="bold" aria-hidden="true" />
          </a>
        ) : null}
        <ConnectButton />
        <BuyButton status={status} className="is-small" />
      </div>
      <i className="head__charge" style={{ transform: `scaleX(${pct})` }} aria-hidden="true" />
    </header>
  );
}
