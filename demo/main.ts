/* sketchy-3d demo — https://sketchy-3d.lucianlabs.ca
 *
 * Two behaviours of the published library shape this page:
 *
 *  - params.t is hardwired to () => 0, so the elapsed clock comes from
 *    params.time (which start3dSketch does advance) rather than t().
 *  - start3dSketch's animate loop has no cancel and never reads
 *    params.animated, so switching sketches must reuse ONE scene rather than
 *    starting a second loop. Both are recorded in the review.
 */

import {
  createParams,
  create3dSketch,
  start3dSketch,
  useBox,
  useSphere,
  useCircle,
  useMesh,
  useStandardMaterial,
  useBasicMaterial,
  useLight,
  useAmbient,
} from '@dank-inc/sketchy-3d'
import type { Sketch, Sketchy3DParams } from '@dank-inc/sketchy-3d'
import * as THREE from 'three'

declare const waveloop: {
  ready: (...tags: string[]) => Promise<unknown>
  whenSized: (el: Element, fn: (rect: DOMRect) => void) => () => void
}

const app = document.getElementById('app') as HTMLElement

const h = (tag: string, cls?: string, text?: string) => {
  const n = document.createElement(tag)
  if (cls) n.className = cls
  if (text != null) n.textContent = text
  return n
}

const section = (title: string) => {
  const s = document.createElement('wl-section')
  s.setAttribute('title', title)
  app.append(s)
  return s
}

/* live controls the frame function reads each tick */
const state = { mode: 'lattice', spin: 0.5, spread: 1, wire: false }

/* ── the sketch ─────────────────────────────────────────────────────────── */

const sketch: Sketch = create3dSketch(({ scene, camera }) => {
  /* per-load setup — runs once */

  scene.add(useAmbient(0x334455, 0.9))
  const key = useLight(0xffffff, 1.1)
  key.position.set(4, 6, -4)
  scene.add(key)
  const rim = useLight(0xbf7ae6, 0.8)
  rim.position.set(-5, 2, 3)
  scene.add(rim)

  const GROUP = new THREE.Group()
  scene.add(GROUP)

  const COUNT = 8
  const cells: THREE.Mesh[] = []

  const boxMat = useStandardMaterial(0x8c2ebf)
  const ballMat = useStandardMaterial(0x6be6e0)
  const flatMat = useBasicMaterial(0xbf7ae6)

  for (let x = 0; x < COUNT; x++) {
    for (let z = 0; z < COUNT; z++) {
      const mesh = useMesh(useBox([0.55, 0.55, 0.55]), boxMat)
      mesh.userData.u = x / (COUNT - 1)
      mesh.userData.v = z / (COUNT - 1)
      GROUP.add(mesh)
      cells.push(mesh)
    }
  }

  const ring: THREE.Mesh[] = []
  for (let i = 0; i < 26; i++) {
    const mesh = useMesh(useSphere([0.22, 18, 18]), ballMat)
    mesh.userData.u = i / 26
    GROUP.add(mesh)
    ring.push(mesh)
  }

  const disc = useMesh(useCircle(3.2, 48), flatMat)
  disc.rotation.x = -Math.PI / 2
  disc.position.y = -1.6
  GROUP.add(disc)

  /* per-frame */

  return ({ time, renderer, scene: sc, camera: cam }) => {
    const t = time
    const spread = state.spread

    for (const m of cells) {
      const { u, v } = m.userData as { u: number; v: number }
      const visible = state.mode !== 'ring'
      m.visible = visible
      if (!visible) continue
      const x = (u - 0.5) * 7 * spread
      const z = (v - 0.5) * 7 * spread
      const wave = Math.sin(u * 5 + t * 1.4) * Math.cos(v * 4 - t)
      m.position.set(x, wave * 0.9, z)
      m.rotation.y = t * 0.4 + u * 3
      m.rotation.x = wave * 0.5
      const s = 0.6 + Math.abs(wave) * 0.7
      m.scale.setScalar(s)
      ;(m.material as THREE.MeshStandardMaterial).wireframe = state.wire
    }

    for (const m of ring) {
      const { u } = m.userData as { u: number }
      const visible = state.mode !== 'lattice'
      m.visible = visible
      if (!visible) continue
      const a = u * Math.PI * 2 + t * 0.6
      const r = (2.4 + Math.sin(t * 0.8 + u * 6) * 0.6) * spread
      m.position.set(Math.cos(a) * r, Math.sin(t + u * 6) * 1.2, Math.sin(a) * r)
      ;(m.material as THREE.MeshStandardMaterial).wireframe = state.wire
    }

    disc.visible = state.mode !== 'ring'

    GROUP.rotation.y = t * state.spin

    cam.position.x = Math.sin(t * 0.15) * 1.6
    cam.lookAt(new THREE.Vector3(0, 0, 0))

    renderer.render(sc, cam)
    void camera
    void scene
  }
})

/* ── page ───────────────────────────────────────────────────────────────── */

waveloop.ready().then(boot)

function boot() {
  installSection()
  stageSection()
  helpersSection()
  apiSection()
}

function installSection() {
  const s = section('install')
  const install = document.createElement('wl-install')
  install.setAttribute('pkg', '@dank-inc/sketchy-3d')
  const c = document.createElement('wl-code')
  c.textContent = `import {
  createParams, create3dSketch, start3dSketch,
  useBox, useMesh, useStandardMaterial, useLight,
} from '@dank-inc/sketchy-3d'

const sketch = create3dSketch(({ scene }) => {
  const mesh = useMesh(useBox([1, 1, 1]), useStandardMaterial(0x8c2ebf))
  scene.add(mesh)
  scene.add(useLight(0xffffff, 1.1))

  return ({ time, renderer, scene, camera }) => {
    mesh.rotation.y = time
    renderer.render(scene, camera)
  }
})

start3dSketch(sketch, createParams({ element, animate: true }))`
  s.append(install, c)
}

function stageSection() {
  const s = section('stage')
  s.append(
    h(
      'p',
      'wl-muted',
      'One scene, one frame loop. The controls write into an object the frame ' +
        'function reads each tick — the sketch is never reloaded, because ' +
        'start3dSketch has no cancel path.'
    )
  )

  const hud = document.createElement('wl-hud')
  hud.style.height = '480px'
  const stage = h('div')
  stage.style.position = 'absolute'
  stage.style.inset = '0'
  hud.append(stage)
  s.append(hud)

  const controls = h('div', 'wl-grid')
  controls.style.marginTop = '0.75rem'

  const mode = document.createElement('wl-segmented')
  mode.setAttribute('options', 'lattice,ring,both')
  mode.setAttribute('value', 'lattice')

  const spin = document.createElement('wl-fader')
  spin.setAttribute('label', 'spin')
  spin.setAttribute('min', '-1.5')
  spin.setAttribute('max', '1.5')
  spin.setAttribute('step', '0.01')
  spin.setAttribute('value', '0.5')
  spin.setAttribute('bipolar', '')

  const spread = document.createElement('wl-fader')
  spread.setAttribute('label', 'spread')
  spread.setAttribute('min', '0.3')
  spread.setAttribute('max', '1.8')
  spread.setAttribute('step', '0.01')
  spread.setAttribute('value', '1')

  const wire = document.createElement('wl-selector')
  wire.setAttribute('label', 'wireframe')

  controls.append(mode, spin, spread, wire)
  s.append(controls)

  mode.addEventListener('wl-input', (e) => {
    state.mode = (e as CustomEvent<{ value: string }>).detail.value
    hud.setAttribute('tl', state.mode.toUpperCase())
  })
  spin.addEventListener('wl-input', (e) => {
    state.spin = (e as CustomEvent<{ value: number }>).detail.value
    hud.setAttribute('br', `SPIN ${state.spin.toFixed(2)}`)
  })
  spread.addEventListener('wl-input', (e) => {
    state.spread = (e as CustomEvent<{ value: number }>).detail.value
  })
  wire.addEventListener('wl-input', (e) => {
    state.wire = (e as CustomEvent<{ value: boolean }>).detail.value
  })

  // start3dSketch has no cancel, so this must run exactly once — whenSized
  // fires on every resize, hence the latch.
  let started = false
  waveloop.whenSized(hud, (box) => {
    if (started) return
    started = true
    const params: Sketchy3DParams = createParams({
      element: stage,
      animate: true,
      dimensions: [Math.round(box.width), Math.round(box.height)],
      background: [0x080b0b, 0],
    })
    hud.setAttribute('tl', 'LATTICE')
    hud.setAttribute('tr', `${Math.round(box.width)}×${Math.round(box.height)}`)
    hud.setAttribute('bl', 'THREE.JS · WEBGL')
    hud.setAttribute('br', 'SPIN 0.50')
    start3dSketch(sketch, params)
  })
}

function helpersSection() {
  const s = section('the use* helpers')
  s.append(
    h(
      'p',
      'wl-muted',
      'Thin constructors over three.js primitives. They return real three objects, ' +
        'so you can drop down to the library at any point — nothing is wrapped.'
    )
  )
  const c = document.createElement('wl-code')
  c.textContent = `useBox([w, h, d])                 // BoxGeometry
useSphere([r, wSeg, hSeg])        // SphereGeometry
useCircle(radius, segments)       // CircleGeometry

useBasicMaterial(0xffffff)        // MeshBasicMaterial
useStandardMaterial(0x8c2ebf)     // MeshStandardMaterial
useShaderMesh(geo, shaderMaterial)

useMesh(geometry, material)       // THREE.Mesh
useLight(color, intensity)        // DirectionalLight
useAmbient(color, intensity)      // AmbientLight
useCamera('perspective', ratio)   // Perspective | Orthographic`
  s.append(c)
}

function apiSection() {
  const s = section('api')
  const api = document.createElement('wl-api')
  s.append(api)
  ;(api as HTMLElement & { rows: unknown }).rows = [
    { name: 'createParams', kind: 'function', signature: '(config: Sketchy3DConfig) => Sketchy3DParams', about: 'Builds scene, camera, renderer and clock, and mounts the canvas. Adds background: [color, alpha] on top of sketchy SketchConfig.' },
    { name: 'create3dSketch', kind: 'function', signature: '(sketch: Sketch) => Sketch', about: 'Identity helper for param typing.' },
    { name: 'start3dSketch', kind: 'function', signature: '(sketch: Sketch, params: Sketchy3DParams) => void', about: 'Runs the sketch and drives requestAnimationFrame. See the review note on cancellation.' },
    { name: 'params.scene / camera / renderer / clock', kind: 'property', signature: 'THREE.*', about: 'The real three.js objects.' },
    { name: 'params.time / dt', kind: 'property', signature: 'number', about: 'Seconds since start, and the last frame delta.' },
    { name: 'useBox / useSphere / useCircle', kind: 'function', signature: '(dims) => BufferGeometry', about: 'Geometry constructors.' },
    { name: 'useBasicMaterial / useStandardMaterial', kind: 'function', signature: '(color) => Material', about: 'Material constructors.' },
    { name: 'useMesh / useShaderMesh', kind: 'function', signature: '(geo, material) => Mesh', about: 'Mesh constructors.' },
    { name: 'useLight / useAmbient', kind: 'function', signature: '(color, intensity) => Light', about: 'Directional and ambient lights.' },
    { name: 'useCamera', kind: 'function', signature: "('perspective' | 'ortho', ratio) => Camera", about: 'Camera constructor.' },
    { name: 'useText', kind: 'function', signature: '(phrase, { size }) => Promise<…>', about: 'Async text geometry.' },
    { name: 'tosha / dehash / dehash2d / dehash3d', kind: 'function', signature: 'various', about: 'Hash helpers for deterministic placement.' },
  ]
}
