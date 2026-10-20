# Night Moth ($MOTH) · lore (20 Oct 2026)

A new lore on the same engine as Hang On ($HANG), Capy Onsen ($ONSEN) and Take a Seat ($SEAT). Mechanics and tokenomics are unchanged; the name, ticker, characters, UI and words are new.

## Lore

A white sheet strung up in a dark field under a mercury lamp, the way moth hunters do it. Moths come to the light and rest on the sheet. Holding is resting: you stay in the light.

The ten biggest holders rest nearest the lamp. **No. 1 is on the glass**, closest of all. Overtake someone and you crawl past them toward the light. **Sell once and you fly off**: into the dark, for good. The dev wallet is **the gecko** on the post: it watches, never lands on the sheet, never paid.

- Tagline: **"Stay in the light."** Closing line: **"Don't fly off."**
- Voice: a moth hunter's night log that happens to be about a memecoin. Deadpan, short, a little dry. Never yield, APY, passive income or promises of value.
- Original characters: not copies of any NFT collection or film.

| Word on the site | What it is in the engine |
|---|---|
| **the sheet** | the leaderboard |
| **on the glass** | No. 1 |
| **inner ring / outer ring** | the two reward tiers (No. 1-5 share 0.014 ETH, No. 6-10 share 0.006 ETH of every 0.02 ETH reward) |
| **in the grass** | ranks 11-50 |
| **warming up** | holding, but the first buy is not old enough yet |
| **flew off** | sold: out forever |
| **the gecko** | the dev wallet |
| **your moth / the record** | the wallet check |
| **markings** | setting a name, a moth, or an X account (a signed message, no transaction) |
| **the lamp / the orbit** | the cycle: Reward, then Treasury, then again |
| **charging** | the fee escrow filling toward the next step |
| **the night log** | the log of every round, with its transaction |

Money always keeps its plain name: Reward, Treasury.

## The moth

One specimen drawn flat in SVG from above (`src/sheet/Moth.tsx`), reused on the sheet, in flight, on the record and as the mark. Four traits, same counts as the engine validates (5, 5, 6, 6):

- Wings: Dusk, Luna, Rosy, Ash, Tiger
- Antennae: Thread, Feathered, Pollen-dusted, Dew-tipped, Curled
- Markings: Plain, Eye-spots, Bands, Eye-spots + bands, Moon windows, Moon windows + bands
- Behind: The sheet, Lamp glow, Dusk, Rain, Night, Moonlit

## Mechanics (unchanged)

1. Every 3 seconds the engine reads the Pons fee escrow. When it reaches the next step's size it claims it.
2. **Reward** (0.02 ETH) → ETH straight to the top 10 by balance, by tier and by balance inside each tier.
3. **Treasury** (0.025 ETH) → the treasury wallet.
4. Again from 2. Over a full loop that is 44% to the ten and 56% to the treasury, shown openly on the page.

No buyback and no burn: the engine never buys, sells or destroys $MOTH.

To be on the sheet: never sold, at least 100,000 $MOTH, and the hold time the server sets.

## Where things are

Name and ticker: `src/lib/brand.ts` (plus the engine logs in `bot/`, the signed text in `bot/byline.ts`, `index.html`, `public/favicon.svg`). The page: `src/sheet/`. Styles: `src/styles/night.css`.
