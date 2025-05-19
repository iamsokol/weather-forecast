document.addEventListener("DOMContentLoaded", () => {
  const weatherTab = document.getElementById("weather-tab")
  const subscribeTab = document.getElementById("subscribe-tab")
  const weatherContent = document.getElementById("weather-content")
  const subscribeContent = document.getElementById("subscribe-content")
  const cityInput = document.getElementById("city-input")
  const searchBtn = document.getElementById("search-btn")
  const weatherContainer = document.getElementById("weather-container")
  const loadingSpinner = document.getElementById("loading-spinner")
  const errorMessage = document.getElementById("error-message")
  const subscribeForm = document.getElementById("subscribe-form")
  const subscribeError = document.getElementById("subscribe-error")
  const subscribeSuccess = document.getElementById("subscribe-success")

  weatherTab.addEventListener("click", () => {
    weatherTab.classList.add("active")
    subscribeTab.classList.remove("active")
    weatherContent.classList.remove("hidden")
    subscribeContent.classList.add("hidden")
    subscribeError.classList.add("hidden")
    subscribeSuccess.classList.add("hidden")
  })

  subscribeTab.addEventListener("click", () => {
    subscribeTab.classList.add("active")
    weatherTab.classList.remove("active")
    subscribeContent.classList.remove("hidden")
    weatherContent.classList.add("hidden")
    errorMessage.classList.add("hidden")
  })

  searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim()
    if (city) {
      getWeatherForecast(city)
    }
  })

  cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const city = cityInput.value.trim()
      if (city) {
        getWeatherForecast(city)
      }
    }
  })

  subscribeForm.addEventListener("submit", (e) => {
    e.preventDefault()

    const email = document.getElementById("email-input").value.trim()
    const city = document.getElementById("subscribe-city-input").value.trim()
    const frequencyInputs = document.getElementsByName("frequency")

    let frequency

    for (const input of frequencyInputs) {
      if (input.checked) {
        frequency = input.value
        break
      }
    }

    if (!email || !city || !frequency) {
      subscribeError.textContent = "All fields are required"
      subscribeError.classList.remove("hidden")
      subscribeSuccess.classList.add("hidden")
      return
    }

    subscribeError.classList.add("hidden")
    subscribeSuccess.classList.add("hidden")

    submitSubscription(email, city, frequency)
  })

  async function getWeatherForecast(city) {
    try {
      loadingSpinner.classList.remove("hidden")
      weatherContainer.classList.add("hidden")
      errorMessage.classList.add("hidden")

      const response = await fetch(`/api/forecast?city=${encodeURIComponent(city)}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch weather data")
      }

      const data = await response.json()

      renderWeatherData(data)

      loadingSpinner.classList.add("hidden")
      weatherContainer.classList.remove("hidden")
    } catch (error) {
      console.error("Error fetching weather:", error)

      errorMessage.textContent = error.message || "An error occurred while fetching weather data"
      errorMessage.classList.remove("hidden")
      weatherContainer.classList.add("hidden")
      loadingSpinner.classList.add("hidden")
    }
  }

  function renderWeatherData(data) {
    const { current, forecast } = data

    document.getElementById("location").textContent = `${current.location}, ${current.country}`
    document.getElementById("date").textContent = new Date(current.localtime).toLocaleString()
    document.getElementById("temperature").textContent = `${current.temperature}°C`
    document.getElementById("weather-description").textContent = current.description
    document.getElementById("weather-icon").src = current.icon
    document.getElementById("weather-icon").alt = current.description

    document.getElementById("feels-like").textContent = `${current.feelslike}°C`
    document.getElementById("humidity").textContent = `${current.humidity}%`
    document.getElementById("wind-speed").textContent = `${current.wind} km/h`
    document.getElementById("pressure").textContent = `${current.pressure} mb`

    if (current.uv) document.getElementById("uv-index").textContent = current.uv
    if (current.visibility) document.getElementById("visibility").textContent = `${current.visibility} km`
    if (current.cloud) document.getElementById("cloud-cover").textContent = `${current.cloud}%`

    const forecastContainer = document.getElementById("forecast-days")
    forecastContainer.innerHTML = ""

    forecast.forEach((day) => {
      const date = new Date(day.date)
      const dayName = date.toLocaleDateString("en-US", { weekday: "short" })
      const monthDay = date.toLocaleDateString("en-US", { month: "short", day: "numeric" })

      const dayElement = document.createElement("div")
      dayElement.className = "forecast-day"
      dayElement.innerHTML = `
        <div class="forecast-date">${dayName}, ${monthDay}</div>
        <div class="forecast-icon">
          <img src="${day.icon}" alt="${day.condition}" width="50" height="50">
        </div>
        <div class="forecast-temp">
          <span class="forecast-high">${day.maxtemp_c}°</span>
          <span class="forecast-low">${day.mintemp_c}°</span>
        </div>
        <div class="forecast-description">${day.condition}</div>
      `

      forecastContainer.appendChild(dayElement)
    })
  }

  async function submitSubscription(email, city, frequency) {
    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, city, frequency }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create subscription")
      }

      subscribeSuccess.textContent = data.message || "Subscription created. Check your email for confirmation."
      subscribeSuccess.classList.remove("hidden")

      subscribeForm.reset()
    } catch (error) {
      console.error("Error creating subscription:", error)

      subscribeError.textContent = error.message || "An error occurred while creating subscription"
      subscribeError.classList.remove("hidden")
      subscribeSuccess.classList.add("hidden")
    }
  }
})
