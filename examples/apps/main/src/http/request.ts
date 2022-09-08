import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import http from '@/config/http'
import route from '@/config/route'
import { getToken, removeToken } from './token'

const service = axios.create({
  baseURL: http.baseURL,
  timeout: http.timeout,
})

service.interceptors.request.use((req) => {
  const token = getToken()
  if (token) {
    ;(req.headers as Record<string, string>)['X-TOKEN'] = token
  }
  return req
})

service.interceptors.response.use(
  (resp) => {
    const res = resp.data
    if (res.code === 2000) {
      return Promise.resolve(res)
    } else {
      ElMessage.error(res.message || '系统错误')
      return Promise.reject(res)
    }
  },
  (err) => {
    if (err && err.response) {
      console.log(err.response)
      let message = '连接服务器失败'
      switch (err.response.status) {
        case 401:
          // 认证失败删除 token, 重新登录
          message = '认证失败，请重新登录'
          removeToken()
          router.push({
            name: route.loginName,
          })
          break
        case 404:
          message = `找不到 ${err.response.config.url}`
          break
        default:
          message = err.response.data.message
      }
      ElMessage.error(message)
    } else {
      ElMessage.error('连接服务器失败')
    }
  },
)

export default service
