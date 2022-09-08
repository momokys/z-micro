import request from '@/http/request'

const baseURL = '/user'

export default {
  login(data: { userName: string; password: string }) {
    return request({
      url: `${baseURL}/login`,
      method: 'POST',
      data,
    })
  },
  logout() {
    return request({
      url: `${baseURL}/logout`,
      method: 'GET',
    })
  },
  qryCurUser() {
    return request({
      url: `${baseURL}/cur`,
      method: 'GET',
    })
  },
  qryAppList() {
    return request({
      url: `${baseURL}/app/list`,
      method: 'GET',
    })
  },
  qryMenuList(name: string) {
    return request({
      url: `${baseURL}/menu/list`,
      method: 'GET',
    })
  },
}
