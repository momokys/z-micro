import { Sandbox } from './sandbox'
import { loader } from './loader'
import { documentProxyProperties } from './common'

export class MicroApp extends HTMLElement {
  public name: string
  public host: string
  public uri: string
  public keepAlive = true
  private _template: string
  private _active: boolean
  private _sandbox?: Sandbox
  private _shadowRoot?: ShadowRoot

  static get observedAttributes() {
    return ['name', 'host', 'uri', 'keepAlive']
  }

  constructor() {
    super()
    this.name = this.getAttribute('name') ?? ''
    this.host = this.getAttribute('host') ?? ''
    this.uri = this.getAttribute('uri') ?? ''
    this._template = ''
    this._active = false
  }

  connectedCallback() {
    this.createShadow()
    ;(async () => {
      await this.createSandbox()
      const { template, scripts } = await loader(this.host, this.uri)
      this._template = template
        .replace(/<!--([\s\S]*?)-->/g, '')
        .replace(/(<script.*?\/?>(?:[\s\S]*?<\/script>)?)/g, '<!-- $1 -->')

      const document = this._sandbox!.iframe!.contentDocument!
      const html = document.createElement('html')
      html.innerHTML = this._template
      this._shadowRoot!.appendChild(html)
      // @ts-ignore
      this._shadowRoot!.head = this._shadowRoot?.querySelector('head')
      // @ts-ignore
      this._shadowRoot!.body = this._shadowRoot?.querySelector('body')

      this._sandbox?.execScripts(scripts)
    })()
  }

  attributeChangedCallback(name: string, oldVal: any, newVal: any) {
    // @ts-ignore
    this[name] = newVal
    this.setAttribute(name, newVal)
  }

  public createShadow() {
    this._shadowRoot = this.attachShadow({ mode: 'open' })
  }

  public async createSandbox() {
    const sandbox = new Sandbox(this.name)
    await sandbox.init(this.host, this.uri)
    const sandboxWindow = sandbox.sandboxWindow
    const sandboxDocument = sandbox.sandboxDocument
    const shadowRoot = this._shadowRoot!

    const proxyDocument = new Proxy<Document | ShadowRoot>({} as Document | ShadowRoot, {
      // eslint-disable-next-line @typescript-eslint/ban-types
      get(target: {}, p: string | symbol): any {
        if (['createElement', 'createTextNode'].includes(p as any)) {
          // @ts-ignore
          return new Proxy(window.document[p], {
            apply(target: any, _ctx: any, args: any[]): any {
              return target.apply(sandboxDocument, args)
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

    this._sandbox = sandbox
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
