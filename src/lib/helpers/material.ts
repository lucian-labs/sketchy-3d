import {
  Color,
  MeshBasicMaterial,
  MeshStandardMaterial,
  ShaderMaterial,
} from 'three'

export { MeshBasicMaterial, MeshStandardMaterial, ShaderMaterial } from 'three'

export const useBasicMaterial = (color: number | string = 0xffffff) => {
  return new MeshBasicMaterial({
    color,
  })
}

export const useStandardMaterial = (color: number | string = 0xffffff) => {
  return new MeshStandardMaterial({
    color,
    flatShading: true,
  })
}

type Uniform = [key: string, value: number | Color]

const mapUniforms = (uniforms?: Uniform[]) => {
  if (!uniforms) return
  // Null prototype: a caller-supplied '__proto__' key would otherwise hit
  // Object.prototype's setter instead of registering a uniform.
  const result: Record<string, { value: number | Color }> = Object.create(null)
  for (const [key, value] of uniforms) {
    result[key] = { value }
  }
  return result
}

type ShaderParams = {
  vert: string
  frag: string
}

export const useShader = (
  { frag, vert }: ShaderParams,
  uniforms?: Uniform[],
): ShaderMaterial => {
  return new ShaderMaterial({
    fragmentShader: frag,
    vertexShader: vert,
    uniforms: mapUniforms(uniforms),
  })
}
