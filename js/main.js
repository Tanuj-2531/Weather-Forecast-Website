// SECTION G1-1-1: Main Weather App Class Definition
class WeatherApp {
    constructor() {
        this.isInitialized = false;
        this.currentLocation = null;
        
        // Initialize the app
        this.init();
    }

    // SECTION G1-1-2: Initialize Application
    async init() {
        try {
            console.log('🚀 Initializing Weather App...');
            
            // Load user settings
            this.loadSettings();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Load recent searches
            this.loadRecentSearches();
            
            // Check if API key is configured
            this.checkApiConfiguration();
            
            this.isInitialized = true;
            console.log('✅ Weather App initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize Weather App:', error);
            uiManager.showError('Failed to initialize the application. Please refresh the page.');
        }
    }

    // SECTION G1-1-3: Load User Settings
    loadSettings() {
        try {
            const settings = storageManager.getSettings();
            
            // Set temperature unit
            const tempUnit = settings.temperatureUnit || 'celsius';
            weatherProcessor.setTemperatureUnit(tempUnit);
            uiManager.setTemperatureUnit(tempUnit);
            
            console.log('✅ Settings loaded:', settings);
        } catch (error) {
            console.error('❌ Error loading settings:', error);
        }
    }

    // SECTION G1-1-4: Setup Event Listeners
    setupEventListeners() {
        // Search button click
        if (uiManager.searchButton) {
            uiManager.searchButton.addEventListener('click', () => {
                this.handleSearch();
            });
        }

        // Search input enter key
        if (uiManager.searchInput) {
            uiManager.searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSearch();
                }
            });

            // Show recent searches on focus
            uiManager.searchInput.addEventListener('focus', () => {
                this.showRecentSearches();
            });

            // Hide recent searches on blur (with delay)
            uiManager.searchInput.addEventListener('blur', () => {
                setTimeout(() => {
                    uiManager.hideRecentSearches();
                }, 200);
            });
        }

        // Current location button
        if (uiManager.currentLocationBtn) {
            uiManager.currentLocationBtn.addEventListener('click', () => {
                this.getCurrentLocationWeather();
            });
        }

     // Temperature unit toggle (ENHANCED)
if (uiManager.tempUnitToggle) {
    uiManager.tempUnitToggle.addEventListener('change', async (e) => {
        const unit = e.target.checked ? 'fahrenheit' : 'celsius';
        console.log(`🎯 Toggle clicked: switching to ${unit}`);
        
        // Show loading during conversion
        uiManager.showLoading(`Converting to ${unit === 'fahrenheit' ? 'Fahrenheit' : 'Celsius'}...`);
        
        try {
            await this.changeTemperatureUnit(unit);
        } catch (error) {
            console.error('❌ Toggle conversion failed:', error);
        } finally {
            uiManager.hideLoading();
        }
    });
}


        // Recent search selection
        document.addEventListener('recentSearchSelected', (e) => {
            this.searchWeatherByCity(e.detail.city);
        });

        // Click outside to hide dropdowns
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#citySearchInput') && !e.target.closest('#recentSearchesDropdown')) {
                uiManager.hideRecentSearches();
            }
        });

        console.log('✅ Event listeners setup complete');
    }

    // SECTION G1-1-5: Check API Configuration
    checkApiConfiguration() {
        if (!weatherAPI.isApiKeyValid()) {
            const message = 'Please add your OpenWeatherMap API key to js/api.js file. Get a free key at openweathermap.org/api';
            console.warn('⚠️ ' + message);
            uiManager.showError(message);
            return false;
        }
        return true;
    }

   // SECTION G1-1-6: Handle Search (ENHANCED WITH VALIDATION)
async handleSearch() {
    const searchTerm = uiManager.getSearchInputValue();
    
    // SECTION H10-1-1: Validate search input
    if (!searchTerm) {
        uiManager.showError('Please enter a city name');
        return;
    }

    // SECTION H10-1-2: Enhanced input validation
    if (!this.isValidCityName(searchTerm)) {
        uiManager.showError('Please enter a valid city name (letters, spaces, hyphens, and apostrophes only)');
        return;
    }

    if (!this.checkApiConfiguration()) {
        return;
    }

    await this.searchWeatherByCity(searchTerm);
}

// SECTION H10-1-3: Add city name validation function
isValidCityName(cityName) {
    // Remove extra spaces and convert to string
    const cleanName = String(cityName).trim();
    
    // Check minimum length
    if (cleanName.length < 2) {
        console.log('❌ City name too short:', cleanName);
        return false;
    }
    
    // Check maximum length
    if (cleanName.length > 50) {
        console.log('❌ City name too long:', cleanName);
        return false;
    }
    
    // Check for numbers only (like "123")
    if (/^\d+$/.test(cleanName)) {
        console.log('❌ City name cannot be numbers only:', cleanName);
        return false;
    }
    
    // Check for valid characters (letters, spaces, hyphens, apostrophes, dots, commas)
    if (!/^[a-zA-ZÀ-ÿ\s\-'.,]+$/.test(cleanName)) {
        console.log('❌ City name contains invalid characters:', cleanName);
        return false;
    }
    
    // Check for too many consecutive spaces or special characters
    if (/[\s\-'.,]{3,}/.test(cleanName)) {
        console.log('❌ City name has too many consecutive special characters:', cleanName);
        return false;
    }
    
    console.log('✅ City name is valid:', cleanName);
    return true;
}


 // SECTION G1-1-7: Search Weather by City (WITH ENHANCED ERROR HANDLING)
async searchWeatherByCity(cityName) {
    try {
        uiManager.showLoading(`Getting weather for ${cityName}...`);
        
        // Get current weather with validation
        const currentWeatherData = await weatherAPI.getCurrentWeatherByCity(cityName);
        
        // Get 5-day forecast
        const forecastData = await weatherAPI.getForecastByCity(cityName);
        
        // Process data
        const processedForecast = weatherProcessor.processForecastData(forecastData);
        let processedCurrentWeather = weatherProcessor.processCurrentWeather(currentWeatherData);
        
        // Sync current weather with today's forecast if available
        if (processedForecast.length > 0) {
            const todaysForecast = processedForecast[0];
            processedCurrentWeather = {
                ...processedCurrentWeather,
                description: todaysForecast.description,
                icon: todaysForecast.icon,
                iconURL: todaysForecast.iconURL
            };
        }
        
                // Update UI with original API data stored
        uiManager.updateCurrentWeather(processedCurrentWeather, currentWeatherData);
        uiManager.updateForecast(processedForecast, forecastData);
        
        // SECTION H21-7-1: Check for weather alerts
        this.checkWeatherAlerts(processedCurrentWeather);
        
        // Save to recent searches
        storageManager.addRecentSearch(processedCurrentWeather.city, processedCurrentWeather.country);
        this.loadRecentSearches();

        
        // Check for extreme weather alerts
        this.checkWeatherAlerts(processedCurrentWeather);
        
        // Clear search input
        uiManager.clearSearchInput();
        uiManager.hideRecentSearches();
        
        console.log('✅ Weather search completed successfully');
        
    } catch (error) {
        console.error('❌ Weather search failed:', error);
        
        // SECTION H10-6-1: Show specific error messages with suggestions
        if (error.message.includes('not a valid city name')) {
            uiManager.showErrorWithSuggestions(
                error.message,
                ['London, UK', 'New York, USA', 'Tokyo, Japan', 'Paris, France', 'Sydney, Australia']
            );
        } else {
            uiManager.showError(error.message);
        }
    } finally {
        uiManager.hideLoading();
    }
}



   // SECTION G1-1-8: Get Current Location Weather (ENHANCED CITY DETECTION)
async getCurrentLocationWeather() {
    if (!this.checkApiConfiguration()) {
        return;
    }

    try {
        uiManager.showLoading('Getting your location...');
        
        // Check if geolocation is supported
        if (!navigator.geolocation) {
            throw new Error('Geolocation is not supported by this browser');
        }

        // Get current position
        const position = await this.getCurrentPosition();
        const { latitude, longitude } = position.coords;
        
        console.log(`📍 Your coordinates: ${latitude}, ${longitude}`);
        
        uiManager.showLoading('Determining your city...');
        
        // SECTION H12-2-1: Use enhanced city detection
        const locationInfo = await weatherAPI.getCityFromCoordsEnhanced(latitude, longitude);
        console.log('🏙️ Detected location:', locationInfo);
        
        // SECTION H12-2-2: Get weather using the detected city name instead of coordinates
        // This ensures we get the same city name in weather data
        uiManager.showLoading(`Getting weather for ${locationInfo.name}...`);
        
        let currentWeatherData, forecastData;
        
        try {
            // Try to get weather by city name first (more accurate city names)
            currentWeatherData = await weatherAPI.getCurrentWeatherByCity(locationInfo.name);
            forecastData = await weatherAPI.getForecastByCity(locationInfo.name);
        } catch (cityError) {
            console.log('⚠️ City name search failed, falling back to coordinates');
            // Fallback to coordinates if city name doesn't work
            currentWeatherData = await weatherAPI.getCurrentWeatherByCoords(latitude, longitude);
            forecastData = await weatherAPI.getForecastByCoords(latitude, longitude);
        }
        
        // Process data
        const processedForecast = weatherProcessor.processForecastData(forecastData);
        let processedCurrentWeather = weatherProcessor.processCurrentWeather(currentWeatherData);
        
        // Sync current weather with today's forecast if available
        if (processedForecast.length > 0) {
            const todaysForecast = processedForecast[0];
            processedCurrentWeather = {
                ...processedCurrentWeather,
                description: todaysForecast.description,
                icon: todaysForecast.icon,
                iconURL: todaysForecast.iconURL
            };
        }
        
               // Update UI with original API data stored
        uiManager.updateCurrentWeather(processedCurrentWeather, currentWeatherData);
        uiManager.updateForecast(processedForecast, forecastData);
        
        // SECTION H21-7-1: Check for weather alerts
        this.checkWeatherAlerts(processedCurrentWeather);
        
        // Save to recent searches
        storageManager.addRecentSearch(processedCurrentWeather.city, processedCurrentWeather.country);
        this.loadRecentSearches();

        
        // Check for extreme weather alerts
        this.checkWeatherAlerts(processedCurrentWeather);
        
        // Store current location with better city info
        this.currentLocation = { 
            latitude, 
            longitude, 
            city: processedCurrentWeather.city,
            country: processedCurrentWeather.country,
            detectedLocation: locationInfo
        };
        
        console.log(`✅ Current location weather loaded for ${processedCurrentWeather.city}`);
        
    } catch (error) {
        console.error('❌ Current location weather failed:', error);
        
        if (error.code === 1) {
            uiManager.showError('Location access denied. Please enable location services and try again.');
        } else if (error.code === 2) {
            uiManager.showError('Location unavailable. Please try searching for your city instead.');
        } else if (error.code === 3) {
            uiManager.showError('Location request timeout. Please try again.');
        } else {
            uiManager.showError(error.message + ' You can search for "Kanpur" manually instead.');
        }
    } finally {
        uiManager.hideLoading();
    }
}


    // SECTION G1-1-9: Get Current Position Promise
    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                resolve,
                reject,
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000 // 5 minutes
                }
            );
        });
    }

 // SECTION G1-1-10: Change Temperature Unit (BULLETPROOF VERSION)
async changeTemperatureUnit(unit) {
    try {
        console.log(`🔄 Changing temperature unit to: ${unit}`);
        
        // Update processor first
        weatherProcessor.setTemperatureUnit(unit);
        
        // Update UI manager
        uiManager.setTemperatureUnit(unit);
        
        // Save to storage
        storageManager.setTemperatureUnit(unit);
        
        // SECTION H6-1-1: Re-fetch fresh data to avoid conversion errors
        // Get the last searched city from recent searches
        const recentSearches = storageManager.getRecentSearches();
        if (recentSearches.length > 0) {
            const lastCity = recentSearches[0].city;
            console.log(`🔄 Re-fetching weather data for ${lastCity} with new unit`);
            
            // Re-fetch and display weather data with new unit
            await this.searchWeatherByCity(lastCity);
        } else if (this.currentLocation) {
            // If we have current location, re-fetch using coordinates
            console.log('🔄 Re-fetching weather data for current location with new unit');
            await this.getCurrentLocationWeather();
        }
        
        console.log(`✅ Temperature unit successfully changed to ${unit}`);
        
    } catch (error) {
        console.error('❌ Error changing temperature unit:', error);
        
        // SECTION H6-1-2: Fallback - try to update display without re-fetching
        try {
            // Update the toggle visual state
            uiManager.setTemperatureUnit(unit);
            
            // If we have current weather data, try manual conversion
            if (uiManager.currentWeatherData) {
                const currentTemp = uiManager.currentWeatherData.temperature;
                const currentFeelsLike = uiManager.currentWeatherData.feelsLike;
                
                let newTemp, newFeelsLike;
                
                if (unit === 'fahrenheit') {
                    // Convert from Celsius to Fahrenheit
                    newTemp = Math.round((currentTemp * 9/5) + 32);
                    newFeelsLike = Math.round((currentFeelsLike * 9/5) + 32);
                } else {
                    // Convert from Fahrenheit to Celsius
                    newTemp = Math.round((currentTemp - 32) * 5/9);
                    newFeelsLike = Math.round((currentFeelsLike - 32) * 5/9);
                }
                
                // Update display manually
                const tempSymbol = unit === 'fahrenheit' ? '°F' : '°C';
                document.getElementById('currentTemp').textContent = `${newTemp}${tempSymbol}`;
                document.getElementById('feelsLike').textContent = `${newFeelsLike}${tempSymbol}`;
                
                console.log(`✅ Fallback conversion applied: ${newTemp}${tempSymbol}`);
            }
        } catch (fallbackError) {
            console.error('❌ Fallback conversion also failed:', fallbackError);
            uiManager.showError('Failed to change temperature unit. Please search again.');
        }
    }
}



    // SECTION G1-1-11: Load Recent Searches
    loadRecentSearches() {
        try {
            const recentSearches = storageManager.getRecentSearches();
            uiManager.updateRecentSearches(recentSearches);
        } catch (error) {
            console.error('❌ Error loading recent searches:', error);
        }
    }

    // SECTION G1-1-12: Show Recent Searches
    showRecentSearches() {
        this.loadRecentSearches();
        uiManager.showRecentSearches();
    }

    // SECTION G1-1-13: Check Weather Alerts
    checkWeatherAlerts(weatherData) {
        try {
            const alerts = weatherProcessor.checkExtremeWeather(weatherData);
            
            if (alerts.length > 0) {
                // Show the first alert (highest priority)
                const alert = alerts[0];
                uiManager.showAlert(alert.message);
            }
        } catch (error) {
            console.error('❌ Error checking weather alerts:', error);
        }
    }

    // SECTION G1-1-14: Clear All Data
    clearAllData() {
        try {
            storageManager.clearAllData();
            uiManager.clearWeatherDisplay();
            this.loadRecentSearches();
            console.log('✅ All data cleared');
        } catch (error) {
            console.error('❌ Error clearing data:', error);
            uiManager.showError('Failed to clear data');
        }
    }

    // SECTION G1-1-15: Get App Status
    getAppStatus() {
        return {
            initialized: this.isInitialized,
            apiKeyValid: weatherAPI.isApiKeyValid(),
            hasCurrentWeather: !!uiManager.currentWeatherData,
            hasForecast: !!uiManager.forecastData,
            currentLocation: this.currentLocation,
            temperatureUnit: weatherProcessor.temperatureUnit,
            recentSearchesCount: storageManager.getRecentSearches().length
        };
    }

// SECTION H12-3-1: Allow users to set preferred location
setPreferredLocation(cityName) {
    try {
        storageManager.saveSettings({ preferredLocation: cityName });
        console.log(`✅ Preferred location set to: ${cityName}`);
    } catch (error) {
        console.error('❌ Failed to save preferred location:', error);
    }
}

// SECTION H12-3-2: Get preferred location
getPreferredLocation() {
    try {
        const settings = storageManager.getSettings();
        return settings.preferredLocation || null;
    } catch (error) {
        console.error('❌ Failed to get preferred location:', error);
        return null;
    }
}

// SECTION G1-1-15: Check and Display Weather Alerts
checkWeatherAlerts(weatherData) {
    // Skip if user has dismissed alerts
    if (uiManager.areAlertsDismissed()) {
        console.log('🔕 Weather alerts are dismissed by user');
        return;
    }
    
    try {
        const alerts = weatherProcessor.checkExtremeWeather(weatherData);
        
        if (alerts.length > 0) {
            // Show the most severe alert first
            const severityOrder = { 'extreme': 3, 'high': 2, 'medium': 1 };
            const sortedAlerts = alerts.sort((a, b) => 
                (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0)
            );
            
            const primaryAlert = sortedAlerts[0];
            uiManager.showAlert(primaryAlert.message, primaryAlert.severity);
            
            // Log all alerts
            alerts.forEach(alert => {
                console.log(`⚠️ ${alert.type.toUpperCase()}: ${alert.message}`);
            });
        }
    } catch (error) {
        console.error('❌ Error checking weather alerts:', error);
    }
}

}

// SECTION G1-1-16: Initialize App When DOM is Loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌤️ Starting Weather Forecast Application...');
    
    // Create global app instance
    window.weatherApp = new WeatherApp();
    
    // Add some helpful console commands for debugging
    console.log('🔧 Debug commands available:');
    console.log('- weatherApp.getAppStatus() - Get app status');
    console.log('- weatherApp.clearAllData() - Clear all stored data');
    console.log('- storageManager.getStorageInfo() - Get storage info');
});

// SECTION G1-1-17: Handle Page Visibility Changes
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && window.weatherApp) {
        // Refresh recent searches when page becomes visible
        window.weatherApp.loadRecentSearches();
    }
});

// SECTION G1-1-18: Console Welcome Message
console.log(`
🌤️ ================================
   WEATHER FORECAST APPLICATION
   ================================
   
   ✅ All systems initialized
   🔧 Ready for weather data
   🌍 Global access via: weatherApp
   
   Need help? Check the console for debug commands!
================================
`);
