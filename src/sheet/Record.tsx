/**
 * Find your moth: look up any wallet and get its capture record, with where it rests and what it
 * has been paid. The holder of the wallet can then mark it: a name, a moth, or an X account, set
 * by signing one plain message. No transaction is ever requested.
 */
import { useEffect, useRef, useState, type FormEvent } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { CaretLeft, CaretRight, Check, LinkSimple, MagnifyingGlass, PenNib, SealCheck, Wallet, XLogo } from "@phosphor-icons/react";
import { DEMO, addrUrl, amount, bylineNonce, claimByline, dateWib, demoSaveByline, demoWallet, eth, fetchWallet, short, startXDemo, startXLink, takeXDemo, txUrl, unlinkX, type WalletInfo } from "../lib/api";
import { nameFor } from "../lib/alias";
import { prefersReducedMotion } from "../lib/motion";
import { connectWallet, hasWallet, signText, useAccount } from "../lib/wallet";
import { NAME, TICKER } from "../lib/brand";
import { Face, XCheck, XLink } from "./Bits";
import { Mark, PARTS, PART_NAMES, Portrait, mothOf, type Traits } from "./Moth";

gsap.registerPlugin(useGSAP);

const VALID = /^0x[0-9a-fA-F]{40}$/;

type Tone = "ok" | "wait" | "stop" | "dim";
const STAMP: Record<WalletInfo["status"], { word: string; tone: Tone; line: string }> = {
  sitting: { word: "On the sheet", tone: "ok", line: "You are on the sheet. Hold and move closer to the lamp." },
  waiting: { word: "Warming up", tone: "wait", line: `Your first ${TICKER} are still settling. A moment.` },
  "too-small": { word: "Out of the light", tone: "wait", line: `Under 100,000 ${TICKER}. Too far from the lamp to count. Hold more.` },
  hopped: { word: "Flew off", tone: "stop", line: "This wallet sold. It flew off into the dark, for good." },
  excluded: { word: "Not a moth", tone: "dim", line: "Engine, curve, treasury or dead address. Never on the sheet, never paid." },
  "not-holding": { word: "Not here", tone: "dim", line: `This wallet holds no ${TICKER}.` },
};

/** What X sign-in came back with (?x=…), read once and then cleared from the address bar. */
const X_RESULT: Record<string, { ok: boolean; text: string }> = {
  linked: { ok: true, text: "X linked. The sheet now shows your X handle, picture and badge." },
  demo: { ok: true, text: "X linked for real: that's your handle, picture and badge. Demo page, so nothing was saved." },
  cancelled: { ok: false, text: "X sign-in cancelled. Nothing changed." },
  expired: { ok: false, text: "The X sign-in took too long. Try again." },
  failed: { ok: false, text: "X didn't confirm the account. Try again in a minute." },
};
function takeXResult() {
  const url = new URL(window.location.href);
  const r = url.searchParams.get("x");
  if (!r) return null;
  url.searchParams.delete("x");
  window.history.replaceState(null, "", url);
  return X_RESULT[r] ?? X_RESULT.failed;
}

export const NO_WALLET = `No wallet in this browser. Open ${typeof window === "undefined" ? "this site" : window.location.host} inside your wallet app (MetaMask, Rabby, OKX) to connect. GMGN's built-in wallet can't sign here yet.`;

function readQuery() {
  const p = new URLSearchParams(window.location.search).get("w") || window.location.hash.match(/w=(0x[0-9a-fA-F]{40})/)?.[1] || "";
  return VALID.test(p) ? p : "";
}

/** Rows elsewhere on the page open a wallet's record through this event. */
export function openRecord(addr: string) {
  const url = new URL(window.location.href);
  url.searchParams.set("w", addr);
  window.history.replaceState(null, "", url);
  window.dispatchEvent(new CustomEvent("rbank:card", { detail: addr }));
}

const SLOTS = [
  ["fur", "Wings"],
  ["hat", "Antennae"],
  ["acc", "Markings"],
  ["bg", "Behind"],
] as const;

function Markings({ info, onSaved, flash }: { info: WalletInfo; onSaved: (patch: Partial<WalletInfo>) => void; flash: { ok: boolean; text: string } | null }) {
  // The header's Connect button and this desk share one account.
  const shared = useAccount();
  // Back from a demo X sign-in, the desk reopens already "connected".
  const [demoAccount, setDemoAccount] = useState(DEMO && flash ? info.addr : "");
  const account = demoAccount || shared;
  const [open, setOpen] = useState(!!flash || (!!shared && shared.toLowerCase() === info.addr.toLowerCase()));
  const [tab, setTab] = useState<"name" | "x">(info.x ? "x" : "name");
  // A freshly linked X account opens on its own tab.
  const hasX = !!info.x;
  useEffect(() => {
    if (hasX) setTab("x");
  }, [hasX]);
  const [name, setName] = useState(info.nickname || "");
  const [moth, setMoth] = useState<Traits>(mothOf(info.addr, info.pp));
  const turn = (slot: number, by: number) => {
    const max = [PARTS.fur, PARTS.hat, PARTS.acc, PARTS.bg][slot];
    const next = [...moth] as Traits;
    next[slot] = (next[slot] + by + max) % max;
    setMoth(next);
  };
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(flash);
  const mine = account && account.toLowerCase() === info.addr.toLowerCase();

  const connect = async () => {
    setNote(null);
    // The demo page opens the desk without a wallet; nothing it saves leaves the page.
    if (DEMO) {
      setDemoAccount(info.addr);
      return setNote({ ok: true, text: "Demo page: try it all. Whatever you set stays on this page only." });
    }
    if (!hasWallet()) return setNote({ ok: false, text: NO_WALLET });
    try {
      setBusy(true);
      const a = await connectWallet();
      if (a.toLowerCase() !== info.addr.toLowerCase()) setNote({ ok: false, text: `This record belongs to ${short(info.addr)}, your wallet is ${short(a)}. Switch accounts in the wallet.` });
    } catch (e: any) {
      setNote({ ok: false, text: e?.message || "The wallet didn't connect." });
    } finally {
      setBusy(false);
    }
  };

  const sign = async () => {
    setNote(null);
    const tidy = name.replace(/\s+/g, " ").trim();
    if (DEMO) {
      if (tidy.length < 3 || tidy.length > 18 || !/^[A-Za-z0-9 _'-]+$/.test(tidy)) return setNote({ ok: false, text: "Names are 3 to 18 letters, numbers, spaces, - ' or _." });
      demoSaveByline(info.addr, { nickname: tidy, pp: moth });
      onSaved({ nickname: tidy, pp: moth });
      return setNote({ ok: true, text: `Saved. You're "${tidy}" on the sheet now. (Demo page: on this page only.)` });
    }
    try {
      setBusy(true);
      const clean = name.replace(/\s+/g, " ").trim();
      const { nonce, template } = await bylineNonce(info.addr);
      const signature = await signText(account, template.replace("{nickname}", clean).replace("{mugshot}", moth.join("-")));
      const saved = await claimByline(info.addr, clean, moth, nonce, signature);
      onSaved({ nickname: saved.nickname, pp: saved.pp });
      setNote({ ok: true, text: `Saved. You're "${saved.nickname}" on the sheet now.` });
      window.dispatchEvent(new Event("rbank:refresh"));
    } catch (e: any) {
      setNote({ ok: false, text: e?.code === 4001 ? "You cancelled the signature. Nothing was saved." : e?.message || "Couldn't save the name." });
    } finally {
      setBusy(false);
    }
  };

  const failed = (e: any, what: string) => setNote({ ok: false, text: e?.code === 4001 ? "You cancelled the signature. Nothing changed." : e?.message || what });

  // Link X: the wallet signs, then the browser goes to X and comes back to this record.
  const linkX = async () => {
    setNote(null);
    if (DEMO) {
      // A real X sign-in (shown once, never saved). Without X keys on the engine, say so plainly;
      // a pretend account is only used if the visitor asks for one.
      try {
        setBusy(true);
        const { url } = await startXDemo(info.addr);
        return window.location.assign(url);
      } catch (e: any) {
        setBusy(false);
        setPretend(true);
        return setNote({ ok: false, text: `Real X sign-in isn't switched on yet (${e?.message || "no X app keys on the server"}). You can preview with a pretend account instead.` });
      }
    }
    try {
      setBusy(true);
      const { nonce, linkX: text } = await bylineNonce(info.addr);
      const signature = await signText(account, text);
      const { url } = await startXLink(info.addr, nonce, signature);
      window.location.assign(url);
    } catch (e: any) {
      failed(e, "Couldn't start X sign-in.");
      setBusy(false);
    }
  };

  const [pretend, setPretend] = useState(false);
  const usePretend = () => {
    const x = { username: "your_x_handle", name: "Your X name", avatar: "/favicon.svg", verified: "blue" };
    demoSaveByline(info.addr, { x });
    onSaved({ x });
    setPretend(false);
    setNote({ ok: true, text: "Pretend X account linked. With X sign-in switched on, this is your real handle, picture and badge." });
  };

  const dropX = async () => {
    setNote(null);
    if (DEMO) {
      demoSaveByline(info.addr, { x: null });
      // take it off the shared test board too
      fetch("/api/x/demo/unlink", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ addr: info.addr }) }).catch(() => {});
      onSaved({ x: null });
      setTab("name");
      return setNote({ ok: true, text: "X unlinked. The sheet shows your name and moth again." });
    }
    try {
      setBusy(true);
      const { nonce, unlinkX: text } = await bylineNonce(info.addr);
      await unlinkX(info.addr, nonce, await signText(account, text));
      onSaved({ x: null });
      setTab("name");
      setNote({ ok: true, text: "X unlinked. The sheet shows your name and moth again." });
      window.dispatchEvent(new Event("rbank:refresh"));
    } catch (e: any) {
      failed(e, "Couldn't unlink X.");
    } finally {
      setBusy(false);
    }
  };

  if (!open)
    return (
      <button type="button" className="btn is-line desk__open" onClick={() => setOpen(true)}>
        <PenNib weight="bold" aria-hidden="true" /> {info.x ? "Manage X link" : info.nickname ? "Edit name, moth or X" : "Set your name, moth or X"}
      </button>
    );

  return (
    <div className="desk">
      <h3 className="desk__head">Markings</h3>
      {!mine ? (
        <>
          <button type="button" className="btn is-line" onClick={connect} disabled={busy}>
            <Wallet weight="bold" aria-hidden="true" /> {busy ? "Connecting" : account ? "Switch to this wallet" : "Connect this wallet"}
          </button>
          {account && !note ? <p className="help">Your wallet is {short(account)}. This record is {short(info.addr)}: switch accounts in the wallet to edit it.</p> : null}
        </>
      ) : (
        <>
          <div className="desk__tabs" role="tablist" aria-label="How the sheet shows you">
            <button type="button" role="tab" aria-selected={tab === "name"} className="desk__tab" onClick={() => setTab("name")}>
              <PenNib weight="bold" aria-hidden="true" /> Name & moth
            </button>
            <button type="button" role="tab" aria-selected={tab === "x"} className="desk__tab" onClick={() => setTab("x")}>
              <XLogo weight="bold" aria-hidden="true" /> Connect X
            </button>
          </div>
          {tab === "x" ? (
            <div className="xdesk" role="tabpanel">
              {info.x ? (
                <>
                  <div className="xdesk__who">
                    <Face addr={info.addr} pp={info.pp} x={info.x} size={64} className="xdesk__face" />
                    <div>
                      <p className="xdesk__name">
                        {info.x.name} <XCheck x={info.x} />
                      </p>
                      <a className="xdesk__handle" href={`https://x.com/${info.x.username}`} target="_blank" rel="noreferrer noopener">
                        @{info.x.username}
                      </a>
                    </div>
                  </div>
                  <p className="help">Handle, picture and badge come from X and can't be edited here. Changed them on X? Link again to refresh.</p>
                  <div className="xdesk__actions">
                    <button type="button" className="btn is-line" onClick={linkX} disabled={busy}>
                      <XLogo weight="bold" aria-hidden="true" /> Link again
                    </button>
                    <button type="button" className="btn is-quiet" onClick={dropX} disabled={busy}>
                      Unlink X
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="xdesk__pitch">Show your X account instead: your handle, your picture, and your badge if X gave you one. A logo next to your name opens your profile.</p>
                  <button type="button" className="btn is-line" onClick={linkX} disabled={busy || !info.xLogin}>
                    <XLogo weight="bold" aria-hidden="true" /> {busy ? "Opening X" : "Sign & connect X"}
                  </button>
                  {DEMO && pretend ? (
                    <button type="button" className="btn is-quiet" onClick={usePretend}>
                      Use a pretend account
                    </button>
                  ) : null}
                  <p className="help">{info.xLogin ? "Read-only: we never post or see your DMs. Your picture and handle then can't be edited here." : "X sign-in opens at launch."}</p>
                </>
              )}
            </div>
          ) : info.x ? (
            <p className="help" role="tabpanel">
              Your X account is showing right now. Unlink X on the other tab to set a name and moth instead.
            </p>
          ) : (
            <form
              className="desk__form"
              onSubmit={(e) => {
                e.preventDefault();
                sign();
              }}
            >
              <div className="dress">
                <Portrait
                  traits={moth}
                  size={136}
                  className="dress__shot"
                  title={`Your moth: ${PART_NAMES.fur[moth[0]]} wings, ${PART_NAMES.hat[moth[1]]}, ${PART_NAMES.acc[moth[2]]}, ${PART_NAMES.bg[moth[3]]}`}
                />
                <div className="dress__dials">
                  {SLOTS.map(([key, label], i) => (
                    <div className="dress__dial" key={key}>
                      <span className="dress__label">{label}</span>
                      <button type="button" className="dress__turn" onClick={() => turn(i, -1)} aria-label={`Previous ${label.toLowerCase()}`}>
                        <CaretLeft weight="bold" />
                      </button>
                      <span className="dress__value">{PART_NAMES[key][moth[i]]}</span>
                      <button type="button" className="dress__turn" onClick={() => turn(i, 1)} aria-label={`Next ${label.toLowerCase()}`}>
                        <CaretRight weight="bold" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <label htmlFor="byline-name">Name</label>
              <div className="field">
                <input id="byline-name" value={name} maxLength={18} placeholder="Your name" onChange={(e) => setName(e.target.value)} autoComplete="off" spellCheck={false} />
                <button type="submit" className="btn" disabled={busy}>
                  {busy ? "Signing" : "Sign & save"}
                </button>
              </div>
              <p className="help">3 to 18 letters or numbers. Free to sign, moves no funds, once a day.</p>
            </form>
          )}
        </>
      )}
      {note ? (
        <p className={note.ok ? "okline" : "errline"} role={note.ok ? "status" : "alert"}>
          {note.text}
        </p>
      ) : null}
    </div>
  );
}

export function Record({ live }: { live: boolean }) {
  const root = useRef<HTMLElement>(null);
  const [input, setInput] = useState(readQuery);
  const [info, setInfo] = useState<WalletInfo | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [linked, setLinked] = useState(false);
  const [xFlash] = useState(takeXResult);

  const lookup = async (addr: string) => {
    if (!VALID.test(addr)) {
      setError("That isn't a wallet address. It starts with 0x and has 42 characters.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      const w = await fetchWallet(addr);
      setInfo(w);
      const url = new URL(window.location.href);
      url.searchParams.set("w", addr);
      window.history.replaceState(null, "", url);
    } catch (e: any) {
      setError(e?.message === "Not Found" || !live ? "The lamp isn't on yet: nothing to check." : "Couldn't reach the engine. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    const q = readQuery();
    const code = new URLSearchParams(window.location.search).get("xdemo");
    if (DEMO && code && q) {
      const url = new URL(window.location.href);
      url.searchParams.delete("xdemo");
      window.history.replaceState(null, "", url);
      takeXDemo(code)
        .then((x) => demoSaveByline(q, { x }))
        .catch(() => {})
        .finally(() => lookup(q));
    } else if (q) lookup(q);
    const open = (e: Event) => {
      const addr = (e as CustomEvent<string>).detail;
      setInput(addr);
      lookup(addr);
      const el = document.getElementById("card");
      const lenis = (window as unknown as { __lenis?: { scrollTo: (t: HTMLElement, o: { offset: number }) => void } }).__lenis;
      if (el) lenis ? lenis.scrollTo(el, { offset: -64 }) : el.scrollIntoView();
    };
    // The header's Connect button found no wallet: say so here, where the record lives.
    const noWallet = () => {
      setError(NO_WALLET);
      document.getElementById("card")?.scrollIntoView();
    };
    window.addEventListener("rbank:card", open);
    window.addEventListener("rbank:nowallet", noWallet);
    return () => {
      window.removeEventListener("rbank:card", open);
      window.removeEventListener("rbank:nowallet", noWallet);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A fresh record develops like a flash photo: white first, then the moth comes out of it.
  useGSAP(
    () => {
      if (!info || prefersReducedMotion()) return;
      gsap.fromTo(".rec__plate", { filter: "brightness(3) blur(6px)" }, { filter: "brightness(1) blur(0px)", duration: 0.9, ease: "expo.out" });
      gsap.fromTo(".rec__body > *", { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "expo.out", stagger: 0.05, delay: 0.15 });
    },
    { scope: root, dependencies: [info] },
  );

  const submit = (e: FormEvent) => {
    e.preventDefault();
    lookup(input.trim());
  };

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinked(true);
      setTimeout(() => setLinked(false), 1600);
    } catch {}
  };

  const base = info ? (info.house ? { word: "Gecko", tone: "ok" as Tone, line: "The dev wallet. Watches from the post, never on the sheet, never paid." } : STAMP[info.status]) : null;
  // Holders outside the top N get no share yet: say how far there is to go.
  const stamp =
    info && base && info.status === "sitting" && !info.inTop
      ? { ...base, word: "In the grass", tone: "wait" as const, line: `No. ${info.rank}, in the grass. Only the ten nearest the lamp are paid: pass ${info.rank! - info.topN} more.` }
      : info && base && info.status === "sitting"
        ? {
            ...base,
            word: info.rank === 1 ? "On the glass" : info.rank! <= 5 ? "Inner ring" : "Outer ring",
            line: info.rank === 1 ? "You hold the most. The spot on the lamp glass and the biggest share of the next Reward are yours." : `No. ${info.rank} on the sheet. You share the next Reward.`,
          }
        : base;

  return (
    <section className="sec recsec" id="card" ref={root} aria-labelledby="card-head">
      <div className="wrap recsec__grid">
        <div className="recsec__ask">
          <h2 className="h2" id="card-head">
            Find your moth
          </h2>
          <p className="deck">Paste any wallet. You get its record: where it rests, what it has been paid, and what it would get next.</p>
          <form className="lookup" onSubmit={submit} noValidate>
            <label htmlFor="wallet">Wallet address</label>
            <div className="field">
              <input id="wallet" inputMode="text" autoComplete="off" spellCheck={false} placeholder="0x…" value={input} onChange={(e) => setInput(e.target.value)} aria-invalid={!!error} aria-describedby="wallet-help" />
              <button type="submit" className="btn is-line" disabled={busy}>
                <MagnifyingGlass weight="bold" aria-hidden="true" /> {busy ? "Checking" : "Check"}
              </button>
            </div>
            <p id="wallet-help" className={error ? "errline" : "help"} role={error ? "alert" : undefined}>
              {error || (xFlash && !info && !readQuery() ? xFlash.text : "Read only. Connect only to set a name; it signs a message, never a payment.")}
            </p>
          </form>
        </div>

        <div className="recsec__slot" aria-live="polite">
          {info && stamp ? (
            <article className={`rec is-${stamp.tone}`}>
              <header className="rec__top">
                <span className="rec__org">
                  <Mark size={22} /> {NAME} record
                </span>
                {info.rank ? <span className="rec__rank num">No. {info.rank}</span> : null}
              </header>
              <div className="rec__plate" aria-hidden="true">
                <Face addr={info.addr} pp={info.pp} x={info.x} size={168} />
              </div>
              <div className="rec__body">
                {(() => {
                  const who = nameFor(info.addr, info.nickname, info.x);
                  return (
                    <>
                      <p className={`rec__who ${info.status === "hopped" ? "is-struck" : ""}`}>
                        {info.x ? <XLink x={info.x} className="rec__xlead" /> : null}
                        {who.name}
                        {info.x ? <XCheck x={info.x} /> : who.claimed ? <SealCheck className="rec__claimed" weight="fill" aria-label="claimed name" /> : null}
                      </p>
                      <p className="rec__addr num">
                        <a href={addrUrl(info.addr)} target="_blank" rel="noreferrer">
                          {short(info.addr)}
                        </a>
                        {info.x ? <span> · @{info.x.username}</span> : who.claimed ? null : <span> · no name set</span>}
                      </p>
                    </>
                  );
                })()}
                <p className="rec__stamp">{stamp.word}</p>
                <dl className="rec__facts">
                  <div>
                    <dt>Days held</dt>
                    <dd className="num">{info.padDays}</dd>
                  </div>
                  <div>
                    <dt>Balance</dt>
                    <dd className="num">{amount(info.balance)}</dd>
                  </div>
                  <div>
                    <dt>Paid so far</dt>
                    <dd className="num is-eth">{eth(info.received)}</dd>
                  </div>
                  <div>
                    <dt>{info.status === "sitting" && info.inTop ? "Next Reward, est." : info.status === "hopped" ? "Flew off" : "Rank"}</dt>
                    <dd className="num">
                      {info.status === "sitting" && info.inTop ? (
                        <span className="is-eth">{eth(info.estNext)}</span>
                      ) : info.status === "hopped" ? (
                        info.hoppedTx ? (
                          <a href={txUrl(info.hoppedTx)} target="_blank" rel="noreferrer">
                            {dateWib(info.hoppedAt)}
                          </a>
                        ) : (
                          dateWib(info.hoppedAt)
                        )
                      ) : info.rank ? (
                        `#${info.rank}`
                      ) : (
                        "-"
                      )}
                    </dd>
                  </div>
                </dl>
                <p className="rec__line">{stamp.line}</p>
                <button type="button" className="rec__share" onClick={share}>
                  {linked ? <Check weight="bold" aria-hidden="true" /> : <LinkSimple weight="bold" aria-hidden="true" />}
                  {linked ? "Link copied" : "Copy link"}
                </button>
              </div>
            </article>
          ) : (
            <div className="rec is-blank" aria-hidden="true">
              <div className="rec__plate is-empty" />
              <p className="rec__blank">Your record develops here.</p>
            </div>
          )}
          {info && info.status !== "not-holding" && (info.status !== "excluded" || info.house) ? (
            <Markings key={info.addr} info={info} flash={xFlash} onSaved={(patch) => setInfo(DEMO ? demoWallet(info.addr) : { ...info, ...patch })} />
          ) : info && info.status === "not-holding" ? (
            // Say why the desk is shut instead of leaving a connected holder guessing.
            <p className="help">
              {live
                ? `Names, moths and X links are for wallets holding ${TICKER}. Buy in, then come back.`
                : `Opens at launch: once ${TICKER} trades, any holder can set a name, mark their moth or link X here.`}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
