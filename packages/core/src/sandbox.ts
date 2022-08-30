import { rawDocumentQuerySelector } from './common'
import { patchRelativeURL } from './util'
import { createScheduler, Scheduler } from './scheduler'

export class Sandbox {
  public iframe: HTMLIFrameElement
  // @ts-ignore
  public sandboxWindow: Window
  // @ts-ignore
  public sandboxDocument: Document
  private readonly _scheduler: Scheduler

  constructor(name: string) {
    this.iframe = Sandbox.createIframe(name)
    this._scheduler = createScheduler()
  }

  public async execScripts(scripts: { src?: string; type?: string; code?: string }[]) {
    scripts.forEach((script) => {
      this._scheduler(() => {
        const scriptEl = this.sandboxDocument.createElement('script')
        const attr = { ...script, style: 'display: none' }
        Object.entries(attr).forEach(([key, value]) => {
          scriptEl.setAttribute(key, value)
        })
        const head = rawDocumentQuerySelector.call(this.sandboxWindow.document, 'head')!
        head.appendChild(scriptEl)
      })
    })
  }

  public async init(host: string, uri: string) {
    await this.waitIframeLoad()
    this.patch()
    this.sandboxWindow = this.iframe.contentWindow!
    this.sandboxDocument = this.iframe.contentDocument!
    if (this.sandboxDocument.firstChild) {
      this.sandboxDocument.removeChild(this.sandboxDocument.firstChild)
    }
    const html = this.sandboxDocument.createElement('html')
    if (this.sandboxDocument.firstElementChild) {
      this.sandboxDocument.firstElementChild.appendChild(html)
    } else {
      this.sandboxDocument.append(html)
    }
    html.innerHTML = `
<head>
  <base href="${host}${uri}">
</head>
<body>
</body>
    `
  }

  public async waitIframeLoad() {
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

  public patch() {
    const iframeWindow = this.iframe.contentWindow!

    patchRelativeURL(iframeWindow, iframeWindow.window.HTMLImageElement, 'src')
    patchRelativeURL(iframeWindow, iframeWindow.window.HTMLAnchorElement, 'href')
    patchRelativeURL(iframeWindow, iframeWindow.window.HTMLSourceElement, 'src')
    patchRelativeURL(iframeWindow, iframeWindow.window.HTMLLinkElement, 'href')
    patchRelativeURL(iframeWindow, iframeWindow.window.HTMLScriptElement, 'src')
  }

  public static createIframe(name: string) {
    const iframe = window.document.createElement('iframe')
    const attr = { style: 'display: none', src: `${window.location.protocol}//${window.location.host}`, name }
    Object.entries(attr).forEach(([key, value]) => {
      iframe.setAttribute(key, value)
    })
    window.document.body.appendChild(iframe)
    return iframe
  }
}
