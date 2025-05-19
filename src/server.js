const app = require("./app")
const config = require("./config/config")

const server = app.listen(config.port)

process.on("SIGTERM", () => {
  server.close(() => {
    process.exit(0)
  })
})

process.on("SIGINT", () => {
  server.close(() => {
    process.exit(0)
  })
})
