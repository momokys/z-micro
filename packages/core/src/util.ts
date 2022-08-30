export function patchRelativeURL(
  target: Window,
  elementCtr:
    | typeof HTMLImageElement
    | typeof HTMLAnchorElement
    | typeof HTMLSourceElement
    | typeof HTMLLinkElement
    | typeof HTMLScriptElement,
  attr: any,
) {
  const rawElementSetAttribute = target.window.Element.prototype.setAttribute
  elementCtr.prototype.setAttribute = function (name: string, value: string): void {
    let targetValue = value
    if (name === attr) targetValue = getAbsolutePath(value, this.baseURI || '')
    rawElementSetAttribute.call(this, name, targetValue)
  }

  const rawAnchorElementHrefDescriptor = Object.getOwnPropertyDescriptor(elementCtr.prototype, attr)
  // @ts-ignore
  const { enumerable, configurable, get, set } = rawAnchorElementHrefDescriptor
  Object.defineProperty(elementCtr.prototype, attr, {
    enumerable,
    configurable,
    get: function () {
      return get.call(this)
    },
    set: function (href) {
      console.log(this.baseURI)
      set.call(this, getAbsolutePath(href, this.baseURI))
    },
  })
}

export function getAbsolutePath(url: string, base: string) {
  return new URL(url, base).href
}
