import { cssSelectorMap } from './common'

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

/**
 * 样式元素的css变量处理
 */
export function handleStylesheetElementPatch(
  stylesheetElement: HTMLStyleElement,
  shadowRoot: ShadowRoot & { head: HTMLHeadElement },
) {
  if (!stylesheetElement.innerHTML) return
  // @ts-ignore
  const [hostStyleSheetElement, fontStyleSheetElement] = getPatchStyleElements([stylesheetElement.sheet])
  if (hostStyleSheetElement) {
    shadowRoot.head.appendChild(hostStyleSheetElement)
  }
  if (fontStyleSheetElement) {
    shadowRoot.host.appendChild(fontStyleSheetElement)
  }
}

/**
 * 获取修复好的样式元素
 * 主要是针对对root样式和font-face样式
 */
export function getPatchStyleElements(rootStyleSheets: Array<CSSStyleSheet>): Array<HTMLStyleElement | null> {
  const rootCssRules = []
  const fontCssRules = []
  const rootStyleReg = /:root/g

  // 找出root的cssRules
  for (let i = 0; i < rootStyleSheets.length; i++) {
    const cssRules = rootStyleSheets[i]?.cssRules ?? []
    for (let j = 0; j < cssRules.length; j++) {
      const cssRuleText = cssRules[j].cssText
      // 如果是root的cssRule
      if (rootStyleReg.test(cssRuleText)) {
        // @ts-ignore
        rootCssRules.push(cssRuleText.replace(rootStyleReg, (match) => cssSelectorMap[match]))
      }
      // 如果是font-face的cssRule
      if (cssRules[j].type === CSSRule.FONT_FACE_RULE) {
        fontCssRules.push(cssRuleText)
      }
    }
  }

  let rootStyleSheetElement = null
  let fontStyleSheetElement = null

  // 复制到host上
  if (rootCssRules.length) {
    rootStyleSheetElement = window.document.createElement('style')
    rootStyleSheetElement.innerHTML = rootCssRules.join('')
  }

  if (fontCssRules.length) {
    fontStyleSheetElement = window.document.createElement('style')
    fontStyleSheetElement.innerHTML = fontCssRules.join('')
  }

  return [rootStyleSheetElement, fontStyleSheetElement]
}

export function getAbsolutePath(url: string, base: string) {
  return new URL(url, base).href
}
