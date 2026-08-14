import { AmbientLight, DirectionalLight } from 'three'
import { Vec3 } from '../types/common.js'

export const useLight = (
  color: string | number = '#fff',
  intensity = 0.5,
  position: Vec3 = [0, 2, 0],
) => {
  const light = new DirectionalLight(color, intensity)
  light.position.set(...position)
  return light
}

export const useAmbient = (
  color: string | number = '#fff',
  intensity = 0.5,
) => {
  return new AmbientLight(color, intensity)
}
