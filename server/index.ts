import { createApp } from './app'
import { loadConfig } from './config'

const config = loadConfig()
const app = createApp(config)

const host = config.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1'

app.listen(config.PORT, host, () => {
  console.log(`OneOps listening on http://${host}:${config.PORT} (${config.DATA_MODE} mode)`)
})
