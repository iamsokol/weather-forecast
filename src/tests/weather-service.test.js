const axios = require("axios")
const WeatherService = require("src/services/weather-service")

jest.mock("axios")

describe("WeatherService", () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("getCurrentWeather", () => {
    it("should return correctly formatted weather data", async () => {
      axios.get.mockResolvedValue({
        data: {
          current: {
            temp_c: 20,
            humidity: 65,
            feelslike_c: 21,
            wind_kph: 10,
            pressure_mb: 1015,
            condition: {
              text: "Sunny",
              icon: "//cdn.weatherapi.com/weather/64x64/day/113.png",
            },
          },
          location: {
            name: "London",
            country: "UK",
            localtime: "2023-06-01 12:00",
          },
        },
      })

      const result = await WeatherService.getCurrentWeather("London")

      expect(result).toEqual({
        temperature: 20,
        humidity: 65,
        description: "Sunny",
        icon: "//cdn.weatherapi.com/weather/64x64/day/113.png",
        feelslike: 21,
        wind: 10,
        pressure: 1015,
        location: "London",
        country: "UK",
        localtime: "2023-06-01 12:00",
      })

      expect(axios.get).toHaveBeenCalledTimes(1)
      expect(axios.get.mock.calls[0][1].params.q).toBe("London")
    })

    it("should handle 404 error (city not found)", async () => {
      axios.get.mockRejectedValue({
        response: {
          status: 404,
          data: {
            error: {
              message: "No matching location found.",
            },
          },
        },
      })

      await expect(WeatherService.getCurrentWeather("NonExistentCity")).rejects.toThrow("City not found")
    })

    it("should handle 400 error (invalid request)", async () => {
      axios.get.mockRejectedValue({
        response: {
          status: 400,
          data: {
            error: {
              message: "Invalid request",
            },
          },
        },
      })

      await expect(WeatherService.getCurrentWeather("")).rejects.toThrow("Invalid request")
    })
  })

  describe("getForecast", () => {
    it("should return correctly formatted forecast data", async () => {
      axios.get.mockResolvedValue({
        data: {
          current: {
            temp_c: 20,
            humidity: 65,
            feelslike_c: 21,
            wind_kph: 10,
            pressure_mb: 1015,
            condition: {
              text: "Sunny",
              icon: "//cdn.weatherapi.com/weather/64x64/day/113.png",
            },
            uv: 5,
            cloud: 25,
            vis_km: 10,
          },
          location: {
            name: "London",
            country: "UK",
            localtime: "2023-06-01 12:00",
          },
          forecast: {
            forecastday: [
              {
                date: "2023-06-01",
                day: {
                  maxtemp_c: 22,
                  mintemp_c: 15,
                  avgtemp_c: 18,
                  condition: {
                    text: "Sunny",
                    icon: "//cdn.weatherapi.com/weather/64x64/day/113.png",
                  },
                  maxwind_kph: 15,
                  totalprecip_mm: 0,
                  avghumidity: 60,
                  daily_chance_of_rain: 0,
                  uv: 5,
                },
              },
            ],
          },
        },
      })

      const result = await WeatherService.getForecast("London", 1)

      expect(result).toHaveProperty("current")
      expect(result).toHaveProperty("forecast")
      expect(result.forecast).toHaveLength(1)

      expect(result.current.temperature).toBe(20)
      expect(result.current.humidity).toBe(65)

      expect(result.forecast[0].date).toBe("2023-06-01")
      expect(result.forecast[0].maxtemp_c).toBe(22)
      expect(result.forecast[0].mintemp_c).toBe(15)
    })
  })
})
