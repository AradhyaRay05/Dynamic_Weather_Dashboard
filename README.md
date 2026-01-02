# 🌦️ Dynamic Weather Dashboard - WeatherPulse

A comprehensive, feature-rich weather dashboard built with vanilla HTML, CSS, and JavaScript. Get real-time weather data, forecasts, air quality information, and much more with a beautiful, responsive interface.

![WeatherPulse Dashboard](https://img.shields.io/badge/WeatherPulse-Dynamic%20Weather%20Dashboard-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Version](https://img.shields.io/badge/version-1.0.0-orange)

## ✨ Features

### Core Features
- 🌡️ **Current Weather Data** - Temperature, humidity, wind speed, pressure, visibility, cloudiness
- 📍 **Geolocation Auto-Detection** - Automatically detect user's location
- 🔍 **City Search** - Search weather for any city worldwide
- 📱 **Responsive Design** - Optimized for desktop and mobile devices
- 🔄 **Temperature Unit Toggle** - Switch between Celsius, Fahrenheit, and Kelvin

### Advanced Features
- ⏰ **Hourly Forecast** - 12-hour forecast with precipitation probability
- 📅 **7-Day Forecast** - Weekly weather predictions with high/low temperatures
- 🌅 **Sunrise & Sunset Times** - With animated sun position indicator
- 🌬️ **Air Quality Index (AQI)** - Detailed pollutant breakdown (PM2.5, PM10, O₃, NO₂, SO₂, CO)
- 🤖 **AI Recommendations** - Smart clothing, umbrella, and activity suggestions
- 📊 **Weather Charts** - Temperature trends and precipitation probability graphs
- 🗺️ **Interactive Map** - Weather layers (temperature, precipitation, clouds, wind)

### User Experience
- 🌙 **Dark/Light Mode** - Theme toggle with persistent preference
- ⭐ **Favorites** - Save preferred locations for quick access
- 🕐 **Recent Searches** - Quick access to recently searched cities
- 🎤 **Voice Search** - Search by speaking city names
- 📤 **Share Weather** - Share to Twitter, Facebook, WhatsApp, or copy to clipboard
- 🔔 **Weather Alerts** - Notifications for extreme weather conditions
- 🔊 **Ambient Sounds** - Optional rain, wind, and thunder sounds

### Comparison & Planning
- ⚖️ **City Comparison** - Compare weather between two cities side by side
- ✈️ **Travel Suggestions** - Best days for outdoor activities based on weather
- 🏆 **Gamification** - Earn badges like "Weather Explorer", "Globe Trotter", "Night Owl"

### Technical Features
- 💾 **Offline Mode** - Cached weather data for offline access
- 🔄 **Auto-Refresh** - Optional 30-minute auto-refresh
- 🌐 **Multi-Language Support** - 10+ languages supported
- ⚡ **Dynamic Backgrounds** - Weather-based animated backgrounds (rain, snow effects)
- ⌨️ **Accessibility** - ARIA labels, keyboard navigation, high contrast support

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **APIs**:
  - [OpenWeatherMap API](https://openweathermap.org/api) - Weather data
  - [OpenWeatherMap Geocoding API](https://openweathermap.org/api/geocoding-api) - City to coordinates
  - [OpenWeatherMap Air Pollution API](https://openweathermap.org/api/air-pollution) - AQI data
  - [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API) - User location
- **Libraries**:
  - [Chart.js](https://www.chartjs.org/) - Weather trend charts
  - [Leaflet.js](https://leafletjs.com/) - Interactive weather maps
  - [Font Awesome](https://fontawesome.com/) - Icons
  - [Google Fonts (Poppins)](https://fonts.google.com/specimen/Poppins) - Typography

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- An OpenWeatherMap API key (free tier available)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/dynamic-weather-dashboard.git
   cd dynamic-weather-dashboard
   ```

2. **Get your API Key**
   - Sign up at [OpenWeatherMap](https://openweathermap.org/api)
   - Generate a free API key
   - The free tier includes:
     - Current weather data
     - 5-day/3-hour forecast
     - Air pollution data
     - Geocoding

3. **Configure the API Key**
   - Open `app.js`
   - Replace `YOUR_API_KEY_HERE` with your actual API key:
   ```javascript
   const API_KEY = 'your_actual_api_key_here';
   ```

4. **Run the Application**
   - Open `index.html` in your browser
   - Or use a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js (npx)
   npx serve
   
   # Using VS Code Live Server extension
   # Right-click index.html → Open with Live Server
   ```

5. **Access the Dashboard**
   - Navigate to `http://localhost:8000` (or your server address)
   - Allow location access for auto-detection, or search for a city

## 📁 Project Structure

```
Dynamic Weather Dashboard/
├── index.html          # Main HTML structure
├── style.css           # Complete styling with themes
├── app.js              # All JavaScript functionality
├── README.md           # Documentation
└── .gitignore          # Git ignore file
```

## 🎯 Usage Guide

### Basic Usage
1. **Auto-Location**: Click "My Location" to detect your current location
2. **Search**: Type a city name and press Enter or click Search
3. **Unit Toggle**: Click °C, °F, or K to change temperature units

### Advanced Features
1. **Voice Search**: Click the microphone icon and speak a city name
2. **Favorites**: Click the star icon to save a location
3. **Compare Cities**: Enter two city names in the comparison section
4. **Map Layers**: Switch between temperature, precipitation, clouds, and wind views
5. **Settings**: Click the gear icon to customize default city, language, and preferences

### Keyboard Shortcuts
- `Enter` in search box: Submit search
- `Escape`: Close modals

## 🎨 Customization

### Themes
The dashboard automatically applies dynamic backgrounds based on weather:
- ☀️ Sunny: Purple gradient
- ☁️ Cloudy: Gray gradient
- 🌧️ Rainy: Blue gradient with rain animation
- ❄️ Snow: Light gradient with snowflake animation
- 🌙 Night: Dark gradient

### Colors
Modify CSS variables in `style.css`:
```css
:root {
    --primary-color: #4a90d9;
    --secondary-color: #f39c12;
    /* ... more variables */
}
```

## 📱 Responsive Breakpoints

- **Desktop**: 1200px and above
- **Tablet**: 768px - 1199px
- **Mobile**: Below 768px

## 🔒 Privacy

- Location data is only used for weather queries
- Preferences are stored locally in your browser (LocalStorage)
- No data is sent to third-party servers (except OpenWeatherMap API)

## 🐛 Troubleshooting

### Common Issues

1. **Location not working**
   - Ensure location permissions are enabled in your browser
   - Try using HTTPS instead of HTTP
   - Check if your browser supports Geolocation API

2. **API errors**
   - Verify your API key is correct
   - Check if you've exceeded the free tier limits (60 calls/minute)
   - Ensure the city name is spelled correctly

3. **Map not loading**
   - Check internet connection
   - Verify Leaflet.js is loading properly
   - Check browser console for errors

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenWeatherMap](https://openweathermap.org/) for the weather API
- [Leaflet](https://leafletjs.com/) for the interactive map library
- [Chart.js](https://www.chartjs.org/) for data visualization
- [Font Awesome](https://fontawesome.com/) for icons
- [Google Fonts](https://fonts.google.com/) for the Poppins font

## 📞 Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/yourusername/dynamic-weather-dashboard/issues) page
2. Create a new issue with detailed information about the problem
3. Include browser version, OS, and screenshots if applicable

---

Made with ❤️ by [Your Name]

⭐ Star this repo if you find it helpful!