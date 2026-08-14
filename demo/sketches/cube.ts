import { Vector3 } from 'three'
import {
  create3dSketch,
  useAmbient,
  useBox,
  useLight,
  useShader,
  useShaderMesh,
} from '@dank-inc/sketchy-3d'

export default create3dSketch(({ scene, camera, renderer }) => {
  scene.add(useAmbient())
  scene.add(useLight(0xffffff, 0.4, [-1, 1, -1]))

  camera.position.y = 0
  camera.lookAt(new Vector3())

  const creator = new URLSearchParams(window.location.search).get('creator')
  const viewer = new URLSearchParams(window.location.search).get('viewer')
  const addr = 'tz1SLpSREWeSSdHhMTVgt1ygi9pkgeBZFGRG'

  const s = 6

  const mesh = useShaderMesh(
    useBox([s, s, s]),
    useShader({ frag, vert }, [['time', 0]]),
  )
  scene.add(mesh)

  return ({ time, dt }) => {
    mesh.rotation.y += dt * 0.5

    mesh.material.uniforms.time.value = time

    renderer.render(scene, camera)
  }
})

const vert = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xyz, 1.0);
}
`

const frag = `
varying vec2 vUv;
uniform float time;
void main() {

  float d = distance(sin(time + vUv.x * 4.0), vUv.y);

  float t = mod(time + d * 2.0, 1.0);
  vec3 fragColor = vec3(t);

  gl_FragColor = vec4(fragColor, 0.1);
}
`
