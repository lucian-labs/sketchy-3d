import {
  create3dSketch,
  createParams,
  useLight,
  useMesh,
  useStandardMaterial,
  useBox,
  useAmbient,
  start3dSketch,
  useOrthographicCamera,
  OrthographicCameraBounds,
  useText,
} from '../src/lib'

import { SuperMouse } from '@dank-inc/super-mouse'

const params = createParams({
  element: document.getElementById('root')!,
  // dimensions: [600, 600],
  animate: true,
  background: [0x000000, 1],
})

const sketch = create3dSketch(
  ({ scene, camera, renderer, PI, TAU, container, sin, cos }) => {
    // Z is UP

    const ambient = useAmbient(0xffffff, 0)
    scene.add(ambient)

    const light = useLight(0xffffff, 1, [1, 1, 1])
    scene.add(light)

    const box = useMesh(useBox([3, 3, 3]), useStandardMaterial(0xffff00))
    box.position.set(0, 0, 0)
    box.rotation.x = TAU * 0.125
    scene.add(box)

    light.lookAt(box.position)

    const data = {
      clicked: false,
    }

    scene.remove(camera)

    const bounds: OrthographicCameraBounds = [-5, 5, 5, -5]

    camera = useOrthographicCamera(bounds)
    camera.position.set(0, 10, 0)
    camera.lookAt(box.position)
    scene.add(camera)

    const mouse = new SuperMouse({ element: container, scrollScale: 0.001 })
    mouse.onScroll = (e) => {
      e.stopPropagation()

      const deltaY = e.deltaY

      box.rotation.y -= deltaY
    }
    mouse.onClick = (e) => {
      e.stopPropagation()

      data.clicked = !data.clicked
      box.rotation.x += PI * 0.25
    }

    return ({ time, dt }) => {
      box.rotation.y += dt * 0.5
      box.position.y = 1 + Math.sin(time) * 1

      box.rotation.y += mouse.scrollInertia * 0.0001
      box.rotation.y += dt

      if (mouse.scrollInertia >= 0) {
        light.color.set(0xffffff)
        light.intensity = 1 + mouse.scrollInertia * 0.01
        ambient.intensity = 0 + mouse.scrollInertia * 0.0001
        box.scale.set(
          1 + mouse.scrollInertia * 0.002,
          1, // + mouse.scrollInertia * 0.001,
          1 + mouse.scrollInertia * 0.002,
        )
      } else {
        light.color.set(0xff0000)
        box.scale.y = 1 + mouse.scrollInertia * 0.001
        ambient.intensity = sin(time, 1, 0.2, 0.5)
      }

      light.lookAt(box.position)
      mouse.update()
      renderer.render(scene, camera)
    }
  },
)

start3dSketch(sketch, params)
