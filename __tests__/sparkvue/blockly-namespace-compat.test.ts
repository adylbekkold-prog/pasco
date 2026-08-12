const HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml'
const SVG_NAMESPACE = 'http://www.w3.org/2000/svg'
const XLINK_NAMESPACE = 'http://www.w3.org/1999/xlink'

describe('SPARKvue Blockly namespace compatibility', () => {
  const originalCreateElementNS = document.createElementNS
  const originalSetAttributeNS = Element.prototype.setAttributeNS

  afterEach(() => {
    document.createElementNS = originalCreateElementNS
    Element.prototype.setAttributeNS = originalSetAttributeNS
    jest.resetModules()
  })

  it('creates SVG and HTML elements in their proper namespaces', async () => {
    await jest.isolateModulesAsync(async () => {
      // @ts-expect-error side-effect import of a classic script
      await import('../../sparkvue-pwa/javascripts/blockly-namespace-compat.js')
    })

    const rectangle = document.createElementNS('', 'rect') as SVGElement
    const textarea = document.createElementNS('', 'textarea')

    expect(rectangle.namespaceURI).toBe(SVG_NAMESPACE)
    expect(rectangle.style).toBeDefined()
    expect(textarea.namespaceURI).toBe(HTML_NAMESPACE)
  })

  it('repairs empty xlink namespaces used by Blockly images', async () => {
    await jest.isolateModulesAsync(async () => {
      // @ts-expect-error side-effect import of a classic script
      await import('../../sparkvue-pwa/javascripts/blockly-namespace-compat.js')
    })

    const image = document.createElementNS(SVG_NAMESPACE, 'image')
    image.setAttributeNS('', 'xlink:href', '/sparkvue/images/icon.svg')

    expect(image.getAttributeNS(XLINK_NAMESPACE, 'href')).toBe('/sparkvue/images/icon.svg')
  })
})
