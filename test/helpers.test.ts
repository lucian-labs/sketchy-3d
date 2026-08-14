import { describe, expect, it, vi } from 'vitest'
import { OrthographicCamera, PerspectiveCamera } from 'three'

import { useCamera, useOrthographicCamera } from '../src/lib/helpers/cam'
import { useBox, useCircle, useSphere } from '../src/lib/helpers/geometry'
import { useAmbient, useLight } from '../src/lib/helpers/light'
import { useShader, useStandardMaterial } from '../src/lib/helpers/material'
import { useMesh } from '../src/lib/helpers/mesh'
import { v3 } from '../src/lib/helpers/maff'
import { start3dSketch } from '../src/lib/sketchy-3d'
import type { Sketchy3DParams } from '../src/lib/types'

describe('useCamera', () => {
  it('applies the ratio to a perspective camera', () => {
    const cam = useCamera('perspective', 16 / 9)
    expect(cam).toBeInstanceOf(PerspectiveCamera)
    expect((cam as PerspectiveCamera).aspect).toBeCloseTo(16 / 9)
  })

  it('applies the ratio to an orthographic camera', () => {
    const cam = useCamera('ortho', 2) as OrthographicCamera
    expect(cam).toBeInstanceOf(OrthographicCamera)
    expect(cam.left).toBe(-2)
    expect(cam.right).toBe(2)
  })

  it('uses the same clipping planes on both branches', () => {
    const persp = useCamera('perspective')
    const ortho = useCamera('ortho')
    expect(ortho.near).toBe(persp.near)
    expect(ortho.far).toBe(persp.far)
  })

  it('builds an orthographic camera from explicit bounds', () => {
    const cam = useOrthographicCamera([-5, 5, 5, -5])
    expect([cam.left, cam.right, cam.top, cam.bottom]).toEqual([-5, 5, 5, -5])
  })
})

describe('geometry', () => {
  it('reads useBox tuples as width/height/depth', () => {
    const geo = useBox([1, 2, 3])
    expect(geo.parameters.width).toBe(1)
    expect(geo.parameters.height).toBe(2)
    expect(geo.parameters.depth).toBe(3)
  })

  it('gives useSphere a properly tessellated default', () => {
    expect(useSphere(1).attributes.position.count).toBeGreaterThan(100)
    expect(useSphere().parameters.radius).toBe(1)
  })

  it('still accepts the legacy (radius, wSeg, hSeg) tuple', () => {
    const geo = useSphere([2, 18, 12])
    expect(geo.parameters.radius).toBe(2)
    expect(geo.parameters.widthSegments).toBe(18)
    expect(geo.parameters.heightSegments).toBe(12)
  })

  it('defaults useCircle', () => {
    const geo = useCircle()
    expect(geo.parameters.radius).toBe(5)
    expect(geo.parameters.segments).toBe(32)
  })
})

describe('lights', () => {
  it('positions a directional light', () => {
    const light = useLight('#fff', 2, [1, 2, 3])
    expect(light.intensity).toBe(2)
    expect(light.position.toArray()).toEqual([1, 2, 3])
  })

  it('defaults an ambient light', () => {
    expect(useAmbient().intensity).toBe(0.5)
  })
})

describe('materials', () => {
  it('flat shades the standard material', () => {
    expect(useStandardMaterial(0x123456).flatShading).toBe(true)
  })

  it('maps uniform tuples into three-shaped uniforms', () => {
    const mat = useShader({ vert: '', frag: '' }, [['time', 1.5]])
    expect(mat.uniforms.time.value).toBe(1.5)
  })

  it('registers a __proto__ uniform as an own key', () => {
    const mat = useShader({ vert: '', frag: '' }, [
      ['__proto__', 1],
      ['time', 0],
    ])
    expect(Object.keys(mat.uniforms).sort()).toEqual(['__proto__', 'time'])
    expect(Object.getPrototypeOf(mat.uniforms)).toBeNull()
  })
})

describe('useMesh', () => {
  it('keeps the concrete material on the mesh', () => {
    const material = useStandardMaterial(0xff0000)
    expect(useMesh(useBox([1, 1, 1]), material).material).toBe(material)
  })
})

describe('v3', () => {
  it('builds a Vector3 from a tuple, scalars or nothing', () => {
    expect(v3([1, 2, 3]).toArray()).toEqual([1, 2, 3])
    expect(v3(1, 2, 3).toArray()).toEqual([1, 2, 3])
    expect(v3().toArray()).toEqual([0, 0, 0])
  })
})

/**
 * start3dSketch only touches time/animated and the rAF globals, so a stubbed
 * params bag is enough - no WebGL context needed.
 */
const stubParams = (animated: boolean) =>
  ({ time: 0, dt: 0, animated }) as unknown as Sketchy3DParams

describe('start3dSketch', () => {
  it('renders exactly one frame when animate is false', () => {
    const raf = vi.fn()
    vi.stubGlobal('requestAnimationFrame', raf)

    const frame = vi.fn()
    start3dSketch(() => frame, stubParams(false))

    expect(frame).toHaveBeenCalledTimes(1)
    expect(raf).not.toHaveBeenCalled()
    vi.unstubAllGlobals()
  })

  it('stops scheduling frames once the returned stop is called', () => {
    let queued: (() => void) | null = null
    const raf = vi.fn((cb: () => void) => {
      queued = cb
      return 1
    })
    const cancel = vi.fn()
    vi.stubGlobal('requestAnimationFrame', raf)
    vi.stubGlobal('cancelAnimationFrame', cancel)

    const frame = vi.fn()
    const stop = start3dSketch(() => frame, stubParams(true))

    expect(frame).toHaveBeenCalledTimes(1)
    expect(raf).toHaveBeenCalledTimes(1)

    stop()
    expect(cancel).toHaveBeenCalledWith(1)

    // an already-scheduled callback may still fire; it must not re-queue
    queued?.()
    expect(raf).toHaveBeenCalledTimes(1)

    vi.unstubAllGlobals()
  })
})
