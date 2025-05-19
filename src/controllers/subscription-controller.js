const SubscriptionModel = require("../models/subscription")
const EmailService = require("../services/email-service")
const WeatherService = require("../services/weather-service")

const SubscriptionController = {
  async subscribe(req, res) {
    try {
      const { email, city, frequency } = req.body

      if (!email || !city || !frequency) {
        return res.status(400).json({
          error: "All fields (email, city, frequency) are required",
        })
      }

      const validFrequencies = ["fifteen_minutes", "hourly", "daily"]
      if (!validFrequencies.includes(frequency)) {
        return res.status(400).json({
          error: 'Frequency must be one of: "fifteen_minutes", "hourly", "daily"',
        })
      }

      const subscription = await SubscriptionModel.create(email, city, frequency)
      await EmailService.sendConfirmationEmail(email, city, subscription.confirmation_token, frequency)

      res.status(200).json({
        message: "Subscription created. Check your email for confirmation.",
      })
    } catch (error) {
      console.error("Error creating subscription:", error)

      if (error.code === "23505") {
        return res.status(409).json({
          error: "This email is already subscribed to weather updates for this city",
        })
      } else if (error.code === "ECONNREFUSED") {
        return res.status(500).json({
          error: "Error sending email. Check SMTP server settings",
        })
      } else if (error.message && error.message.includes("database")) {
        return res.status(500).json({
          error: "Database connection error. Check database settings",
        })
      }

      res.status(500).json({ error: "Internal server error: " + error.message })
    }
  },

  async confirmSubscription(req, res) {
    try {
      const { token } = req.params

      const subscription = await SubscriptionModel.confirmByToken(token)

      if (!subscription) {
        return res.status(404).json({ error: "Token not found" })
      }

      res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Subscription Confirmed | City Forecast Hub</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    margin: 0;
                    padding: 0;
                    background: linear-gradient(135deg, #e0f2fe, #bfdbfe);
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                }
                .container {
                    max-width: 600px;
                    margin: 2rem auto;
                    padding: 2rem;
                    background-color: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    text-align: center;
                }
                .header {
                    margin-bottom: 2rem;
                }
                h1 {
                    color: #3b82f6;
                    margin-bottom: 0.5rem;
                }
                .icon {
                    font-size: 4rem;
                    color: #10b981;
                    margin-bottom: 1rem;
                }
                .details {
                    background-color: #f9fafb;
                    padding: 1.5rem;
                    border-radius: 8px;
                    margin: 1.5rem 0;
                    text-align: left;
                }
                .button {
                    display: inline-block;
                    background-color: #3b82f6;
                    color: white;
                    text-decoration: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 5px;
                    font-weight: 500;
                    margin-top: 1rem;
                    transition: background-color 0.2s;
                }
                .button:hover {
                    background-color: #2563eb;
                }
                .footer {
                    margin-top: 2rem;
                    font-size: 0.875rem;
                    color: #6b7280;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="icon">✓</div>
                    <h1>Subscription Confirmed</h1>
                    <p>Thank you for confirming your weather forecast subscription!</p>
                </div>
                
                <div class="details">
                    <p><strong>City:</strong> ${subscription.city}</p>
                    <p><strong>Email:</strong> ${subscription.email}</p>
                    <p><strong>Update Frequency:</strong> ${
                      subscription.frequency === "daily"
                        ? "Daily"
                        : subscription.frequency === "hourly"
                          ? "Hourly"
                          : "Every 15 minutes"
                    }</p>
                </div>
                
                <p>You will now receive weather forecast updates at the specified email address.</p>
                
                <a href="/" class="button">Return to Home</a>
                
                <div class="footer">
                    <p>Weather data provided by WeatherAPI.com</p>
                </div>
            </div>
        </body>
        </html>
      `)
    } catch (error) {
      console.error("Error confirming subscription:", error)
      res.status(500).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Error | City Forecast Hub</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    margin: 0;
                    padding: 0;
                    background: linear-gradient(135deg, #e0f2fe, #bfdbfe);
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                }
                .container {
                    max-width: 600px;
                    margin: 2rem auto;
                    padding: 2rem;
                    background-color: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    text-align: center;
                }
                .header {
                    margin-bottom: 2rem;
                }
                h1 {
                    color: #ef4444;
                    margin-bottom: 0.5rem;
                }
                .icon {
                    font-size: 4rem;
                    color: #ef4444;
                    margin-bottom: 1rem;
                }
                .button {
                    display: inline-block;
                    background-color: #3b82f6;
                    color: white;
                    text-decoration: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 5px;
                    font-weight: 500;
                    margin-top: 1rem;
                    transition: background-color 0.2s;
                }
                .button:hover {
                    background-color: #2563eb;
                }
                .footer {
                    margin-top: 2rem;
                    font-size: 0.875rem;
                    color: #6b7280;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="icon">✗</div>
                    <h1>Error</h1>
                    <p>An error occurred while confirming your subscription.</p>
                </div>
                <p>Please try again later or contact us for assistance.</p>
                <a href="/" class="button">Return to Home</a>
                <div class="footer">
                    <p>Weather data provided by WeatherAPI.com</p>
                </div>
            </div>
        </body>
        </html>
      `)
    }
  },

  async unsubscribe(req, res) {
    try {
      const { token } = req.params

      const subscription = await SubscriptionModel.deleteByToken(token)

      if (!subscription) {
        return res.status(404).send(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Token Not Found | City Forecast Hub</title>
              <style>
                  body {
                      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                      line-height: 1.6;
                      color: #333;
                      margin: 0;
                      padding: 0;
                      background: linear-gradient(135deg, #e0f2fe, #bfdbfe);
                      min-height: 100vh;
                      display: flex;
                      flex-direction: column;
                      justify-content: center;
                      align-items: center;
                  }
                  .container {
                      max-width: 600px;
                      margin: 2rem auto;
                      padding: 2rem;
                      background-color: white;
                      border-radius: 8px;
                      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                      text-align: center;
                  }
                  .header {
                      margin-bottom: 2rem;
                  }
                  h1 {
                      color: #ef4444;
                      margin-bottom: 0.5rem;
                  }
                  .icon {
                      font-size: 4rem;
                      color: #ef4444;
                      margin-bottom: 1rem;
                  }
                  .button {
                      display: inline-block;
                      background-color: #3b82f6;
                      color: white;
                      text-decoration: none;
                      padding: 0.75rem 1.5rem;
                      border-radius: 5px;
                      font-weight: 500;
                      margin-top: 1rem;
                      transition: background-color 0.2s;
                  }
                  .button:hover {
                      background-color: #2563eb;
                  }
                  .footer {
                      margin-top: 2rem;
                      font-size: 0.875rem;
                      color: #6b7280;
                  }
              </style>
          </head>
          <body>
              <div class="container">
                  <div class="header">
                      <div class="icon">✗</div>
                      <h1>Token Not Found</h1>
                      <p>The unsubscribe token was not found or has already been used.</p>
                  </div>
                  
                  <p>You may have already unsubscribed or the link is invalid.</p>
                  
                  <a href="/" class="button">Return to Home</a>
                  
                  <div class="footer">
                      <p>Weather data provided by WeatherAPI.com</p>
                  </div>
              </div>
          </body>
          </html>
        `)
      }

      res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Unsubscribed | City Forecast Hub</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    margin: 0;
                    padding: 0;
                    background: linear-gradient(135deg, #e0f2fe, #bfdbfe);
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                }
                .container {
                    max-width: 600px;
                    margin: 2rem auto;
                    padding: 2rem;
                    background-color: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    text-align: center;
                }
                .header {
                    margin-bottom: 2rem;
                }
                h1 {
                    color: #3b82f6;
                    margin-bottom: 0.5rem;
                }
                .icon {
                    font-size: 4rem;
                    color: #10b981;
                    margin-bottom: 1rem;
                }
                .details {
                    background-color: #f9fafb;
                    padding: 1.5rem;
                    border-radius: 8px;
                    margin: 1.5rem 0;
                    text-align: left;
                }
                .button {
                    display: inline-block;
                    background-color: #3b82f6;
                    color: white;
                    text-decoration: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 5px;
                    font-weight: 500;
                    margin-top: 1rem;
                    transition: background-color 0.2s;
                }
                .button:hover {
                    background-color: #2563eb;
                }
                .footer {
                    margin-top: 2rem;
                    font-size: 0.875rem;
                    color: #6b7280;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="icon">✓</div>
                    <h1>Unsubscribed</h1>
                    <p>You have successfully unsubscribed from weather forecast updates.</p>
                </div>
                
                <div class="details">
                    <p><strong>City:</strong> ${subscription.city}</p>
                    <p><strong>Email:</strong> ${subscription.email}</p>
                </div>
                
                <p>You will no longer receive weather forecast updates for this city.</p>
                
                <a href="/" class="button">Return to Home</a>
                
                <div class="footer">
                    <p>Weather data provided by WeatherAPI.com</p>
                </div>
            </div>
        </body>
        </html>
      `)
    } catch (error) {
      console.error("Error unsubscribing:", error)
      res.status(500).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Error | City Forecast Hub</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    margin: 0;
                    padding: 0;
                    background: linear-gradient(135deg, #e0f2fe, #bfdbfe);
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                }
                .container {
                    max-width: 600px;
                    margin: 2rem auto;
                    padding: 2rem;
                    background-color: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    text-align: center;
                }
                .header {
                    margin-bottom: 2rem;
                }
                h1 {
                    color: #ef4444;
                    margin-bottom: 0.5rem;
                }
                .icon {
                    font-size: 4rem;
                    color: #ef4444;
                    margin-bottom: 1rem;
                }
                .button {
                    display: inline-block;
                    background-color: #3b82f6;
                    color: white;
                    text-decoration: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 5px;
                    font-weight: 500;
                    margin-top: 1rem;
                    transition: background-color 0.2s;
                }
                .button:hover {
                    background-color: #2563eb;
                }
                .footer {
                    margin-top: 2rem;
                    font-size: 0.875rem;
                    color: #6b7280;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="icon">✗</div>
                    <h1>Error</h1>
                    <p>An error occurred while unsubscribing from weather updates.</p>
                </div>
                
                <p>Please try again later or contact us for assistance.</p>
                
                <a href="/" class="button">Return to Home</a>
                
                <div class="footer">
                    <p>Weather data provided by WeatherAPI.com</p>
                </div>
            </div>
        </body>
        </html>
      `)
    }
  },

  async getSubscriptionsByEmail(req, res) {
    try {
      const { email } = req.query

      if (!email) {
        return res.status(400).json({ error: "Email parameter is required" })
      }

      const subscriptions = await SubscriptionModel.getByEmail(email)

      const subscriptionsWithWeather = await Promise.all(
        subscriptions.map(async (subscription) => {
          try {
            const weather = await WeatherService.getCurrentWeather(subscription.city)
            return {
              ...subscription,
              weather,
            }
          } catch (error) {
            console.error(`Error getting weather for ${subscription.city}:`, error)
            return {
              ...subscription,
              weather: null,
            }
          }
        }),
      )

      res.status(200).json(subscriptionsWithWeather)
    } catch (error) {
      console.error("Error getting subscriptions:", error)
      res.status(500).json({ error: "Internal server error: " + error.message })
    }
  },

  async deleteSubscription(req, res) {
    try {
      const { email, city } = req.body

      if (!email || !city) {
        return res.status(400).json({ error: "Email and city parameters are required" })
      }

      const subscription = await SubscriptionModel.deleteByEmailAndCity(email, city)

      if (!subscription) {
        return res.status(404).json({ error: "Subscription not found" })
      }

      res.status(200).json({ message: "Unsubscribed successfully" })
    } catch (error) {
      console.error("Error deleting subscription:", error)
      res.status(500).json({ error: "Internal server error: " + error.message })
    }
  },
}

module.exports = SubscriptionController
