/**
 * Motion vocabulary.
 *
 * The codebase previously used [0.22, 1, 0.36, 1] for every transition —
 * entrances, exits, hovers and springs alike, copy-pasted across 11 files. One
 * curve everywhere flattens the page's rhythm: things that behave differently
 * should feel different.
 *
 * Pick by intent, not by taste:
 *   ENTER  — something arriving. Decelerates into place.
 *   EXIT   — something leaving. Accelerates away, and runs ~half as long.
 *   SPRING — something the user directly manipulated. Slight overshoot.
 *   SHARP  — state flips (colour, border, opacity). Short and near-linear.
 *   WIPE   — clip-path reveals. Slow in, slow out, no overshoot.
 */
export const EASE = {
  ENTER: [0.16, 1, 0.3, 1],
  EXIT: [0.7, 0, 0.84, 0],
  SPRING: [0.34, 1.56, 0.64, 1],
  SHARP: [0.4, 0, 0.2, 1],
  WIPE: [0.76, 0, 0.24, 1],
}

/** CSS-string forms, for `transition:` and `animation-timing-function:`. */
export const CSS_EASE = Object.fromEntries(
  Object.entries(EASE).map(([k, v]) => [k, `cubic-bezier(${v.join(",")})`])
)

/**
 * Durations in seconds. Exits are deliberately shorter than entrances — an
 * element leaving should get out of the way, not perform on the way out.
 */
export const DUR = {
  enter: 0.62,
  exit: 0.3,
  sharp: 0.18,
  wipe: 0.72,
}
