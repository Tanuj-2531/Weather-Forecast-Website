// SECTION F1-1-1: UI Manager Class Definition
class UIManager {
    constructor() {
        this.currentWeatherData = null;
        this.forecastData = null;
        this.isLoading = false;
        this.temperatureUnit = 'celsius';
        
        // Initialize UI elements
        this.initializeElements();
        this.setupEventListeners();
    }

    // SECTION F1-1-2: Initialize DOM Elements
    initializeElements() {
        // Search elements
        this.searchInput = document.getElementById('citySearchInput');
        this.searchButton = document.getElementById('searchButton');
        this.currentLocationBtn = document.getElementById('currentLocationBtn');
        this.recentSearchesDropdown = document.getElementById('recentSearchesDropdown');
        this.recentSearchesList = document.getElementById('recentSearchesList');

        // Weather display elements
        this.currentWeatherSection = document.getElementById('currentWeatherSection');
        this.forecastSection = document.getElementById('forecastSection');
        this.forecastContainer = document.getElementById('forecastContainer');

        // Current weather elements
        this.currentCity = document.getElementById('currentCity');
        this.currentDate = document.getElementById('currentDate');
        this.currentTemp = document.getElementById('currentTemp');
        this.currentDescription = document.getElementById('currentDescription');
        this.currentWeatherIcon = document.getElementById('currentWeatherIcon');
        this.feelsLike = document.getElementById('feelsLike');
        this.humidity = document.getElementById('humidity');
        this.windSpeed = document.getElementById('windSpeed');
        this.pressure = document.getElementById('pressure');

        // Modal elements
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.errorModal = document.getElementById('errorModal');
        this.errorMessage = document.getElementById('errorMessage');
        this.closeErrorModal = document.getElementById('closeErrorModal');
        this.alertModal = document.getElementById('alertModal');
        this.alertMessage = document.getElementById('alertMessage');
        this.closeAlertModal = document.getElementById('closeAlertModal');

        // Temperature toggle
        this.tempUnitToggle = document.getElementById('tempUnitToggle');
        this.appBody = document.getElementById('app-body');

          // SECTION H21-3-1: Alert modal elements
    this.alertModal = document.getElementById('alertModal');
    this.alertMessage = document.getElementById('alertMessage');
    this.closeAlertModal = document.getElementById('closeAlertModal');
    this.dismissAlertsBtn = document.getElementById('dismissAlertsBtn');

        console.log('✅ UI elements initialized');
    }

    // SECTION F1-1-3: Setup Event Listeners (ENHANCED WITH SEARCH INPUT EVENTS)
setupEventListeners() {
    // Search input events
    if (this.searchInput) {
        // Enter key search
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.dispatchEvent(new CustomEvent('searchWeather'));
            }
        });

        // Show recent searches on focus (ENHANCED WITH POSITION FIX)
        this.searchInput.addEventListener('focus', () => {
            this.showRecentSearches();
            // Fix position after showing
            setTimeout(() => {
                this.fixDropdownPosition();
            }, 10);
        });

        // Hide recent searches on blur (with delay)
        this.searchInput.addEventListener('blur', () => {
            setTimeout(() => {
                this.hideRecentSearches();
            }, 200);
        });
    }

    // Close modal event listeners
    if (this.closeErrorModal) {
        this.closeErrorModal.addEventListener('click', () => this.hideErrorModal());
    }
    
    if (this.closeAlertModal) {
        this.closeAlertModal.addEventListener('click', () => this.hideAlertModal());
    }

    // Click outside modal to close
    if (this.errorModal) {
        this.errorModal.addEventListener('click', (e) => {
            if (e.target === this.errorModal) {
                this.hideErrorModal();
            }
        });
    }

    if (this.alertModal) {
        this.alertModal.addEventListener('click', (e) => {
            if (e.target === this.alertModal) {
                this.hideAlertModal();
            }
        });
    }
     // SECTION H21-4-1: Alert modal event listeners
    if (this.closeAlertModal) {
        this.closeAlertModal.addEventListener('click', () => this.hideAlertModal());
    }
    
    if (this.dismissAlertsBtn) {
        this.dismissAlertsBtn.addEventListener('click', () => this.dismissAlerts());
    }

    if (this.alertModal) {
        this.alertModal.addEventListener('click', (e) => {
            if (e.target === this.alertModal) {
                this.hideAlertModal();
            }
        });
    }
    console.log('✅ UI event listeners setup complete with search input events');
}

    // SECTION F1-1-4: Show Loading Spinner
    showLoading(message = 'Loading weather data...') {
        if (this.loadingSpinner) {
            const loadingText = this.loadingSpinner.querySelector('p');
            if (loadingText) {
                loadingText.textContent = message;
            }
            this.loadingSpinner.classList.remove('hidden');
            this.isLoading = true;
        }
    }

    // SECTION F1-1-5: Hide Loading Spinner
    hideLoading() {
        if (this.loadingSpinner) {
            this.loadingSpinner.classList.add('hidden');
            this.isLoading = false;
        }
    }

    // SECTION F1-1-6: Show Error Modal
    showError(message) {
        if (this.errorModal && this.errorMessage) {
            this.errorMessage.textContent = message;
            this.errorModal.classList.remove('hidden');
        }
        console.error('❌ Error shown to user:', message);
    }

    // SECTION F1-1-7: Hide Error Modal
    hideErrorModal() {
        if (this.errorModal) {
            this.errorModal.classList.add('hidden');
        }
    }

    // SECTION F1-1-8: Show Alert Modal
    showAlert(message) {
        if (this.alertModal && this.alertMessage) {
            this.alertMessage.textContent = message;
            this.alertModal.classList.remove('hidden');
        }
    }

    // SECTION F1-1-9: Hide Alert Modal
    hideAlertModal() {
        if (this.alertModal) {
            this.alertModal.classList.add('hidden');
        }
    }

// SECTION F1-1-10: Update Current Weather Display (FIXED TO STORE ORIGINAL DATA)
updateCurrentWeather(weatherData, originalApiData = null) {
    try {
        this.currentWeatherData = weatherData;
        
        // SECTION H5-2-1: Store original API data for temperature conversions
        if (originalApiData) {
            this.currentWeatherData.originalApiData = originalApiData;
        }

        // Hide landing page content when weather is shown
        this.hideLandingContent();

        // Update city and date
        if (this.currentCity) {
            this.currentCity.textContent = `${weatherData.city}, ${weatherData.country}`;
        }

        if (this.currentDate) {
            const now = new Date();
            this.currentDate.textContent = now.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

        // Update main weather info
        if (this.currentTemp) {
            this.currentTemp.textContent = `${weatherData.temperature}${weatherData.temperatureSymbol}`;
            this.currentTemp.classList.add('temp-change');
            setTimeout(() => {
                this.currentTemp.classList.remove('temp-change');
            }, 500);
        }

        if (this.currentDescription) {
            this.currentDescription.textContent = weatherData.description;
        }

        if (this.currentWeatherIcon) {
            this.currentWeatherIcon.src = weatherData.iconURL;
            this.currentWeatherIcon.alt = weatherData.description;
            this.currentWeatherIcon.classList.add('weather-icon-bounce');
        }

        // Update weather details
        if (this.feelsLike) {
            this.feelsLike.textContent = `${weatherData.feelsLike}${weatherData.temperatureSymbol}`;
        }

        if (this.humidity) {
            this.humidity.textContent = `${weatherData.humidity}%`;
        }

        if (this.windSpeed) {
            this.windSpeed.textContent = `${weatherData.windSpeed} km/h`;
        }

        if (this.pressure) {
            this.pressure.textContent = `${weatherData.pressure} hPa`;
        }

      // Update background based on weather (ENHANCED WITH TEMPERATURE)
         this.updateBackgroundByWeather(weatherData.icon, weatherData.temperature, weatherData.temperatureUnit);


        // Show current weather section with animation
        if (this.currentWeatherSection) {
            this.currentWeatherSection.classList.remove('hidden');
            this.currentWeatherSection.classList.add('weather-card-enter');
        }

        console.log('✅ Current weather display updated with original data stored');
    } catch (error) {
        console.error('❌ Error updating current weather display:', error);
        this.showError('Failed to update weather display');
    }
}



    // SECTION F1-1-11: Update 5-Day Forecast Display (FIXED TO STORE ORIGINAL DATA)
updateForecast(forecastData, originalApiData = null) {
    try {
        this.forecastData = forecastData;
        
        // SECTION H5-4-1: Store original API data for temperature conversions
        if (originalApiData) {
            this.forecastData.originalApiData = originalApiData;
        }

        if (!this.forecastContainer) {
            console.error('❌ Forecast container not found');
            return;
        }

        // Clear existing forecast cards
        this.forecastContainer.innerHTML = '';

        // Create forecast cards
        forecastData.forEach((day, index) => {
            const forecastCard = this.createForecastCard(day, index);
            this.forecastContainer.appendChild(forecastCard);
        });

        // Show forecast section with animation
        if (this.forecastSection) {
            this.forecastSection.classList.remove('hidden');
            this.forecastSection.classList.add('weather-card-enter');
        }

        console.log('✅ Forecast display updated with original data stored');
    } catch (error) {
        console.error('❌ Error updating forecast display:', error);
        this.showError('Failed to update forecast display');
    }
}


  // SECTION F1-1-12: Create Forecast Card (ENHANCED WITH WIND & HUMIDITY)
createForecastCard(dayData, index) {
    const card = document.createElement('div');
    card.className = 'bg-white/20 backdrop-blur-lg rounded-xl p-4 text-center text-white weather-glass card-hover';
    card.style.animationDelay = `${index * 0.1}s`;

    card.innerHTML = `
        <!-- SECTION H4-1-1: Date Header -->
        <div class="mb-3 border-b border-white/20 pb-2">
            <div class="font-bold text-lg">${index === 0 ? 'Today' : dayData.dayName}</div>
            <div class="text-sm text-white/80">${dayData.shortDate}</div>
        </div>
        
        <!-- SECTION H4-1-2: Weather Icon and Description -->
        <div class="mb-4">
            <img src="${dayData.iconURL}" alt="${dayData.description}" 
                 class="w-16 h-16 mx-auto weather-icon-bounce mb-2">
            <div class="text-sm text-white/90 capitalize leading-tight">${dayData.description}</div>
        </div>
        
        <!-- SECTION H4-1-3: Temperature Section -->
        <div class="mb-4 bg-white/10 rounded-lg p-3">
            <div class="flex items-center justify-center mb-2">
                <i class="fas fa-thermometer-half text-yellow-300 mr-2"></i>
                <span class="text-xs text-white/70 font-medium">TEMPERATURE</span>
            </div>
            <div class="text-xl font-bold text-white">${dayData.maxTemp}${dayData.temperatureSymbol}</div>
            <div class="text-sm text-white/70">Low: ${dayData.minTemp}${dayData.temperatureSymbol}</div>
        </div>
        
        <!-- SECTION H4-1-4: Wind Information -->
        <div class="mb-3 bg-white/10 rounded-lg p-3">
            <div class="flex items-center justify-center mb-2">
                <i class="fas fa-wind text-gray-300 mr-2"></i>
                <span class="text-xs text-white/70 font-medium">WIND</span>
            </div>
            <div class="text-lg font-bold text-white">${dayData.windSpeed || 0}</div>
            <div class="text-xs text-white/70">km/h</div>
        </div>
        
        <!-- SECTION H4-1-5: Humidity Information -->
        <div class="bg-white/10 rounded-lg p-3">
            <div class="flex items-center justify-center mb-2">
                <i class="fas fa-tint text-blue-300 mr-2"></i>
                <span class="text-xs text-white/70 font-medium">HUMIDITY</span>
            </div>
            <div class="text-lg font-bold text-white">${dayData.humidity || 0}%</div>
            <div class="text-xs text-white/70">relative</div>
        </div>
    `;

    return card;
}

// SECTION F1-1-13: Update Background by Weather (FIXED RAIN DETECTION)
updateBackgroundByWeather(weatherIcon, temperature = null, temperatureUnit = 'celsius') {
    const body = document.body;
    
    // Remove existing weather classes
    body.classList.remove(
        'weather-sunny', 'weather-cloudy', 'weather-rainy', 
        'weather-snowy', 'weather-stormy', 'weather-hot', 
        'weather-cold', 'weather-night'
    );
    
    console.log(`🎨 Setting background for icon: ${weatherIcon}, temp: ${temperature}°${temperatureUnit}`);
    
    // SECTION H20-2-1: Check for rain FIRST (highest priority)
    if (weatherIcon.includes('rain') || weatherIcon.includes('drizzle') || 
        weatherIcon.includes('09') || weatherIcon.includes('10') || 
        weatherIcon.includes('shower') || weatherIcon.startsWith('09') || 
        weatherIcon.startsWith('10')) {
        body.classList.add('weather-rainy');
        body.style.background = 'linear-gradient(135deg, #636e6eff, #60676bff, #ecf0f1)';
        console.log('🌧️ Applied RAINY background (light grey) for icon:', weatherIcon);
        return; // Exit early for rain
    }
    
    // SECTION H20-2-2: Temperature-based backgrounds (after rain check)
    if (temperature !== null) {
        let tempInCelsius = temperature;
        
        // Convert to Celsius for consistent comparison
        if (temperatureUnit === 'fahrenheit') {
            tempInCelsius = (temperature - 32) * 5/9;
        }
        
        console.log(`🌡️ Temperature in Celsius: ${tempInCelsius.toFixed(1)}°C`);
        
        // Hot weather backgrounds
        if (tempInCelsius >= 38) {
            body.classList.add('weather-hot');
            body.style.background = 'linear-gradient(135deg, #ff6b6b, #ee5a24, #ff9ff3)';
            console.log('🔥 Applied EXTREME HOT background (38°C+)');
            return;
        } else if (tempInCelsius >= 32) {
            body.classList.add('weather-hot');
            body.style.background = 'linear-gradient(135deg, #ff7675, #fd79a8, #fdcb6e)';
            console.log('🌡️ Applied HOT background (32°C+)');
            return;
        }
        
        // Cold weather backgrounds
        if (tempInCelsius <= 5) {
            body.classList.add('weather-cold');
            body.style.background = 'linear-gradient(135deg, #74b9ff, #0984e3, #a29bfe)';
            console.log('🥶 Applied COLD background (5°C-)');
            return;
        }
    }
    
    // SECTION H20-2-3: Other weather conditions
    if (weatherIcon.includes('snow')) {
        body.classList.add('weather-snowy');
        body.style.background = 'linear-gradient(135deg, #ddd, #f1f2f6, #c8d6e5)';
        console.log('❄️ Applied SNOWY background');
    } else if (weatherIcon.includes('thunder') || weatherIcon.includes('storm')) {
        body.classList.add('weather-stormy');
        body.style.background = 'linear-gradient(135deg, #2d3436, #636e72, #74b9ff)';
        console.log('⛈️ Applied STORMY background');
    } else if (weatherIcon.includes('cloud')) {
        body.classList.add('weather-cloudy');
        body.style.background = 'linear-gradient(135deg, #74b9ff, #0984e3, #00b894)';
        console.log('☁️ Applied CLOUDY background');
    } else if (weatherIcon.includes('01d')) {
        body.classList.add('weather-sunny');
        body.style.background = 'linear-gradient(135deg, #fdcb6e, #e17055, #fd79a8)';
        console.log('☀️ Applied SUNNY background');
    } else if (weatherIcon.includes('01n')) {
        body.classList.add('weather-night');
        body.style.background = 'linear-gradient(135deg, #2d3436, #636e72, #74b9ff)';
        console.log('🌙 Applied NIGHT background');
    } else {
        // Default background
        body.style.background = 'linear-gradient(135deg, #74b9ff, #0984e3, #00cec9)';
        console.log('🌤️ Applied DEFAULT background');
    }
}



    // SECTION F1-1-14: Update Recent Searches Dropdown
    updateRecentSearches(searches) {
        if (!this.recentSearchesList) return;

        this.recentSearchesList.innerHTML = '';

        if (searches.length === 0) {
            const emptyItem = document.createElement('li');
            emptyItem.className = 'px-3 py-2 text-gray-500 text-sm';
            emptyItem.textContent = 'No recent searches';
            this.recentSearchesList.appendChild(emptyItem);
            return;
        }

        searches.forEach(search => {
            const listItem = document.createElement('li');
            listItem.className = 'px-3 py-2 hover:bg-blue-50 cursor-pointer rounded text-gray-700 transition-colors';
            listItem.textContent = search.displayName;
            listItem.addEventListener('click', () => {
                if (this.searchInput) {
                    this.searchInput.value = search.city;
                }
                this.hideRecentSearches();
                // Trigger search event
                const searchEvent = new CustomEvent('recentSearchSelected', {
                    detail: { city: search.city }
                });
                document.dispatchEvent(searchEvent);
            });
            this.recentSearchesList.appendChild(listItem);
        });
    }

    // SECTION F1-1-15: Show Recent Searches (ENHANCED POSITIONING)
showRecentSearches() {
    if (!this.recentSearchesDropdown) return;
    
    const searches = storageManager.getRecentSearches();
    
    if (searches.length === 0) {
        this.hideRecentSearches();
        return;
    }
    
    // SECTION H14-ALT-2-1: Perfect positioning
    if (this.searchInput && this.recentSearchesDropdown) {
        const searchRect = this.searchInput.getBoundingClientRect();
        const parentRect = this.searchInput.offsetParent.getBoundingClientRect();
        
        // Position dropdown exactly at the bottom of search input
        this.recentSearchesDropdown.style.top = `${this.searchInput.offsetTop + this.searchInput.offsetHeight}px`;
        this.recentSearchesDropdown.style.left = `${this.searchInput.offsetLeft}px`;
        this.recentSearchesDropdown.style.width = `${this.searchInput.offsetWidth}px`;
        this.recentSearchesDropdown.style.marginTop = '0px';
    }
    
    // Clear existing searches
    if (this.recentSearchesList) {
        this.recentSearchesList.innerHTML = '';
        
        // Add recent searches
        searches.forEach(search => {
            const li = document.createElement('li');
            li.className = 'px-3 py-2 hover:bg-blue-50 cursor-pointer rounded-lg transition-colors flex items-center space-x-2';
            li.innerHTML = `
                <i class="fas fa-map-marker-alt text-blue-500 text-sm"></i>
                <span class="text-gray-700">${search.city}, ${search.country}</span>
            `;
            
            li.addEventListener('click', () => {
                if (this.searchInput) {
                    this.searchInput.value = search.city;
                }
                this.hideRecentSearches();
                // Trigger search
                document.dispatchEvent(new CustomEvent('searchCity', { detail: search.city }));
            });
            
            this.recentSearchesList.appendChild(li);
        });
    }
    
    // Show dropdown
    this.recentSearchesDropdown.classList.remove('hidden');
    console.log('✅ Recent searches shown with perfect positioning');
}


    // SECTION F1-1-16: Hide Recent Searches Dropdown
    hideRecentSearches() {
        if (this.recentSearchesDropdown) {
            this.recentSearchesDropdown.classList.add('hidden');
        }
    }

  // SECTION F1-1-17: Clear Weather Display (FIND THIS FUNCTION AND REPLACE IT)
clearWeatherDisplay() {
    if (this.currentWeatherSection) {
        this.currentWeatherSection.classList.add('hidden');
    }
    if (this.forecastSection) {
        this.forecastSection.classList.add('hidden');
    }
    
    // SECTION H2-2-3-1: Show landing content again when weather is cleared
    this.showLandingContent();
    
    this.currentWeatherData = null;
    this.forecastData = null;
}


 // SECTION F1-1-18: Set Temperature Unit (ENHANCED WITH DEBUG)
setTemperatureUnit(unit) {
    this.temperatureUnit = unit;
    
    // Update toggle state
    if (this.tempUnitToggle) {
        this.tempUnitToggle.checked = (unit === 'fahrenheit');
    }
    
    // Debug toggle state
    this.debugToggleState();
    
    // Update label visual states
    const celsiusLabel = document.getElementById('celsiusLabel');
    const fahrenheitLabel = document.getElementById('fahrenheitLabel');
    
    if (celsiusLabel && fahrenheitLabel) {
        if (unit === 'celsius') {
            celsiusLabel.classList.add('active');
            celsiusLabel.classList.remove('inactive');
            fahrenheitLabel.classList.add('inactive');
            fahrenheitLabel.classList.remove('active');
        } else {
            fahrenheitLabel.classList.add('active');
            fahrenheitLabel.classList.remove('inactive');
            celsiusLabel.classList.add('inactive');
            celsiusLabel.classList.remove('active');
        }
    }
    
    console.log(`✅ Temperature unit UI updated to ${unit}`);
}


    // SECTION F1-1-19: Get Search Input Value
    getSearchInputValue() {
        return this.searchInput ? this.searchInput.value.trim() : '';
    }

    // SECTION F1-1-20: Clear Search Input
    clearSearchInput() {
        if (this.searchInput) {
            this.searchInput.value = '';
        }
    }

    // SECTION F1-1-21: Focus Search Input
    focusSearchInput() {
        if (this.searchInput) {
            this.searchInput.focus();
        }
    }
    // SECTION F1-1-21: Focus Search Input (existing function)
    focusSearchInput() {
        if (this.searchInput) {
            this.searchInput.focus();
        }
    }

    // 👇 ADD THESE NEW FUNCTIONS HERE 👇

    // SECTION H2-2-1: Hide Landing Page Content
    hideLandingContent() {
        // Hide hero section
        const heroSection = document.querySelector('main section:first-child');
        if (heroSection) {
            heroSection.style.display = 'none';
        }
        
        // Hide features showcase section
        const featuresSection = document.querySelector('main section:nth-child(3)');
        if (featuresSection) {
            featuresSection.style.display = 'none';
        }
        
        // Keep search section visible but make it more compact
        const searchSection = document.querySelector('main section:nth-child(2)');
        if (searchSection) {
            searchSection.classList.add('compact-search');
        }
    }

    // SECTION H2-2-2: Show Landing Page Content
    showLandingContent() {
        // Show hero section
        const heroSection = document.querySelector('main section:first-child');
        if (heroSection) {
            heroSection.style.display = 'block';
        }
        
        // Show features showcase section
        const featuresSection = document.querySelector('main section:nth-child(3)');
        if (featuresSection) {
            featuresSection.style.display = 'block';
        }
        
        // Remove compact styling from search section
        const searchSection = document.querySelector('main section:nth-child(2)');
        if (searchSection) {
            searchSection.classList.remove('compact-search');
        }
    }

    // SECTION H6-4-1: Debug Toggle State
debugToggleState() {
    const toggleState = this.tempUnitToggle ? this.tempUnitToggle.checked : 'not found';
    const currentUnit = this.temperatureUnit;
    
    console.log('🔧 Toggle Debug Info:');
    console.log('  Toggle checked:', toggleState);
    console.log('  Current unit:', currentUnit);
    console.log('  Expected: fahrenheit =', toggleState, ', celsius =', !toggleState);
}
  // SECTION H10-5-1: Show User-Friendly Error with Suggestions
showErrorWithSuggestions(message, suggestions = []) {
    let errorHtml = `<p class="mb-4">${message}</p>`;
    
    if (suggestions.length > 0) {
        errorHtml += `<div class="text-sm">
            <p class="mb-2 font-semibold">Try searching for:</p>
            <ul class="list-disc list-inside space-y-1">
                ${suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
            </ul>
        </div>`;
    }
    
    if (this.errorModal && this.errorMessage) {
        this.errorMessage.innerHTML = errorHtml;
        this.errorModal.classList.remove('hidden');
    }
}

// SECTION H14-ALT-3-1: Fix Dropdown Position Dynamically
fixDropdownPosition() {
    if (!this.searchInput || !this.recentSearchesDropdown) return;
    
    // Get search input position and dimensions
    const inputRect = this.searchInput.getBoundingClientRect();
    const dropdownParent = this.recentSearchesDropdown.offsetParent;
    
    if (dropdownParent) {
        const parentRect = dropdownParent.getBoundingClientRect();
        
        // Calculate exact position
        const topPosition = this.searchInput.offsetTop + this.searchInput.offsetHeight;
        const leftPosition = this.searchInput.offsetLeft;
        const width = this.searchInput.offsetWidth;
        
        // Apply positioning
        this.recentSearchesDropdown.style.position = 'absolute';
        this.recentSearchesDropdown.style.top = `${topPosition}px`;
        this.recentSearchesDropdown.style.left = `${leftPosition}px`;
        this.recentSearchesDropdown.style.width = `${width}px`;
        this.recentSearchesDropdown.style.marginTop = '0px';
        this.recentSearchesDropdown.style.transform = 'translateY(-1px)';
        
        console.log('🔧 Dropdown position fixed dynamically');
    }
}

// SECTION F1-1-20: Show Weather Alert Modal
showAlert(message, severity = 'medium') {
    if (this.alertModal && this.alertMessage) {
        this.alertMessage.textContent = message;
        
        // Change modal color based on severity
        const modalContent = this.alertModal.querySelector('div > div');
        if (severity === 'high') {
            modalContent.className = modalContent.className.replace(/from-\w+-\d+ to-\w+-\d+/, 'from-red-500 to-red-700');
        } else if (severity === 'extreme') {
            modalContent.className = modalContent.className.replace(/from-\w+-\d+ to-\w+-\d+/, 'from-red-600 to-red-800');
        } else {
            modalContent.className = modalContent.className.replace(/from-\w+-\d+ to-\w+-\d+/, 'from-orange-400 to-red-500');
        }
        
        this.alertModal.classList.remove('hidden');
        this.alertModal.classList.add('modal-enter');
        
        // Auto-hide after 15 seconds for non-extreme alerts
        if (severity !== 'extreme') {
            setTimeout(() => {
                this.hideAlertModal();
            }, 15000);
        }
        
        console.log(`⚠️ Weather alert shown (${severity}):`, message);
    }
}

// SECTION F1-1-21: Hide Alert Modal
hideAlertModal() {
    if (this.alertModal) {
        this.alertModal.classList.add('hidden');
        this.alertModal.classList.remove('modal-enter');
    }
    console.log('✅ Weather alert modal hidden');
}

// SECTION F1-1-22: Check if alerts are dismissed
areAlertsDismissed() {
    return localStorage.getItem('weatherAlertsDismissed') === 'true';
}

// SECTION F1-1-23: Dismiss alerts permanently
dismissAlerts() {
    localStorage.setItem('weatherAlertsDismissed', 'true');
    this.hideAlertModal();
    console.log('🔕 Weather alerts dismissed permanently');
}

} // ← This is the closing bracket of the UIManager class

// SECTION F1-1-22: Export UI Manager Instance (this stays outside the class)
const uiManager = new UIManager();





// SECTION F1-1-23: Console Log for Debugging
console.log('✅ UI Manager initialized successfully');
