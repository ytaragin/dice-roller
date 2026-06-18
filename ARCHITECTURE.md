# Architecture

This document describes how the Dice Simulator app is structured: its screens,
files, components, state model, and data flow. For build/tooling and PWA setup,
see [`README.md`](./README.md).

## Overview

A mobile-first dice roller PWA. The user configures a set of dice (how many, how
many sides each, and whether to color-code them), then rolls them on the main
screen. Individual dice can be **locked** (kept on reroll) or marked **used**
(a purely visual flag). Dice configurations can be saved as named **presets**
("games") and switched back in quickly; editing dice drops to a one-off
"Custom" configuration.

## Tech stack

- **Svelte 5** (runes: `$state`, `$derived`, `$props`) — UI + reactivity
- **Vite** — build/dev server
- **vite-plugin-pwa** — offline + installable
- **JavaScript** with JSDoc type-checking (`checkJs` in `jsconfig.json`)

No router or state-management library — both are handled with built-in Svelte
primitives to keep the bundle small and fully offline-capable.

## Screens & navigation

Three screens, switched by a single `screen` value
(`'roll' | 'config' | 'stats'`) held in `App.svelte`. No router library. The
roll screen shows two header buttons (**Stats** and **Config**); the other two
screens show a single **Back** button that returns to roll.

```
            ┌─────────────────┐
   ┌─Stats─→│  Stats Screen   │─back─┐
   │        └─────────────────┘      │
┌──┴──────────────┐        ┌─────────▼───────┐
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
│   ├── presets.svelte.js      #   named dice presets + active selection (+ persistence)
│   ├── stats.svelte.js        #   per-size roll counts + distribution (+ persistence)
│   └── dice.svelte.js         #   dice array + roll / reroll / lock / used
│
├── screens/
│   ├── RollScreen.svelte      # main: roll button + dice tray
│   ├── ConfigScreen.svelte    # settings form (per-die editor)
│   └── StatsScreen.svelte     # per-size roll distribution + reset button
│
└── components/
    ├── NavBar.svelte          # header + screen switch button
    ├── PresetBar.svelte       # preset selector + save/delete at top of ConfigScreen
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
| `NavBar.svelte` | nothing (callback props) | title + one or more header buttons (`actions[]`) |
| `RollScreen.svelte` | nothing (reads stores) | Roll/Reroll button → `DiceTray` |
| `DiceTray.svelte` | nothing | grid of `Die`, one per die in store |
| `Die.svelte` | nothing (one `die` prop + callbacks) | face value, lock toggle, used toggle, color |
| `ConfigScreen.svelte` | nothing (reads config + presets stores) | `PresetBar`, list of `DieConfigRow`, "add die" |
| `StatsScreen.svelte` | nothing (reads stats store) | per-size totals/average + per-face bar chart, reset button |
| `PresetBar.svelte` | local save-name input state | preset dropdown, save-as / delete controls |
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
  replaceDice(dice) { ... }        // swap the whole set (used when loading a preset)
}
export const config = new Config()   // singleton
```

### Presets store — `state/presets.svelte.js`

Named dice configurations ("games") the user can save and reload. Persisted to
`localStorage` under its own key (`dice-presets`), separate from the live config.

The list shown to the user combines two sources:

- **Built-in presets** shipped with the app, defined in
  [`lib/builtinPresets.js`](./src/lib/builtinPresets.js). To add one, append an
  object `{ key, name, dice: [{ sides, color }] }` to that array; `key` must be
  a stable, never-reused string id. Built-ins are reconstructed from source on
  every load (not stored as user data), so edits/additions propagate to all
  users. Built-ins are **not deletable**.
- **User presets** the user saves at runtime (full data persisted).

User presets are listed first, then the built-ins.

```js
// one preset (runtime, combined list):
{ id, name, dice: [{ sides, color }, ...], builtin? }

class Presets {
  userPresets    = $state([])      // saved presets (persisted)
  activeId       = $state(null)    // selected preset id, or null = "Custom"
  customDice     = $state([])      // last one-off Custom dice (persisted)

  get presets()           // userPresets first, then built-ins
  get active() { ... }    // the selected preset object, or null
  select(id)        // remember current dice if Custom, then load preset's dice + mark active
  selectCustom()    // restore last remembered Custom dice (if any), mark Custom
  markCustom()      // drop active selection because dice were edited
  saveCurrentAs(name) // snapshot config.dice into a new user preset
  remove(id)        // delete a user preset (built-ins are ignored)
}
export const presets = new Presets()   // singleton
```

`activeId === null` means the live config is a one-off **Custom** setup not tied
to any saved preset. When the user switches away from Custom to a preset,
`select()` first snapshots the live dice into `customDice`; switching back via
`selectCustom()` restores that snapshot, so an in-progress Custom setup survives
a round-trip through presets. `customDice` is empty until the user has been in
Custom mode at least once (then `selectCustom()` just keeps the current dice).
User preset `id`s are persisted and stable across reloads; built-in ids derive
from their stable `key`. The active selection is restored on load only if it
still resolves to an existing preset. The persisted blob is
`{ version: 2, activeId, customDice, userPresets }`.


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

### Stats store — `state/stats.svelte.js`

Per-dice-size roll statistics. For each size we keep an array of per-face counts
(index `value - 1`); totals, averages, and the distribution chart are all
derived from it. Only explicit Roll/Reroll presses are recorded —
`diceState.reroll()` calls `stats.record(sides, value)` for each unlocked die it
rolls. Config rebuilds (`diceState.rebuild()`) deliberately do **not** count, so
editing dice or loading a preset never inflates the numbers. Persisted to
`localStorage` under its own key (`dice-stats`).

```js
class Stats {
  bySize = $state({})        // { [sides]: number[] }  counts indexed by value-1

  record(sides, value)       // increment one face's count
  reset()                    // clear all statistics

  get sizes()                // sizes with rolls, ascending
  get isEmpty()              // true when nothing recorded
  countsFor(sides)           // per-face counts array
  totalFor(sides)            // total rolls for a size
  averageFor(sides)          // mean face value
  maxCountFor(sides)         // highest single-face count (chart scaling)
}
export const stats = new Stats()   // singleton
```

The persisted blob is `{ version: 1, bySize }`. Invalid/corrupt blobs are
ignored on load.

- **Roll / Reroll** → `RollScreen` calls `diceState.reroll()` → for each die, if
  `locked` keep `value`, else `value = rollDie(die.sides)` and
  `stats.record(die.sides, value)` → tray re-renders.
- **Lock** → `Die` calls `onToggleLock(id)` → `diceState.toggleLock(id)` → die
  shows locked style and survives the next reroll *within the session*.
- **Used** → `Die` calls `onToggleUsed(id)` → `diceState.toggleUsed(id)` →
  die is dimmed/marked (purely visual).
- **Config change** → user edits `config` → `presets.markCustom()` (drops to
  Custom) → config persists → `diceState.rebuild()`.
- **Select preset** → `PresetBar` calls `onSelect(id)` → `presets.select(id)`
  loads the preset's dice into `config` → `diceState.rebuild()`.
- **Save preset** → user names the current dice in `PresetBar` →
  `presets.saveCurrentAs(name)` snapshots `config.dice` → new preset becomes active.
- **Delete preset** → `PresetBar` calls `onDelete(id)` → `presets.remove(id)` →
  selection falls back to Custom if the deleted preset was active.

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
4. **Persistence:** the live config is saved to `localStorage` (`dice-config`) so
   the user's dice setup survives reloads. Presets and the active selection are
   saved under a separate key (`dice-presets`). Roll statistics are saved under
   their own key (`dice-stats`). The current roll/session state is not persisted.
5. **Presets vs. Custom.** Editing any die (sides/color/add/remove) calls
   `presets.markCustom()`, so the live config detaches from the selected preset
   instead of mutating it. A preset only changes when explicitly re-saved. This
   keeps saved "games" stable while allowing quick one-off tweaks. Built-in
   presets are non-deletable; user presets can be deleted.
