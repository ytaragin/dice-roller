# Architecture

This document describes how the Dice Simulator app is structured: its screens,
files, components, state model, and data flow. For build/tooling and PWA setup,
see [`README.md`](./README.md).

## Overview

A mobile-first dice roller PWA. The user configures a set of dice (how many, how
many sides each, and whether to color-code them), then rolls them on the main
screen. Individual dice can be **locked** (kept on reroll) or marked **used**
(a purely visual flag).

## Tech stack

- **Svelte 5** (runes: `$state`, `$derived`, `$props`) — UI + reactivity
- **Vite** — build/dev server
- **vite-plugin-pwa** — offline + installable
- **JavaScript** with JSDoc type-checking (`checkJs` in `jsconfig.json`)

No router or state-management library — both are handled with built-in Svelte
primitives to keep the bundle small and fully offline-capable.

## Screens & navigation

Two screens, switched by a single `currentScreen` value (`'roll' | 'config'`)
held in `App.svelte`. No router library.

```
┌─────────────────┐        ┌─────────────────┐
│   Roll Screen   │ ─gear→ │  Config Screen  │
│   (main view)   │ ←back─ │   (settings)    │
└─────────────────┘        └─────────────────┘
```

## File / folder structure

```
src/
├── main.js                    # (exists) mounts App
├── App.svelte                 # (exists) root: global styles + screen routing + nav
│
├── lib/                       # pure, framework-free logic (easy to test)
│   ├── rng.js                 #   rollDie(sides) → random face value
│   ├── colors.js              #   color palette + colorForIndex(i)
│   └── storage.js             #   localStorage load/save wrappers
│
├── state/                     # reactive stores (Svelte 5 runes in .svelte.js)
│   ├── config.svelte.js       #   per-die definitions + colorCoded (+ persistence)
│   └── dice.svelte.js         #   dice array + roll / reroll / lock / used
│
├── screens/
│   ├── RollScreen.svelte      # main: roll button + dice tray
│   └── ConfigScreen.svelte    # settings form (per-die editor)
│
└── components/
    ├── NavBar.svelte          # header + screen switch button
    ├── DiceTray.svelte        # responsive grid layout of dice
    ├── Die.svelte             # ONE die: value + lock button + used button
    └── DieConfigRow.svelte    # one editable row in ConfigScreen
```

## Component responsibilities

Logic lives in the **stores**, not the components. Components stay "dumb": they
read store state and call store methods via callback props (the Svelte 5 idiom —
no `createEventDispatcher`).

| Component | Owns | Renders |
|---|---|---|
| `App.svelte` | `currentScreen` state, global CSS | NavBar + active screen |
| `NavBar.svelte` | nothing (callback props) | title + gear/back button |
| `RollScreen.svelte` | nothing (reads stores) | Roll/Reroll button → `DiceTray` |
| `DiceTray.svelte` | nothing | grid of `Die`, one per die in store |
| `Die.svelte` | nothing (one `die` prop + callbacks) | face value, lock toggle, used toggle, color |
| `ConfigScreen.svelte` | nothing (reads config store) | color toggle, list of `DieConfigRow`, "add die" |
| `DieConfigRow.svelte` | nothing (one die-def prop + callbacks) | sides selector + remove button |

## State & data model

### Config store — `state/config.svelte.js`

Holds an **array of per-die definitions** (each die has its own side count) plus
the color-code flag. Persisted to `localStorage`.

```js
// one die definition:
{ id, sides }                      // e.g. { id: 'd1', sides: 20 }

class Config {
  dice       = $state([            // per-die definitions
    { id, sides: 6 },
    { id, sides: 6 },
  ])
  colorCoded = $state(true)        // distinct color per die?

  get diceCount() { return this.dice.length }   // derived
  addDie(sides = 6) { ... }        // append a die
  removeDie(id)     { ... }        // drop a die
  setSides(id, n)   { ... }        // change one die's faces
}
export const config = new Config()   // singleton
```

### Dice store — `state/dice.svelte.js`

The runtime dice that appear on the roll screen.

```js
// one runtime die:
{ id, sides, value, locked, used }

class DiceState {
  dice = $state([])

  rebuild()        // rebuild array from config (see "Config-change behavior")
  reroll()         // unlocked dice get new values; locked keep their value
  toggleLock(id)   // flip locked
  toggleUsed(id)   // flip used (visual only)
}
export const diceState = new DiceState()
```

The `id` on a runtime die is used only for keyed `{#each}` rendering and for
`toggleLock(id)` / `toggleUsed(id)` within a session.

## Data flow (key actions)

- **Roll / Reroll** → `RollScreen` calls `diceState.reroll()` → for each die, if
  `locked` keep `value`, else `value = rollDie(die.sides)` → tray re-renders.
- **Lock** → `Die` calls `onToggleLock(id)` → `diceState.toggleLock(id)` → die
  shows locked style and survives the next reroll *within the session*.
- **Used** → `Die` calls `onToggleUsed(id)` → `diceState.toggleUsed(id)` →
  die is dimmed/marked (purely visual).
- **Config change** → user edits `config` → config persists → `diceState.rebuild()`.

## Config-change behavior

A **lock does not survive a configuration change.** Whenever the config changes
(add/remove a die, or change a die's sides), `diceState.rebuild()` recreates the
dice array from scratch:

```js
rebuild() {
  this.dice = config.dice.map(d => ({
    id: d.id,
    sides: d.sides,
    value: rollDie(d.sides),   // fresh roll
    locked: false,             // locks reset on config change
    used: false,               // used flags reset on config change
  }))
}
```

So locks/used live **only within a rolling session**. Editing the config gives a
clean slate of freshly rolled dice. This deliberately avoids any per-die state
reconciliation.

## Design decisions

1. **Per-die sides.** Each die carries its own `sides` value, so a set can mix
   dice (e.g. 3× d6 + 1× d20). The config screen edits a list of dice rather
   than a single global "sides" number.
2. **Locks/used are session-only.** They reset on any config change (see above),
   which keeps the state model simple — no reconciliation by id across edits.
3. **Color-coding** is a single boolean. When on, each die gets a distinct color
   by position via `colors.colorForIndex(i)`; when off, all dice share a neutral
   color.
4. **Persistence:** the config is saved to `localStorage` so the user's dice
   setup survives reloads. The current roll/session state is not persisted.
