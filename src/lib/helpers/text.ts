import { Font, FontLoader, TextGeometry } from 'three/examples/jsm/Addons.js'

/** three's stock font. The package does not ship it - host it yourself. */
export const DEFAULT_FONT_URL = '/fonts/helvetiker_regular.typeface.json'

// One in-flight request per URL, so N labels cost one fetch, not N.
const fonts = new Map<string, Promise<Font>>()

const loadFont = (url: string) => {
  const cached = fonts.get(url)
  if (cached) return cached

  const pending = new FontLoader().loadAsync(url).catch((err: unknown) => {
    // A 404 lands here as a JSON parse error, which says nothing useful.
    fonts.delete(url)
    throw new Error(
      `[sketchy-3d] could not load font '${url}'. sketchy-3d does not ship a font: serve one from your own public dir or pass options.font. (${err})`,
    )
  })

  fonts.set(url, pending)
  return pending
}

export type TextOptions = {
  size: number
  /** A preloaded Font, or a URL to load one from. Defaults to DEFAULT_FONT_URL. */
  font?: Font | string
}

export const useText = async (phrase: string, options: TextOptions) => {
  const { font: source = DEFAULT_FONT_URL } = options
  const font = typeof source === 'string' ? await loadFont(source) : source

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
