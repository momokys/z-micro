import { rawDocumentQuerySelector } from './common'
import { patchRelativeURL } from './util'

export class Sandbox {
  public iframe: HTMLIFrameElement

  constructor(name: string, host: string, uri: string) {
    this.iframe = Sandbox.createIframe(name)
    Sandbox.initIframe(this.iframe, host, uri)
  }

  public async execScripts(scripts: { src?: string; type?: string; code?: string }[]) {
    await Sandbox.waitIframeLoad(this.iframe)
    const iframeWindow = this.iframe.contentWindow!
    const iframeDocument = this.iframe.contentDocument!
    scripts.forEach((script) => {
      const scriptEl = iframeDocument.createElement('script')
      const attr = { ...script, style: 'display: none' }
      Object.entries(attr).forEach(([key, value]) => {
        scriptEl.setAttribute(key, value)
      })
      const head = rawDocumentQuerySelector.call(iframeWindow.document, 'head')!
      head.appendChild(scriptEl)
    })
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

  public static async initIframe(iframe: HTMLIFrameElement, host: string, uri: string) {
    await Sandbox.waitIframeLoad(iframe)
    Sandbox.patch(iframe)
    const iframeDocumnt = iframe.contentDocument!
    if (iframeDocumnt.firstChild) {
      iframeDocumnt.removeChild(iframeDocumnt.firstChild)
    }
    const html = iframeDocumnt.createElement('html')
    html.innerHTML = `
<head>
  <base href="${host}${uri}">
</head>
<body>
  <div id="app"></div>
</body>
    `
    iframeDocumnt.append(html)
  }

  public static async waitIframeLoad(iframe: HTMLIFrameElement) {
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

  public static patch(iframe: HTMLIFrameElement) {
    const iframeWindow = iframe.contentWindow!

    patchRelativeURL(iframeWindow, iframeWindow.window.HTMLImageElement, 'src')
    patchRelativeURL(iframeWindow, iframeWindow.window.HTMLAnchorElement, 'href')
    patchRelativeURL(iframeWindow, iframeWindow.window.HTMLSourceElement, 'src')
    patchRelativeURL(iframeWindow, iframeWindow.window.HTMLLinkElement, 'href')
    patchRelativeURL(iframeWindow, iframeWindow.window.HTMLScriptElement, 'src')
  }
}
