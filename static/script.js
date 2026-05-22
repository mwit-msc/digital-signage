// Digital Signage JavaScript - Compatible with Chrome 49
// Using ES5 syntax for maximum compatibility

(function() {
    'use strict';

    // ========================================
    // SEASONAL THEME DETECTION
    // ========================================

    // Check if current month is winter season (December, January, February)
    function isWinterSeason() {
        var month = new Date().getMonth(); // 0-indexed: 0 = January
        return month === 11 || month === 0 || month === 1; // Dec, Jan, Feb
    }

    // Apply seasonal theme based on current month
    function applySeasonalTheme() {
        var body = document.body;
        var decorations = document.getElementById('seasonal-decorations');

        if (isWinterSeason()) {
            body.classList.add('winter-theme');
            if (decorations) {
                decorations.classList.remove('hidden');
            }
            createSnowflakes();
        } else {
            body.classList.remove('winter-theme');
            if (decorations) {
                decorations.classList.add('hidden');
            }
        }
    }

    // Create falling snowflake particles
    function createSnowflakes() {
        var container = document.getElementById('snowflakes-container');
        if (!container) return;

        // Clear existing snowflakes
        container.innerHTML = '';

        var snowflakeCount = 50;
        var snowflakeChars = ['❄', '❅', '❆', '✻', '✼'];

        for (var i = 0; i < snowflakeCount; i++) {
            var snowflake = document.createElement('div');
            snowflake.className = 'snowflake';

            // Randomize size class
            var sizeRand = Math.random();
            if (sizeRand < 0.3) {
                snowflake.className += ' small';
            } else if (sizeRand > 0.8) {
                snowflake.className += ' large';
            }

            // Random position and timing
            snowflake.style.left = Math.random() * 100 + '%';
            snowflake.style.animationDuration = (Math.random() * 15 + 10) + 's';
            snowflake.style.animationDelay = Math.random() * 15 + 's';
            snowflake.style.opacity = Math.random() * 0.5 + 0.3;

            // Random snowflake character
            snowflake.textContent = snowflakeChars[Math.floor(Math.random() * snowflakeChars.length)];

            container.appendChild(snowflake);
        }
    }

    // ========================================
    // DYNAMIC SUGGESTIONS
    // ========================================

    // Get dynamic health suggestion based on AQI and temperature
    function getDynamicSuggestion(aqi, temperature) {
        // Temperature-based warnings take priority
        if (temperature >= 38) {
            return 'อากาศร้อนมาก ดื่มน้ำบ่อยๆ หลีกเลี่ยงแดดจัด';
        }
        if (temperature <= 15) {
            return 'อากาศเย็น สวมเสื้อกันหนาว ระวังสุขภาพ';
        }

        // AQI-based suggestions
        if (aqi <= 0) {
            return 'กรุณารอสักครู่...';
        }
        if (aqi <= 50) {
            return 'วันนี้อากาศดี เหมาะออกกำลังกายกลางแจ้ง';
        }
        if (aqi <= 100) {
            return 'แนะนำ: สวมหน้ากากอนามัยเมื่ออยู่นอกอาคาร เพื่อสุขภาพที่ดีในช่วงฤดูหนาว';
        }
        if (aqi <= 150) {
            return 'กลุ่มเสี่ยงควรลดกิจกรรมกลางแจ้ง สวมหน้ากาก N95';
        }
        if (aqi <= 200) {
            return 'ทุกคนควรลดกิจกรรมกลางแจ้ง ใช้เครื่องฟอกอากาศในอาคาร';
        }
        return 'อยู่ในอาคาร ปิดหน้าต่าง ใช้เครื่องกรองอากาศ';
    }

    // Store last temperature for suggestion updates
    var lastTemperature = 28;

    // ========================================
    // TWEMOJI HELPER
    // ========================================

    // Helper function to convert emoji to Twemoji images.
    // Uses self-hosted SVG assets (static/vendor/twemoji/svg) - no CDN required.
    function parseEmoji(element) {
        if (typeof twemoji !== 'undefined' && element) {
            twemoji.parse(element, {
                callback: function(icon) {
                    return 'vendor/twemoji/svg/' + icon + '.svg';
                }
            });
        }
    }

    // WMO Weather codes to emoji mapping (Open-Meteo)
    var weatherCodes = {
        0: '☀️',      // Clear sky
        1: '🌤️',      // Mainly clear
        2: '⛅',      // Partly cloudy
        3: '☁️',      // Overcast
        45: '🌫️',     // Fog
        48: '🌫️',     // Depositing rime fog
        51: '🌧️',     // Light drizzle
        53: '🌧️',     // Moderate drizzle
        55: '🌧️',     // Dense drizzle
        56: '🌧️',     // Light freezing drizzle
        57: '🌧️',     // Dense freezing drizzle
        61: '🌧️',     // Slight rain
        63: '🌧️',     // Moderate rain
        65: '🌧️',     // Heavy rain
        66: '🌧️',     // Light freezing rain
        67: '🌧️',     // Heavy freezing rain
        71: '❄️',     // Slight snow
        73: '❄️',     // Moderate snow
        75: '❄️',     // Heavy snow
        77: '❄️',     // Snow grains
        80: '🌦️',     // Slight rain showers
        81: '🌦️',     // Moderate rain showers
        82: '⛈️',     // Violent rain showers
        85: '🌨️',     // Slight snow showers
        86: '🌨️',     // Heavy snow showers
        95: '⛈️',     // Thunderstorm
        96: '⛈️',     // Thunderstorm with slight hail
        99: '⛈️'      // Thunderstorm with heavy hail
    };

    // Rain-related weather codes
    var rainCodes = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99];

    // AQI breakpoints for PM2.5 calculation
    var aqiBreakpoints = [
        { aqiLow: 0, aqiHigh: 50, pm25Low: 0.0, pm25High: 12.0 },
        { aqiLow: 51, aqiHigh: 100, pm25Low: 12.1, pm25High: 35.4 },
        { aqiLow: 101, aqiHigh: 150, pm25Low: 35.5, pm25High: 55.4 },
        { aqiLow: 151, aqiHigh: 200, pm25Low: 55.5, pm25High: 150.4 },
        { aqiLow: 201, aqiHigh: 300, pm25Low: 150.5, pm25High: 250.4 },
        { aqiLow: 301, aqiHigh: 400, pm25Low: 250.5, pm25High: 350.4 },
        { aqiLow: 401, aqiHigh: 500, pm25Low: 350.5, pm25High: 500.4 }
    ];

    // State variables
    var timeOffset = 0;
    var isLoading = true;
    var lastFetchTime = null;

    // Helper function for calculating PM2.5 from AQI
    function calculatePM25(aqi) {
        for (var i = 0; i < aqiBreakpoints.length; i++) {
            var range = aqiBreakpoints[i];
            if (aqi >= range.aqiLow && aqi <= range.aqiHigh) {
                return ((aqi - range.aqiLow) / (range.aqiHigh - range.aqiLow)) *
                       (range.pm25High - range.pm25Low) + range.pm25Low;
            }
        }
        return null;
    }

    // Get AQI information for styling and display
    function getAQIInfo(aqi) {
        if (aqi <= 0) return {
            bgClass: 'aqi-loading',
            textColor: 'text-white',
            level: 'กำลังโหลด',
            message: 'กรุณารอสักครู่',
            emoji: '⏳'
        };

        if (aqi <= 50) return {
            bgClass: 'aqi-good',
            textColor: 'text-white',
            level: 'ดี',
            message: 'คุณภาพอากาศดี เพลิดเพลินกับกิจกรรมกลางแจ้งได้',
            emoji: '😊'
        };

        if (aqi <= 100) return {
            bgClass: 'aqi-moderate',
            textColor: 'text-black',
            level: 'ปานกลาง',
            message: 'คุณภาพอากาศยอมรับได้ แต่อาจส่งผลกระทบต่อกลุ่มเสี่ยง',
            emoji: '🙂'
        };

        if (aqi <= 150) return {
            bgClass: 'aqi-unhealthy-sensitive',
            textColor: 'text-white',
            level: 'ไม่ดีสำหรับกลุ่มเสี่ยง',
            message: 'กลุ่มเสี่ยงอาจได้รับผลกระทบต่อสุขภาพ',
            emoji: '😕'
        };

        if (aqi <= 200) return {
            bgClass: 'aqi-unhealthy',
            textColor: 'text-white',
            level: 'ไม่ดีต่อสุขภาพ',
            message: 'ทุกคนอาจได้รับผลกระทบต่อสุขภาพ ควรลดกิจกรรมกลางแจ้ง',
            emoji: '😷'
        };

        if (aqi <= 300) return {
            bgClass: 'aqi-very-unhealthy',
            textColor: 'text-white',
            level: 'อันตราย',
            message: 'ทุกคนควรหลีกเลี่ยงกิจกรรมกลางแจ้ง',
            emoji: '🤢'
        };

        return {
            bgClass: 'aqi-hazardous',
            textColor: 'text-white',
            level: 'อันตรายมาก',
            message: 'ทุกคนควรงดกิจกรรมกลางแจ้งทั้งหมด',
            emoji: '☠️'
        };
    }

    // Convert wind angle to cardinal direction
    function angleToCardinal(angle) {
        var directions = [
            'เหนือ', 'ตะวันออกเฉียงเหนือ', 'ตะวันออก', 'ตะวันออกเฉียงใต้',
            'ใต้', 'ตะวันตกเฉียงใต้', 'ตะวันตก', 'ตะวันตกเฉียงเหนือ'
        ];

        angle = (angle % 360 + 360) % 360;
        var index = Math.round(angle / 45) % 8;
        return directions[index];
    }

    // Format wind speed from m/s to km/h
    function formatWindSpeed(speed) {
        if (isNaN(speed) || speed < 0) return 0;
        return Math.round(speed * 3.6 * 10) / 10;
    }

    // Update AQI card with new data
    function updateAQICard(data) {
        var aqiCard = document.getElementById('aqi-card');
        var aqiValue = document.getElementById('aqi-value');
        var aqiLevel = document.getElementById('aqi-level');
        var aqiEmoji = document.getElementById('aqi-emoji');
        var pm25Info = document.getElementById('pm25-info');
        var aqiSuggestion = document.getElementById('aqi-suggestion');

        if (!data || !data.current || !data.current.pollution) {
            return;
        }

        var aqi = data.current.pollution.aqius || 0;
        var aqiInfo = getAQIInfo(aqi);
        var pm25 = calculatePM25(aqi);

        // Update AQI card styling (glassmorphism with colored tint)
        aqiCard.className = 'w-1/2 glass-card rounded-3xl shadow-2xl overflow-hidden relative aqi-card ' + aqiInfo.bgClass;

        // Update values
        aqiValue.textContent = aqi;
        aqiLevel.textContent = aqiInfo.level;
        aqiEmoji.textContent = aqiInfo.emoji;
        parseEmoji(aqiEmoji);

        // Update dynamic suggestion based on AQI and temperature
        if (aqiSuggestion) {
            aqiSuggestion.textContent = getDynamicSuggestion(aqi, lastTemperature);
        }

        if (pm25 !== null) {
            pm25Info.textContent = 'PM 2.5: ~' + pm25.toFixed(1) + ' µg/m³';
        }

        // Update text colors if needed for moderate AQI
        var textElements = aqiCard.querySelectorAll('.text-white, .text-black');
        for (var i = 0; i < textElements.length; i++) {
            textElements[i].className = textElements[i].className.replace(/text-(?:white|black)/, aqiInfo.textColor);
        }
    }

    // Get weather alert based on current conditions
    function getWeatherAlert(weatherCode, precipitation, hourlyPrecip, hourlyTime, temperature) {
        // Currently raining
        if (precipitation > 0 || rainCodes.indexOf(weatherCode) !== -1) {
            return { show: true, text: 'ฝนกำลังตก อย่าลืมดูแลตัวเองด้วยนะ!', icon: '🌧️', type: 'rain' };
        }

        // Rain expected in next few hours
        if (hourlyPrecip && hourlyPrecip.length > 0) {
            for (var i = 0; i < hourlyPrecip.length; i++) {
                if (hourlyPrecip[i] > 0.1) {
                    var rainTime = new Date(hourlyTime[i]);
                    var hours = rainTime.getHours();
                    var timeStr = (hours < 10 ? '0' : '') + hours + ':00 น.';
                    return { show: true, text: 'ฝนอาจตกตอน ' + timeStr, icon: '🌧️', type: 'rain' };
                }
            }
        }

        // Hot weather warning
        if (temperature >= 38) {
            return { show: true, text: 'อากาศร้อนมาก ดื่มน้ำเยอะๆ นะ!', icon: '🥵', type: 'heat' };
        }

        // Thunderstorm warning
        if ([95, 96, 99].indexOf(weatherCode) !== -1) {
            return { show: true, text: 'มีพายุฝนฟ้าคะนอง ระวังอันตราย!', icon: '⛈️', type: 'storm' };
        }

        return { show: false };
    }

    // Update weather card with Open-Meteo data
    function updateWeatherCard(data) {
        var weatherLocation = document.getElementById('weather-location');
        var temperatureValue = document.getElementById('temperature-value');
        var tempRange = document.getElementById('temp-range');
        var humidityValue = document.getElementById('humidity-value');
        var precipForecast = document.getElementById('precip-forecast');
        var precipIcon = document.getElementById('precip-icon');
        var windInfo = document.getElementById('wind-info');
        var weatherIcon = document.getElementById('weather-icon');
        var weatherAlert = document.getElementById('weather-alert');
        var alertIcon = document.getElementById('alert-icon');
        var alertText = document.getElementById('alert-text');

        if (!data || !data.current) {
            return;
        }

        var current = data.current;
        var daily = data.daily || {};
        var hourly = data.hourly || {};
        var location = data.location || {};

        // Temperature
        var temperature = Math.round(current.temperature) || 0;
        lastTemperature = temperature;

        // Min/Max temps
        var tempMin = Math.round(daily.tempMin) || 0;
        var tempMax = Math.round(daily.tempMax) || 0;

        // Humidity
        var humidity = current.humidity || 0;

        // Wind
        var windSpeed = Math.round(current.windSpeed) || 0;
        var windDirection = current.windDirection || 0;
        var windCardinal = angleToCardinal(windDirection);

        // Weather code for icon
        var weatherCode = current.weatherCode || 0;
        var icon = weatherCodes[weatherCode] || '☀️';

        // Location display
        var locationDisplay = 'กำลังโหลด...';
        if (location.name) {
            locationDisplay = location.name;
            if (location.state) {
                locationDisplay += ', ' + location.state;
            }
        }

        // Precipitation forecast
        var precipText = 'ไม่มีฝนในช่วงนี้';
        var precipIconEmoji = '💧';
        if (hourly.precipitation && hourly.time) {
            for (var i = 0; i < hourly.precipitation.length; i++) {
                if (hourly.precipitation[i] > 0.1) {
                    var rainTime = new Date(hourly.time[i]);
                    var hours = rainTime.getHours();
                    var timeStr = (hours < 10 ? '0' : '') + hours + ':00 น.';
                    precipText = 'ฝนอาจตกตอน ' + timeStr;
                    precipIconEmoji = '🌧️';
                    break;
                }
            }
        }

        // Currently raining
        if (current.precipitation > 0 || rainCodes.indexOf(weatherCode) !== -1) {
            precipText = 'ฝนกำลังตก';
            precipIconEmoji = '🌧️';
        }

        // Update DOM elements
        weatherLocation.textContent = locationDisplay;
        temperatureValue.textContent = temperature + '°C';
        tempRange.textContent = 'ต่ำสุด ' + tempMin + '° • สูงสุด ' + tempMax + '°';
        humidityValue.textContent = 'ความชื้น ' + humidity + '%';
        precipForecast.textContent = precipText;
        precipIcon.textContent = precipIconEmoji;
        parseEmoji(precipIcon);
        windInfo.textContent = 'ลม ' + windSpeed + ' กม./ชม. ทิศ' + windCardinal;

        // Update weather icon
        if (weatherIcon) {
            weatherIcon.textContent = icon;
            parseEmoji(weatherIcon);
        }

        // Check for weather alerts
        var alert = getWeatherAlert(
            weatherCode,
            current.precipitation,
            hourly.precipitation,
            hourly.time,
            temperature
        );

        if (alert.show && weatherAlert) {
            weatherAlert.classList.remove('hidden', 'rain', 'heat', 'storm');
            weatherAlert.classList.add(alert.type);
            alertIcon.textContent = alert.icon;
            parseEmoji(alertIcon);
            alertText.textContent = alert.text;
        } else if (weatherAlert) {
            weatherAlert.classList.add('hidden');
        }
    }

    // Fetch weather data from Open-Meteo endpoint
    function fetchWeatherData() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'api/weather', true);
        xhr.setRequestHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        xhr.setRequestHeader('Pragma', 'no-cache');

        xhr.onload = function() {
            try {
                if (xhr.status === 200) {
                    var data = JSON.parse(xhr.responseText);
                    if (data.status === 'success') {
                        updateWeatherCard(data);
                    } else {
                        console.error('Weather API error:', data.error || 'Unknown error');
                        loadFallbackWeatherData();
                    }
                } else {
                    console.error('Weather HTTP error:', xhr.status);
                    loadFallbackWeatherData();
                }
            } catch (e) {
                console.error('Failed to parse weather response:', e);
                loadFallbackWeatherData();
            }
        };

        xhr.onerror = function() {
            console.error('Weather network error');
            loadFallbackWeatherData();
        };

        xhr.send();
    }

    // Fallback weather data
    function loadFallbackWeatherData() {
        var fallbackData = {
            status: 'success',
            location: { name: 'กำลังโหลด', state: '' },
            current: {
                temperature: 0,
                humidity: 0,
                precipitation: 0,
                weatherCode: 0,
                windSpeed: 0,
                windDirection: 0
            },
            daily: { tempMin: 0, tempMax: 0 },
            hourly: { precipitation: [], precipitationProbability: [], time: [] }
        };
        updateWeatherCard(fallbackData);
    }

    // Update footer with last updated time
    function updateFooter(data) {
        var lastUpdated = document.getElementById('last-updated');
        var cacheIndicator = document.getElementById('cache-indicator');

        var updateTime = data && data.lastFetch ? new Date(data.lastFetch) : new Date();

        var formattedDate = updateTime.toLocaleDateString('th-TH');
        var formattedTime = updateTime.toLocaleTimeString('th-TH', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });

        lastUpdated.textContent = 'อัพเดทล่าสุด: ' + formattedDate + ' - ' + formattedTime + ' น.';

        // Show cache indicator if data is cached
        if (data && data.cached) {
            cacheIndicator.classList.remove('hidden');
        } else {
            cacheIndicator.classList.add('hidden');
        }
    }

    // Fetch air quality data
    function fetchAirQualityData() {
        // Using XMLHttpRequest for Chrome 49 compatibility
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'api/air-quality', true);
        xhr.setRequestHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        xhr.setRequestHeader('Pragma', 'no-cache');

        xhr.onload = function() {
            try {
                if (xhr.status === 200) {
                    var data = JSON.parse(xhr.responseText);
                    if (data.data && data.data.data) {
                        updateAQICard(data.data.data);
                        updateFooter(data);
                        isLoading = false;
                    } else {
                        console.error('API returned error:', data.error || 'Unknown error');
                        console.error('Full response:', data);
                        loadFallbackData();
                    }
                } else {
                    console.error('HTTP error:', xhr.status);
                    loadFallbackData();
                }
            } catch (e) {
                console.error('Failed to parse response:', e);
                loadFallbackData();
            }
        };

        xhr.onerror = function() {
            console.error('Network error');
            loadFallbackData();
        };

        xhr.send();
    }

    // Fallback AQI data - matches default display values
    function loadFallbackData() {
        var fallbackData = {
            status: 'success',
            data: {
                city: 'กำลังโหลด',
                state: '',
                country: 'Thailand',
                location: {
                    type: 'Point',
                    coordinates: [100.3, 13.8]
                },
                current: {
                    pollution: {
                        ts: new Date().toISOString(),
                        aqius: 0,
                        mainus: 'p2',
                        aqicn: 0,
                        maincn: 'p2'
                    }
                }
            },
            cached: false,
            lastFetch: new Date()
        };

        updateAQICard(fallbackData.data);
        updateFooter(fallbackData);
        isLoading = false;
    }

    // Sync time with server
    function syncTime() {
        var xhr = new XMLHttpRequest();
        var start = Date.now();

        xhr.open('GET', 'api/time', true);
        xhr.setRequestHeader('Cache-Control', 'no-store');

        xhr.onload = function() {
            var end = Date.now();
            if (xhr.status === 200) {
                try {
                    var serverTime = new Date(xhr.responseText);
                    var networkDelay = (end - start) / 2;
                    var serverTimestamp = serverTime.getTime() + networkDelay;
                    var localTimestamp = Date.now();
                    timeOffset = serverTimestamp - localTimestamp;
                } catch (e) {
                    console.warn('Failed to parse server time:', e);
                }
            }
        };

        xhr.onerror = function() {
            console.warn('Failed to sync time with server');
        };

        xhr.send();
    }

    // Update current date and time display
    function updateDateTime() {
        var dateDisplay = document.getElementById('date-display');
        var timeDisplay = document.getElementById('time-display');

        var currentTime = new Date(Date.now() + timeOffset);

        var formattedDate = currentTime.toLocaleDateString('th-TH', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        var formattedTime = currentTime.toLocaleTimeString('th-TH', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });

        dateDisplay.textContent = formattedDate;
        timeDisplay.textContent = formattedTime + ' น.';
    }

    // Initialize the application
    function init() {
        //console.log('Initializing ...');

        // Apply seasonal theme (winter decorations in Dec-Feb)
        applySeasonalTheme();

        // Initial time sync
        syncTime();

        // Initial data fetch
        fetchAirQualityData();
        fetchWeatherData();

        // Set up intervals
        setInterval(updateDateTime, 1000); // Update time every second
        setInterval(syncTime, 5 * 60 * 1000); // Sync time every 5 minutes
        setInterval(fetchAirQualityData, 60 * 1000); // Fetch AQI data every minute
        setInterval(fetchWeatherData, 5 * 60 * 1000); // Fetch weather data every 5 minutes

        // Check for seasonal theme change daily (in case page is open across months)
        setInterval(applySeasonalTheme, 24 * 60 * 60 * 1000);

        // console.log('initialized successfully');
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Handle page visibility changes to refresh data when page becomes visible
    if (typeof document.hidden !== 'undefined') {
        document.addEventListener('visibilitychange', function() {
            if (!document.hidden) {
                fetchAirQualityData();
                fetchWeatherData();
            }
        });
    }

})();
