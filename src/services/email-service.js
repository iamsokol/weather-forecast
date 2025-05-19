const nodemailer = require("nodemailer")
const config = require("../config/config")

const verifyEmailConfig = () => {
  const { host, port, auth } = config.email

  if (!host || !port) {
    console.error("ERROR: SMTP host or port not specified")
    return false
  }

  if (!auth.user || !auth.pass) {
    console.error("ERROR: SMTP username or password not specified")
    return false
  }

  return true
}

let transporter

try {
  if (verifyEmailConfig()) {
    transporter = nodemailer.createTransport(config.email)

    transporter.verify((error, success) => {
      if (error) {
        console.error("SMTP server connection error:", error)
      }
    })
  } else {
    console.warn("Email sending disabled due to invalid configuration")

    transporter = {
      sendMail: () => {
        return Promise.resolve({ messageId: "mock-id" })
      },
    }
  }
} catch (error) {
  console.error("Error creating email transport:", error)
  transporter = {
    sendMail: () => {
      return Promise.resolve({ messageId: "mock-id" })
    },
  }
}

function translateFrequency(frequency) {
  const translations = {
    fifteen_minutes: "every 15 minutes",
    hourly: "hourly",
    daily: "daily",
  }
  return translations[frequency] || frequency
}

const EmailService = {
  async sendConfirmationEmail(email, city, token, frequency) {
    const confirmationUrl = `${config.baseUrl}/api/confirm/${token}`
    const frequencyText = translateFrequency(frequency)

    const mailOptions = {
      from: config.email.from,
      to: email,
      subject: `Confirm Weather Forecast Subscription for ${city}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Subscription Confirmation</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f5f7fa;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #4a90e2, #63b3ed);
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              background-color: #ffffff;
              padding: 30px;
              border-radius: 0 0 5px 5px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #4a90e2, #63b3ed);
              color: white;
              text-decoration: none;
              padding: 12px 25px;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: 500;
              text-align: center;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #999;
            }
            .details {
              background-color: #f5f7fa;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Subscription Confirmation</h1>
            </div>
            <div class="content">
              <p>Hello!</p>
              <p>Thank you for subscribing to weather forecasts for <strong>${city}</strong>.</p>
              
              <div class="details">
                <p><strong>Subscription Details:</strong></p>
                <p>City: ${city}</p>
                <p>Update Frequency: ${frequencyText}</p>
              </div>
              
              <p>To confirm your subscription, please click the button below:</p>
              <p style="text-align: center;">
                <a href="${confirmationUrl}" class="button">Confirm Subscription</a>
              </p>
              <p>Or go to this link: <a href="${confirmationUrl}">${confirmationUrl}</a></p>
              <p>If you didn't subscribe to weather forecasts, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>Weather data provided by WeatherAPI.com</p>
            </div>
          </div>
        </body>
        </html>
      `,
    }

    try {
      return await transporter.sendMail(mailOptions)
    } catch (error) {
      console.error("Error sending confirmation email:", error)
      throw error
    }
  },

  async sendWeatherUpdate(email, city, weatherData, unsubscribeToken) {
    const unsubscribeUrl = `${config.baseUrl}/api/unsubscribe/${unsubscribeToken}`

    const mailOptions = {
      from: config.email.from,
      to: email,
      subject: `Weather Forecast for ${city}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Weather Forecast</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f5f7fa;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #4a90e2, #63b3ed);
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              background-color: #ffffff;
              padding: 30px;
              border-radius: 0 0 5px 5px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            }
            .weather-card {
              background-color: #f5f7fa;
              border-radius: 5px;
              padding: 25px;
              margin: 20px 0;
            }
            .weather-main {
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 20px;
            }
            .weather-temp {
              font-size: 36px;
              font-weight: bold;
              margin: 0 20px;
              color: #4a90e2;
            }
            .weather-details {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
            }
            .weather-detail {
              padding: 12px;
              background-color: #ffffff;
              border-radius: 5px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            }
            .button {
              display: inline-block;
              background-color: #e53e3e;
              color: white;
              text-decoration: none;
              padding: 12px 25px;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: 500;
              text-align: center;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #999;
            }
            .location-time {
              text-align: center;
              margin-bottom: 15px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Weather Forecast for ${city}</h1>
            </div>
            <div class="content">
              <div class="location-time">
                <p>${weatherData.location}, ${weatherData.country}</p>
                <p>Local time: ${new Date(weatherData.localtime).toLocaleString()}</p>
              </div>
              
              <div class="weather-card">
                <div class="weather-main">
                  ${
                    weatherData.icon
                      ? `<img src="${weatherData.icon}" alt="${weatherData.description}" width="64" height="64">`
                      : ""
                  }
                  <div class="weather-temp">${weatherData.temperature}°C</div>
                  <div>${weatherData.description}</div>
                </div>
                <div class="weather-details">
                  <div class="weather-detail">
                    <strong>Humidity:</strong> ${weatherData.humidity}%
                  </div>
                  <div class="weather-detail">
                    <strong>Feels like:</strong> ${weatherData.feelslike || weatherData.temperature}°C
                  </div>
                  ${
                    weatherData.wind
                      ? `
                  <div class="weather-detail">
                    <strong>Wind:</strong> ${weatherData.wind} km/h
                  </div>
                  `
                      : ""
                  }
                  ${
                    weatherData.pressure
                      ? `
                  <div class="weather-detail">
                    <strong>Pressure:</strong> ${weatherData.pressure} mb
                  </div>
                  `
                      : ""
                  }
                </div>
              </div>
              
              <p>To unsubscribe from weather updates, click the button below:</p>
              <p style="text-align: center;">
                <a href="${unsubscribeUrl}" class="button">Unsubscribe</a>
              </p>
              <p>Or go to this link: <a href="${unsubscribeUrl}">${unsubscribeUrl}</a></p>
            </div>
            <div class="footer">
              <p>Weather data provided by WeatherAPI.com</p>
            </div>
          </div>
        </body>
        </html>
      `,
    }

    try {
      return await transporter.sendMail(mailOptions)
    } catch (error) {
      console.error("Error sending weather forecast:", error)
      throw error
    }
  },
}

module.exports = EmailService
