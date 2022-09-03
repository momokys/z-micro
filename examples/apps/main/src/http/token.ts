import cookieJs from 'js-cookie'

const TOKEN_KEY = 'X-TOKEN'

export function setToken(token: string, expires = 1) {
  cookieJs.set(TOKEN_KEY, token, { expires })
}

export function getToken() {
  return cookieJs.get(TOKEN_KEY)
}

export function removeToken() {
  return cookieJs.remove(TOKEN_KEY)
}
