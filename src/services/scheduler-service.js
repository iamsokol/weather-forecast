const schedule = require("node-schedule")
const SubscriptionModel = require("../models/subscription")
const WeatherService = require("./weather-service")
const EmailService = require("./email-service")

const SchedulerService = {
  jobs: {},

  init() {
    this.jobs.fifteenMinutes = schedule.scheduleJob("*/15 * * * *", async () => {
      await this.sendUpdates("fifteen_minutes")
    })

    this.jobs.hourly = schedule.scheduleJob("0 * * * *", async () => {
      await this.sendUpdates("hourly")
    })

    this.jobs.daily = schedule.scheduleJob("0 8 * * *", async () => {
      await this.sendUpdates("daily")
    })
  },

  async sendUpdates(frequency) {
    try {
      const subscriptions = await SubscriptionModel.getActiveByFrequency(frequency)

      for (const subscription of subscriptions) {
        try {
          const weatherData = await WeatherService.getCurrentWeather(subscription.city)

          await EmailService.sendWeatherUpdate(
            subscription.email,
            subscription.city,
            weatherData,
            subscription.unsubscribe_token,
          )
        } catch (error) {
          console.error(`Error sending update for ${subscription.email}:`, error)
        }
      }
    } catch (error) {
      console.error(`Error sending updates with frequency ${frequency}:`, error)
    }
  },

  stop() {
    Object.values(this.jobs).forEach((job) => job.cancel())
  },
}

module.exports = SchedulerService
