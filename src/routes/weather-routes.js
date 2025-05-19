const express = require("express")
const WeatherController = require("../controllers/weather-controller")

const router = express.Router()

router.get("/weather", WeatherController.getCurrentWeather)
router.get("/forecast", WeatherController.getForecast)

module.exports = router
