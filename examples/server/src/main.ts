import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import router from '@/router'
import config from '@/config'
import { openDB } from '@/db'

const app: Koa = new Koa()

app.use(bodyParser())
app.use(router.routes())
app.use(router.allowedMethods())

app.listen(config.port, () => {
  openDB()
  console.log('Server running on http://localhost:8080')
})
