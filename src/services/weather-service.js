const axios = require("axios")
const config = require("../config/config")

const WeatherService = {
  async getCurrentWeather(city) {
    try {
      const response = await axios.get(`${config.weatherApi.baseUrl}/current.json`, {
        params: {
          key: config.weatherApi.apiKey,
          q: city,
          aqi: "no",
        },
      })

      return {
        temperature: response.data.current.temp_c,
        humidity: response.data.current.humidity,
        description: response.data.current.condition.text,
        icon: response.data.current.condition.icon,
        feelslike: response.data.current.feelslike_c,
        wind: response.data.current.wind_kph,
        pressure: response.data.current.pressure_mb,
        location: response.data.location.name,
        country: response.data.location.country,
        localtime: response.data.location.localtime,
      }
    } catch (error) {
      console.error("Error getting weather:", error.response?.data || error.message)

      if (error.response?.status === 400) {
        throw new Error("Invalid request")
      } else if (error.response?.status === 404) {
        throw new Error("City not found")
      } else {
        throw new Error("Error getting weather data")
      }
    }
  },

  async getForecast(city, days = 7) {
    try {
      const response = await axios.get(`${config.weatherApi.baseUrl}/forecast.json`, {
        params: {
          key: config.weatherApi.apiKey,
          q: city,
          days: days,
          aqi: "no",
        },
      })

      const current = {
        temperature: response.data.current.temp_c,
        humidity: response.data.current.humidity,
        description: response.data.current.condition.text,
        icon: response.data.current.condition.icon,
        feelslike: response.data.current.feelslike_c,
        wind: response.data.current.wind_kph,
        pressure: response.data.current.pressure_mb,
        location: response.data.location.name,
        country: response.data.location.country,
        localtime: response.data.location.localtime,
        uv: response.data.current.uv,
        cloud: response.data.current.cloud,
        visibility: response.data.current.vis_km,
      }

      const forecast = response.data.forecast.forecastday.map((day) => ({
        date: day.date,
        maxtemp_c: day.day.maxtemp_c,
        mintemp_c: day.day.mintemp_c,
        avgtemp_c: day.day.avgtemp_c,
        condition: day.day.condition.text,
        icon: day.day.condition.icon,
        maxwind_kph: day.day.maxwind_kph,
        totalprecip_mm: day.day.totalprecip_mm,
        avghumidity: day.day.avghumidity,
        daily_chance_of_rain: day.day.daily_chance_of_rain,
        uv: day.day.uv,
      }))

      return {
        current,
        forecast,
      }
    } catch (error) {
      console.error("Error getting forecast:", error.response?.data || error.message)

      if (error.response?.status === 400) {
        throw new Error("Invalid request")
      } else if (error.response?.status === 404) {
        throw new Error("City not found")
      } else {
        throw new Error("Error getting forecast data")
      }
    }
  },
}

module.exports = WeatherService
