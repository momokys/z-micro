import { App } from './model'
import { rawDocumentQuerySelector } from './common'
import { isConstructor, getAbsolutePath } from './util'
import { createScheduler } from './scheduler'

export class Sandbox {
  /**
   * 需要代理到基座应用的 window 属性
   * @private
   */
  private static PROXY_APP_WINDOW_PROPERTIES: any[] = ['getComputedStyle', 'visualViewport', 'matchMedia', 'DOMParser']
  private static PROXY_APP_DOCUMENT_PROPERTIES: any[] = [
    'createElement',
    'createTextNode',
    'implementation',
    'documentElement',
    'querySelector',
  ]
  /**
   * 子应用对象
   */
  public app: App
  /**
   * 沙箱载体
   */
  public iframe: HTMLIFrameElement

  constructor(app: App) {
    this.app = app
    this.iframe = this.createIframe()
  }

  public async execScripts(scripts: { src?: string; type?: string; code?: string }[]) {
    const scheduler = createScheduler()
    scripts.forEach((script) => {
      scheduler(() => {
        const scriptEl = this.iframe.contentDocument!.createElement('script')
        const attr = { ...script, style: 'display: none' }
        Object.entries(attr).forEach(([key, value]) => {
          scriptEl.setAttribute(key, value)
        })
        const head = rawDocumentQuerySelector.call(this.iframe.contentWindow!.document, 'head')!
        head.appendChild(scriptEl)
      })
    })
  }

  public async init() {
    await this.waitIframeLoad()
    this.patch()
    this.initIframe()
  }

  /**
   * 链接子应用
   */
  public link() {
    const app = this.app
    const sandboxWindow = this.iframe.contentWindow!

    sandboxWindow.window.Document.prototype.addEventListener = function (
      type: string,
      handler: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions,
    ): void {
      app.document.addEventListener(type, handler, options)
    }

    Sandbox.PROXY_APP_DOCUMENT_PROPERTIES.forEach(key => {
      const descriptor = Object.getOwnPropertyDescriptor(sandboxWindow.window.Document.prototype, key) || {
        enumerable: true,
        writable: true,
      }

      if (['createElement', 'createText'].includes(key)) {

      }
    })
  }
  /**
   * 打补丁
   * @private
   */
  private patch() {
    this.proxyIframeWindowToMainApp()
    this.patchRelativeURL()
  }
  /**
   * 将 iframe 的 window 代理到基座应用
   * @private
   */
  private proxyIframeWindowToMainApp() {
    const sandboxWindow = this.iframe.contentWindow!
    Sandbox.PROXY_APP_WINDOW_PROPERTIES.forEach((key) => {
      const value = window[key]
      Object.defineProperty(sandboxWindow, key, {
        get(): any {
          if (typeof value === 'function' && !isConstructor(value)) {
            // @ts-ignore
            return value.bind(window)
          } else {
            return value
          }
        },
      })
    })
  }
  /**
   * 修复元素引用资源时 404 问题
   * @private
   */
  private patchRelativeURL() {
    this.rewriteElementURL(this.iframe.contentWindow!.window.HTMLImageElement, 'src')
    this.rewriteElementURL(this.iframe.contentWindow!.window.HTMLAnchorElement, 'href')
    this.rewriteElementURL(this.iframe.contentWindow!.window.HTMLSourceElement, 'src')
    this.rewriteElementURL(this.iframe.contentWindow!.window.HTMLLinkElement, 'href')
    this.rewriteElementURL(this.iframe.contentWindow!.window.HTMLScriptElement, 'src')
  }
  /**
   * 重写元素引用资源URL的属性，如：href、src
   * @param elementCtr 元素构造函数
   * @param urlAttr 引用资源属性
   * @private
   */
  private rewriteElementURL(
    elementCtr:
      | typeof HTMLImageElement
      | typeof HTMLAnchorElement
      | typeof HTMLSourceElement
      | typeof HTMLLinkElement
      | typeof HTMLScriptElement,
    urlAttr: string,
  ) {
    // 重写设置资源 URL 为绝对 URL
    const rawElementSetAttribute = this.iframe.contentWindow!.window.Element.prototype.setAttribute
    elementCtr.prototype.setAttribute = function (name: string, value: string): void {
      if (name === urlAttr) {
        rawElementSetAttribute.call(this, name, getAbsolutePath(value, this.baseURI ?? ''))
      }
    }

    // 重写元素 URL 属性的读写
    const rawAnchorElementHrefDescriptor = Object.getOwnPropertyDescriptor(elementCtr.prototype, urlAttr)!
    const { enumerable, configurable, get, set } = rawAnchorElementHrefDescriptor
    Object.defineProperty(elementCtr.prototype, urlAttr, {
      enumerable,
      configurable,
      get: function () {
        return get!.call(this)
      },
      set: function (href) {
        set!.call(this, getAbsolutePath(href, this.baseURI))
      },
    })
  }
  /**
   * 创建 iframe
   * @private
   */
  private createIframe() {
    const iframe = window.document.createElement('iframe')
    const attr = {
      style: 'display: none',
      src: `${window.location.protocol}//${window.location.host}`,
      name: this.app.name,
    }
    Object.entries(attr).forEach(([key, value]) => {
      iframe.setAttribute(key, value)
    })
    window.document.body.appendChild(iframe)
    return iframe
  }
  /**
   * 初始化 iframe 的 DOM 结构
   * @private
   */
  private initIframe() {
    const sandboxDocument = this.iframe.contentDocument!
    if (sandboxDocument.firstChild) {
      sandboxDocument.removeChild(sandboxDocument.firstChild)
    }
    const html = sandboxDocument.createElement('html')
    // TODO 修复 append 报错，待优化
    if (sandboxDocument.firstElementChild) {
      sandboxDocument.firstElementChild.appendChild(html)
    } else {
      sandboxDocument.append(html)
    }
    html.innerHTML = `
<head>
  <base href="${this.getURL()}">
  <title></title>
</head>
<body>
</body>
    `
  }
  /**
   * 等待 iframe 初次加载完成
   * @private
   */
  private async waitIframeLoad() {
    const iframe = this.iframe
    return new Promise<void>((resolve) => {
      const loop = () => {
        setTimeout(() => {
          if (iframe.contentWindow!.location.href === 'about:blank') {
            loop()
          } else {
            iframe.contentWindow!.stop()
            resolve()
          }
        }, 0)
      }
      loop()
    })
  }
  /**
   * 获取子应用 URL
   * @private
   */
  private getURL() {
    return this.app.host + this.app.uri
  }
}
