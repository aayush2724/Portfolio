import { useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { HOTSPOTS } from "./stations"

const ndc = new THREE.Vector3()

/**
 * Reports which door the camera is looking at: the one nearest the centre of
 * the frame, among those inside it sideways. Runs only while the stage
 * renders — in demand mode that is only while the camera moves — and calls
 * back only when the answer changes.
 */
export default function Facing({ onFacing }) {
  const camera = useThree((s) => s.camera)
  const last = useRef(null)
  useFrame(() => {
    if (!onFacing) return
    let best = null
    let bestD = Infinity
    for (const h of HOTSPOTS) {
      ndc.fromArray(h.at).project(camera)
      // Behind the camera, or past the left/right edge of the frame.
      if (ndc.z > 1 || Math.abs(ndc.x) > 1.05) continue
      const d = ndc.x * ndc.x + ndc.y * ndc.y
      if (d < bestD) {
        bestD = d
        best = h.id
      }
    }
    if (best !== last.current) {
      last.current = best
      onFacing(best)
    }
  })
  return null
}
