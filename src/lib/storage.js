const KEY = 'dice-config'

/**
 * Load persisted JSON for a key.
 * @param {string} [key]
 * @returns {any | null}
 */
export function load(key = KEY) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/**
 * Persist a value as JSON.
 * @param {any} value
 * @param {string} [key]
 */
export function save(value, key = KEY) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore write failures (e.g. private mode)
  }
}
