import { App } from './model'
import { rawDocumentQuerySelector } from './common'
import { isConstructor, getAbsolutePath } from './util'
import { createScheduler } from './scheduler'

export class Sandbox {
  /**
   * 需要代理到基座应用的 window 属性
   * @private
   */
  private static PROXY_APP_WINDOW_PROPERTIES: any[] = [
    'getComputedStyle',
    'visualViewport',
    'matchMedia',
    'DOMParser',
    'MouseEvent',
    'FocusEvent',
    'SubmitEvent',
    'UIEvent',
    'AnimationEvent',
    'DragEvent',
  ]
  /**
   * 需要代理到基座应用的 document 属性
   * @private
   */
  private static PROXY_APP_DOCUMENT_PROPERTIES: any[] = [
    // 根元素代理到子应用的 document
    'documentElement',
    'scrollingElement',
    // ownerDocument 代理到子应用 document
    'createElement',
    'createTextNode',
    // 获取元素方法代理到子应用 document
    'getElementsByTagName',
    'getElementsByClassName',
    'getElementsByName',
    'getElementById',
    'querySelector',
    'querySelectorAll',
    'forms',
    'images',
    'links',
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
        const scriptEl = document.createElement('script')
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
    const proxyDocument = this.generateProxyDocument()

    sandboxWindow.window.Document.prototype.addEventListener = function (
      type: string,
      handler: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions,
    ): void {
      app.document.addEventListener(type, handler, options)
    }

    Sandbox.PROXY_APP_DOCUMENT_PROPERTIES.forEach((key) => {
      const descriptor = Object.getOwnPropertyDescriptor(sandboxWindow.window.Document.prototype, key) || {
        enumerable: true,
        writable: true,
      }
      Object.defineProperty(sandboxWindow.window.Document.prototype, key, {
        enumerable: descriptor.enumerable,
        configurable: true,
        set: undefined,
        // @ts-ignore
        get: () => proxyDocument[key],
      })
    })
    ;['head', 'body'].forEach((key) => {
      Object.defineProperty<Document>(sandboxWindow.document, key, {
        enumerable: true,
        configurable: true,
        set: undefined,
        // @ts-ignore
        get: () => proxyDocument[key],
      })
    })
  }

  /**
   * 生成代理 document
   * @private
   */
  private generateProxyDocument() {
    const app = this.app
    const sandboxDocument = this.iframe.contentDocument!
    return new Proxy<Document | ShadowRoot>({} as Document | ShadowRoot, {
      get(target: Document | ShadowRoot, key: string): any {
        // ownerDocument 链接到子应用的 document
        if (['createElement', 'createTextNode'].includes(key)) {
          // @ts-ignore
          return new Proxy(window.document[key], {
            apply(target: any, _ctx: any, args: any[]): any {
              const element = target.apply(sandboxDocument, args)
              Object.defineProperty(element, 'ownerDocument', {
                configurable: true,
                get: () => sandboxDocument,
              })
              return element
            },
          })
        }
        if (
          [
            'getElementsByTagName',
            'getElementsByClassName',
            'getElementsByName',
            'getElementById',
            'querySelector',
            'querySelectorAll',
          ].includes(key)
        ) {
          // @ts-ignore
          return new Proxy(app.document[key], {
            apply(target, _ctx, args) {
              const arg = args[0]
              const flag =
                (key === 'getElementsByTagName' && arg === 'script') ||
                (key === 'querySelector' && arg === 'script') ||
                (key === 'querySelectorAll' && arg === 'script')
              _ctx = flag ? sandboxDocument : app.document
              return target.call(_ctx, args)
            },
          })
        }
        if (['documentElement', 'scrollingElement'].includes(key)) {
          return app.document.firstElementChild
        }
        if (key === 'forms') return app.document.querySelectorAll('form')
        if (key === 'images') return app.document.querySelectorAll('img')
        if (key === 'links') return app.document.querySelectorAll('a')
        // @ts-ignore
        return app.document[key]
      },
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

    const desc = Object.getOwnPropertyDescriptor(sandboxWindow.window, 'history')!
    Object.defineProperty(sandboxWindow.window, 'history', {
      enumerable: desc.enumerable,
      configurable: true,
      set: undefined,
      get(): any {
        return window.history
      }
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
