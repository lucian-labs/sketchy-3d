import { Sketch, Sketchy3DParams, Sketchy3DConfig } from './types/index.js'
import * as THREE from 'three'
import { usePerspectiveCamera } from './helpers/cam.js'
import { sin, cos, lerp } from '@dank-inc/sketchy/lib/maff.js'

export const createParams = (config: Sketchy3DConfig): Sketchy3DParams => {
  // Split up creating canvas element and creating params

  const id = config.containerId || 'root'
  const rootElement = config.element || document.getElementById(id)

  if (!rootElement)
    throw new Error(
      `No Root Element Found! supply an 'element: HTMLElement' or 'id: string'`,
    )

  const [w = rootElement.clientWidth, h = rootElement.clientHeight] =
    config.dimensions ?? []

  // An unstyled or display:none container measures 0, which turns the camera
  // aspect into Infinity/NaN and renders a blank page with no error at all.
  if (w < 1 || h < 1)
    console.warn(
      `[sketchy-3d] container measured ${w}x${h} - give it a size in CSS or pass 'dimensions'. Falling back to 1px.`,
    )

  const width = Math.max(1, Math.round(w))
  const height = Math.max(1, Math.round(h))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  // Hand three the canvas so there is exactly one WebGL context per sketch,
  // and so params.context is the context actually being drawn to.
  const renderer = new THREE.WebGLRenderer({ canvas })
  const context = renderer.getContext()

  const scene = new THREE.Scene()
  const camera = usePerspectiveCamera(width / height)
  camera.position.y = 1.5
  camera.position.z = -6
  camera.lookAt(new THREE.Vector3())
  scene.add(camera)

  renderer.setSize(width, height)
  rootElement.appendChild(renderer.domElement)

  if (config.background) {
    const [color, alpha = 1] = config.background
    renderer.setClearColor(color, alpha)
  } else {
    renderer.setClearColor(0x000000, 0)
  }

  const params: Sketchy3DParams = {
    container: rootElement,
    renderer,
    scene,
    camera,
    // composer: new EffectsComposer(),

    clock: new THREE.Clock(true),
    width,
    height,
    // The loop is opt-out, not opt-in: sketches written before this flag was
    // read omit `animate` entirely and still expect to animate.
    animated: config.animate ?? true,
    context,

    time: config.timeOffset || 0,
    dt: 0,
    startTime: performance.now(),

    TAU: Math.PI * 2,
    PI: Math.PI,
    abs: Math.abs,

    // Reads the live params object, not the per-frame copy, so it keeps
    // tracking elapsed time. Matches sketchy's t: seconds * scale + offset.
    t: (scale = 1, offset = 0) => params.time * scale + offset,

    sin,
    cos,
    lerp,
  }

  return params
}

/**
 * Runs the sketch and drives the frame loop. Returns a stop function - call it
 * to cancel the loop (React cleanup, route change, hot reload). It does not
 * dispose the renderer; call `params.renderer.dispose()` if you are done with
 * the GL context entirely.
 */
export const start3dSketch = (
  sketch: Sketch,
  params: Sketchy3DParams,
): (() => void) => {
  const frame = sketch(params)
  let ot = +new Date()
  let requestId: number | null = null
  let running = true

  function animate() {
    const now = +new Date()
    const dt = (now - ot) / 1000
    params.time += dt
    ot = now

    frame({
      ...params,
      dt,
    })

    if (running) requestId = requestAnimationFrame(animate)
  }

  if (params.animated) {
    animate()
  } else {
    frame({ ...params, dt: 0 })
  }

  return () => {
    running = false
    if (requestId !== null) cancelAnimationFrame(requestId)
    requestId = null
  }
}

// Type wrapper
export const create3dSketch = (sketch: Sketch) => sketch
