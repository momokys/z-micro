import { Sandbox } from './sandbox'
import { loader } from './loader'
import { documentProxyProperties, rawAppendChild } from './common'
import { handleStylesheetElementPatch } from './util'

export class MicroApp extends HTMLElement {
  public name: string
  public host: string
  public uri: string
  public keepAlive = true
  private _active: boolean
  private _sandbox?: Sandbox
  private _shadowRoot?: ShadowRoot & { head: HTMLHeadElement; body: HTMLBodyElement }

  static get observedAttributes() {
    return ['name', 'host', 'uri', 'keepAlive']
  }

  constructor() {
    super()
    this.name = this.getAttribute('name') ?? ''
    this.host = this.getAttribute('host') ?? ''
    this.uri = this.getAttribute('uri') ?? ''
    this._active = false
  }

  connectedCallback() {
    ;(async () => {
      this.createShadow()
      await this.createSandbox()
      this.link()
      const { template, scripts } = await loader(this.host, this.uri)
      this.renderTemplateToShadow(template)
      this._sandbox?.execScripts(scripts)
    })()
  }

  attributeChangedCallback(name: string, oldVal: any, newVal: any) {
    // @ts-ignore
    this[name] = newVal
    this.setAttribute(name, newVal)
  }

  private createShadow() {
    this._shadowRoot = this.attachShadow({ mode: 'open' }) as any
  }

  private async createSandbox() {
    const sandbox = new Sandbox(this.name)
    await sandbox.init(this.host, this.uri)
    this._sandbox = sandbox
  }

  private renderTemplateToShadow(template: string) {
    const document = this._sandbox!.iframe!.contentDocument!
    const html = document.createElement('html')
    html.innerHTML = template
      .replace(/<!--([\s\S]*?)-->/g, '')
      .replace(/(<script.*?\/?>(?:[\s\S]*?<\/script>)?)/g, '<!-- $1 -->')
    this._shadowRoot!.appendChild(html)
    // @ts-ignore
    this._shadowRoot!.head = this._shadowRoot?.querySelector('head')
    // @ts-ignore
    this._shadowRoot!.body = this._shadowRoot?.querySelector('body')

    this.patch()
  }

  private link() {
    const shadowRoot = this._shadowRoot!
    const sandboxWindow = this._sandbox!.sandboxWindow
    const proxyDocument = this.proxy().proxyDocument

    sandboxWindow.window.Document.prototype.addEventListener = function (
      type: string,
      handler: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions,
    ): void {
      shadowRoot.addEventListener(type, handler, options)
    }

    const { modifyProperties, shadowProperties, shadowMethods, documentProperties, documentMethods, ownerProperties } =
      documentProxyProperties
    modifyProperties.concat(shadowProperties, shadowMethods, documentProperties, documentMethods).forEach((propKey) => {
      const descriptor = Object.getOwnPropertyDescriptor(sandboxWindow.window.Document.prototype, propKey) || {
        enumerable: true,
        writable: true,
      }
      try {
        Object.defineProperty(sandboxWindow.window.Document.prototype, propKey, {
          enumerable: descriptor.enumerable,
          configurable: true,
          // @ts-ignore
          get: () => proxyDocument[propKey],
          set: undefined,
        })
      } catch (e) {
        console.error(e)
      }
    })

    ownerProperties.forEach((propKey) => {
      Object.defineProperty<Document>(sandboxWindow.document, propKey, {
        enumerable: true,
        configurable: true,
        // @ts-ignore
        get: () => proxyDocument[propKey],
        set: undefined,
      })
    })
  }

  private proxy() {
    const sandboxDocument = this._sandbox!.sandboxDocument
    const sandboxWindow = this._sandbox!.sandboxWindow
    const shadowRoot = this._shadowRoot!
    const proxyDocument = new Proxy<Document | ShadowRoot>({} as Document | ShadowRoot, {
      // eslint-disable-next-line @typescript-eslint/ban-types
      get(target: {}, p: string | symbol): any {
        if (['createElement', 'createTextNode'].includes(p as any)) {
          // @ts-ignore
          return new Proxy(window.document[p], {
            apply(target: any, _ctx: any, args: any[]): any {
              const element = target.apply(sandboxDocument, args)
              Object.defineProperty(element, 'ownerDocument', {
                configurable: true,
                get: () => sandboxWindow.document,
              })
              return element
            },
          })
        }
        if (
          p === 'getElementsByTagName' ||
          p === 'getElementsByClassName' ||
          p === 'getElementsByName' ||
          p === 'getElementById'
        ) {
          return new Proxy(shadowRoot.querySelectorAll, {
            apply(querySelectorAll, _ctx, args) {
              let arg = args[0]
              if (p === 'getElementsByTagName' && arg === 'script') {
                return sandboxDocument.querySelectorAll('script')
              }
              if (p === 'getElementsByClassName') arg = '.' + arg
              if (p === 'getElementsByName') arg = `[name="${arg}"]`
              if (p === 'getElementById') arg = `[id="${args[0]}"]`
              return querySelectorAll.call(shadowRoot, arg)
            },
          })
        }
        if (p === 'querySelector' || p === 'querySelectorAll') {
          return shadowRoot[p].bind(shadowRoot)
        }
        if (p === 'documentElement' || p === 'scrollingElement') return shadowRoot.firstElementChild
        if (p === 'forms') return shadowRoot.querySelectorAll('form')
        if (p === 'images') return shadowRoot.querySelectorAll('img')
        if (p === 'links') return shadowRoot.querySelectorAll('a')
        // @ts-ignore
        return shadowRoot[p]
      },
    })
    return {
      proxyDocument,
    }
  }

  private patch() {
    const shadowRoot = this._shadowRoot!
    shadowRoot.head.appendChild = function <T extends Node>(node: T) {
      const tagName = ((node as any).tagName ?? '').toUpperCase()
      if (!['LINK', 'STYLE', 'SCRIPT', 'IFRAME'].includes(tagName)) {
        return rawAppendChild.call(this, node) as T
      }
      const res = rawAppendChild.call(this, node)
      switch (tagName) {
        case 'STYLE':
          handleStylesheetElementPatch(node as unknown as HTMLStyleElement, shadowRoot)
          break
        default:
      }
      return res as T
      // return rawAppendChild.call(this, newChild)
    }
  }

  public active() {
    this._active = true
  }

  public sleep() {
    this._active = false
  }

  public isActive() {
    return this._active
  }
}

export const defineMicroApp = () => {
  window.customElements.define('micro-app', MicroApp)
}
