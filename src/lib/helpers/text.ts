import { FontLoader, TextGeometry } from 'three/examples/jsm/Addons.js'

const loadFont = async () => {
  const loader = new FontLoader()
  const font = await loader.loadAsync('/fonts/helvetiker_regular.typeface.json')
  return font
}

export const useText = async (phrase: string, options: { size: number }) => {
  const font = await loadFont()
  return new TextGeometry(phrase, {
    font,
    size: options.size,
    height: 0.1,
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.02,
    bevelOffset: 0,
  })
}
