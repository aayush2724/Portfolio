import { useLowPower } from "../context/motion"

/**
 * Site-wide drifting ground fog, sitting between the fixed backgrounds and
 * the content. The haze is pre-blurred radial gradients and the drift is
 * transform-only, so nothing here touches the main thread after first paint.
 * Low-power devices keep the atmosphere but drop the second layer and the
 * animation.
 */
export default function FogAtmosphere() {
  const lowPower = useLowPower()

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 overflow-hidden pointer-events-none z-[2]"
    >
      <div className={"fog-layer fog-a" + (lowPower ? "" : " fog-drift")} />
      {!lowPower && <div className="fog-layer fog-b fog-drift-slow" />}
    </div>
  )
}
