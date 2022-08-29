export default {
  info(msg: any) {
    console.log('[zan-micro info]: ', msg)
  },
  warn(msg: any) {
    console.warn(`[zan-micro warn]: ${msg}`)
  },
  error(msg: any) {
    console.warn(`[zan-micro error]: ${msg}`)
  },
}
