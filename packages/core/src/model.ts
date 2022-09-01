export interface App {
  name: string
  host: string
  uri: string
  document: (ShadowRoot | Document) & { head: HTMLHeadElement; body: HTMLBodyElement }
}
