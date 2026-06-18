/**
 * Predefined presets that ship with the app.
 *
 * To add a new built-in preset, append an object to the array below:
 *   - `key`:  a stable, unique string id. NEVER change or reuse a key — it is
 *             how a deleted (hidden) built-in is tracked across reloads.
 *   - `name`: the label shown in the preset dropdown.
 *   - `dice`: the dice set, each `{ sides, color }`.
 *
 * Built-ins are reconstructed from this source on every load (they are not
 * stored as user data), so edits here propagate to all users. Users can
 * "delete" a built-in (it is hidden, not removed) and restore the full set.
 *
 * @typedef {{ key: string, name: string, dice: { sides: number, color: string }[] }} BuiltinPreset
 * @type {BuiltinPreset[]}
 */
export const builtinPresets = [
  {
    key: 'yahtzee',
    name: 'Yahtzee',
    dice: [
      { sides: 6, color: '#ffffff' },
      { sides: 6, color: '#ffffff' },
      { sides: 6, color: '#ffffff' },
      { sides: 6, color: '#ffffff' },
      { sides: 6, color: '#ffffff' },
    ],
  },
]
