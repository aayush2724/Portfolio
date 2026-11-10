import * as THREE from "three"
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js"

/**
 * Collapse the room's static furniture into a few draw calls.
 *
 * The cabin is built from hundreds of primitives (book spines, desk legs,
 * shelf boards, rack bodies), and each one was its own draw call — 283 for
 * under 5k triangles, so the frame cost was the calls, not the geometry.
 * Meshes that share a material's look are merged into one mesh per look; the
 * originals stay in the scene graph (refs and React still own them) but are
 * hidden.
 *
 * Left alone: anything transparent, textured, emissive (the blinking LEDs
 * and glowing spines animate their material), wireframe, or interactive
 * (R3F pointer handlers) — exactly the meshes that do something per frame.
 *
 * Returns an undo function for the effect cleanup.
 */
function lookOf(mesh) {
  const m = mesh.material
  if (Array.isArray(m) || !(m.isMeshPhongMaterial || m.isMeshBasicMaterial)) return null
  if (m.transparent || m.map || m.alphaMap || m.wireframe) return null
  if (m.isMeshPhongMaterial && m.emissive.getHex() !== 0) return null
  if (mesh.__r3f?.eventCount > 0) return null
  const g = mesh.geometry
  const attrs = Object.keys(g.attributes).sort().join(",")
  return [
    m.type,
    m.color.getHex(),
    m.side,
    m.toneMapped,
    m.fog,
    m.isMeshPhongMaterial ? `${m.specular.getHex()}/${m.shininess}` : "",
    g.index ? "i" : "n",
    attrs,
  ].join("|")
}

export function mergeStatic(root) {
  root.updateMatrixWorld(true)
  const toRoot = new THREE.Matrix4().copy(root.matrixWorld).invert()
  const looks = new Map()
  root.traverse((o) => {
    if (!o.isMesh || o.isInstancedMesh || !o.visible) return
    const key = lookOf(o)
    if (!key) return
    if (!looks.has(key)) looks.set(key, [])
    looks.get(key).push(o)
  })

  const added = []
  const hidden = []
  const m = new THREE.Matrix4()
  for (const meshes of looks.values()) {
    if (meshes.length < 2) continue
    const parts = meshes.map((mesh) => mesh.geometry.clone().applyMatrix4(m.multiplyMatrices(toRoot, mesh.matrixWorld)))
    const geometry = mergeGeometries(parts, false)
    parts.forEach((p) => p.dispose())
    if (!geometry) continue
    const merged = new THREE.Mesh(geometry, meshes[0].material)
    merged.name = "merged-static"
    root.add(merged)
    added.push(merged)
    meshes.forEach((mesh) => {
      mesh.visible = false
      hidden.push(mesh)
    })
  }

  return () => {
    added.forEach((mesh) => {
      root.remove(mesh)
      mesh.geometry.dispose()
    })
    hidden.forEach((mesh) => {
      mesh.visible = true
    })
  }
}
