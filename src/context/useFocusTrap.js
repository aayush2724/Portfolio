import { useEffect } from "react"

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "textarea:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",")

function focusables(root) {
  return Array.from(root.querySelectorAll(FOCUSABLE)).filter(
    (el) => !el.closest('[aria-hidden="true"]') && el.getClientRects().length > 0
  )
}

/**
 * Keeps keyboard focus inside `ref` while `active` is true.
 *
 * On activation it remembers the element that had focus, then (after `delay`
 * ms, so an enter animation has mounted its children) moves focus to
 * `initialFocus` or the first focusable element. Tab and Shift+Tab wrap at
 * the edges instead of escaping to the page behind the dialog. On
 * deactivation focus is handed back to the remembered element, so a visitor
 * who opened a modal from a button lands on that button again.
 *
 * Handlers that already consumed the Tab key (the shell's tab-completion)
 * call preventDefault, and this hook then leaves the event alone.
 */
export default function useFocusTrap(ref, active, { initialFocus, delay = 60 } = {}) {
  useEffect(() => {
    if (!active) return undefined
    const node = ref.current
    if (!node) return undefined
    const previous = document.activeElement

    const timer = setTimeout(() => {
      const target = initialFocus?.current || focusables(node)[0] || node
      target.focus?.({ preventScroll: true })
    }, delay)

    const onKey = (e) => {
      if (e.key !== "Tab" || e.defaultPrevented) return
      const els = focusables(node)
      if (!els.length) {
        e.preventDefault()
        node.focus?.()
        return
      }
      const first = els[0]
      const last = els[els.length - 1]
      const current = document.activeElement
      const inside = node.contains(current)
      if (e.shiftKey) {
        if (!inside || current === first) {
          e.preventDefault()
          last.focus()
        }
      } else if (!inside || current === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", onKey)
    return () => {
      clearTimeout(timer)
      document.removeEventListener("keydown", onKey)
      if (previous instanceof HTMLElement && document.contains(previous)) {
        previous.focus({ preventScroll: true })
      }
    }
  }, [ref, active, initialFocus, delay])
}
