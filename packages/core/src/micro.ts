import { App } from './model'
import { Sandbox } from './sandbox'
import { loader } from './loader'
import { rawAppendChild } from './common'
import { handleStylesheetElementPatch } from './util'
import { MicroContainer } from './container'

export type AppDocument = (Omit<ShadowRoot, 'host'> | Omit<Document, 'head' | 'body'>) & {
  host: Element
  html: HTMLHtmlElement
  head: HTMLHeadElement
  body: HTMLBodyElement
}

export class MicroApp extends HTMLElement implements App {
  public name: string
  public host: string
  public uri: string
  public keepAlive = true
  private _active: boolean
  private _sandbox?: Sandbox
  private _document?: AppDocument

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

  attributeChangedCallback(name: string, oldVal: any, newVal: any) {
    // @ts-ignore
    this[name] = newVal
    this.setAttribute(name, newVal)
  }

  connectedCallback() {
    const parent = this.parentElement
    if (!parent || parent.tagName !== 'MICRO-CONTAINER') {
      console.warn('[zan-micro]: ', 'The parent element of micro-app must be micro-container')
    } else {
      this._document = this.attachShadow({ mode: 'open' }) as any
      const container = parent as MicroContainer
      container.setupApp(this)
      ;(async () => {
        this._sandbox = new Sandbox(this)
        await this._sandbox.init()
        this._sandbox.link()
        const { template, scripts } = await loader(this.host, this.uri)
        this.renderTemplateToShadow(template)
        this._sandbox?.execScripts(scripts)
        if (this._document && this._document.html) {
          this._document.html.style.transition = 'all .3s'
          this._document.html.style.display = this._active ? 'block' : 'none'
        }
      })()
    }
  }

  private renderTemplateToShadow(template: string) {
    // const document = this._sandbox!.iframe!.contentDocument!
    const html = document.createElement('html')
    html.innerHTML = template.replace(/<!--([\s\S]*?)-->/g, '').replace(/(<script.*?\/?>(?:[\s\S]*?<\/script>)?)/g, '')

    Array.from(html.querySelectorAll('link')).forEach((link) => {
      const href = link.getAttribute('href')
      if (href) {
        link.setAttribute('href', this.host + href)
      }
    })
    const _document = this._document!
    _document.appendChild(html)
    _document.html = html
    _document.head = _document.querySelector('head')!
    _document.body = _document.querySelector('body')!

    this.patch()
  }

  private patch() {
    const _document = this._document!
    _document.head.appendChild = function <T extends Node>(node: T) {
      const tagName = ((node as any).tagName ?? '').toUpperCase()
      if (!['LINK', 'STYLE', 'SCRIPT', 'IFRAME'].includes(tagName)) {
        return rawAppendChild.call(this, node) as T
      }
      const res = rawAppendChild.call(this, node)
      switch (tagName) {
        case 'STYLE':
          handleStylesheetElementPatch(node as unknown as HTMLStyleElement, _document)
          break
        default:
      }
      return res as T
    }
  }

  public active() {
    if (this._document && this._document.html) {
      this._document.html.style.display = 'block'
      setTimeout(() => {
        this._document!.html.style.opacity = '1'
      })
    }
    this._active = true
  }

  public sleep() {
    if (this._document && this._document.html) {
      this._document.html.style.display = 'none'
      this._document.html.style.opacity = '0'
    }
    this._active = false
  }

  public isActive() {
    return this._active
  }

  get sandbox(): Sandbox {
    return this._sandbox!
  }
  set sandbox(value: Sandbox) {
    console.warn('[zan-micro]: ', 'sandbox is read-only')
  }
  get document(): (Document | ShadowRoot) & { head: HTMLHeadElement; body: HTMLBodyElement } {
    return this._document!
  }
  set document(value: (Document | ShadowRoot) & { head: HTMLHeadElement; body: HTMLBodyElement }) {
    console.warn('[zan-micro]: ', 'document is read-only')
  }
}

export const defineMicroApp = () => {
  window.customElements.define('micro-app', MicroApp)
}
