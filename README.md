# Sketchy3D

**[Live demo →](https://sketchy-3d.lucianlabs.ca)** · [npm](https://www.npmjs.com/package/@dank-inc/sketchy-3d) · [all packages](https://lucianlabs.ca/packages/)

[![npm version](https://badge.fury.io/js/@dank-inc%2Fsketchy-3d.svg)](https://badge.fury.io/js/@dank-inc%2Fsketchy-3d)

A threejs typescript wrapper built around @dank-inc/sketchy!

Build by and for creative coders!

why? because I love threejs and I'm lazy!

"Work smarter, not hearter!"

## Install

```sh
npm i @dank-inc/sketchy-3d three
```

`three` is a peer dependency, so you own the version. ESM only.

## Use

```ts
import {
  createParams,
  create3dSketch,
  start3dSketch,
  useBox,
  useMesh,
  useStandardMaterial,
  useLight,
} from '@dank-inc/sketchy-3d'

const sketch = create3dSketch(({ scene }) => {
  const mesh = useMesh(useBox([1, 1, 1]), useStandardMaterial(0x8c2ebf))
  scene.add(mesh)
  scene.add(useLight(0xffffff, 1.1))

  // the returned closure is your frame - you call render
  return ({ time, renderer, scene, camera }) => {
    mesh.rotation.y = time
    renderer.render(scene, camera)
  }
})

const stop = start3dSketch(sketch, createParams({ containerId: 'root' }))
```

Things worth knowing:

- **Give the container a size.** `createParams` measures `clientWidth`/`clientHeight`; a bare `<div id="root">` measures 0 and you get a blank page. Set CSS, or pass `dimensions: [w, h]`.
- **`start3dSketch` returns a stop function.** Call it in a React cleanup / on route change. Pass `animate: false` to render exactly one frame.
- **One sketch per `createParams`.** Each call builds a WebGL context and browsers cap those around 8-16 per page.
- **`useSphere` tuples are three's own `(radius, widthSegments, heightSegments)`**, not a size. `useSphere(1)` is the sane call.
- **`useText` needs a font you host.** It defaults to `/fonts/helvetiker_regular.typeface.json` from your own public dir; pass `{ font }` with a URL or a preloaded `Font` instead.

## TODO

- lots of stuff
- ResizeObserver on the container (canvas is frozen at its initial size)
