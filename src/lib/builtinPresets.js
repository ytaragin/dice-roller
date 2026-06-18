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
  {
    key: 'ganz-schon-clever',
    name: 'Ganz Schön Clever',
    dice: [
      { sides: 6, color: '#f5c518' },
      { sides: 6, color: '#2196f3' },
      { sides: 6, color: '#4caf50' },
      { sides: 6, color: '#ff9800' },
      { sides: 6, color: '#9c27b0' },
      { sides: 6, color: '#ffffff' },
    ],
  },
  {
    key: 'pocket-peaks',
    name: 'Pocket Peaks',
    dice: [
      { sides: 6, color: '#1e88e5' },
      { sides: 6, color: '#43a047' },
      { sides: 6, color: '#e53935' },
      { sides: 6, color: '#ffffff' },
    ],
  },
  {
    key: 'lantern-adventures',
    name: 'Lantern Adventures',
    dice: [
      { sides: 6, color: '#ffffff' },
      { sides: 6, color: '#ffffff' },
      { sides: 6, color: '#ffffff' },
      { sides: 6, color: '#ffffff' },
      { sides: 6, color: '#ffffff' },
      { sides: 6, color: '#ffffff' },
    ],
  },
  {
    key: 'gem-getter',
    name: 'Gem Getter',
    dice: [
      { sides: 6, color: '#ffffff' },
      { sides: 6, color: '#43a047' },
    ],
  },
  {
    key: 'dungeon-dailies',
    name: 'Dungeon Dailies',
    dice: [
      { sides: 4,  color: '#fff176' },
      { sides: 6,  color: '#ffb74d' },
      { sides: 8,  color: '#ff7043' },
      { sides: 10, color: '#e53935' },
      { sides: 12, color: '#880e4f' },
    ],
  },
  {
    key: 'dungeon-pages',
    name: 'Dungeon Pages',
    dice: [
      { sides: 6, color: '#ffffff' },
      { sides: 6, color: '#ffffff' },
      { sides: 6, color: '#ffffff' },
      { sides: 6, color: '#212121' },
      { sides: 6, color: '#212121' },
      { sides: 6, color: '#212121' },
    ],
  },
  {
    key: 'pencil-and-powers',
    name: 'Pencil & Powers',
    dice: [
      { sides: 6, color: '#ffffff' },
      { sides: 6, color: '#ffffff' },
      { sides: 6, color: '#ffffff' },
      { sides: 6, color: '#1e88e5' },
      { sides: 6, color: '#e53935' },
    ],
  },
  {
    key: 'clever-cubed',
    name: 'Clever Cubed',
    dice: [
      { sides: 6, color: '#e91e8c' },
      { sides: 6, color: '#00bcd4' },
      { sides: 6, color: '#1a237e' },
      { sides: 6, color: '#795548' },
      { sides: 6, color: '#f5c518' },
      { sides: 6, color: '#ffffff' },
    ],
  },
  {
    key: '30-rails',
    name: '30 Rails',
    dice: [
      { sides: 6, color: '#ffffff' },
      { sides: 6, color: '#e53935' },
    ],
  },
  {
    key: 'qwixx',
    name: 'Qwixx',
    dice: [
      { sides: 6, color: '#ffffff' },
      { sides: 6, color: '#ffffff' },
      { sides: 6, color: '#e53935' },
      { sides: 6, color: '#43a047' },
      { sides: 6, color: '#1e88e5' },
      { sides: 6, color: '#f5c518' },
    ],
  },
  {
    key: 'qwinto',
    name: 'Qwinto',
    dice: [
      { sides: 6, color: '#e53935' },
      { sides: 6, color: '#8e24aa' },
      { sides: 6, color: '#f5c518' },
    ],
  },
  {
    key: 'bargain-basement-bathysphere',
    name: 'Bargain Basement Bathysphere',
    dice: [
      { sides: 6, color: '#ffffff' },
      { sides: 6, color: '#ffffff' },
      { sides: 6, color: '#ffffff' },
      { sides: 6, color: '#ffffff' },
      { sides: 6, color: '#ffffff' },
      { sides: 6, color: '#ffffff' },
      { sides: 6, color: '#ffffff' },
      { sides: 6, color: '#ffffff' },
    ],
  },
]
