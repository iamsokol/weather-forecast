# City Forecast

A modern weather forecast service with subscription features. Users can check current weather conditions and 7-day forecasts for any city, and subscribe to receive weather updates via email at their preferred frequency.

### [Demo link on Render](https://weather-forecast-p9u0.onrender.com/)
https://weather-forecast-p9u0.onrender.com/

### Weather tab
<img width="1800" alt="image" src="https://github.com/user-attachments/assets/7d995ab1-29df-42ce-9355-aa60966feb7a" />

### Subscribe tab
<img width="1798" alt="image" src="https://github.com/user-attachments/assets/aead5ebf-c674-47f3-bc68-7784be78aabc" />

## Features

- Current weather conditions display
- 7-day weather forecast
- Dynamic weather icons
- Email subscriptions with customizable frequency (daily, hourly, or every 15 minutes)
- Responsive design for all devices

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **Email**: Nodemailer
- **Weather Data**: WeatherAPI.com
- **Containerization**: Docker, Docker Compose

## Prerequisites

- Node.js (v14 or higher)
- Docker and Docker Compose (for containerized deployment)
- WeatherAPI.com API key
- SMTP server for sending emails

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Server port
PORT=3000

# Database configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=weather_db
DB_USER=postgres
DB_PASSWORD=postgres

# WeatherAPI.com API key
WEATHER_API_KEY=your_weather_api_key

# Email configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_password
EMAIL_FROM=noreply@weatherforecast.com

# Base URL of the application
BASE_URL=http://localhost:3000
```

## Installation and Setup

### Local Development

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with your configuration (see above)

4. Start the application:
   ```
   npm start
   ```

5. Access the application at http://localhost:3000

### Docker Deployment

1. Clone the repository:

2. Create a `.env` file with your configuration (see above)

3. Build and start the containers:
   
   build:
   ```
   docker-compose build --no-cache
   ```
   
   start:
   ```
   docker-compose up -d
   ```
   
   or
   ```
   docker-compose -f docker-compose.dev.yml up -d
   ```

4. Access the application at http://localhost:3000

## API Documentation

The API follows the OpenAPI specification. You can view the full API documentation in the `swagger.yaml` file or by using [Swagger Editor](https://editor.swagger.io/).

### Endpoints

- `GET /api/weather?city={city}` - Get current weather for a city
- `GET /api/forecast?city={city}` - Get 7-day forecast for a city
- `POST /api/subscribe` - Subscribe to weather updates
- `GET /api/confirm/{token}` - Confirm email subscription
- `GET /api/unsubscribe/{token}` - Unsubscribe from weather updates
- `GET /api/subscriptions?email={email}` - Get subscriptions for an email
- `POST /api/unsubscribe` - Unsubscribe by email and city

## Testing

Run the tests with:
`npm test`

## License

This project is licensed under the MIT License.
