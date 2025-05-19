const express = require("express")
const cors = require("cors")
const path = require("path")
const weatherRoutes = require("./routes/weather-routes")
const subscriptionRoutes = require("./routes/subscription-routes")
const migrate = require("./db/migrate")
const SchedulerService = require("./services/scheduler-service")
const { checkDatabaseConnection } = require("./db")
const config = require("./config/config")

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use((req, res, next) => next())

app.use(express.static(path.join(__dirname, "../public")))

app.use("/api", weatherRoutes)
app.use("/api", subscriptionRoutes)

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"))
})

app.use((err, req, res, next) => {
  console.error("Request processing error:", err)
  res.status(500).json({ error: "Internal server error: " + (err.message || "Unknown error") })
})

const checkConfig = () => {
  let hasErrors = false

  if (!config.weatherApi.apiKey) {
    console.error("ERROR: Weather API key not specified (WEATHER_API_KEY)")
    hasErrors = true
  }

  if (!config.email.host || !config.email.port) {
    console.error("ERROR: SMTP host or port not specified (EMAIL_HOST, EMAIL_PORT)")
    hasErrors = true
  }

  if (!config.email.auth.user || !config.email.auth.pass) {
    console.error("ERROR: SMTP username or password not specified (EMAIL_USER, EMAIL_PASSWORD)")
    hasErrors = true
  }

  if (!config.baseUrl) {
    console.error("ERROR: Base URL not specified (BASE_URL)")
    hasErrors = true
  }

  return !hasErrors
}

const initApp = async () => {
  try {
    const configValid = checkConfig()

    if (!configValid) {
      console.warn("Application started with incomplete configuration. Some features may not work.")
    }

    const dbConnected = await checkDatabaseConnection()

    if (dbConnected) {
      await migrate()

      SchedulerService.init()
    } else {
      console.error("Failed to connect to database. Migrations and scheduler not started.")
    }
  } catch (error) {
    console.error("Error initializing application:", error)
  }
}

initApp()

module.exports = app
