import { describe, expect, it } from 'vitest'
import { validateSvgMarkup, isSvgUpload } from '@/features/assets/svg-upload'
import { parseSvgElement, applyColorMap, elementColors } from '@/vendor/doory/editor/engine/objects/elements'
import { serializeObject } from '@/vendor/doory/editor/engine/serialization'
import { studioObjectsSchema } from '@/core/document/studio-schema'
import { elementColors as serializedColors } from '@/vendor/doory/editor/toolbar/kinds'

const artwork = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 180"><rect width="240" height="180" rx="16" fill="#f5e9cf"/><path d="M120 20L160 145H80Z" fill="#304b36" stroke="#ed8d54" stroke-width="8"/></svg>'

describe('editable uploaded SVG artwork', () => {
  it('retains geometry, background fill and strokes as recolorable vector objects', async () => {
    const { object } = await parseSvgElement(validateSvgMarkup(artwork))
    expect(elementColors(object)).toEqual(expect.arrayContaining(['#f5e9cf', '#304b36', '#ed8d54']))
    applyColorMap(object, { '#f5e9cf': '#ffffff', '#304b36': '#a71967' })
    object.set('backgroundColor', '#99ccff')
    const stored = serializeObject(object)
    expect(studioObjectsSchema.safeParse([stored]).success).toBe(true)
    expect(stored.backgroundColor).toBe('#99ccff')
    expect(stored.colorMap).toEqual({ '#f5e9cf': '#ffffff', '#304b36': '#a71967' })
    expect(serializedColors(stored)).toHaveLength(3)
    applyColorMap(object, undefined)
    expect(serializeObject(object).colorMap).toBeUndefined()
  })

  it('accepts internal gradients and SVG files without a MIME type', () => {
    expect(isSvgUpload(new File([artwork], 'shape.SVG'))).toBe(true)
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g"><stop offset="0" stop-color="red"/><stop offset="1" stop-color="blue"/></linearGradient></defs><rect width="50" height="50" fill="url(#g)"/></svg>'
    expect(validateSvgMarkup(svg)).toContain('url(#g)')
  })

  it.each([
    '<script>alert(1)</script>',
    '<foreignObject><div>HTML</div></foreignObject>',
    '<image href="https://example.com/track.png"/>',
    '<rect width="20" height="20" onload="alert(1)"/>',
    '<style>@import "https://example.com/style.css";</style>',
    '<rect fill="url(https://example.com/image.svg#g)"/>',
    '<g id="repeat"><use href="#repeat"/></g>',
  ])('rejects active or remotely linked SVG content: %s', content => {
    expect(() => validateSvgMarkup(`<svg xmlns="http://www.w3.org/2000/svg">${content}</svg>`)).toThrow()
  })

  it('rejects malformed and oversized vectors before canvas parsing', () => {
    expect(() => validateSvgMarkup('<svg>')).toThrow('valid SVG')
    expect(() => validateSvgMarkup(' '.repeat(2 * 1024 * 1024 + 1))).toThrow('2 MB')
  })

  it('makes every original color available, including artwork with more than eight colors', () => {
    const colors = Array.from({ length: 12 }, (_, i) => `#${i.toString(16).padStart(6, '0')}`)
    expect(serializedColors({ objects: colors.map(origFill => ({ origFill })) })).toEqual(colors)
  })
})
