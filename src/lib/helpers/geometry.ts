import { BoxGeometry, CircleGeometry, SphereGeometry } from 'three'
import { Vec3 } from '../types/common'

export { BoxGeometry, CircleGeometry, SphereGeometry } from 'three'

export type GeoType = 'sphere-buffer' | 'box'

export const useBox = (size: Vec3) => {
  return new BoxGeometry(...size)
}

export const useSphere = (size: Vec3) => {
  return new SphereGeometry(...size)
}

export const useCircle = (rad = 5, segments = 32) => {
  return new CircleGeometry(rad, segments)
}
