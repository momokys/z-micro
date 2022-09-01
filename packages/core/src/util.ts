import { cssSelectorMap } from './common'
import { AppDocument } from './micro'

/**
 * 样式元素的css变量处理
 */
export function handleStylesheetElementPatch(stylesheetElement: HTMLStyleElement, _document: AppDocument) {
  if (!stylesheetElement.innerHTML) return
  const [hostStyleSheetElement, fontStyleSheetElement] = getPatchStyleElements([stylesheetElement.sheet!])
  if (hostStyleSheetElement) {
    _document.head.appendChild(hostStyleSheetElement)
  }
  if (fontStyleSheetElement) {
    _document.host.appendChild(fontStyleSheetElement)
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

const windowConstructorCache = new WeakSet()
export function isConstructor(ctr: any) {
  if (windowConstructorCache.has(ctr)) return true
  if (ctr.prototype && Object.getOwnPropertyNames(ctr.prototype).length > 0 && ctr.prototype.constructor !== ctr) {
    windowConstructorCache.add(ctr)
    return true
  }
  const str = ctr.toString()
  if (/^class\b/.test(str) || /^function\b\s[A-Z].*/.test(str)) {
    windowConstructorCache.add(ctr)
    return true
  }
  return false
}
