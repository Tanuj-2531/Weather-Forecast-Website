// SECTION E1-1-1: API Configuration
const API_CONFIG = {
    key: '14383adc69373ac4a56131c0e6176a2c', // Replace with your OpenWeatherMap API key
    baseURL: 'https://api.openweathermap.org/data/2.5/',
    iconURL: 'https://openweathermap.org/img/wn/',
    geoURL: 'https://api.openweathermap.org/geo/1.0/'
};

// SECTION E1-1-2: Weather API Class
class WeatherAPI {
    constructor() {
        this.apiKey = API_CONFIG.key;
        this.baseURL = API_CONFIG.baseURL;
        this.iconURL = API_CONFIG.iconURL;
        this.geoURL = API_CONFIG.geoURL;
    }

    // SECTION E1-1-3: Check API Key Validity
    isApiKeyValid() {
        return this.apiKey && this.apiKey !== 'YOUR_API_KEY_HERE' && this.apiKey.length > 10;
    }

    // SECTION E1-1-4: Get Weather Icon URL
    getWeatherIconURL(iconCode, size = '@2x') {
        return `${this.iconURL}${iconCode}${size}.png`;
    }

    // SECTION E1-1-5: Handle API Errors (ENHANCED)
handleApiError(error, context = 'API call') {
    console.error(`❌ ${context} failed:`, error);
    
    if (error.message.includes('fetch')) {
        throw new Error('Network error. Please check your internet connection.');
    }
    
    if (error.message.includes('401')) {
        throw new Error('Invalid API key. Please check your OpenWeatherMap API key.');
    }
    
    if (error.message.includes('404')) {
        throw new Error('City not found. Please check the city name and try again.');
    }
    
    if (error.message.includes('429')) {
        throw new Error('Too many requests. Please wait a moment and try again.');
    }
    
    if (error.message.includes('400')) {
        throw new Error('Invalid request. Please enter a valid city name.');
    }
    
    throw new Error('Something went wrong. Please try again later.');
}


    // SECTION E1-1-6: Make API Request
    async makeApiRequest(url, context = 'API request') {
        try {
            console.log(`🌐 Making ${context}:`, url);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log(`✅ ${context} successful:`, data);
            
            return data;
        } catch (error) {
            this.handleApiError(error, context);
        }
    }

   // SECTION E1-1-7: Get Current Weather by City (WITH VALIDATION)
async getCurrentWeatherByCity(cityName) {
    if (!this.isApiKeyValid()) {
        throw new Error('Please add your OpenWeatherMap API key to js/api.js');
    }

    // SECTION H10-4-1: Pre-validate city name
    const cleanCityName = cityName.trim();
    if (/^\d+$/.test(cleanCityName)) {
        throw new Error(`"${cleanCityName}" is not a valid city name. Please enter a real city name like "London" or "New York".`);
    }

    const url = `${this.baseURL}weather?q=${encodeURIComponent(cleanCityName)}&appid=${this.apiKey}&units=metric`;
    const data = await this.makeApiRequest(url, `Current weather for ${cleanCityName}`);
    
    // SECTION H10-4-2: Validate response
    this.validateWeatherResponse(data, cleanCityName);
    
    return data;
}


    // SECTION E1-1-8: Get Current Weather by Coordinates
    async getCurrentWeatherByCoords(lat, lon) {
        if (!this.isApiKeyValid()) {
            throw new Error('Please add your OpenWeatherMap API key to js/api.js');
        }

        const url = `${this.baseURL}weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`;
        return await this.makeApiRequest(url, `Current weather for coordinates ${lat}, ${lon}`);
    }

    // SECTION E1-1-9: Get 5-Day Forecast by City
    async getForecastByCity(cityName) {
        if (!this.isApiKeyValid()) {
            throw new Error('Please add your OpenWeatherMap API key to js/api.js');
        }

        const url = `${this.baseURL}forecast?q=${encodeURIComponent(cityName)}&appid=${this.apiKey}&units=metric`;
        return await this.makeApiRequest(url, `5-day forecast for ${cityName}`);
    }

    // SECTION E1-1-10: Get 5-Day Forecast by Coordinates
    async getForecastByCoords(lat, lon) {
        if (!this.isApiKeyValid()) {
            throw new Error('Please add your OpenWeatherMap API key to js/api.js');
        }

        const url = `${this.baseURL}forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`;
        return await this.makeApiRequest(url, `5-day forecast for coordinates ${lat}, ${lon}`);
    }
    // SECTION H10-3-1: Validate API Response
validateWeatherResponse(data, searchTerm) {
    // Check if response has required fields
    if (!data || !data.name || !data.main || !data.weather) {
        throw new Error('Invalid weather data received from API');
    }
    
    // Check if the returned city name makes sense
    const returnedCity = data.name.toLowerCase();
    const searchedCity = searchTerm.toLowerCase();
    
    // If search term was numbers only, reject the response
    if (/^\d+$/.test(searchTerm)) {
        throw new Error(`"${searchTerm}" is not a valid city name. Please enter a real city name.`);
    }
    
    // Check for suspicious responses (like "123" returning actual data)
    if (returnedCity.length < 2 || /^\d+$/.test(returnedCity)) {
        throw new Error(`Invalid city data received. Please try a different city name.`);
    }
    
    console.log(`✅ API response validated for ${data.name}`);
    return true;
}

   // SECTION H12-1-1: Enhanced City Detection from Coordinates
async getCityFromCoordsEnhanced(lat, lon) {
    if (!this.isApiKeyValid()) {
        throw new Error('Please add your OpenWeatherMap API key to js/api.js');
    }

    try {
        // SECTION H12-1-2: Try multiple geocoding approaches
        console.log(`🌍 Getting city name for coordinates: ${lat}, ${lon}`);
        
        // Approach 1: OpenWeatherMap reverse geocoding (multiple results)
        const reverseUrl = `${this.geoURL}reverse?lat=${lat}&lon=${lon}&limit=5&appid=${this.apiKey}`;
        const reverseResults = await this.makeApiRequest(reverseUrl, `Reverse geocoding for ${lat}, ${lon}`);
        
        if (reverseResults && reverseResults.length > 0) {
            // SECTION H12-1-3: Find the best city match
            let bestMatch = null;
            
            // Priority: Look for major cities first
            const majorCities = ['kanpur', 'lucknow', 'delhi', 'mumbai', 'kolkata', 'chennai', 'bangalore', 'hyderabad'];
            
            for (let result of reverseResults) {
                const cityName = result.name.toLowerCase();
                
                // If we find a major city, use it
                if (majorCities.includes(cityName)) {
                    bestMatch = result;
                    console.log(`✅ Found major city: ${result.name}`);
                    break;
                }
                
                // Otherwise, prefer results with 'state' field (more likely to be cities)
                if (result.state && !bestMatch) {
                    bestMatch = result;
                }
            }
            
            // Use best match or first result
            const selectedResult = bestMatch || reverseResults[0];
            
            console.log(`🎯 Selected location: ${selectedResult.name}, ${selectedResult.state || selectedResult.country}`);
            return selectedResult;
        }
        
        // Approach 2: If reverse geocoding fails, try getting weather data directly
        // and use the city name from weather response
        console.log('⚠️ Reverse geocoding failed, trying weather API directly');
        const weatherUrl = `${this.baseURL}weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`;
        const weatherData = await this.makeApiRequest(weatherUrl, `Weather data for coordinates ${lat}, ${lon}`);
        
        if (weatherData && weatherData.name) {
            return {
                name: weatherData.name,
                country: weatherData.sys.country,
                state: null,
                lat: lat,
                lon: lon
            };
        }
        
        throw new Error('Could not determine city name from coordinates');
        
    } catch (error) {
        console.error('❌ Enhanced city detection failed:', error);
        throw new Error('Unable to determine your location. Please search for your city manually.');
    }
}

}

// SECTION E1-1-11: Weather Data Processor Class
class WeatherDataProcessor {
    constructor() {
        this.temperatureUnit = 'celsius';
    }

    // SECTION E1-1-12: Set Temperature Unit
    setTemperatureUnit(unit) {
        this.temperatureUnit = unit;
    }

    // SECTION E1-1-13: Convert Temperature
    convertTemperature(tempCelsius) {
        if (this.temperatureUnit === 'fahrenheit') {
            return Math.round((tempCelsius * 9/5) + 32);
        }
        return Math.round(tempCelsius);
    }

    // SECTION E1-1-14: Get Temperature Symbol
    getTemperatureSymbol() {
        return this.temperatureUnit === 'fahrenheit' ? '°F' : '°C';
    }

   // SECTION E1-1-15: Process Current Weather Data (UPDATED)
processCurrentWeather(data) {
    // SECTION H3-1-1: Get the most relevant weather condition
    let primaryWeather = data.weather[0]; // Default to first weather condition
    
    // If there are multiple weather conditions, prioritize precipitation
    if (data.weather.length > 1) {
        // Priority order: thunderstorm > rain > drizzle > snow > atmosphere > clouds > clear
        const priorityOrder = ['thunderstorm', 'rain', 'drizzle', 'snow', 'mist', 'fog', 'haze', 'dust', 'sand', 'ash', 'squall', 'tornado', 'clouds', 'clear'];
        
        for (let priority of priorityOrder) {
            const matchingWeather = data.weather.find(w => 
                w.main.toLowerCase().includes(priority) || 
                w.description.toLowerCase().includes(priority)
            );
            if (matchingWeather) {
                primaryWeather = matchingWeather;
                break;
            }
        }
    }
    
    // SECTION H3-1-2: Enhanced weather condition detection
    const weatherMain = primaryWeather.main.toLowerCase();
    const weatherDesc = primaryWeather.description.toLowerCase();
    
    // Determine the most accurate icon based on conditions
    let weatherIcon = primaryWeather.icon;
    
    // Override icon if we detect specific conditions that should take priority
    if (weatherDesc.includes('rain') || weatherDesc.includes('drizzle')) {
        // Use rain icon variants
        if (weatherDesc.includes('light')) {
            weatherIcon = weatherIcon.includes('d') ? '10d' : '10n'; // light rain
        } else if (weatherDesc.includes('heavy')) {
            weatherIcon = weatherIcon.includes('d') ? '09d' : '09n'; // heavy rain
        } else {
            weatherIcon = weatherIcon.includes('d') ? '10d' : '10n'; // moderate rain
        }
    } else if (weatherDesc.includes('thunderstorm') || weatherDesc.includes('storm')) {
        weatherIcon = weatherIcon.includes('d') ? '11d' : '11n'; // thunderstorm
    } else if (weatherDesc.includes('snow')) {
        weatherIcon = weatherIcon.includes('d') ? '13d' : '13n'; // snow
    } else if (weatherDesc.includes('mist') || weatherDesc.includes('fog') || weatherDesc.includes('haze')) {
        weatherIcon = weatherIcon.includes('d') ? '50d' : '50n'; // mist/fog
    }

    return {
        city: data.name,
        country: data.sys.country,
        temperature: this.convertTemperature(data.main.temp),
        feelsLike: this.convertTemperature(data.main.feels_like),
        description: primaryWeather.description, // Use the prioritized weather description
        icon: weatherIcon, // Use the corrected icon
        iconURL: API_CONFIG.iconURL + weatherIcon + '@2x.png',
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
        coordinates: {
            lat: data.coord.lat,
            lon: data.coord.lon
        },
        temperatureUnit: this.temperatureUnit,
        temperatureSymbol: this.getTemperatureSymbol(),
        
        // SECTION H3-1-3: Add debug information
        allWeatherConditions: data.weather, // Keep all conditions for debugging
        rawWeatherData: {
            main: primaryWeather.main,
            description: primaryWeather.description,
            originalIcon: primaryWeather.icon,
            correctedIcon: weatherIcon
        }
    };
}


   // SECTION E1-1-16: Process Forecast Data (ENHANCED WITH WIND & HUMIDITY)
processForecastData(data) {
    const dailyForecasts = {};
    
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dateKey = date.toDateString();
        
        if (!dailyForecasts[dateKey]) {
            dailyForecasts[dateKey] = {
                date: date,
                temperatures: [],
                descriptions: [],
                icons: [],
                humidity: [],
                windSpeed: [],
                pressure: []
            };
        }
        
        dailyForecasts[dateKey].temperatures.push(item.main.temp);
        dailyForecasts[dateKey].descriptions.push(item.weather[0].description);
        dailyForecasts[dateKey].icons.push(item.weather[0].icon);
        dailyForecasts[dateKey].humidity.push(item.main.humidity);
        dailyForecasts[dateKey].windSpeed.push(item.wind ? item.wind.speed : 0);
        dailyForecasts[dateKey].pressure.push(item.main.pressure);
    });

    return Object.values(dailyForecasts).slice(0, 5).map(day => {
        const maxTemp = Math.max(...day.temperatures);
        const minTemp = Math.min(...day.temperatures);
        const avgHumidity = Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length);
        const avgWindSpeed = Math.round((day.windSpeed.reduce((a, b) => a + b, 0) / day.windSpeed.length) * 3.6);
        const avgPressure = Math.round(day.pressure.reduce((a, b) => a + b, 0) / day.pressure.length);
        
        // Get most common weather condition
        const conditionCounts = {};
        day.descriptions.forEach(desc => {
            conditionCounts[desc] = (conditionCounts[desc] || 0) + 1;
        });
        const mostCommonCondition = Object.keys(conditionCounts).reduce((a, b) => 
            conditionCounts[a] > conditionCounts[b] ? a : b
        );
        
        // Get most common icon
        const iconCounts = {};
        day.icons.forEach(icon => {
            iconCounts[icon] = (iconCounts[icon] || 0) + 1;
        });
        const mostCommonIcon = Object.keys(iconCounts).reduce((a, b) => 
            iconCounts[a] > iconCounts[b] ? a : b
        );

        return {
            date: day.date,
            dayName: day.date.toLocaleDateString('en-US', { weekday: 'long' }),
            shortDate: day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            maxTemp: this.convertTemperature(maxTemp),
            minTemp: this.convertTemperature(minTemp),
            description: mostCommonCondition,
            icon: mostCommonIcon,
            iconURL: API_CONFIG.iconURL + mostCommonIcon + '@2x.png',
            humidity: avgHumidity,
            windSpeed: avgWindSpeed,
            pressure: avgPressure,
            temperatureUnit: this.temperatureUnit,
            temperatureSymbol: this.getTemperatureSymbol()
        };
    });
}


   // SECTION E1-1-17: Check for Extreme Weather (SMART VERSION)
checkExtremeWeather(weatherData) {
    const alerts = [];
    const temp = weatherData.temperature;
    const unit = weatherData.temperatureUnit;
    const comfort = this.getTemperatureComfort(temp, unit);
    
    console.log(`🌡️ Temperature: ${temp}${weatherData.temperatureSymbol}, Comfort Level: ${comfort}`);
    
    // Only alert for truly extreme conditions
    if (comfort === 'extreme') {
        if (unit === 'fahrenheit' && temp > 104) {
            alerts.push({
                type: 'extreme_heat',
                message: `Dangerous heat! Temperature is ${temp}°F. Stay indoors, stay hydrated, and seek air conditioning.`,
                severity: 'high'
            });
        } else if (unit === 'celsius' && temp > 40) {
            alerts.push({
                type: 'extreme_heat',
                message: `Dangerous heat! Temperature is ${temp}°C. Stay indoors, stay hydrated, and seek air conditioning.`,
                severity: 'high'
            });
        }
    }
    
    if (comfort === 'freezing') {
        if (unit === 'fahrenheit' && temp <= -4) {
            alerts.push({
                type: 'extreme_cold',
                message: `Dangerous cold! Temperature is ${temp}°F. Dress in layers and limit outdoor exposure.`,
                severity: 'high'
            });
        } else if (unit === 'celsius' && temp <= -20) {
            alerts.push({
                type: 'extreme_cold',
                message: `Dangerous cold! Temperature is ${temp}°C. Dress in layers and limit outdoor exposure.`,
                severity: 'high'
            });
        }
    }
    
    // Wind speed alerts (unchanged)
    if (weatherData.windSpeed >= 50) {
        alerts.push({
            type: 'high_wind',
            message: `High wind warning! Wind speed is ${weatherData.windSpeed} km/h. Be cautious outdoors.`,
            severity: 'medium'
        });
    }
    
    return alerts;
}


    // SECTION H3-2-1: Debug Weather Conditions
debugWeatherConditions(data) {
    console.log('🌤️ Weather Debug Information:');
    console.log('All weather conditions:', data.weather);
    console.log('Selected condition:', data.weather[0]);
    console.log('Weather main:', data.weather[0].main);
    console.log('Weather description:', data.weather[0].description);
    console.log('Weather icon:', data.weather[0].icon);
    
    // Check if there are multiple conditions
    if (data.weather.length > 1) {
        console.log('⚠️ Multiple weather conditions detected:');
        data.weather.forEach((condition, index) => {
            console.log(`  ${index + 1}. ${condition.main} - ${condition.description} (${condition.icon})`);
        });
    }
}

// SECTION H7-2-1: Validate Temperature Ranges
validateTemperature(temp, unit) {
    let minReasonable, maxReasonable;
    
    if (unit === 'fahrenheit') {
        minReasonable = -40; // -40°F (extreme cold but possible)
        maxReasonable = 130; // 130°F (extreme heat but possible)
    } else {
        minReasonable = -40; // -40°C
        maxReasonable = 54;  // 54°C (Death Valley record)
    }
    
    if (temp < minReasonable || temp > maxReasonable) {
        console.warn(`⚠️ Unreasonable temperature detected: ${temp}°${unit === 'fahrenheit' ? 'F' : 'C'}`);
        return false;
    }
    
    return true;
}
// SECTION H7-3-1: Get Temperature Comfort Level
getTemperatureComfort(temp, unit) {
    let comfortRanges;
    
    if (unit === 'fahrenheit') {
        comfortRanges = {
            freezing: temp <= 32,
            cold: temp > 32 && temp <= 50,
            cool: temp > 50 && temp <= 65,
            comfortable: temp > 65 && temp <= 75,
            warm: temp > 75 && temp <= 85,
            hot: temp > 85 && temp <= 95,
            veryHot: temp > 95 && temp <= 104,
            extreme: temp > 104
        };
    } else {
        comfortRanges = {
            freezing: temp <= 0,
            cold: temp > 0 && temp <= 10,
            cool: temp > 10 && temp <= 18,
            comfortable: temp > 18 && temp <= 24,
            warm: temp > 24 && temp <= 29,
            hot: temp > 29 && temp <= 35,
            veryHot: temp > 35 && temp <= 40,
            extreme: temp > 40
        };
    }
    
    for (let [level, condition] of Object.entries(comfortRanges)) {
        if (condition) {
            return level;
        }
    }
    
    return 'unknown';
}

 // SECTION E1-1-17: Check for Extreme Weather Alerts
checkExtremeWeather(weatherData) {
    const alerts = [];
    const temp = weatherData.temperature;
    const unit = weatherData.temperatureUnit;
    
    console.log(`🌡️ Checking weather alerts for: ${temp}${weatherData.temperatureSymbol} (${unit})`);
    
    // SECTION H21-5-1: Temperature-based alerts
    if (unit === 'celsius') {
        if (temp >= 45) {
            alerts.push({
                type: 'extreme_heat',
                message: `🚨 EXTREME HEAT DANGER! Temperature is ${temp}°C. This is life-threatening heat. Stay indoors with air conditioning, drink water constantly, and avoid all outdoor activities.`,
                severity: 'extreme'
            });
        } else if (temp >= 40) {
            alerts.push({
                type: 'severe_heat',
                message: `⚠️ SEVERE HEAT WARNING! Temperature is ${temp}°C. Stay indoors during peak hours (10 AM - 6 PM), drink plenty of water, and wear light-colored clothing if you must go outside.`,
                severity: 'high'
            });
        } else if (temp >= 35) {
            alerts.push({
                type: 'heat_advisory',
                message: `🌡️ Heat Advisory: Temperature is ${temp}°C. Stay hydrated, limit outdoor activities during midday, and take frequent breaks in shade or air conditioning.`,
                severity: 'medium'
            });
        }
        
        // Cold weather alerts
        if (temp <= -20) {
            alerts.push({
                type: 'extreme_cold',
                message: `🥶 EXTREME COLD WARNING! Temperature is ${temp}°C. Frostbite can occur in minutes. Dress in layers, cover exposed skin, and limit time outdoors.`,
                severity: 'high'
            });
        } else if (temp <= -10) {
            alerts.push({
                type: 'cold_warning',
                message: `❄️ Cold Weather Alert: Temperature is ${temp}°C. Dress warmly, watch for icy conditions, and check on elderly neighbors.`,
                severity: 'medium'
            });
        }
    } else if (unit === 'fahrenheit') {
        if (temp >= 113) { // 45°C
            alerts.push({
                type: 'extreme_heat',
                message: `🚨 EXTREME HEAT DANGER! Temperature is ${temp}°F. This is life-threatening heat. Stay indoors with air conditioning, drink water constantly, and avoid all outdoor activities.`,
                severity: 'extreme'
            });
        } else if (temp >= 104) { // 40°C
            alerts.push({
                type: 'severe_heat',
                message: `⚠️ SEVERE HEAT WARNING! Temperature is ${temp}°F. Stay indoors during peak hours (10 AM - 6 PM), drink plenty of water, and wear light-colored clothing if you must go outside.`,
                severity: 'high'
            });
        } else if (temp >= 95) { // 35°C
            alerts.push({
                type: 'heat_advisory',
                message: `🌡️ Heat Advisory: Temperature is ${temp}°F. Stay hydrated, limit outdoor activities during midday, and take frequent breaks in shade or air conditioning.`,
                severity: 'medium'
            });
        }
        
        // Cold weather alerts
        if (temp <= -4) { // -20°C
            alerts.push({
                type: 'extreme_cold',
                message: `🥶 EXTREME COLD WARNING! Temperature is ${temp}°F. Frostbite can occur in minutes. Dress in layers, cover exposed skin, and limit time outdoors.`,
                severity: 'high'
            });
        } else if (temp <= 14) { // -10°C
            alerts.push({
                type: 'cold_warning',
                message: `❄️ Cold Weather Alert: Temperature is ${temp}°F. Dress warmly, watch for icy conditions, and check on elderly neighbors.`,
                severity: 'medium'
            });
        }
    }
    
    // SECTION H21-5-2: Wind speed alerts
    if (weatherData.windSpeed >= 60) {
        alerts.push({
            type: 'high_wind',
            message: `💨 HIGH WIND WARNING! Wind speed is ${weatherData.windSpeed} km/h. Avoid driving high-profile vehicles, secure outdoor objects, and be cautious of falling debris.`,
            severity: 'high'
        });
    } else if (weatherData.windSpeed >= 40) {
        alerts.push({
            type: 'wind_advisory',
            message: `🌬️ Wind Advisory: Wind speed is ${weatherData.windSpeed} km/h. Be cautious when driving and walking outdoors.`,
            severity: 'medium'
        });
    }
    
    if (alerts.length === 0) {
        console.log('✅ No weather alerts - conditions are safe');
    } else {
        console.log(`⚠️ Generated ${alerts.length} weather alert(s)`);
    }
    
    return alerts;
}

}

// SECTION E1-1-18: Export API Classes
const weatherAPI = new WeatherAPI();
const weatherProcessor = new WeatherDataProcessor();

// SECTION E1-1-19: Console Log for Debugging
console.log('✅ Weather API initialized successfully');
console.log('⚠️  Remember to add your OpenWeatherMap API key to API_CONFIG.key');
