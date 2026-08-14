import { BoxGeometry, CircleGeometry, SphereGeometry } from 'three'
import { Vec3 } from '../types/common.js'

export { BoxGeometry, CircleGeometry, SphereGeometry } from 'three'

export type GeoType = 'sphere-buffer' | 'box'

export const useBox = (size: Vec3) => {
  return new BoxGeometry(...size)
}

/**
 * The tuple form is NOT a size - it is three's own
 * (radius, widthSegments, heightSegments), so useSphere([1, 1, 1]) is a
 * 12-vertex blob, not a unit sphere. Prefer the scalar form, which defaults
 * the segment counts to something round.
 */
export const useSphere = (
  radius: number | Vec3 = 1,
  widthSegments = 32,
  heightSegments = 16,
) => {
  if (Array.isArray(radius)) return new SphereGeometry(...radius)
  return new SphereGeometry(radius, widthSegments, heightSegments)
}

export const useCircle = (rad = 5, segments = 32) => {
  return new CircleGeometry(rad, segments)
}
