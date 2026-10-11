import * as THREE from "three"

/** Read a space-separated "r g b" design token off :root as a three.js Color. */
export function tokenColor(name, fallback) {
  if (typeof document === "undefined") return new THREE.Color(fallback)
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name)
  const ch = raw.trim().split(/[\s,]+/).map(Number)
  if (ch.length !== 3 || !ch.every(Number.isFinite)) return new THREE.Color(fallback)
  return new THREE.Color(ch[0] / 255, ch[1] / 255, ch[2] / 255)
}
