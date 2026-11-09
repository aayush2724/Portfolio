/**
 * Anonymous visitor session id: a random UUID kept in sessionStorage for the
 * tab's lifetime. It is the only identifier the assistant API ever receives;
 * the backend stores a hash of it, never the value.
 */
const KEY = "pia.session"
let memory = null

function uuid() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16)
  })
}

export function getSessionId() {
  try {
    let id = sessionStorage.getItem(KEY)
    if (!id) {
      id = uuid()
      sessionStorage.setItem(KEY, id)
    }
    return id
  } catch {
    memory ||= uuid()
    return memory
  }
}
