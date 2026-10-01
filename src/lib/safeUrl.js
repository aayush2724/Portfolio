/**
 * URL allow-listing for content the site renders but does not author —
 * project READMEs fetched from GitHub. A README can contain any link, so
 * before one becomes an <a href> or <img src> it has to resolve to a protocol
 * that cannot run code in this page. `javascript:`, `data:text/html`,
 * `vbscript:` and friends are dropped (the renderer then shows plain text).
 *
 * Relative paths are resolved against `base` so README-relative links point
 * back at the repository instead of at this site.
 */

const LINK_PROTOCOLS = new Set(["http:", "https:", "mailto:"])
const IMAGE_PROTOCOLS = new Set(["http:", "https:"])
const DATA_IMAGE = /^data:image\/(png|jpe?g|gif|webp|avif);base64,/i

export function safeHref(href, base) {
  if (typeof href !== "string") return null
  const value = href.trim()
  if (!value) return null
  if (value.startsWith("#")) return value
  try {
    const url = new URL(value, base)
    return LINK_PROTOCOLS.has(url.protocol) ? url.href : null
  } catch {
    return null
  }
}

export function safeImageSrc(src, base) {
  if (typeof src !== "string") return null
  const value = src.trim()
  if (!value) return null
  if (DATA_IMAGE.test(value)) return value
  try {
    const url = new URL(value, base)
    return IMAGE_PROTOCOLS.has(url.protocol) ? url.href : null
  } catch {
    return null
  }
}
