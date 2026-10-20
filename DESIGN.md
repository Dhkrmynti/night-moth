---
name: Night Moth
description: "$MOTH on Robinhood Chain as a lit sheet in a dark field: moths drawn flat on cotton, rank is distance from the lamp, violet only for the light, pollen only for ETH."
colors:
  night: "#06080c"
  night-2: "#090c13"
  field: "#0b130f"
  line: "#1e2330"
  line-2: "#2c3242"
  moon: "#e9ebf2"
  dim: "#9ba2b3"
  sheet: "#e8eaf2"
  sheet-2: "#d9dce7"
  sheet-ink: "#15171d"
  sheet-mute: "#4b5060"
  lamp: "#8b5cff"
  lamp-deep: "#7444f5"
  lamp-hover: "#8257ff"
  lamp-hi: "#a68bff"
  lamp-white: "#f4f1ff"
  pollen: "#f3c74a"
  pollen-ink: "#7a4f00"
  ember: "#ff6a4d"
  ember-ink: "#b8321a"
typography:
  display:
    fontFamily: "Bricolage Grotesque Variable, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(50px, 6.4vw, 96px)"
    fontWeight: 780
    lineHeight: 0.94
    letterSpacing: "-0.032em"
    fontVariation: "'wdth' 80"
  rule:
    fontFamily: "Bricolage Grotesque Variable, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(40px, 7.2vw, 96px)"
    fontWeight: 790
    lineHeight: 0.92
    letterSpacing: "-0.034em"
    fontVariation: "'wdth' 76"
  headline:
    fontFamily: "Bricolage Grotesque Variable, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(36px, 4.8vw, 68px)"
    fontWeight: 760
    lineHeight: 1
    letterSpacing: "-0.028em"
    fontVariation: "'wdth' 84"
  title:
    fontFamily: "Bricolage Grotesque Variable, Segoe UI, system-ui, sans-serif"
    fontSize: "26px"
    fontWeight: 720
    lineHeight: 1.1
    fontVariation: "'wdth' 86"
  body:
    fontFamily: "Bricolage Grotesque Variable, Segoe UI, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Fragment Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.4
  number:
    fontFamily: "Fragment Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontWeight: 400
    letterSpacing: "-0.01em"
    fontFeature: "'tnum' 1"
rounded:
  cloth: "2px"
  pill: "999px"
  round: "50%"
spacing:
  gap-sm: "8px"
  gap-md: "12px"
  gap-lg: "24px"
  header: "64px"
  gutter: "clamp(16px, 4.4vw, 64px)"
  section: "clamp(88px, 11vw, 168px)"
components:
  button-primary:
    backgroundColor: "{colors.lamp-deep}"
    textColor: "#ffffff"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "0 22px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.lamp-hover}"
  button-line:
    backgroundColor: "transparent"
    textColor: "{colors.moon}"
    rounded: "{rounded.pill}"
    padding: "0 22px"
    height: "48px"
  button-small:
    rounded: "{rounded.pill}"
    padding: "0 18px"
    height: "40px"
  button-waiting:
    backgroundColor: "#161a25"
    textColor: "{colors.dim}"
    rounded: "{rounded.pill}"
  connect:
    backgroundColor: "transparent"
    textColor: "{colors.moon}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "40px"
  input-field:
    backgroundColor: "#0d1119"
    textColor: "{colors.moon}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "48px"
  desk-tab-selected:
    backgroundColor: "{colors.moon}"
    textColor: "{colors.night}"
    rounded: "{rounded.pill}"
  sheet:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.sheet-ink}"
    rounded: "{rounded.cloth}"
  record-card:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.sheet-ink}"
    rounded: "{rounded.cloth}"
    padding: "22px"
  header:
    backgroundColor: "{colors.night}"
    textColor: "{colors.moon}"
    height: "64px"
---

# Design System: Night Moth

## Overview

**Creative North Star: "The Light Sheet"**

A moth hunter strings a cotton sheet between two posts in a dark field and hangs a mercury lamp over it. Everything on this site happens on or around that sheet. The night is the ground; the lit sheet is the reading surface; rank is literally distance from the lamp. The ten moths resting nearest the light are the paid top ten, and a moth that flies off into the dark does not come back. The interface is the hunter's night log of that sheet: dry, deadpan, exact, and illuminated by a single source.

Density is calm on the night and dense on the cloth. Night sections carry one large condensed line, a short dim deck and a few measured facts. The sheet carries the work: specimens, hairline leader-line callouts in mono, ring rows of ranks and balances. Light comes from one place, the lamp, and its violet tints nothing that is not the lamp, its light, or the one action that matters (buying). Money keeps its own colour: pollen yellow, only on ETH amounts.

The world refuses the memecoin template: no mascot-left-headline-right hero, no stat-card grid, no generic table. Moths are flat, drawn specimens viewed from above, never rendered 3D mascots, and every one faces the lamp.

**Key Characteristics:**
- Night ground (#06080c) with a lit cotton sheet (#e8eaf2, woven texture) as the reading surface.
- One light source: lamp violet appears only on the lamp, its glow, and the primary action.
- Pollen yellow is ETH and nothing else; ember is "flew off" and nothing else.
- Condensed Bricolage Grotesque for what is said; Fragment Mono for every number, label and callout.
- Pill controls, cloth surfaces with 2px corners.
- Flat SVG moth specimens, heads toward the lamp, with hairline leader-line callouts.
- Motion is the lamp, the moths and the camera: lamp-on, flutter-in, crawl, fly-off, walk-up, flash. All of it off under reduced motion.

## Colors

A near-black night with a cool mercury-white sheet, lit by one saturated violet, with two narrow signal colours for money and loss.

### Primary
- **Mercury Lamp Violet** (`lamp`): the lamp itself, its glow on the sheet and the field, the arc over No. 1, text selection, and nothing else. Never a fill for decoration, never a section tint.
- **Deep Lamp Violet** (`lamp-deep`): the primary button background (Buy $MOTH). One step deeper than the light so white button text passes AA. Hover lifts to **Lamp Hover** (`lamp-hover`).
- **Lamp Halo** (`lamp-hi`): focus rings, input focus borders, the caret, and the lit ticks on the lamp-charge scale.
- **Bulb White** (`lamp-white`): the bulb face and the hottest point of the glow.

### Secondary
- **Pollen** (`pollen`): ETH amounts on the night ground (log totals, feeding log lines, the Reward step and its orbit segment).
- **Pollen Ink** (`pollen-ink`): ETH amounts on the sheet and on the record card, where Pollen would fail contrast.

### Tertiary
- **Ember** (`ember`): a wallet that flew off, on the night ground (the "sell once" rule line).
- **Ember Ink** (`ember-ink`): the same meaning on the sheet: a struck name, the "Flew off" stamp, a flown wallet in the tally margin.

### Neutral
- **Night** (`night`): the page ground, header, hero, lamp section and log.
- **Deeper Night** (`night-2`): the bottom of the rules gradient.
- **Grass** (`field`): the ground under the hero where the field meets the sheet's foot.
- **Hairline** (`line`) and **Hairline Strong** (`line-2`): dividers, the night-log spine, orbit track, outline-button and input strokes.
- **Moonlight** (`moon`): primary text on night.
- **Dusk Grey** (`dim`): decks, secondary text, mono labels on night.
- **Mercury Sheet** (`sheet`) and **Sheet Shade** (`sheet-2`): the sheet, the tally ground, the record card.
- **Sheet Ink** (`sheet-ink`): text and moth outlines on the sheet.
- **Sheet Mute** (`sheet-mute`): secondary text and callout ranks on the sheet.

### Named Rules
**The One Light Rule.** Violet is the lamp. If an element is not the lamp, its light, or the primary action, it is not violet. Glow exists only as the lamp's radial light; nothing else glows.

**The Pollen Is Money Rule.** Pollen yellow marks an ETH amount and nothing else. On the sheet it becomes Pollen Ink; on the night it stays Pollen.

**The Flew Off Rule.** Ember means a wallet sold and flew off, for good. It is never a generic warning colour.

## Typography

**Display Font:** Bricolage Grotesque Variable (with Segoe UI, system-ui)
**Body Font:** Bricolage Grotesque Variable (with Segoe UI, system-ui)
**Label/Mono Font:** Fragment Mono (with ui-monospace, SFMono-Regular, Menlo)

**Character:** One grotesque for everything said, squeezed through its width axis (`font-stretch` 76-86%) into tall, heavy, deadpan lines; a plain mono for everything measured. The voice is the log entry; the mono is the specimen tag.

### Hierarchy
- **Display** (780, clamp(50px, 6.4vw, 96px), 0.94, width 80%): the hero line only ("Stay in the light.").
- **Rule** (790, clamp(40px, 7.2vw, 96px), 0.92, width 76%): the rules section's big statements; the close line uses the same register at 800, clamp(56px, 9vw, 96px).
- **Headline** (760, clamp(36px, 4.8vw, 68px), 1, width 84%): section heads; balanced wrap. No. 1's name on the tally (clamp(30px, 3.6vw, 48px)) and the record name (28px) are the same cut, smaller.
- **Title** (720, 24-26px, 1.1-1.15, width 86%): ring heads, step names, desk heads.
- **Body** (400, 17px, 1.55): running text; decks at 18px in Dusk Grey, max 56ch.
- **Label** (Fragment Mono 400, 11-13px): callout ranks and balances, charge scale, timestamps, transaction links, the contract address, stamps. Sentence case, no tracking.
- **Number** (Fragment Mono, tabular figures, -0.01em): every rank, balance and ETH figure, at whatever size the context needs.

### Named Rules
**The Said And Measured Rule.** Words are Bricolage; numbers, addresses, labels and callouts are Fragment Mono with tabular figures. A number is never set in the grotesque.

**The Condensed Voice Rule.** Large Bricolage is always condensed through the width axis (76-86%) with tight negative tracking; body text stays at normal width.

## Layout

A centred 1240px column (`min(1240px, 100% - 2 × gutter)`) with a fluid gutter (16-64px) and tall section padding (88-168px). The header is a fixed 64px night bar with a 2px lamp-charge hairline along its foot. The hero is a full-viewport two-column grid (copy 5fr, scene 7fr): copy left, the cord, posts, lamp and sheet right, with the sheet filling the scene below the cord and No. 1 just under the lamp, 2-5 in an inner ring, 6-10 in an outer ring. On scroll the hero pins and the sheet scales until it is the whole screen and becomes the tally's ground, which ends in a sewn hem over the night.

Below 1080px the nav hides. Below 900px every two-column grid collapses to one column, the hero stacks copy over scene, and the walk-up pin is off. Below 640px callouts keep their leader line, rank and short name only (balances move to the tally), button labels switch to short forms, the record card stacks, and the night-log spine moves to the left edge.

## Elevation & Depth

Depth is physical, not interface chrome: a cloth hanging in the dark and lit from above. Surfaces cast one long soft drop shadow into the night; the sheet itself is shaded by its light (a white hot spot under the lamp, a violet cone, darkening toward the edges) and by soft vertical crease bands. Moths cast small drop shadows onto the cloth and get dimmer the farther they rest from the lamp. Controls are flat; outlines are inset hairlines, not shadows.

### Shadow Vocabulary
- **Hanging sheet** (`box-shadow: 0 40px 90px rgba(0, 0, 0, 0.55)`): the hero sheet.
- **Record card** (`box-shadow: 0 30px 80px rgba(0, 0, 0, 0.45)`): a wallet's record on the night.
- **Inner-ring moth** (`filter: drop-shadow(0 7px 6px rgba(21, 23, 29, 0.28)) brightness(0.94)`): moths near the lamp.
- **Outer-ring moth** (`filter: drop-shadow(0 6px 5px rgba(21, 23, 29, 0.24)) brightness(0.82) saturate(0.85)`): moths farther out.
- **Hairline outline** (`box-shadow: inset 0 0 0 1.5px var(--line-2)`): outline buttons and pills; turns Moonlight on hover.

### Named Rules
**The Distance Is Light Rule.** Nearness to the lamp is shown with light: brighter, larger and more saturated near the lamp, dimmer and smaller farther out. Never with badges or medals.

## Shapes

Two shape families. Controls a hand touches are pills (999px): buttons, the connect pill, inputs, desk tabs, the contract-address pill. Surfaces are cloth and keep 2px corners: the sheet, the record card, the dressing desk, portrait plates. Round (50%) is reserved for things that are round in the world: the glow, bulb, log dots, avatars. Moths are drawn as flat SVG specimens from above with wings open, outlined in Sheet Ink at 1.6px with round joins, every head rotated toward the lamp. Callouts are hairline leader lines (1px, Sheet Ink at 70%) ending in mono text. The tally ends in a sewn hem; empty places are dashed ellipses.

## Components

### Buttons
Plain, confident pills.
- **Shape:** pill (999px), 48px tall, 22px side padding; small variant 40px with 18px padding.
- **Primary:** Deep Lamp Violet with white text, Bricolage 620 at 16px. Only the primary action (Buy $MOTH) uses it.
- **Hover / Focus:** background to Lamp Hover over 0.2s; press scales to 0.98; focus is a 2px Lamp Halo outline at 3px offset.
- **Line:** transparent with a 1.5px inset Hairline Strong ring and Moonlight text; the ring goes Moonlight on hover.
- **Waiting:** dark fill (#161a25) with Dusk Grey text, no hover.
- **Quiet:** an underlined Dusk Grey text link with no fill.

### Inputs / Fields
- **Style:** pill, 48px, 1.5px Hairline Strong border on a near-night fill (#0d1119), Moonlight text in Fragment Mono 15px.
- **Focus:** border turns Lamp Halo; no glow.
- **Error:** a short message line under the field, announced as an alert.

### Navigation
- **Style:** fixed 64px night header: wordmark (Bricolage 760, condensed, 20px) and ticker left, centred text links in Dusk Grey at 15px, connect pill and buy button right.
- **States:** hover and current turn Moonlight; the current link is underlined in Dusk Grey at 8px offset.
- **Mobile:** links hide below 1080px; the ticker and the waiting button hide below 640px.

### The Sheet (signature)
The cotton sheet hung from the cord under the lamp: Mercury Sheet with a 6px weave texture, crease bands, three brass pins along the top, the lamp's light drawn over it. Ten moth specimens sit on it by rank, each with a leader-line callout (mono rank, name, balance). Hovering or focusing a moth scales it 1.08. A seller's moth flies off on a wobbling path into the dark and leaves a dashed ghost.

### Record Card
A wallet's record on cloth: 2px corners, Mercury Sheet with weave, 22px padding, a 168px portrait plate beside the name (condensed 760, 28px), a mono stamp coloured by state, and a facts list with ETH in Pollen Ink. A new record develops like a flash photo: the plate comes out of white and blur.

### Night Log
A vertical spine (1px Hairline Strong) with a dot per round; Reward rounds get a Pollen dot and Pollen amount; each line ends in a mono transaction link.

### Motion
Lamp-on on load (glow blooms, bulb flickers on a stepped ease), moths flutter in from the dark and settle, wings twitch on a 9s cycle, moths crawl to new ranks (FLIP, 1.8s), a seller flies off (1.8s). Scroll: the pinned walk-up scales the sheet into the tally ground, an orbit flyer is scrubbed round the lamp section's loop, rules come out of blur, a camera-flash inversion (a white difference layer, 0.45s) fires as the record comes up, the night-log spine draws on scroll. Ease family is expo.out for arrivals and power2 for travel. Everything is off under `prefers-reduced-motion`.

## Do's and Don'ts

### Do:
- **Do** keep night as the ground and the lit sheet as the reading surface; dense information goes on the cloth.
- **Do** keep violet to the lamp, its light and the one primary action; put the button on `lamp-deep` (#7444f5) with white text for AA.
- **Do** colour every ETH amount Pollen on night and Pollen Ink on the sheet.
- **Do** set every number, address, label and callout in Fragment Mono with tabular figures.
- **Do** draw moths as flat SVG specimens from above with every head facing the lamp.
- **Do** use pills for controls and 2px corners for surfaces.
- **Do** place anything GSAP moves with left/top/margins and let GSAP own the transform.
- **Do** turn all motion off under `prefers-reduced-motion`.

### Don't:
- **Don't** use violet for decoration, section tints, borders or secondary buttons.
- **Don't** use Pollen for anything that is not ETH, or Ember for anything that is not a wallet that flew off.
- **Don't** set numbers in Bricolage or words-as-voice in the mono.
- **Don't** add glows other than the lamp's own light.
- **Don't** use rounded cards (beyond 2px) or square controls.
- **Don't** use the CSS `translate` property on elements GSAP moves.
- **Don't** fall back to the memecoin template: mascot left and headline right, stat-card grids, a plain leaderboard table.
- **Don't** add kickers or eyebrow labels above headings.
