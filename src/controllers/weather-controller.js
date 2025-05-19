const WeatherService = require("../services/weather-service")

const WeatherController = {
  async getCurrentWeather(req, res) {
    try {
      const { city } = req.query

      if (!city) {
        return res.status(400).json({ error: "City parameter is required" })
      }

      const weatherData = await WeatherService.getCurrentWeather(city)

      res.json(weatherData)
    } catch (error) {
      console.error("Error getting weather:", error)

      if (error.message === "City not found") {
        res.status(404).json({ error: error.message })
      } else if (error.message === "Invalid request") {
        res.status(400).json({ error: error.message })
      } else {
        res.status(500).json({ error: "Internal server error" })
      }
    }
  },

  async getForecast(req, res) {
    try {
      const { city, days } = req.query

      if (!city) {
        return res.status(400).json({ error: "City parameter is required" })
      }

      const forecastData = await WeatherService.getForecast(city, days || 7)

      res.json(forecastData)
    } catch (error) {
      console.error("Error getting forecast:", error)

      if (error.message === "City not found") {
        res.status(404).json({ error: error.message })
      } else if (error.message === "Invalid request") {
        res.status(400).json({ error: error.message })
      } else {
        res.status(500).json({ error: "Internal server error" })
      }
    }
  },
}

module.exports = WeatherController
