/**
 * The one way other components open the assistant. Dispatching a DOM event
 * keeps ProjectStage, CaseStudyBody and the Shell free of any import from the
 * lazy assistant chunk.
 */
export const ASSISTANT_OPEN_EVENT = "assistant:open"

/** detail: { projectSlug?: string, prompt?: string } */
export function openAssistant(detail = {}) {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(ASSISTANT_OPEN_EVENT, { detail }))
}

export const ASSISTANT_CLOSE_EVENT = "assistant:close"

/** Close the panel from outside it (the desktop dock's toggle). */
export function closeAssistant() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(ASSISTANT_CLOSE_EVENT))
}

/** Broadcast by the assistant whenever it opens or closes. detail: { open } */
export const ASSISTANT_STATE_EVENT = "assistant:state"
