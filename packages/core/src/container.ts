import { MicroApp } from './micro'

export class MicroContainer extends HTMLElement {
  private microApps: Map<string, MicroApp>
  private _active: string

  static get observedAttributes() {
    return ['active']
  }

  public constructor() {
    super()
    this._active = ''
    this.microApps = new Map<string, MicroApp>()
  }

  connectedCallback() {
    // const shadowRoot = this.attachShadow({ mode: 'open' })
    // shadowRoot.innerHTML = '<slot />'
  }

  attributeChangedCallback(name: string, oldVal: any, newVal: any) {
    // @ts-ignore
    this[name] = newVal
  }

  public setupApp(app: MicroApp) {
    this.microApps.set(app.name, app)
    if (this._active === app.name) {
      app.active()
    } else {
      app.sleep()
    }
  }

  public removeApp(app: MicroApp) {
    this.microApps.delete(app.name)
  }

  get active(): string {
    return this._active
  }

  set active(value: string) {
    let app = this.microApps.get(this._active)
    if (app) {
      app.sleep()
    }
    this._active = value
    app = this.microApps.get(this._active)
    if (app) {
      app.active()
    }
  }
}
