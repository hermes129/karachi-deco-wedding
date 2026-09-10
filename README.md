# Karachi Deco — Noor & Zayn

A wedding invitation built on 1930s Karachi Art Deco: the Saddar and
Bunder Road facades, brass gates, terrazzo lobbies, curved corners.

**Noor & Zayn / 17 October 2026 / The Courtyard, Beach Luxury Hotel, Karachi.**

## What makes this one different

It is the only sans-led site in the set. The other five are serif worlds;
this one is Jost — the Futura lineage, which is the geometric the era
actually drew with — against DM Mono for every label and time.

Its signature move is **bilateral convergence**. Deco is symmetry before it
is anything else: every facade, grille and fan here folds down its own
centre line, so the page assembles the same way. Paired blocks enter from
opposite edges and meet on the axis rather than rising from below. The
tweens carry transform only — if a ScrollTrigger never updates, content is
merely un-offset, never invisible.

## Palette

| Token | Value | Use |
|---|---|---|
| `--black` | `#0b0c0b` | ground |
| `--champagne` | `#c8a35a` | rules, numerals, every accent |
| `--emerald` | `#0d4f3c` | the venue panel |
| `--bone` | `#e9e2d2` | body text |

## Running it

```bash
npm install
npm run dev
npm run build   # vite build --base=./
```

The build base is `./`, not `/`, because this deploys to a project page.

## Art

Four photographs, all generated, none containing a face:

| File | Frame |
|---|---|
| `deco-doors.webp` | the gate, composed symmetric about its centre seam |
| `deco-facade.webp` | the curved corner facade, hero |
| `deco-terrazzo.webp` | a lobby floor, story |
| `deco-attire.webp` | dinner jacket and emerald silk, attire |

Masters live in `art-masters/` at the repo root so they never ship in
`dist/`. Shipped art is webp at quality 82.

## The gate

Two panels that part on the seam the doors were painted around. Both panels
paint the full-width image and clip it, so `overflow: hidden` on
`.opener__panel` is load-bearing — without it the halves swap instead of
opening. Anything not inside a panel (the seam, `.opener`'s own background)
does not travel with the panels and is faded explicitly in the timeline.
