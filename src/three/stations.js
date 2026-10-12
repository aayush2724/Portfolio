/**
 * The cabin: one room, ten camera positions, nine doors to pages.
 *
 * Room is 10 wide (x), 7 deep (z), 4 high (y), floor at y=0, back wall at
 * z=-3.5, front wall (with the door) at z=3.5. Every section of the page is a
 * place in this room: as a section takes the viewport the camera eases to its
 * station and looks at the object that stands for that page.
 *
 *   pos   camera position      look  what it faces
 *   dim   stage brightness while the page content sits over it (0–1)
 *   lens  base vertical field of view (default 50°; narrow screens widen it)
 *   fov   fixed field of view, no aspect correction at all
 *   turn  a drag turns the head instead of orbiting the look point
 */
export const STATIONS = {
  hero:         { pos: [1.1, 1.9, 3.0],   look: [2.8, 1.2, -2.6],   dim: 0.05 },  // at the door, looking toward the window; desk side stays out of frame behind the headline
  // The map: just outside the (single-sided) front wall, close enough that
  // the room fills the frame top to bottom on a 16:9 screen with every door
  // in view; a slightly wider lens keeps the near corners (corkboard, arcade)
  // in frame. Whatever the screen shape leaves over, the vestibule covers.
  hq:           { pos: [0.1, 2.2, 7.6],   look: [-0.1, 1.4, -0.8],  dim: 1, lens: 56 },
  // Portrait screens can't fit a wide room: stand just inside the doorway,
  // look down the room, and let a sideways drag pan to either wall.
  hq_portrait:  { pos: [-0.3, 1.9, 3.3],  look: [-1.0, 1.45, -1.5], dim: 1, fov: 74, turn: true },
  projects:     { pos: [-0.9, 1.7, 1.2],   look: [-1.8, 1.3, -2.9],  dim: 0.12 },
  about:        { pos: [-1.2, 1.7, 0.2],   look: [-4.8, 1.5, -1.2],  dim: 0.12 },
  skills:       { pos: [1.0, 1.6, 0.4],    look: [4.5, 1.3, -2.5],   dim: 0.12 },
  approach:     { pos: [0.2, 1.7, 1.2],    look: [2.2, 2.3, -3.4],   dim: 0.08 },
  stats:        { pos: [0.6, 1.8, 0.6],    look: [4.9, 2.2, -0.6],   dim: 0.12 },
  journey:      { pos: [-0.8, 1.8, 1.0],   look: [-4.9, 2.1, 1.3],   dim: 0.12 },
  achievements: { pos: [-0.6, 1.9, 0.4],   look: [-1.8, 3.1, -3.3],  dim: 0.12 },
  play:         { pos: [0.6, 1.5, 0.4],    look: [4.3, 1.3, 2.3],    dim: 0.12 },
  life:         { pos: [0.8, 1.9, -0.6],   look: [4.9, 2.5, 1.0],    dim: 0.12 },
  contact:      { pos: [0.6, 1.7, -0.4],   look: [-2.5, 1.4, 3.4],   dim: 0.12 },
}

export const DEFAULT_STATION = STATIONS.hero

/** Slate labels for the HUD. */
export const SCENE_LABELS = {
  hero: "Opening",
  hq: "HQ",
  projects: "Projects",
  about: "About",
  skills: "The stack",
  approach: "The approach",
  stats: "Coding stats",
  journey: "Journey",
  achievements: "Achievements",
  play: "Play",
  life: "Beyond code",
  contact: "Contact",
}

/**
 * Doors: the object in the room that opens each page. `at` is where the
 * marker floats and where the object glows when hovered.
 */
export const HOTSPOTS = [
  { id: "projects",     label: "Projects",     hint: "the desk",          at: [-1.8, 1.75, -2.4] },
  { id: "about",        label: "About",        hint: "the bookshelf",     at: [-4.4, 2.0, -1.2] },
  { id: "skills",       label: "Skills",       hint: "the server racks",  at: [4.2, 2.35, -2.5] },
  { id: "stats",        label: "Stats",        hint: "the status wall",   at: [4.7, 2.4, -0.6] },
  { id: "journey",      label: "Journey",      hint: "the corkboard",     at: [-4.7, 2.3, 1.3] },
  { id: "achievements", label: "Achievements", hint: "the trophy shelf",  at: [-1.8, 3.3, -3.1] },
  { id: "play",         label: "Play",         hint: "the arcade",        at: [4.1, 2.0, 2.3] },
  { id: "life",         label: "Beyond code",  hint: "the guitar",        at: [4.7, 2.9, 1.0] },
  { id: "contact",      label: "Contact",      hint: "the door",          at: [-2.5, 1.8, 3.2] },
]
