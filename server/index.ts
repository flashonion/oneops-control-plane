import { createApp } from './app'
import { loadConfig } from './config'

const config = loadConfig()
const app = createApp(config)

app.listen(config.PORT, '127.0.0.1', () => {
  console.log(`OneOps API listening on http://127.0.0.1:${config.PORT} (${config.DATA_MODE} mode)`)
})
