const config = {
  port: process.env.PORT || 3000,

  db: {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || "weather_db",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
  },

  weatherApi: {
    baseUrl: "https://api.weatherapi.com/v1",
    apiKey: process.env.WEATHER_API_KEY || "",
  },

  email: {
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: Number.parseInt(process.env.EMAIL_PORT || "587"),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER || "",
      pass: process.env.EMAIL_PASSWORD || "",
    },
    from: process.env.EMAIL_FROM || "noreply@weatherforecast.com",
  },

  baseUrl: process.env.BASE_URL || "http://localhost:3000",
}

module.exports = config
