import { lowPowerNow } from "./motion"

/**
 * The opening shot: a one-time handshake between the intro slate (App) and
 * the room (CinemaStage + Rig, walk mode only).
 *
 *   off        no shot this visit (phones, deep links, already seen)
 *   pending    App wants the shot; the slate is up while the stage loads
 *   playing    the stage is built and warm: the slate fades, the camera
 *              dollies in from outside the room to the hero's station
 *   done       the dolly landed (or was skipped): the headline comes in
 *   cancelled  the stage was too slow; App went ahead without it
 *
 * Module state, not React state: the stage lives in its own lazy chunk and
 * mounts after App, and both sides only need to hear about a few changes.
 */

/** Same switch CinemaBackground uses to put the room behind the page. */
export const WALK_MQ = "(min-width: 768px) and (pointer: fine) and (prefers-reduced-motion: no-preference)"

export function canShoot() {
  return typeof window !== "undefined" && window.matchMedia(WALK_MQ).matches && !lowPowerNow()
}

export const opening = { state: "off" }
const listeners = new Set()

export function setOpening(state) {
  if (opening.state === state) return
  opening.state = state
  listeners.forEach((fn) => fn(state))
}

export function onOpening(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
