export function fetch(url: string) {
  return new Promise<string>((resolve, reject) => {
    window
      .fetch(url)
      .then((res) => res.text())
      .then((res) => resolve(res))
      .catch((err) => reject(err))
  })
}

export async function loader(host: string, uri: string) {
  const template = await fetch(`${host}${uri}`)

  const div = document.createElement('div')
  div.innerHTML = template

  const reg = /^(?:http|https):\/\/.*?(\/.*)$/g
  const scripts =
    Array.from(div.querySelectorAll('script')).map((item) => {
      return {
        src: item.src.replace(reg, `${host}$1`),
        type: item.type,
        content: item.innerHTML,
      }
    }) ?? []

  const styles = await Promise.all(
    Array.from(div.querySelectorAll('style')).map((item) => Promise.resolve(item.innerHTML)) ?? [],
  )
  return {
    template,
    scripts,
    styles,
  }
}
