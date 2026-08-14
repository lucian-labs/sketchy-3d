import { SketchConfig } from '@dank-inc/sketchy'
import { Lerpr, Scaler, SinCosFn } from '@dank-inc/sketchy/lib/maff.js'
import {
  Clock,
  OrthographicCamera,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three'

export type Frame = (params: Sketchy3DParams) => void
export type Sketch = (params: Sketchy3DParams) => Frame

export type Sketchy3DConfig = SketchConfig & {
  background?: [color: number, alpha?: number]
}

export type Sketchy3DParams = {
  // Context
  container: HTMLElement
  context: WebGLRenderingContext | WebGL2RenderingContext
  width: number
  height: number
  animated: boolean
  time: number
  dt: number
  startTime: number
  TAU: number
  PI: number
  abs: Math['abs']

  t: Scaler
  sin: SinCosFn
  cos: SinCosFn
  lerp: Lerpr

  // THREE
  scene: Scene
  // Concrete types, so .aspect / .setPixelRatio / .shadowMap are reachable
  // without a cast - Camera and Renderer are near-empty base types.
  camera: PerspectiveCamera | OrthographicCamera
  // composer: EffectsComposer;
  renderer: WebGLRenderer
  clock: Clock

  // helporz
}
