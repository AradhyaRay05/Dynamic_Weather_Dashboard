const API_KEY = '6dcd40944831c722d09ab65ce3115d7'; // OpenWeatherMap API key
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';

// Get your free token at: https://aqicn.org/data-platform/token/
const WAQI_TOKEN = '4d5a4720e050056f80696ec9988df9aa8ceec4fb'; // Replace with your WAQI token for production use
const WAQI_URL = 'https://api.waqi.info';

// ===== State Management =====
const state = {
    currentCity: null,
    currentCoords: null,
    unit: 'metric',
    language: 'en',
    theme: 'light',
    favorites: [],
    recentSearches: [],
    badges: {
        explorer: { earned: false, cities: 0 },
        weatherWatcher: { earned: false, refreshes: 0 },
        globeTrotter: { earned: false, countries: new Set() },
        nightOwl: { earned: false },
        earlyBird: { earned: false }
    },
    settings: {
        defaultCity: '',
        defaultUnit: 'metric',
        language: 'en',
        notifications: false,
        autoRefresh: false,
        ambientSounds: false
    },
    offlineData: null,
    map: null,
    currentLayer: null,
    temperatureChart: null,
    precipitationChart: null,
    autoRefreshInterval: null
};

let elements = {};

function initializeElements() {
    elements = {
        
        loadingOverlay: document.getElementById('loading-overlay'),
        
        // Alerts
        weatherAlerts: document.getElementById('weather-alerts'),
        alertMessage: document.getElementById('alert-message'),
        closeAlert: document.getElementById('close-alert'),
        
        // Header
        themeToggle: document.getElementById('theme-toggle'),
        voiceSearchBtn: document.getElementById('voice-search-btn'),
        refreshBtn: document.getElementById('refresh-btn'),
        settingsBtn: document.getElementById('settings-btn'),
        
        // Search
        citySearch: document.getElementById('city-search'),
        searchBtn: document.getElementById('search-btn'),
        locationBtn: document.getElementById('location-btn'),
        recentList: document.getElementById('recent-list'),
        favoritesList: document.getElementById('favorites-list'),
        
        // Unit Toggle
        celsiusBtn: document.getElementById('celsius-btn'),
        fahrenheitBtn: document.getElementById('fahrenheit-btn'),
        kelvinBtn: document.getElementById('kelvin-btn'),
        
        // Current Weather
        cityName: document.getElementById('city-name'),
        currentDate: document.getElementById('current-date'),
        localTime: document.getElementById('local-time'),
        addFavorite: document.getElementById('add-favorite'),
        weatherIcon: document.getElementById('weather-icon'),
        weatherDescription: document.getElementById('weather-description'),
        currentTemp: document.getElementById('current-temp'),
        feelsLike: document.getElementById('feels-like'),
        humidity: document.getElementById('humidity'),
        windSpeed: document.getElementById('wind-speed'),
        windDeg: document.getElementById('wind-deg'),
        windDir: document.getElementById('wind-dir'),
        visibility: document.getElementById('visibility'),
        pressure: document.getElementById('pressure'),
        cloudiness: document.getElementById('cloudiness'),
        sunrise: document.getElementById('sunrise'),
        sunset: document.getElementById('sunset'),
        sunPosition: document.getElementById('sun-position'),
        
        // AQI
        aqiGauge: document.getElementById('aqi-gauge'),
        aqiValue: document.getElementById('aqi-value'),
        aqiStatus: document.getElementById('aqi-status'),
        aqiMessage: document.getElementById('aqi-message'),
        pm25: document.getElementById('pm25'),
        pm10: document.getElementById('pm10'),
        o3: document.getElementById('o3'),
        no2: document.getElementById('no2'),
        so2: document.getElementById('so2'),
        co: document.getElementById('co'),
        
        // Recommendations
        clothingRec: document.getElementById('clothing-rec'),
        umbrellaRec: document.getElementById('umbrella-rec'),
        activityRec: document.getElementById('activity-rec'),
        
        // Share
        shareBtn: document.getElementById('share-btn'),
        
        // Forecasts
        hourlyContainer: document.getElementById('hourly-container'),
        dailyContainer: document.getElementById('daily-container'),
        
        // Map
        weatherMap: document.getElementById('weather-map'),
        mapLayerBtns: document.querySelectorAll('.map-layer-btn'),
        
        // Comparison
        compareCity1: document.getElementById('compare-city1'),
        compareCity2: document.getElementById('compare-city2'),
        compareBtn: document.getElementById('compare-btn'),
        comparisonResult: document.getElementById('comparison-result'),
        
        // Travel
        travelSuggestions: document.getElementById('travel-suggestions'),
        
        // Badges
        badgesContainer: document.getElementById('badges-container'),
        
        // Footer
        lastUpdated: document.getElementById('last-updated'),
        offlineIndicator: document.getElementById('offline-indicator'),
        
        // Settings Modal
        settingsModal: document.getElementById('settings-modal'),
        closeSettings: document.getElementById('close-settings'),
        defaultCity: document.getElementById('default-city'),
        defaultUnit: document.getElementById('default-unit'),
        languageSelect: document.getElementById('language-select'),
        notificationsToggle: document.getElementById('notifications-toggle'),
        autoRefreshToggle: document.getElementById('auto-refresh-toggle'),
        ambientSoundsToggle: document.getElementById('ambient-sounds-toggle'),
        saveSettings: document.getElementById('save-settings'),
        clearData: document.getElementById('clear-data'),
        
        // Share Modal
        shareModal: document.getElementById('share-modal'),
        closeShare: document.getElementById('close-share'),
        sharePreview: document.getElementById('share-preview'),
        copyShare: document.getElementById('copy-share'),
        
        // Audio
        rainSound: document.getElementById('rain-sound'),
        windSound: document.getElementById('wind-sound'),
        thunderSound: document.getElementById('thunder-sound')
    };
    
    // DEBUG: Immediately set test values to confirm elements work
    console.log('=== TESTING DIRECT ELEMENT ACCESS ===');
    const testAqi = document.getElementById('aqi-value');
    const testClothing = document.getElementById('clothing-rec');
    console.log('Direct test - aqi-value element:', testAqi);
    console.log('Direct test - clothing-rec element:', testClothing);
    
    if (testAqi) {
        testAqi.textContent = 'TEST';
        testAqi.style.color = 'red';
        console.log('Set aqi-value to TEST');
    }
    if (testClothing) {
        testClothing.textContent = 'TEST CLOTHING';
        testClothing.style.color = 'red';
        console.log('Set clothing-rec to TEST');
    }
}


// Format temperature based on unit
function formatTemp(temp, unit = state.unit) {
    if (unit === 'kelvin') {
        return `${Math.round(temp + 273.15)}K`;
    }
    if (unit === 'imperial') {
        return `${Math.round(temp * 9/5 + 32)}°F`;
    }
    return `${Math.round(temp)}°C`;
}

// Format wind speed based on unit
function formatWindSpeed(speed, unit = state.unit) {
    if (unit === 'imperial') {
        return `${Math.round(speed * 2.237)} mph`;
    }
    return `${Math.round(speed * 3.6)} km/h`;
}

// Get wind direction text
function getWindDirection(deg) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(deg / 22.5) % 16;
    return directions[index];
}

// Format time from Unix timestamp
function formatTime(timestamp, timezone = 0) {
    const date = new Date((timestamp + timezone) * 1000);
    return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true,
        timeZone: 'UTC'
    });
}

// Format date
function formatDate(timestamp, timezone = 0) {
    const date = new Date((timestamp + timezone) * 1000);
    return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        timeZone: 'UTC'
    });
}

// Format day name
function formatDay(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
}

// Get weather icon URL
function getWeatherIcon(iconCode, size = '4x') {
    return `https://openweathermap.org/img/wn/${iconCode}@${size}.png`;
}

// Show loading overlay
function showLoading() {
    elements.loadingOverlay.classList.remove('hidden');
}

// Hide loading overlay
function hideLoading() {
    elements.loadingOverlay.classList.add('hidden');
}

// Show notification
function showNotification(message, type = 'info') {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('WeatherPulse', {
            body: message,
            icon: 'https://openweathermap.org/img/wn/01d@2x.png'
        });
    }
}


// Fetch current weather data
async function fetchCurrentWeather(lat, lon) {
    try {
        const response = await fetch(
            `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=${state.language}`
        );
        if (!response.ok) throw new Error('Failed to fetch weather data');
        return await response.json();
    } catch (error) {
        console.error('Error fetching current weather:', error);
        throw error;
    }
}

// Fetch forecast data
async function fetchForecast(lat, lon) {
    try {
        const response = await fetch(
            `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=${state.language}`
        );
        if (!response.ok) throw new Error('Failed to fetch forecast data');
        return await response.json();
    } catch (error) {
        console.error('Error fetching forecast:', error);
        throw error;
    }
}

async function fetchAirQuality(lat, lon) {
    try {
        const waqiResponse = await fetch(
            `${WAQI_URL}/feed/geo:${lat};${lon}/?token=${WAQI_TOKEN}`
        );
        
        if (waqiResponse.ok) {
            const waqiData = await waqiResponse.json();
            if (waqiData.status === 'ok' && waqiData.data) {
                console.log('Using WAQI data (ground station):', waqiData.data.city?.name);
                return { source: 'waqi', data: waqiData.data };
            }
        }
        
        console.log('WAQI unavailable, falling back to OpenWeatherMap');
        const owmResponse = await fetch(
            `${BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
        );
        if (!owmResponse.ok) throw new Error('Failed to fetch AQI data');
        const owmData = await owmResponse.json();
        return { source: 'openweathermap', data: owmData };
        
    } catch (error) {
        console.error('Error fetching air quality:', error);
        throw error;
    }
}

async function geocodeCity(cityName) {
    try {
        const response = await fetch(
            `${GEO_URL}/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=${API_KEY}`
        );
        if (!response.ok) throw new Error('Geocoding failed');
        const data = await response.json();
        if (data.length === 0) throw new Error('City not found');
        return data[0];
    } catch (error) {
        console.error('Error geocoding city:', error);
        throw error;
    }
}

function updateCurrentWeather(data) {
    const { name, sys, main, weather, wind, visibility: vis, clouds, dt, timezone, coord } = data;
    
    state.currentCity = name;
    state.currentCoords = coord;
    
    // Location info
    elements.cityName.textContent = `${name}, ${sys.country}`;
    elements.currentDate.textContent = formatDate(dt, timezone);
    
    // Update local time every second
    updateLocalTime(timezone);
    
    // Weather icon and description
    const iconCode = weather[0].icon;
    elements.weatherIcon.src = getWeatherIcon(iconCode);
    elements.weatherIcon.alt = weather[0].description;
    elements.weatherDescription.textContent = weather[0].description;
    
    // Temperature
    elements.currentTemp.textContent = formatTemp(main.temp);
    elements.feelsLike.textContent = `Feels like: ${formatTemp(main.feels_like)}`;
    
    // Weather details
    elements.humidity.textContent = `${main.humidity}%`;
    elements.windSpeed.textContent = formatWindSpeed(wind.speed);
    elements.windDeg.style.transform = `rotate(${wind.deg}deg)`;
    elements.windDir.textContent = getWindDirection(wind.deg);
    elements.visibility.textContent = `${(vis / 1000).toFixed(1)} km`;
    elements.pressure.textContent = `${main.pressure} hPa`;
    elements.cloudiness.textContent = `${clouds.all}%`;
    
    // Sunrise and sunset
    elements.sunrise.textContent = formatTime(sys.sunrise, timezone);
    elements.sunset.textContent = formatTime(sys.sunset, timezone);
    
    // Calculate sun position
    updateSunPosition(sys.sunrise, sys.sunset, dt);
    
    // Update background based on weather
    updateDynamicBackground(weather[0].main, iconCode.includes('n'));
    
    // Update favorite button
    updateFavoriteButton();
    
    // Add to recent searches
    addToRecentSearches(name);
    
    // Update badges
    updateBadges(name, sys.country);
    
    // Generate recommendations
    generateRecommendations(main.temp, weather[0].main, wind.speed);
    
    // Play ambient sounds if enabled
    if (state.settings.ambientSounds) {
        playAmbientSound(weather[0].main);
    }
    
    // Cache for offline use
    cacheWeatherData(data);
    
    // Update last updated time
    elements.lastUpdated.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
}

// Update local time continuously
function updateLocalTime(timezone) {
    const updateTime = () => {
        const now = new Date();
        const utc = now.getTime() + now.getTimezoneOffset() * 60000;
        const localTime = new Date(utc + timezone * 1000);
        elements.localTime.textContent = localTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    };
    
    updateTime();
    setInterval(updateTime, 1000);
}

// Update sun position indicator
function updateSunPosition(sunrise, sunset, currentTime) {
    const dayLength = sunset - sunrise;
    const elapsed = currentTime - sunrise;
    let percentage = (elapsed / dayLength) * 100;
    percentage = Math.max(0, Math.min(100, percentage));
    elements.sunPosition.style.left = `${percentage}%`;
}

// Update dynamic background based on weather
function updateDynamicBackground(condition, isNight) {
    const body = document.body;
    body.classList.remove('weather-sunny', 'weather-cloudy', 'weather-rainy', 'weather-night', 'weather-snow', 'weather-storm');
    
    // Remove rain/snow overlays
    document.querySelectorAll('.rain-overlay, .snow-overlay').forEach(el => el.remove());
    
    if (isNight) {
        body.classList.add('weather-night');
        return;
    }
    
    switch (condition.toLowerCase()) {
        case 'clear':
            body.classList.add('weather-sunny');
            break;
        case 'clouds':
            body.classList.add('weather-cloudy');
            break;
        case 'rain':
        case 'drizzle':
            body.classList.add('weather-rainy');
            createRainEffect();
            break;
        case 'snow':
            body.classList.add('weather-snow');
            createSnowEffect();
            break;
        case 'thunderstorm':
            body.classList.add('weather-storm');
            createRainEffect();
            break;
        default:
            body.classList.add('weather-cloudy');
    }
}

// Create rain effect
function createRainEffect() {
    const rainOverlay = document.createElement('div');
    rainOverlay.className = 'rain-overlay';
    
    for (let i = 0; i < 100; i++) {
        const drop = document.createElement('div');
        drop.className = 'rain-drop';
        drop.style.left = `${Math.random() * 100}%`;
        drop.style.animationDuration = `${0.5 + Math.random() * 0.5}s`;
        drop.style.animationDelay = `${Math.random() * 2}s`;
        rainOverlay.appendChild(drop);
    }
    
    document.body.appendChild(rainOverlay);
}

// Create snow effect
function createSnowEffect() {
    const snowOverlay = document.createElement('div');
    snowOverlay.className = 'snow-overlay';
    
    for (let i = 0; i < 50; i++) {
        const flake = document.createElement('div');
        flake.className = 'snowflake';
        flake.style.left = `${Math.random() * 100}%`;
        flake.style.width = `${5 + Math.random() * 10}px`;
        flake.style.height = flake.style.width;
        flake.style.animationDuration = `${3 + Math.random() * 5}s`;
        flake.style.animationDelay = `${Math.random() * 5}s`;
        snowOverlay.appendChild(flake);
    }
    
    document.body.appendChild(snowOverlay);
}

// Update hourly forecast
function updateHourlyForecast(data) {
    const hourlyData = data.list.slice(0, 12);
    elements.hourlyContainer.innerHTML = '';
    
    hourlyData.forEach((hour, index) => {
        const card = document.createElement('div');
        card.className = `hourly-card ${index === 0 ? 'now' : ''} fade-in`;
        card.style.animationDelay = `${index * 0.05}s`;
        
        const time = index === 0 ? 'Now' : formatTime(hour.dt, data.city.timezone);
        const pop = Math.round((hour.pop || 0) * 100);
        
        card.innerHTML = `
            <p class="hourly-time">${time}</p>
            <img class="hourly-icon" src="${getWeatherIcon(hour.weather[0].icon, '2x')}" alt="${hour.weather[0].description}">
            <p class="hourly-temp">${formatTemp(hour.main.temp)}</p>
            ${pop > 0 ? `<p class="hourly-pop"><i class="fas fa-droplet"></i> ${pop}%</p>` : ''}
        `;
        
        elements.hourlyContainer.appendChild(card);
    });
}

// Update daily forecast
function updateDailyForecast(data) {
    // Group forecast by day
    const dailyData = {};
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000).toDateString();
        if (!dailyData[date]) {
            dailyData[date] = {
                temps: [],
                icons: [],
                descriptions: [],
                dt: item.dt
            };
        }
        dailyData[date].temps.push(item.main.temp);
        dailyData[date].icons.push(item.weather[0].icon);
        dailyData[date].descriptions.push(item.weather[0].description);
    });
    
    elements.dailyContainer.innerHTML = '';
    const days = Object.entries(dailyData).slice(0, 7);
    
    days.forEach(([dateStr, dayData], index) => {
        const date = new Date(dateStr);
        const high = Math.max(...dayData.temps);
        const low = Math.min(...dayData.temps);
        const icon = dayData.icons[Math.floor(dayData.icons.length / 2)];
        const desc = dayData.descriptions[Math.floor(dayData.descriptions.length / 2)];
        
        const card = document.createElement('div');
        card.className = 'daily-card fade-in';
        card.style.animationDelay = `${index * 0.1}s`;
        
        card.innerHTML = `
            <div class="daily-day">
                ${index === 0 ? 'Today' : formatDay(dayData.dt)}
                <span>${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
            <img class="daily-icon" src="${getWeatherIcon(icon, '2x')}" alt="${desc}">
            <p class="daily-desc">${desc}</p>
            <div class="daily-temps">
                <span class="daily-high">${formatTemp(high)}</span>
                <span class="daily-low">${formatTemp(low)}</span>
            </div>
        `;
        
        elements.dailyContainer.appendChild(card);
    });
    
    // Update travel suggestions
    updateTravelSuggestions(days);
}

// Calculate US EPA AQI from PM2.5 concentration
function calculateAQI(pm25) {
    // US EPA AQI breakpoints for PM2.5 (µg/m³)
    const breakpoints = [
        { cLow: 0, cHigh: 12.0, iLow: 0, iHigh: 50 },        // Good
        { cLow: 12.1, cHigh: 35.4, iLow: 51, iHigh: 100 },   // Moderate
        { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },  // Unhealthy for Sensitive Groups
        { cLow: 55.5, cHigh: 150.4, iLow: 151, iHigh: 200 }, // Unhealthy
        { cLow: 150.5, cHigh: 250.4, iLow: 201, iHigh: 300 },// Very Unhealthy
        { cLow: 250.5, cHigh: 350.4, iLow: 301, iHigh: 400 },// Hazardous
        { cLow: 350.5, cHigh: 500.4, iLow: 401, iHigh: 500 } // Hazardous
    ];
    
    for (const bp of breakpoints) {
        if (pm25 >= bp.cLow && pm25 <= bp.cHigh) {
            // Linear interpolation formula
            const aqi = ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (pm25 - bp.cLow) + bp.iLow;
            return Math.round(aqi);
        }
    }
    
    // If PM2.5 exceeds 500.4, cap at 500
    return pm25 > 500.4 ? 500 : 0;
}

// Get AQI category based on US EPA standards
function getAQICategory(aqi) {
    if (aqi <= 50) return { level: 'Good', class: 'good', message: 'Air quality is satisfactory. Little to no risk.' };
    if (aqi <= 100) return { level: 'Moderate', class: 'moderate', message: 'Acceptable air quality. Some pollutants may be a concern for sensitive people.' };
    if (aqi <= 150) return { level: 'Unhealthy for Sensitive Groups', class: 'unhealthy-sensitive', message: 'Sensitive groups may experience health effects. General public is less likely to be affected.' };
    if (aqi <= 200) return { level: 'Unhealthy', class: 'unhealthy', message: 'Everyone may begin to experience health effects. Sensitive groups may experience more serious effects.' };
    if (aqi <= 300) return { level: 'Very Unhealthy', class: 'very-unhealthy', message: 'Health alert: everyone may experience serious health effects.' };
    return { level: 'Hazardous', class: 'hazardous', message: 'Health emergency! The entire population is likely to be affected.' };
}

// Update air quality display - handles both WAQI and OpenWeatherMap data
function updateAirQuality(response) {
    console.log('=== updateAirQuality called ===');
    console.log('AQI Response:', response);
    
    const aqiValueEl = elements.aqiValue || document.getElementById('aqi-value');
    const aqiGaugeEl = elements.aqiGauge || document.getElementById('aqi-gauge');
    const aqiStatusEl = elements.aqiStatus || document.getElementById('aqi-status');
    const aqiMessageEl = elements.aqiMessage || document.getElementById('aqi-message');
    
    if (!response || !response.data) {
        console.warn('No AQI data available');
        if (aqiValueEl) aqiValueEl.textContent = 'N/A';
        if (aqiStatusEl) aqiStatusEl.textContent = 'Not Available';
        if (aqiMessageEl) aqiMessageEl.textContent = 'Air quality data is not available.';
        return;
    }
    
    try {
        let aqi, pm25, pm10, o3, no2, so2, co;
        let stationName = '';
        
        if (response.source === 'waqi') {
            // WAQI data format - uses real ground station data
            const data = response.data;
            aqi = data.aqi;
            stationName = data.city?.name || 'Local Station';
            
            // WAQI provides individual AQI values for each pollutant
            const iaqi = data.iaqi || {};
            pm25 = iaqi.pm25?.v;
            pm10 = iaqi.pm10?.v;
            o3 = iaqi.o3?.v;
            no2 = iaqi.no2?.v;
            so2 = iaqi.so2?.v;
            co = iaqi.co?.v;
            
            console.log('WAQI Station:', stationName, 'AQI:', aqi);
            
        } else {
            // OpenWeatherMap data format - uses model/satellite data
            const data = response.data;
            if (!data.list || data.list.length === 0) {
                throw new Error('No OpenWeatherMap AQI data');
            }
            
            const components = data.list[0].components;
            pm25 = components.pm2_5;
            pm10 = components.pm10;
            o3 = components.o3;
            no2 = components.no2;
            so2 = components.so2;
            co = components.co;
            
            // Calculate AQI from PM2.5 for OpenWeatherMap data
            aqi = calculateAQI(pm25);
            stationName = 'Satellite/Model Data';
            
            console.log('OpenWeatherMap - Calculated AQI:', aqi);
        }
        
        const category = getAQICategory(aqi);
        
        // Update AQI display
        if (aqiValueEl) aqiValueEl.textContent = aqi;
        if (aqiGaugeEl) aqiGaugeEl.className = `aqi-gauge ${category.class}`;
        if (aqiStatusEl) aqiStatusEl.textContent = category.level;
        if (aqiMessageEl) {
            aqiMessageEl.textContent = category.message;
            // Add source indicator
            aqiMessageEl.title = `Data from: ${stationName}`;
        }
        
        // Pollutants - display actual values (for WAQI these might be AQI sub-indices)
        const pm25El = elements.pm25 || document.getElementById('pm25');
        const pm10El = elements.pm10 || document.getElementById('pm10');
        const o3El = elements.o3 || document.getElementById('o3');
        const no2El = elements.no2 || document.getElementById('no2');
        const so2El = elements.so2 || document.getElementById('so2');
        const coEl = elements.co || document.getElementById('co');
        
        if (pm25El) pm25El.textContent = pm25 !== undefined ? `${Number(pm25).toFixed(1)} µg/m³` : 'N/A';
        if (pm10El) pm10El.textContent = pm10 !== undefined ? `${Number(pm10).toFixed(1)} µg/m³` : 'N/A';
        if (o3El) o3El.textContent = o3 !== undefined ? `${Number(o3).toFixed(1)} µg/m³` : 'N/A';
        if (no2El) no2El.textContent = no2 !== undefined ? `${Number(no2).toFixed(1)} µg/m³` : 'N/A';
        if (so2El) so2El.textContent = so2 !== undefined ? `${Number(so2).toFixed(1)} µg/m³` : 'N/A';
        if (coEl) coEl.textContent = co !== undefined ? `${Number(co).toFixed(1)} µg/m³` : 'N/A';
        
        console.log('AQI updated successfully - Source:', response.source);
        
        // Show alert for unhealthy air quality (AQI > 150)
        if (aqi > 150) {
            showWeatherAlert(`⚠️ Air Quality Alert: ${category.level} - ${category.message}`);
        }
    } catch (error) {
        console.error('Error updating AQI display:', error);
    }
}

// Generate AI recommendations
function generateRecommendations(temp, condition, windSpeed) {
    console.log('Generating recommendations:', { temp, condition, windSpeed });
    
    let clothing = '';
    let umbrella = '';
    let activity = '';
    
    // Ensure we have valid data
    if (temp === undefined || temp === null) {
        clothing = 'Weather data loading...';
        umbrella = 'Weather data loading...';
        activity = 'Weather data loading...';
    } else {
        // Clothing recommendations
        if (temp < 5) {
            clothing = 'Wear heavy winter clothing, coat, gloves, and scarf.';
        } else if (temp < 15) {
            clothing = 'A warm jacket or sweater is recommended.';
        } else if (temp < 25) {
            clothing = 'Light layers are perfect for today.';
        } else {
            clothing = 'Light, breathable clothing recommended.';
        }
        
        // Umbrella/rain gear
        const conditionLower = (condition || '').toLowerCase();
        const rainyConditions = ['rain', 'drizzle', 'thunderstorm'];
        if (rainyConditions.some(c => conditionLower.includes(c))) {
            umbrella = 'Don\'t forget your umbrella! ☔';
        } else if (conditionLower.includes('snow')) {
            umbrella = 'Snow expected. Wear waterproof boots! 🥾';
        } else {
            umbrella = 'No rain expected. Sunglasses might be handy! 🕶️';
        }
        
        // Activity recommendations
        if (rainyConditions.some(c => conditionLower.includes(c))) {
            activity = 'Indoor activities recommended today. 🏠';
        } else if (windSpeed > 10) {
            activity = 'Windy day - not ideal for cycling. 💨';
        } else if (temp > 20 && temp < 30 && conditionLower.includes('clear')) {
            activity = 'Perfect weather for outdoor activities! 🏃‍♂️';
        } else if (temp < 5) {
            activity = 'Stay warm - limit outdoor exposure. 🧣';
        } else {
            activity = 'Good conditions for a walk or light exercise. 🚶';
        }
    }
    
    // Update the DOM elements - use direct DOM access as fallback
    console.log('Recommendation elements check:', {
        clothingRec: elements.clothingRec,
        umbrellaRec: elements.umbrellaRec,
        activityRec: elements.activityRec
    });
    
    try {
        const clothingEl = elements.clothingRec || document.getElementById('clothing-rec');
        const umbrellaEl = elements.umbrellaRec || document.getElementById('umbrella-rec');
        const activityEl = elements.activityRec || document.getElementById('activity-rec');
        
        if (clothingEl) {
            clothingEl.textContent = clothing;
            console.log('Set clothing recommendation');
        } else {
            console.error('Could not find clothing-rec element!');
        }
        
        if (umbrellaEl) {
            umbrellaEl.textContent = umbrella;
            console.log('Set umbrella recommendation');
        } else {
            console.error('Could not find umbrella-rec element!');
        }
        
        if (activityEl) {
            activityEl.textContent = activity;
            console.log('Set activity recommendation');
        } else {
            console.error('Could not find activity-rec element!');
        }
        
        console.log('Recommendations set:', { clothing, umbrella, activity });
    } catch (error) {
        console.error('Error setting recommendations:', error);
    }
}

// Update travel suggestions
function updateTravelSuggestions(days) {
    elements.travelSuggestions.innerHTML = '';
    
    days.slice(0, 7).forEach(([dateStr, dayData], index) => {
        const date = new Date(dateStr);
        const avgTemp = dayData.temps.reduce((a, b) => a + b, 0) / dayData.temps.length;
        const mainIcon = dayData.icons[Math.floor(dayData.icons.length / 2)];
        const condition = dayData.descriptions[0];
        
        // Calculate outdoor score
        let score = 100;
        const badConditions = ['rain', 'thunderstorm', 'snow', 'drizzle'];
        
        if (badConditions.some(c => condition.toLowerCase().includes(c))) {
            score -= 40;
        }
        if (avgTemp < 10 || avgTemp > 35) {
            score -= 20;
        }
        if (avgTemp > 40 || avgTemp < 0) {
            score -= 20;
        }
        
        let scoreClass = 'poor';
        let scoreText = 'Poor';
        if (score >= 80) {
            scoreClass = 'excellent';
            scoreText = 'Excellent';
        } else if (score >= 60) {
            scoreClass = 'good';
            scoreText = 'Good';
        } else if (score >= 40) {
            scoreClass = 'fair';
            scoreText = 'Fair';
        }
        
        const card = document.createElement('div');
        card.className = `travel-day ${score >= 80 ? 'recommended' : ''} fade-in`;
        card.style.animationDelay = `${index * 0.1}s`;
        
        card.innerHTML = `
            <h4>${index === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</h4>
            <img src="${getWeatherIcon(mainIcon, '2x')}" alt="${condition}">
            <p>${formatTemp(avgTemp)}</p>
            <p class="travel-score ${scoreClass}">${scoreText} for outdoors</p>
            ${score >= 80 ? '<span>⭐ Recommended</span>' : ''}
        `;
        
        elements.travelSuggestions.appendChild(card);
    });
}

// Update charts
function updateCharts(forecastData) {
    console.log('Updating charts with forecast data:', forecastData);
    
    const hourlyData = forecastData.list.slice(0, 8);
    const labels = hourlyData.map(h => formatTime(h.dt, forecastData.city.timezone));
    const temps = hourlyData.map(h => h.main.temp);
    
    // Get precipitation probability (pop is 0-1, convert to percentage)
    // Also check for rain/snow data as fallback
    const precipitation = hourlyData.map(h => {
        // 'pop' is probability of precipitation (0-1)
        if (h.pop !== undefined && h.pop !== null) {
            return Math.round(h.pop * 100);
        }
        // Fallback: check if there's actual rain/snow data
        if (h.rain && h.rain['3h']) return 100;
        if (h.snow && h.snow['3h']) return 100;
        return 0;
    });
    
    console.log('Chart data - Labels:', labels);
    console.log('Chart data - Temps:', temps);
    console.log('Chart data - Precipitation:', precipitation);
    
    // Temperature Chart
    if (state.temperatureChart) {
        state.temperatureChart.destroy();
    }
    
    const tempCtx = document.getElementById('temperature-chart').getContext('2d');
    state.temperatureChart = new Chart(tempCtx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: temps,
                borderColor: '#4a90d9',
                backgroundColor: 'rgba(74, 144, 217, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#4a90d9',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Temperature Trend',
                    font: {
                        size: 14,
                        weight: '600'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
    
    // Precipitation Chart
    if (state.precipitationChart) {
        state.precipitationChart.destroy();
    }
    
    const hasData = precipitation.some(p => p > 0);
    console.log('Precipitation has data:', hasData, 'Values:', precipitation);
    
    const precipCtx = document.getElementById('precipitation-chart').getContext('2d');
    state.precipitationChart = new Chart(precipCtx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Rain Chance (%)',
                data: precipitation,
                backgroundColor: precipitation.map(p => {
                    if (p >= 70) return 'rgba(41, 128, 185, 0.9)';
                    if (p >= 40) return 'rgba(52, 152, 219, 0.8)';
                    if (p >= 10) return 'rgba(52, 152, 219, 0.6)';
                    return 'rgba(52, 152, 219, 0.4)';
                }),
                borderColor: '#3498db',
                borderWidth: 1,
                borderRadius: 5,
                barThickness: 20,
                minBarLength: 3 // Ensures even 0% values show a tiny bar
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: hasData ? 'Precipitation Probability' : 'Precipitation Probability (Clear skies expected)',
                    font: {
                        size: 14,
                        weight: '600'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Rain Chance: ${context.raw}%`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Initialize map
function initMap(lat, lon) {
    if (state.map) {
        state.map.remove();
    }
    
    state.map = L.map('weather-map').setView([lat, lon], 8);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(state.map);
    
    // Add marker for current location
    L.marker([lat, lon])
        .addTo(state.map)
        .bindPopup(`<b>${state.currentCity}</b>`)
        .openPopup();
    
    // Add default weather layer
    updateMapLayer('temp');
}

// Update map layer
function updateMapLayer(layerType) {
    if (state.currentLayer) {
        state.map.removeLayer(state.currentLayer);
    }
    
    const layerUrl = `https://tile.openweathermap.org/map/${layerType}_new/{z}/{x}/{y}.png?appid=${API_KEY}`;
    
    state.currentLayer = L.tileLayer(layerUrl, {
        attribution: '© OpenWeatherMap',
        opacity: 0.6
    }).addTo(state.map);
}

// ===== Weather Alerts =====
function showWeatherAlert(message) {
    elements.alertMessage.textContent = message;
    elements.weatherAlerts.classList.remove('hidden');
    elements.weatherAlerts.classList.add('show');
}

function hideWeatherAlert() {
    elements.weatherAlerts.classList.remove('show');
    setTimeout(() => {
        elements.weatherAlerts.classList.add('hidden');
    }, 400);
}

// ===== Favorites & Recent Searches =====

// Add to recent searches
function addToRecentSearches(city) {
    const recent = state.recentSearches.filter(c => c.toLowerCase() !== city.toLowerCase());
    recent.unshift(city);
    state.recentSearches = recent.slice(0, 5);
    localStorage.setItem('recentSearches', JSON.stringify(state.recentSearches));
    renderRecentSearches();
}

// Render recent searches
function renderRecentSearches() {
    elements.recentList.innerHTML = '';
    
    state.recentSearches.forEach(city => {
        const item = document.createElement('button');
        item.className = 'recent-item';
        item.innerHTML = `
            <i class="fas fa-history"></i>
            <span>${city}</span>
            <span class="remove-btn" data-city="${city}"><i class="fas fa-times"></i></span>
        `;
        
        item.addEventListener('click', (e) => {
            if (!e.target.closest('.remove-btn')) {
                searchByCity(city);
            }
        });
        
        item.querySelector('.remove-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            removeRecentSearch(city);
        });
        
        elements.recentList.appendChild(item);
    });
}

// Remove recent search
function removeRecentSearch(city) {
    state.recentSearches = state.recentSearches.filter(c => c !== city);
    localStorage.setItem('recentSearches', JSON.stringify(state.recentSearches));
    renderRecentSearches();
}

// Toggle favorite
function toggleFavorite() {
    if (!state.currentCity) return;
    
    const index = state.favorites.findIndex(f => f.toLowerCase() === state.currentCity.toLowerCase());
    
    if (index === -1) {
        state.favorites.push(state.currentCity);
    } else {
        state.favorites.splice(index, 1);
    }
    
    localStorage.setItem('favorites', JSON.stringify(state.favorites));
    updateFavoriteButton();
    renderFavorites();
}

// Update favorite button
function updateFavoriteButton() {
    if (!state.currentCity) return;
    
    const isFavorite = state.favorites.some(f => f.toLowerCase() === state.currentCity.toLowerCase());
    elements.addFavorite.classList.toggle('active', isFavorite);
    elements.addFavorite.innerHTML = isFavorite ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>';
}

// Render favorites
function renderFavorites() {
    elements.favoritesList.innerHTML = '';
    
    state.favorites.forEach(city => {
        const item = document.createElement('button');
        item.className = 'favorite-item';
        item.innerHTML = `
            <i class="fas fa-star"></i>
            <span>${city}</span>
            <span class="remove-btn" data-city="${city}"><i class="fas fa-times"></i></span>
        `;
        
        item.addEventListener('click', (e) => {
            if (!e.target.closest('.remove-btn')) {
                searchByCity(city);
            }
        });
        
        item.querySelector('.remove-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            removeFavorite(city);
        });
        
        elements.favoritesList.appendChild(item);
    });
}

// Remove favorite
function removeFavorite(city) {
    state.favorites = state.favorites.filter(c => c !== city);
    localStorage.setItem('favorites', JSON.stringify(state.favorites));
    updateFavoriteButton();
    renderFavorites();
}

// ===== Badges System =====

function updateBadges(city, country) {
    try {
        // Explorer badge - search 5+ cities
        if (!state.badges.explorer) state.badges.explorer = { earned: false, cities: 0 };
        state.badges.explorer.cities++;
        if (state.badges.explorer.cities >= 5 && !state.badges.explorer.earned) {
            state.badges.explorer.earned = true;
            showNotification('🏆 Badge Earned: Weather Explorer!');
        }
        
        // Globe Trotter - search cities in 3+ countries
        if (!state.badges.globeTrotter) state.badges.globeTrotter = { earned: false, countries: new Set() };
        // Ensure countries is a Set
        if (!(state.badges.globeTrotter.countries instanceof Set)) {
            const arr = Array.isArray(state.badges.globeTrotter.countries) ? state.badges.globeTrotter.countries : [];
            state.badges.globeTrotter.countries = new Set(arr);
        }
        state.badges.globeTrotter.countries.add(country);
        if (state.badges.globeTrotter.countries.size >= 3 && !state.badges.globeTrotter.earned) {
            state.badges.globeTrotter.earned = true;
            showNotification('🏆 Badge Earned: Globe Trotter!');
        }
    
        // Time-based badges
        const hour = new Date().getHours();
        if (hour >= 22 || hour < 5) {
            if (!state.badges.nightOwl.earned) {
                state.badges.nightOwl.earned = true;
                showNotification('🏆 Badge Earned: Night Owl!');
            }
        }
        if (hour >= 5 && hour < 7) {
            if (!state.badges.earlyBird.earned) {
                state.badges.earlyBird.earned = true;
                showNotification('🏆 Badge Earned: Early Bird!');
            }
        }
        
        // Convert Set to Array for JSON storage
        const badgesToSave = JSON.parse(JSON.stringify(state.badges));
        badgesToSave.globeTrotter.countries = Array.from(state.badges.globeTrotter.countries);
        localStorage.setItem('badges', JSON.stringify(badgesToSave));
        renderBadges();
    } catch (error) {
        console.error('Error updating badges:', error);
    }
}

function renderBadges() {
    const badges = [
        { id: 'explorer', icon: 'fa-compass', name: 'Weather Explorer', desc: 'Search 5+ cities', earned: state.badges.explorer.earned },
        { id: 'globeTrotter', icon: 'fa-globe', name: 'Globe Trotter', desc: 'Search in 3+ countries', earned: state.badges.globeTrotter.earned },
        { id: 'weatherWatcher', icon: 'fa-eye', name: 'Weather Watcher', desc: 'Refresh 10+ times', earned: state.badges.weatherWatcher.earned },
        { id: 'nightOwl', icon: 'fa-moon', name: 'Night Owl', desc: 'Check weather after 10 PM', earned: state.badges.nightOwl.earned },
        { id: 'earlyBird', icon: 'fa-sun', name: 'Early Bird', desc: 'Check weather before 7 AM', earned: state.badges.earlyBird.earned }
    ];
    
    elements.badgesContainer.innerHTML = '';
    
    badges.forEach(badge => {
        const badgeEl = document.createElement('div');
        badgeEl.className = `badge ${badge.earned ? 'earned' : ''}`;
        badgeEl.innerHTML = `
            <i class="fas ${badge.icon}"></i>
            <span>${badge.name}</span>
            <small>${badge.desc}</small>
        `;
        elements.badgesContainer.appendChild(badgeEl);
    });
}

// ===== Offline Support =====

function cacheWeatherData(data) {
    state.offlineData = {
        data: data,
        timestamp: Date.now()
    };
    localStorage.setItem('offlineWeather', JSON.stringify(state.offlineData));
}

function loadOfflineData() {
    const cached = localStorage.getItem('offlineWeather');
    if (cached) {
        state.offlineData = JSON.parse(cached);
        // Only use if less than 1 hour old
        if (Date.now() - state.offlineData.timestamp < 3600000) {
            updateCurrentWeather(state.offlineData.data);
            elements.offlineIndicator.classList.remove('hidden');
            return true;
        }
    }
    return false;
}

// ===== Voice Search =====

function initVoiceSearch() {
    console.log('Initializing voice search...');
    
    // Check for browser support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        console.log('Voice search not supported in this browser');
        if (elements.voiceSearchBtn) {
            elements.voiceSearchBtn.style.display = 'none';
        }
        return;
    }
    
    console.log('Voice search supported');
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;
    
    recognition.onstart = () => {
        console.log('Voice recognition started');
        if (elements.voiceSearchBtn) {
            elements.voiceSearchBtn.classList.add('voice-active');
            elements.voiceSearchBtn.style.color = '#e74c3c';
        }
        if (elements.citySearch) {
            elements.citySearch.placeholder = '🎤 Listening...';
        }
    };
    
    recognition.onend = () => {
        console.log('Voice recognition ended');
        if (elements.voiceSearchBtn) {
            elements.voiceSearchBtn.classList.remove('voice-active');
            elements.voiceSearchBtn.style.color = '';
        }
        if (elements.citySearch) {
            elements.citySearch.placeholder = 'Search for a city...';
        }
    };
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const confidence = event.results[0][0].confidence;
        console.log('Voice recognized:', transcript, 'Confidence:', confidence);
        
        if (elements.citySearch) {
            elements.citySearch.value = transcript;
        }
        searchByCity(transcript);
    };
    
    recognition.onerror = (event) => {
        console.error('Voice search error:', event.error);
        if (elements.voiceSearchBtn) {
            elements.voiceSearchBtn.classList.remove('voice-active');
            elements.voiceSearchBtn.style.color = '';
        }
        if (elements.citySearch) {
            elements.citySearch.placeholder = 'Search for a city...';
        }
        
        // Show error to user
        let errorMessage = 'Voice search error';
        switch (event.error) {
            case 'not-allowed':
                errorMessage = '🎤 Microphone access denied. Please allow microphone access.';
                break;
            case 'no-speech':
                errorMessage = '🎤 No speech detected. Please try again.';
                break;
            case 'network':
                errorMessage = '🎤 Network error. Please check your connection.';
                break;
            case 'audio-capture':
                errorMessage = '🎤 No microphone found. Please connect a microphone.';
                break;
        }
        showWeatherAlert(errorMessage);
    };
    
    if (elements.voiceSearchBtn) {
        elements.voiceSearchBtn.addEventListener('click', () => {
            console.log('Voice search button clicked');
            try {
                recognition.start();
            } catch (e) {
                console.error('Could not start voice recognition:', e);
                // Recognition might already be running
                recognition.stop();
            }
        });
    }
}

// ===== Ambient Sounds =====

function stopAllSounds() {
    const sounds = [elements.rainSound, elements.windSound, elements.thunderSound];
    sounds.forEach(sound => {
        if (sound) {
            sound.pause();
            sound.currentTime = 0;
        }
    });
}

function playAmbientSound(condition) {
    // Stop all sounds first
    stopAllSounds();
    
    if (!state.settings.ambientSounds) {
        console.log('Ambient sounds disabled');
        return;
    }
    
    console.log('Playing ambient sound for:', condition);
    
    const conditionLower = condition.toLowerCase();
    let soundToPlay = null;
    
    if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
        soundToPlay = elements.rainSound;
    } else if (conditionLower.includes('thunder') || conditionLower.includes('storm')) {
        soundToPlay = elements.thunderSound;
    } else if (conditionLower.includes('wind') || conditionLower.includes('squall')) {
        soundToPlay = elements.windSound;
    }
    
    if (soundToPlay) {
        soundToPlay.volume = 0.3;
        
        // Handle browser autoplay restrictions
        const playPromise = soundToPlay.play();
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    console.log('Ambient sound playing successfully');
                })
                .catch(error => {
                    console.log('Audio autoplay blocked. User interaction required.', error);
                    // Show a message that sound requires user interaction
                    showWeatherAlert('🔊 Click anywhere to enable ambient sounds');
                    
                    // Add one-time click listener to play sound
                    const enableSound = () => {
                        if (state.settings.ambientSounds && soundToPlay) {
                            soundToPlay.play().catch(() => {});
                        }
                        document.removeEventListener('click', enableSound);
                    };
                    document.addEventListener('click', enableSound, { once: true });
                });
        }
    }
}

// Toggle ambient sounds manually
function toggleAmbientSounds() {
    state.settings.ambientSounds = !state.settings.ambientSounds;
    
    if (state.settings.ambientSounds) {
        // Try to play sound based on current weather
        const condition = elements.weatherDescription?.textContent || '';
        playAmbientSound(condition);
    } else {
        stopAllSounds();
    }
    
    // Update UI
    if (elements.ambientSoundsToggle) {
        elements.ambientSoundsToggle.checked = state.settings.ambientSounds;
    }
    
    // Save setting
    localStorage.setItem('settings', JSON.stringify(state.settings));
    
    console.log('Ambient sounds:', state.settings.ambientSounds ? 'ON' : 'OFF');
}

// ===== Share Functionality =====

function generateShareContent() {
    if (!state.currentCity) return null;
    
    const temp = elements.currentTemp.textContent;
    const condition = elements.weatherDescription.textContent;
    const emoji = getWeatherEmoji(condition);
    
    return {
        text: `It's ${temp} and ${condition} in ${state.currentCity} ${emoji} - WeatherPulse`,
        title: `Weather in ${state.currentCity}`,
        temp: temp,
        condition: condition,
        emoji: emoji
    };
}

function getWeatherEmoji(condition) {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('clear') || conditionLower.includes('sunny')) return '☀️';
    if (conditionLower.includes('cloud')) return '☁️';
    if (conditionLower.includes('rain')) return '🌧️';
    if (conditionLower.includes('thunder')) return '⛈️';
    if (conditionLower.includes('snow')) return '❄️';
    if (conditionLower.includes('mist') || conditionLower.includes('fog')) return '🌫️';
    return '🌤️';
}

function openShareModal() {
    const content = generateShareContent();
    if (!content) return;
    
    elements.sharePreview.innerHTML = `
        <h3>${content.emoji} ${state.currentCity}</h3>
        <p>${content.temp}</p>
        <span>${content.condition}</span>
    `;
    
    elements.shareModal.classList.remove('hidden');
}

function shareToSocial(platform) {
    const content = generateShareContent();
    if (!content) return;
    
    let url = '';
    switch (platform) {
        case 'twitter':
            url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(content.text)}`;
            break;
        case 'facebook':
            url = `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(content.text)}`;
            break;
        case 'whatsapp':
            url = `https://wa.me/?text=${encodeURIComponent(content.text)}`;
            break;
    }
    
    if (url) {
        window.open(url, '_blank', 'width=600,height=400');
    }
}

// ===== City Comparison =====

async function compareCities() {
    const city1 = elements.compareCity1.value.trim();
    const city2 = elements.compareCity2.value.trim();
    
    if (!city1 || !city2) {
        alert('Please enter both city names');
        return;
    }
    
    showLoading();
    
    try {
        const [geo1, geo2] = await Promise.all([
            geocodeCity(city1),
            geocodeCity(city2)
        ]);
        
        const [weather1, weather2] = await Promise.all([
            fetchCurrentWeather(geo1.lat, geo1.lon),
            fetchCurrentWeather(geo2.lat, geo2.lon)
        ]);
        
        renderComparison(weather1, weather2);
    } catch (error) {
        alert('Could not compare cities. Please check the city names.');
    } finally {
        hideLoading();
    }
}

function renderComparison(city1, city2) {
    elements.comparisonResult.classList.remove('hidden');
    elements.comparisonResult.innerHTML = `
        <div class="compare-city-card fade-in">
            <h4>${city1.name}, ${city1.sys.country}</h4>
            <img src="${getWeatherIcon(city1.weather[0].icon)}" alt="${city1.weather[0].description}">
            <p class="compare-temp">${formatTemp(city1.main.temp)}</p>
            <p>${city1.weather[0].description}</p>
            <div class="compare-details">
                <p class="compare-detail"><span>Humidity:</span> ${city1.main.humidity}%</p>
                <p class="compare-detail"><span>Wind:</span> ${formatWindSpeed(city1.wind.speed)}</p>
                <p class="compare-detail"><span>Feels like:</span> ${formatTemp(city1.main.feels_like)}</p>
                <p class="compare-detail"><span>Pressure:</span> ${city1.main.pressure} hPa</p>
            </div>
        </div>
        <div class="compare-city-card fade-in" style="animation-delay: 0.1s">
            <h4>${city2.name}, ${city2.sys.country}</h4>
            <img src="${getWeatherIcon(city2.weather[0].icon)}" alt="${city2.weather[0].description}">
            <p class="compare-temp">${formatTemp(city2.main.temp)}</p>
            <p>${city2.weather[0].description}</p>
            <div class="compare-details">
                <p class="compare-detail"><span>Humidity:</span> ${city2.main.humidity}%</p>
                <p class="compare-detail"><span>Wind:</span> ${formatWindSpeed(city2.wind.speed)}</p>
                <p class="compare-detail"><span>Feels like:</span> ${formatTemp(city2.main.feels_like)}</p>
                <p class="compare-detail"><span>Pressure:</span> ${city2.main.pressure} hPa</p>
            </div>
        </div>
    `;
}

// ===== Settings =====

function loadSettings() {
    const saved = localStorage.getItem('weatherSettings');
    if (saved) {
        state.settings = { ...state.settings, ...JSON.parse(saved) };
    }
    
    // Apply saved settings
    elements.defaultCity.value = state.settings.defaultCity;
    elements.defaultUnit.value = state.settings.defaultUnit;
    elements.languageSelect.value = state.settings.language;
    elements.notificationsToggle.checked = state.settings.notifications;
    elements.autoRefreshToggle.checked = state.settings.autoRefresh;
    elements.ambientSoundsToggle.checked = state.settings.ambientSounds;
    
    // Set initial unit
    state.unit = state.settings.defaultUnit;
    updateUnitButtons();
    
    // Set language
    state.language = state.settings.language;
    
    // Setup auto-refresh if enabled
    if (state.settings.autoRefresh) {
        setupAutoRefresh();
    }
    
    // Request notification permission if enabled
    if (state.settings.notifications && 'Notification' in window) {
        Notification.requestPermission();
    }
}

function saveSettings() {
    state.settings = {
        defaultCity: elements.defaultCity.value,
        defaultUnit: elements.defaultUnit.value,
        language: elements.languageSelect.value,
        notifications: elements.notificationsToggle.checked,
        autoRefresh: elements.autoRefreshToggle.checked,
        ambientSounds: elements.ambientSoundsToggle.checked
    };
    
    localStorage.setItem('weatherSettings', JSON.stringify(state.settings));
    
    // Apply new settings
    state.unit = state.settings.defaultUnit;
    state.language = state.settings.language;
    updateUnitButtons();
    
    if (state.settings.autoRefresh) {
        setupAutoRefresh();
    } else {
        clearInterval(state.autoRefreshInterval);
    }
    
    // Refresh weather with new language
    if (state.currentCoords) {
        fetchAllWeatherData(state.currentCoords.lat, state.currentCoords.lon);
    }
    
    elements.settingsModal.classList.add('hidden');
}

function clearAllData() {
    if (confirm('Are you sure you want to clear all saved data?')) {
        localStorage.clear();
        location.reload();
    }
}

function setupAutoRefresh() {
    clearInterval(state.autoRefreshInterval);
    state.autoRefreshInterval = setInterval(() => {
        if (state.currentCoords) {
            fetchAllWeatherData(state.currentCoords.lat, state.currentCoords.lon);
        }
    }, 30 * 60 * 1000); // 30 minutes
}

// ===== Theme Toggle =====

function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', state.theme);
    localStorage.setItem('theme', state.theme);
    
    const icon = elements.themeToggle.querySelector('i');
    icon.className = state.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

function loadTheme() {
    const saved = localStorage.getItem('theme') || 'light';
    state.theme = saved;
    document.documentElement.setAttribute('data-theme', saved);
    
    const icon = elements.themeToggle.querySelector('i');
    icon.className = saved === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// ===== Unit Toggle =====

function updateUnitButtons() {
    document.querySelectorAll('.unit-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.unit === state.unit);
    });
}

function changeUnit(newUnit) {
    state.unit = newUnit;
    updateUnitButtons();
    
    // Refresh display with new unit
    if (state.currentCoords) {
        fetchAllWeatherData(state.currentCoords.lat, state.currentCoords.lon);
    }
}

// ===== Main Search Functions =====

async function searchByCity(cityName) {
    showLoading();
    
    try {
        const geoData = await geocodeCity(cityName);
        await fetchAllWeatherData(geoData.lat, geoData.lon);
        hideLoading();
        return true;
    } catch (error) {
        hideLoading();
        console.error('Search error:', error);
        return false;
    }
}

function searchByLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by your browser'));
            return;
        }
        
        showLoading();
        
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    await fetchAllWeatherData(position.coords.latitude, position.coords.longitude);
                    hideLoading();
                    resolve(true);
                } catch (error) {
                    hideLoading();
                    reject(error);
                }
            },
            (error) => {
                hideLoading();
                // Don't show alert here, let init() handle the fallback
                reject(error);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    });
}

async function fetchAllWeatherData(lat, lon) {
    try {
        // Fetch current weather and forecast (required)
        console.log('Fetching weather data for:', lat, lon);
        const [currentData, forecastData] = await Promise.all([
            fetchCurrentWeather(lat, lon),
            fetchForecast(lat, lon)
        ]);
        
        console.log('Current weather data received:', currentData);
        
        // Update main weather displays - wrap each in try-catch to prevent one failure from stopping others
        try {
            updateCurrentWeather(currentData);
        } catch (e) { console.error('Error in updateCurrentWeather:', e); }
        
        try {
            updateHourlyForecast(forecastData);
        } catch (e) { console.error('Error in updateHourlyForecast:', e); }
        
        try {
            updateDailyForecast(forecastData);
        } catch (e) { console.error('Error in updateDailyForecast:', e); }
        
        try {
            updateCharts(forecastData);
        } catch (e) { console.error('Error in updateCharts:', e); }
        
        try {
            initMap(lat, lon);
        } catch (e) { console.error('Error in initMap:', e); }
        
        // Fetch AQI separately (optional - may not be available for all locations)
        console.log('=== ABOUT TO FETCH AQI ===');
        try {
            console.log('Fetching AQI data...');
            const aqiData = await fetchAirQuality(lat, lon);
            console.log('AQI data received:', aqiData);
            updateAirQuality(aqiData);
            console.log('=== AQI UPDATE COMPLETE ===');
        } catch (aqiError) {
            console.warn('AQI data not available:', aqiError);
            console.log('=== SETTING AQI TO N/A ===');
            // Set default/unavailable values for AQI
            if (elements.aqiValue) elements.aqiValue.textContent = 'N/A';
            if (elements.aqiStatus) elements.aqiStatus.textContent = 'Not Available';
            if (elements.aqiMessage) elements.aqiMessage.textContent = 'Air quality data is not available for this location.';
            if (elements.pm25) elements.pm25.textContent = 'N/A';
            if (elements.pm10) elements.pm10.textContent = 'N/A';
            if (elements.o3) elements.o3.textContent = 'N/A';
            if (elements.no2) elements.no2.textContent = 'N/A';
            if (elements.so2) elements.so2.textContent = 'N/A';
            if (elements.co) elements.co.textContent = 'N/A';
        }
        
        elements.offlineIndicator.classList.add('hidden');
        
        // Check for weather alerts
        checkWeatherAlerts(currentData, forecastData);
        
    } catch (error) {
        console.error('Error fetching weather data:', error);
        
        // Try to load offline data
        if (!loadOfflineData()) {
            throw error;
        }
    }
}

function checkWeatherAlerts(current, forecast) {
    const alerts = [];
    
    // Check for extreme temperatures
    if (current.main.temp > 40) {
        alerts.push('🔥 Extreme Heat Warning: Temperature above 40°C');
    } else if (current.main.temp < -10) {
        alerts.push('❄️ Extreme Cold Warning: Temperature below -10°C');
    }
    
    // Check for storms
    if (current.weather[0].main.toLowerCase() === 'thunderstorm') {
        alerts.push('⛈️ Thunderstorm Alert: Seek shelter indoors');
    }
    
    // Check for heavy rain in forecast
    const heavyRain = forecast.list.slice(0, 8).some(h => (h.pop || 0) > 0.8);
    if (heavyRain) {
        alerts.push('🌧️ Heavy Rain Expected: Carry an umbrella');
    }
    
    if (alerts.length > 0) {
        showWeatherAlert(alerts[0]);
    }
}

// ===== Event Listeners =====

function setupEventListeners() {
    // Search
    elements.searchBtn.addEventListener('click', () => {
        const city = elements.citySearch.value.trim();
        if (city) searchByCity(city);
    });
    
    elements.citySearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const city = elements.citySearch.value.trim();
            if (city) searchByCity(city);
        }
    });
    
    elements.locationBtn.addEventListener('click', async () => {
        try {
            await searchByLocation();
        } catch (error) {
            // Show a toast message instead of blocking alert
            showWeatherAlert('📍 Location access denied. Please search by city name or enable location in browser settings.');
            setTimeout(hideWeatherAlert, 5000);
        }
    });
    
    // Unit toggle
    elements.celsiusBtn.addEventListener('click', () => changeUnit('metric'));
    elements.fahrenheitBtn.addEventListener('click', () => changeUnit('imperial'));
    elements.kelvinBtn.addEventListener('click', () => changeUnit('kelvin'));
    
    // Theme toggle
    elements.themeToggle.addEventListener('click', toggleTheme);
    
    // Refresh
    elements.refreshBtn.addEventListener('click', () => {
        if (state.currentCoords) {
            state.badges.weatherWatcher.refreshes++;
            if (state.badges.weatherWatcher.refreshes >= 10 && !state.badges.weatherWatcher.earned) {
                state.badges.weatherWatcher.earned = true;
                showNotification('🏆 Badge Earned: Weather Watcher!');
                localStorage.setItem('badges', JSON.stringify(state.badges));
                renderBadges();
            }
            fetchAllWeatherData(state.currentCoords.lat, state.currentCoords.lon);
        }
    });
    
    // Favorites
    elements.addFavorite.addEventListener('click', toggleFavorite);
    
    // Settings
    elements.settingsBtn.addEventListener('click', () => {
        elements.settingsModal.classList.remove('hidden');
    });
    
    elements.closeSettings.addEventListener('click', () => {
        elements.settingsModal.classList.add('hidden');
    });
    
    elements.saveSettings.addEventListener('click', saveSettings);
    elements.clearData.addEventListener('click', clearAllData);
    
    // Share
    elements.shareBtn.addEventListener('click', openShareModal);
    
    elements.closeShare.addEventListener('click', () => {
        elements.shareModal.classList.add('hidden');
    });
    
    document.querySelectorAll('.share-social-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.id === 'copy-share') {
                const content = generateShareContent();
                if (content) {
                    navigator.clipboard.writeText(content.text)
                        .then(() => alert('Copied to clipboard!'))
                        .catch(() => alert('Could not copy to clipboard'));
                }
            } else {
                shareToSocial(btn.dataset.platform);
            }
        });
    });
    
    // Weather alerts
    elements.closeAlert.addEventListener('click', hideWeatherAlert);
    
    // Map layers
    elements.mapLayerBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.mapLayerBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateMapLayer(btn.dataset.layer);
        });
    });
    
    // City comparison
    elements.compareBtn.addEventListener('click', compareCities);
    
    // Close modals on outside click
    elements.settingsModal.addEventListener('click', (e) => {
        if (e.target === elements.settingsModal) {
            elements.settingsModal.classList.add('hidden');
        }
    });
    
    elements.shareModal.addEventListener('click', (e) => {
        if (e.target === elements.shareModal) {
            elements.shareModal.classList.add('hidden');
        }
    });
    
    // Offline detection
    window.addEventListener('online', () => {
        elements.offlineIndicator.classList.add('hidden');
        if (state.currentCoords) {
            fetchAllWeatherData(state.currentCoords.lat, state.currentCoords.lon);
        }
    });
    
    window.addEventListener('offline', () => {
        elements.offlineIndicator.classList.remove('hidden');
    });
}

// ===== Initialization =====

async function init() {
    console.log('=== INIT STARTING ===');
    
    // Initialize DOM elements first
    initializeElements();
    
    // Debug: Check if elements were initialized
    console.log('Elements initialized:', {
        aqiValue: elements.aqiValue,
        aqiStatus: elements.aqiStatus,
        clothingRec: elements.clothingRec,
        umbrellaRec: elements.umbrellaRec,
        activityRec: elements.activityRec
    });
    
    // Clear corrupted badges data (remove this line after first run)
    localStorage.removeItem('badges');
    
    // Load saved data
    state.recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    state.favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    // Load badges with special handling for Set (countries)
    const savedBadges = JSON.parse(localStorage.getItem('badges') || 'null');
    if (savedBadges) {
        state.badges = savedBadges;
        // Convert countries array back to Set (JSON doesn't support Sets)
        if (savedBadges.globeTrotter && savedBadges.globeTrotter.countries) {
            if (Array.isArray(savedBadges.globeTrotter.countries)) {
                state.badges.globeTrotter.countries = new Set(savedBadges.globeTrotter.countries);
            } else {
                state.badges.globeTrotter.countries = new Set();
            }
        } else {
            state.badges.globeTrotter = { earned: false, countries: new Set() };
        }
    }
    
    // Setup
    loadTheme();
    loadSettings();
    setupEventListeners();
    initVoiceSearch();
    renderRecentSearches();
    renderFavorites();
    renderBadges();
    
    // Initial weather fetch with fallback chain
    let weatherLoaded = false;
    
    // 1. Try default city from settings
    if (state.settings.defaultCity) {
        weatherLoaded = await searchByCity(state.settings.defaultCity);
    }
    
    // 2. Try geolocation if no default city or it failed
    if (!weatherLoaded) {
        try {
            await searchByLocation();
            weatherLoaded = true;
        } catch (error) {
            console.log('Geolocation failed, falling back to default city');
        }
    }
    
    // 3. Fall back to offline data or default city
    if (!weatherLoaded) {
        if (!loadOfflineData()) {
            // Try New Delhi as default (user seems to be in India based on IP)
            const success = await searchByCity('New Delhi');
            if (!success) {
                await searchByCity('London');
            }
        }
    }
    
    hideLoading();
}

// Start the app
document.addEventListener('DOMContentLoaded', init);

// Service Worker Registration for PWA/Offline support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registered:', registration.scope);
            })
            .catch(error => {
                console.log('ServiceWorker registration failed:', error);
            });
    });
}