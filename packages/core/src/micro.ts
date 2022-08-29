import { Sandbox } from './sandbox'
import { loader } from './loader'

// export type MicroAppOptions = {
//   name: string
//   host: string
//   uri: string
//   keepAlive: boolean
// }

export class MicroApp extends HTMLElement {
  // @ts-ignore
  private _name = ''
  // @ts-ignore
  private _host: string
  // @ts-ignore
  private _uri: string
  // @ts-ignore
  private _keepAlive = true
  // @ts-ignore
  private _isActive = false
  private _sandbox?: Sandbox
  // @ts-ignore
  private _shadowRoot?: ShadowRoot

  static get observedAttributes() {
    return ['name', 'host', 'uri', 'keepAlive']
  }

  constructor() {
    super()
    this.name = this.getAttribute('name') ?? ''
    this.host = this.getAttribute('host') ?? ''
    this.uri = this.getAttribute('uri') ?? ''
    console.log(this)
  }

  connectedCallback() {
    ;(async () => {
      this.createShadow()
      await this.createSandbox()
    })()
  }

  attributeChangedCallback(name: string, oldVal: any, newVal: any) {
    console.log(name)
    // @ts-ignore
    this[name] = newVal
    this.setAttribute(name, newVal)
  }

  public createShadow() {
    this._shadowRoot = this.attachShadow({ mode: 'open' })
  }

  public async createSandbox() {
    const sandbox = new Sandbox(this.name, this.host, this.uri)
    const iframe = sandbox.iframe
    await Sandbox.waitIframeLoad(iframe)
    const iframeWindow = iframe.contentWindow!
    const iframeDocument = iframe.contentDocument!
    const shadowRoot = this._shadowRoot!

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const proxyDocument = new Proxy<Document | ShadowRoot>({} as Document | ShadowRoot, {
      // eslint-disable-next-line @typescript-eslint/ban-types
      get(target: {}, p: string | symbol): any {
        if (['createElement', 'createTextNode'].includes(p as any)) {
          // @ts-ignore
          return new Proxy(window.document[p], {
            apply(target: any, _ctx: any, args: any[]): any {
              return target.apply(iframeDocument, args)
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
                return iframeDocument.querySelectorAll('script')
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
    console.log(iframeWindow.document)
    const shadowMethods = [
      'append',
      'contains',
      'getSelection',
      'elementFromPoint',
      'elementsFromPoint',
      'getAnimations',
      'replaceChildren',
    ]
    shadowMethods.forEach((key) => {
      Object.defineProperty(iframeWindow.document, key, {
        enumerable: true,
        configurable: true,
        // @ts-ignore
        get: () => {
          console.log(key)
          // @ts-ignore
          return proxyDocument[key]
        },
      })
    })

    const { scripts } = await loader(this.host, this.uri)
    await sandbox.execScripts(scripts)
  }

  public active() {
    this._isActive = true
  }

  public sleep() {
    this._isActive = false
  }

  public isActive() {
    return this._isActive
  }

  get name(): string {
    return this._name
  }

  set name(value: string) {
    this._name = value
  }

  get host(): string {
    return this._host
  }

  set host(value: string) {
    this._host = value
  }

  get uri(): string {
    return this._uri
  }

  set uri(value: string) {
    this._uri = value
  }

  get keepAlive(): boolean {
    return this._keepAlive
  }

  set keepAlive(value: boolean) {
    this._keepAlive = value
  }
}

export const defineMicroApp = () => {
  window.customElements.define('micro-app', MicroApp)
}
