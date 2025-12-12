// SECTION D1-1-1: Storage Manager Class Definition
class StorageManager {
    constructor() {
        this.RECENT_SEARCHES_KEY = 'weatherApp_recentSearches';
        this.SETTINGS_KEY = 'weatherApp_settings';
        this.MAX_RECENT_SEARCHES = 5;
    }

    // SECTION D1-1-2: Recent Searches Management
    getRecentSearches() {
        try {
            const searches = localStorage.getItem(this.RECENT_SEARCHES_KEY);
            return searches ? JSON.parse(searches) : [];
        } catch (error) {
            console.error('Error getting recent searches:', error);
            return [];
        }
    }

    // SECTION D1-1-3: Add New Search to Recent
    addRecentSearch(cityName, countryCode = '') {
        try {
            let searches = this.getRecentSearches();
            
            // Create search object
            const searchItem = {
                city: cityName,
                country: countryCode,
                timestamp: new Date().toISOString(),
                displayName: countryCode ? `${cityName}, ${countryCode}` : cityName
            };

            // Remove if already exists
            searches = searches.filter(search => 
                search.city.toLowerCase() !== cityName.toLowerCase()
            );

            // Add to beginning
            searches.unshift(searchItem);

            // Keep only max number of searches
            searches = searches.slice(0, this.MAX_RECENT_SEARCHES);

            // Save to localStorage
            localStorage.setItem(this.RECENT_SEARCHES_KEY, JSON.stringify(searches));
            
            return searches;
        } catch (error) {
            console.error('Error adding recent search:', error);
            return this.getRecentSearches();
        }
    }

    // SECTION D1-1-4: Clear Recent Searches
    clearRecentSearches() {
        try {
            localStorage.removeItem(this.RECENT_SEARCHES_KEY);
            return true;
        } catch (error) {
            console.error('Error clearing recent searches:', error);
            return false;
        }
    }

    // SECTION D1-1-5: Settings Management
    getSettings() {
        try {
            const settings = localStorage.getItem(this.SETTINGS_KEY);
            return settings ? JSON.parse(settings) : {
                temperatureUnit: 'celsius', // celsius or fahrenheit
                theme: 'auto', // auto, light, dark
                notifications: true,
                autoLocation: false
            };
        } catch (error) {
            console.error('Error getting settings:', error);
            return {
                temperatureUnit: 'celsius',
                theme: 'auto',
                notifications: true,
                autoLocation: false
            };
        }
    }

    // SECTION D1-1-6: Save Settings
    saveSettings(settings) {
        try {
            const currentSettings = this.getSettings();
            const updatedSettings = { ...currentSettings, ...settings };
            localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(updatedSettings));
            return updatedSettings;
        } catch (error) {
            console.error('Error saving settings:', error);
            return this.getSettings();
        }
    }

    // SECTION D1-1-7: Get Temperature Unit
    getTemperatureUnit() {
        return this.getSettings().temperatureUnit;
    }

    // SECTION D1-1-8: Set Temperature Unit
    setTemperatureUnit(unit) {
        return this.saveSettings({ temperatureUnit: unit });
    }

    // SECTION D1-1-9: Clear All Data
    clearAllData() {
        try {
            localStorage.removeItem(this.RECENT_SEARCHES_KEY);
            localStorage.removeItem(this.SETTINGS_KEY);
            return true;
        } catch (error) {
            console.error('Error clearing all data:', error);
            return false;
        }
    }

    // SECTION D1-1-10: Get Storage Usage
    getStorageInfo() {
        try {
            const recentSearches = this.getRecentSearches();
            const settings = this.getSettings();
            
            return {
                recentSearchesCount: recentSearches.length,
                settings: settings,
                storageUsed: this.calculateStorageSize()
            };
        } catch (error) {
            console.error('Error getting storage info:', error);
            return null;
        }
    }

    // SECTION D1-1-11: Calculate Storage Size
    calculateStorageSize() {
        try {
            let total = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key) && key.startsWith('weatherApp_')) {
                    total += localStorage[key].length;
                }
            }
            return total;
        } catch (error) {
            console.error('Error calculating storage size:', error);
            return 0;
        }
    }
}

// SECTION D1-1-12: Export Storage Manager Instance
const storageManager = new StorageManager();

// SECTION D1-1-13: Console Log for Debugging
console.log('✅ Storage Manager initialized successfully');
