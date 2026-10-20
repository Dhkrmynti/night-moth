# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Memecoin holders and traders on Robinhood Chain (chain 4663) who buy through the Pons launchpad. They open the site on phones (often inside a wallet's in-app browser) and on desktop in roughly equal measure. Their jobs: see who is in the paid top ten right now, check their own wallet's standing, see how close the next reward is, and verify every payout on the explorer.

## Product Purpose

Night Moth ($MOTH) is a memecoin site plus an on-chain engine. Creator fees from Pons are claimed automatically and run a two-step loop: a Reward (0.02 ETH) sent straight to the ten biggest wallets that never sold, split by tier (No. 1-5 share 70%, No. 6-10 share 30%, by balance within each tier), then a Treasury step (0.025 ETH) to the treasury wallet, then again. Success: holders understand within seconds that holding (never selling) is what gets paid, and can verify it.

## Positioning

Paid in ETH for never selling. One sale removes a wallet forever (wallet-to-wallet moves are not sales). No buyback, no burn: the engine never buys, sells or destroys the token. Every round is logged with its transaction.

## Operating Context

- Live data from the engine API: `/api/status`, `/api/pond`, `/api/wallet/:addr`, `/api/rounds`, a live event stream, byline (name + avatar) claims by signed message, optional X account linking.
- Demo edition (`?demo`, or the dev server) shows labelled illustration data; `?live` shows the real state.
- `/lotnok` is the operator's engine room.
- Wallet connection only ever requests an account and a plain `personal_sign`; never a transaction.

## Capabilities and Constraints

- Backend, engine, tokenomics, API and features must not change. Only the UI and lore change.
- Avatar traits are four slots with fixed counts 5, 5, 6, 6 (validated by the engine as `MUGSHOT_PARTS`). Any new character must keep exactly these counts.
- Eligibility: never sold, at least 100,000 tokens, plus the hold time the server sets.
- Ranks 11-50 are shown as the chasing pack with the gap to the top ten.

## Brand Commitments

- Name: **Night Moth**. Ticker: **$MOTH**. Chain: Robinhood Chain. Launchpad: Pons.
- Lore: moths at a light sheet at night. The ten closest to the lamp are the top ten; selling means flying off into the dark, for good. The dev wallet watches but is never ranked or paid.
- Voice: a moth-hunter's night log. Dry, deadpan, short. Never yield, APY, passive income or promises of value. Money keeps its plain names: Reward, Treasury.
- Original characters only, not copies of any NFT collection or film.

## Evidence on Hand

- No token, domain, X account or server exists yet. No real holders, volumes or testimonials: never fabricate them. Demo numbers must stay labelled as demo.

## Product Principles

1. Holding is the whole game: every screen should make "never sell" legible.
2. Prove, don't promise: every payout links to its transaction.
3. Live first: rank changes and sales show up within seconds.
4. Plain money words, playful world words.

## Accessibility & Inclusion

All motion off under `prefers-reduced-motion`. Readable on small phones inside wallet browsers.
