document.addEventListener('DOMContentLoaded', ()=>{
    const weatherAnimation = document.getElementById('weather-animation');
    const locationElement = document.getElementById('location');
    const currentWeatherElement = document.getElementById('current-weather');
    const temperatureElement = document.getElementById('temperature');
    // Add season selector
    const seasonSelector = document.createElement('div');
    seasonSelector.className = 'season-selector';
    seasonSelector.innerHTML = `
        <h3>Change Season</h3>
        <div class="season-buttons">
            <button class="season-btn" data-season="spring">Spring</button>
            <button class="season-btn" data-season="summer">Summer</button>
            <button class="season-btn" data-season="autumn">Autumn</button>
            <button class="season-btn" data-season="winter">Winter</button>
        </div>
    `;
    document.querySelector('.weather-info').appendChild(seasonSelector);
    // Add season variables
    let currentSeason = 'summer'; // Default season
    let lastWeatherType = null; // Store the last weather type
    // Set initial active season button
    document.querySelector(`.season-btn[data-season="${currentSeason}"]`).classList.add('active');
    // Add season change event listeners
    const seasonButtons = document.querySelectorAll('.season-btn');
    seasonButtons.forEach((button)=>{
        button.addEventListener('click', ()=>{
            // Remove active class from all buttons
            seasonButtons.forEach((btn)=>btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
            // Update current season
            currentSeason = button.getAttribute('data-season');
            // Update weather animation based on current weather and season
            if (lastWeatherType) createWeatherAnimation(lastWeatherType);
        });
    });
    // Add loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.innerHTML = '<div class="spinner"></div><p>Loading weather data...</p>';
    document.querySelector('.weather-info').prepend(loadingIndicator);
    // Weather API key
    const WEATHER_API_KEY = '6f018844487aca8f15b4a35f533859a9';
    // Refresh interval (15 minutes)
    const REFRESH_INTERVAL = 900000;
    // Get user's location
    if (navigator.geolocation) navigator.geolocation.getCurrentPosition((position)=>{
        const { latitude, longitude } = position.coords;
        getLocationName(latitude, longitude);
        getWeatherData(latitude, longitude);
        // Set up periodic refresh
        setInterval(()=>{
            getWeatherData(latitude, longitude);
        }, REFRESH_INTERVAL);
    }, (error)=>{
        console.error('Error getting location:', error);
        handleLocationError(error);
    }, {
        timeout: 10000,
        maximumAge: 0
    });
    else handleLocationError({
        code: 0,
        message: 'Geolocation not supported'
    });
    // Handle location errors
    function handleLocationError(error) {
        loadingIndicator.remove();
        let errorMessage = 'Unable to access your location';
        switch(error.code){
            case 1:
                errorMessage = 'Location access denied. Please enable location services.';
                break;
            case 2:
                errorMessage = 'Location unavailable. Please try again later.';
                break;
            case 3:
                errorMessage = 'Location request timed out. Please try again.';
                break;
        }
        locationElement.textContent = errorMessage;
        // Default to a random weather animation if location access is denied
        const weatherTypes = [
            'rain',
            'sunny',
            'wind',
            'snow',
            'fog'
        ];
        const randomWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
        lastWeatherType = randomWeather; // Store the weather type
        createWeatherAnimation(randomWeather);
    }
    // Get location name from coordinates
    async function getLocationName(lat, lon) {
        try {
            const response = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${WEATHER_API_KEY}`);
            if (!response.ok) throw new Error(`API error: ${response.status}`);
            const data = await response.json();
            if (data && data.length > 0) {
                const { name, country } = data[0];
                locationElement.textContent = `${name}, ${country}`;
            }
        } catch (error) {
            console.error('Error getting location name:', error);
            locationElement.textContent = 'Unknown Location';
        }
    }
    // Get weather data from coordinates
    async function getWeatherData(lat, lon) {
        try {
            loadingIndicator.style.display = 'flex';
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`);
            if (!response.ok) throw new Error(`API error: ${response.status}`);
            const data = await response.json();
            if (data) {
                const { main, weather } = data;
                const weatherDescription = weather[0].description;
                const weatherMain = weather[0].main.toLowerCase();
                const temp = Math.round(main.temp);
                currentWeatherElement.textContent = weatherDescription.charAt(0).toUpperCase() + weatherDescription.slice(1);
                temperatureElement.textContent = `${temp}\xb0C`;
                // Determine weather type and store it
                if (weatherMain.includes('rain') || weatherMain.includes('drizzle')) lastWeatherType = 'rain';
                else if (weatherMain.includes('snow')) lastWeatherType = 'snow';
                else if (weatherMain.includes('clear')) lastWeatherType = 'sunny';
                else if (weatherMain.includes('fog') || weatherMain.includes('mist') || weatherMain.includes('haze')) lastWeatherType = 'fog';
                else if (weatherMain.includes('wind') || weatherMain.includes('squall')) lastWeatherType = 'wind';
                else if (weatherMain.includes('thunder') || weatherMain.includes('storm')) lastWeatherType = 'thunder';
                else // Default for clouds or other conditions
                lastWeatherType = 'cloudy';
                // Create weather animation based on current weather and season
                createWeatherAnimation(lastWeatherType);
            }
        } catch (error) {
            console.error('Error getting weather data:', error);
            currentWeatherElement.textContent = 'Weather data unavailable';
            lastWeatherType = 'sunny'; // Default animation
            createWeatherAnimation(lastWeatherType);
        } finally{
            loadingIndicator.style.display = 'none';
        }
    }
    // Create weather animations
    function createWeatherAnimation(weatherType) {
        // Clear previous animations
        weatherAnimation.innerHTML = '';
        // Add seasonal elements based on current season
        addSeasonalElements();
        // Add background color based on weather and season
        switch(weatherType){
            case 'rain':
                if (currentSeason === 'autumn') weatherAnimation.style.background = 'linear-gradient(to bottom, #614385, #516395)';
                else if (currentSeason === 'winter') weatherAnimation.style.background = 'linear-gradient(to bottom, #0f2027, #203a43)';
                else if (currentSeason === 'spring') weatherAnimation.style.background = 'linear-gradient(to bottom, #3a6186, #89253e)';
                else weatherAnimation.style.background = 'linear-gradient(to bottom, #1a2a3a, #0a1a2a)';
                createRainAnimation();
                break;
            case 'snow':
                if (currentSeason === 'winter') weatherAnimation.style.background = 'linear-gradient(to bottom, #2c3e50, #3498db)';
                else weatherAnimation.style.background = 'linear-gradient(to bottom, #2c3e50, #1a2a3a)';
                createSnowAnimation();
                break;
            case 'sunny':
                if (currentSeason === 'summer') weatherAnimation.style.background = 'linear-gradient(to bottom, #4a90e2, #87ceeb)';
                else if (currentSeason === 'autumn') weatherAnimation.style.background = 'linear-gradient(to bottom, #e96443, #904e95)';
                else if (currentSeason === 'winter') weatherAnimation.style.background = 'linear-gradient(to bottom, #83a4d4, #b6fbff)';
                else weatherAnimation.style.background = 'linear-gradient(to bottom, #83a4d4, #b6fbff)';
                createSunnyAnimation();
                break;
            case 'fog':
                if (currentSeason === 'autumn') weatherAnimation.style.background = 'linear-gradient(to bottom, #5d4157, #a8caba)';
                else weatherAnimation.style.background = 'linear-gradient(to bottom, #7f8c8d, #95a5a6)';
                createFogAnimation();
                break;
            case 'wind':
                if (currentSeason === 'autumn') weatherAnimation.style.background = 'linear-gradient(to bottom, #603813, #b29f94)';
                else weatherAnimation.style.background = 'linear-gradient(to bottom, #3498db, #2c3e50)';
                createWindAnimation();
                break;
            case 'thunder':
                weatherAnimation.style.background = 'linear-gradient(to bottom, #2c3e50, #1a1a2a)';
                createThunderAnimation();
                break;
            case 'cloudy':
                if (currentSeason === 'spring') weatherAnimation.style.background = 'linear-gradient(to bottom, #3a7bd5, #3a6073)';
                else weatherAnimation.style.background = 'linear-gradient(to bottom, #5d6d7e, #34495e)';
                createCloudyAnimation();
                break;
            default:
                weatherAnimation.style.background = 'linear-gradient(to bottom, #4a90e2, #87ceeb)';
                createSunnyAnimation();
        }
    }
    // Function to add seasonal elements
    function addSeasonalElements() {
        switch(currentSeason){
            case 'spring':
                createFlowers();
                break;
            case 'summer':
                createButterflies();
                break;
            case 'autumn':
                createFallingLeaves();
                break;
            case 'winter':
                if (lastWeatherType !== 'snow') createLightSnow();
                break;
        }
    }
    // Seasonal element creation functions
    function createFlowers() {
        for(let i = 0; i < 15; i++){
            const flower = document.createElement('div');
            flower.style.position = 'absolute';
            flower.style.bottom = '0';
            flower.style.left = `${Math.random() * 100}%`;
            flower.style.width = '20px';
            flower.style.height = '20px';
            flower.style.background = `radial-gradient(circle, ${getRandomSpringColor()}, ${getRandomSpringColor()})`;
            flower.style.borderRadius = '50%';
            flower.style.zIndex = '1';
            // Create flower stem
            const stem = document.createElement('div');
            stem.style.position = 'absolute';
            stem.style.bottom = '0';
            stem.style.left = '50%';
            stem.style.width = '2px';
            stem.style.height = `${20 + Math.random() * 30}px`;
            stem.style.background = '#4CAF50';
            stem.style.transform = 'translateX(-50%)';
            flower.appendChild(stem);
            weatherAnimation.appendChild(flower);
        }
    }
    function createButterflies() {
        for(let i = 0; i < 8; i++){
            const butterfly = document.createElement('div');
            butterfly.style.position = 'absolute';
            butterfly.style.top = `${Math.random() * 70}%`;
            butterfly.style.left = `${Math.random() * 100}%`;
            butterfly.style.width = '10px';
            butterfly.style.height = '10px';
            butterfly.style.background = getRandomSummerColor();
            butterfly.style.borderRadius = '50%';
            butterfly.style.zIndex = '3';
            butterfly.style.animation = `butterfly ${5 + Math.random() * 10}s linear infinite`;
            if (!document.querySelector('#butterfly-animation')) {
                const style = document.createElement('style');
                style.id = 'butterfly-animation';
                style.textContent = `
                        @keyframes butterfly {
                            0% {
                                transform: translate(0, 0) rotate(0deg);
                            }
                            25% {
                                transform: translate(50px, -30px) rotate(90deg);
                            }
                            50% {
                                transform: translate(100px, 0) rotate(180deg);
                            }
                            75% {
                                transform: translate(50px, 30px) rotate(270deg);
                            }
                            100% {
                                transform: translate(0, 0) rotate(360deg);
                            }
                        }
                    `;
                document.head.appendChild(style);
            }
            weatherAnimation.appendChild(butterfly);
        }
    }
    function createFallingLeaves() {
        for(let i = 0; i < 20; i++){
            const leaf = document.createElement('div');
            leaf.style.position = 'absolute';
            leaf.style.top = '-20px';
            leaf.style.left = `${Math.random() * 100}%`;
            leaf.style.width = `${10 + Math.random() * 5}px`;
            leaf.style.height = `${10 + Math.random() * 5}px`;
            leaf.style.background = getRandomAutumnColor();
            leaf.style.borderRadius = '30% 70% 70% 30% / 30% 30% 70% 70%';
            leaf.style.zIndex = '2';
            leaf.style.animation = `falling-leaf ${5 + Math.random() * 10}s linear infinite`;
            leaf.style.animationDelay = `${Math.random() * 5}s`;
            if (!document.querySelector('#falling-leaf-animation')) {
                const style = document.createElement('style');
                style.id = 'falling-leaf-animation';
                style.textContent = `
                        @keyframes falling-leaf {
                            0% {
                                transform: translateY(-20px) rotate(0deg);
                            }
                            100% {
                                transform: translateY(100vh) rotate(720deg);
                            }
                        }
                    `;
                document.head.appendChild(style);
            }
            weatherAnimation.appendChild(leaf);
        }
    }
    function createLightSnow() {
        for(let i = 0; i < 30; i++){
            const snowflake = document.createElement('div');
            snowflake.style.position = 'absolute';
            snowflake.style.top = '-10px';
            snowflake.style.left = `${Math.random() * 100}%`;
            snowflake.style.width = `${2 + Math.random() * 3}px`;
            snowflake.style.height = `${2 + Math.random() * 3}px`;
            snowflake.style.background = 'white';
            snowflake.style.borderRadius = '50%';
            snowflake.style.opacity = '0.7';
            snowflake.style.zIndex = '2';
            snowflake.style.animation = `light-snow ${8 + Math.random() * 10}s linear infinite`;
            snowflake.style.animationDelay = `${Math.random() * 5}s`;
            if (!document.querySelector('#light-snow-animation')) {
                const style = document.createElement('style');
                style.id = 'light-snow-animation';
                style.textContent = `
                        @keyframes light-snow {
                            0% {
                                transform: translateY(0) translateX(0);
                            }
                            50% {
                                transform: translateY(50vh) translateX(20px);
                            }
                            100% {
                                transform: translateY(100vh) translateX(0);
                            }
                        }
                    `;
                document.head.appendChild(style);
            }
            weatherAnimation.appendChild(snowflake);
        }
    }
    // Helper functions for random seasonal colors
    function getRandomSpringColor() {
        const springColors = [
            '#FF69B4',
            '#FF1493',
            '#FFC0CB',
            '#FFB6C1',
            '#FF69B4',
            '#DA70D6',
            '#BA55D3'
        ];
        return springColors[Math.floor(Math.random() * springColors.length)];
    }
    function getRandomSummerColor() {
        const summerColors = [
            '#FF4500',
            '#FF8C00',
            '#FFA500',
            '#FFD700',
            '#FFFF00',
            '#ADFF2F',
            '#7FFF00'
        ];
        return summerColors[Math.floor(Math.random() * summerColors.length)];
    }
    function getRandomAutumnColor() {
        const autumnColors = [
            '#8B4513',
            '#A0522D',
            '#CD853F',
            '#D2691E',
            '#B8860B',
            '#DAA520',
            '#F4A460'
        ];
        return autumnColors[Math.floor(Math.random() * autumnColors.length)];
    }
    function createRainAnimation() {
        // Create clouds first
        createCloudBase(3, 'dark');
        // Create rain drops
        for(let i = 0; i < 150; i++){
            const raindrop = document.createElement('div');
            raindrop.classList.add('raindrop');
            raindrop.style.left = `${Math.random() * 100}%`;
            raindrop.style.animationDuration = `${0.5 + Math.random() * 0.5}s`;
            raindrop.style.animationDelay = `${Math.random() * 2}s`;
            raindrop.style.width = '2px';
            raindrop.style.height = `${10 + Math.random() * 20}px`;
            raindrop.style.opacity = 0.6 + Math.random() * 0.4;
            raindrop.style.background = 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0.8))';
            raindrop.style.position = 'absolute';
            raindrop.style.top = '-20px';
            raindrop.style.animation = `rain ${0.5 + Math.random() * 0.5}s linear infinite`;
            raindrop.style.boxShadow = '0 0 5px rgba(255,255,255,0.3)';
            raindrop.style.zIndex = '2';
            // Add keyframes for rain animation if not already added
            if (!document.querySelector('#rain-animation')) {
                const style = document.createElement('style');
                style.id = 'rain-animation';
                style.textContent = `
                        @keyframes rain {
                            0% {
                                transform: translateY(-20px) rotate(0deg);
                            }
                            100% {
                                transform: translateY(calc(100vh + 20px)) rotate(20deg);
                            }
                        }
                    `;
                document.head.appendChild(style);
            }
            // Create splash effect
            const splash = document.createElement('div');
            splash.classList.add('splash');
            splash.style.left = `${Math.random() * 100}%`;
            splash.style.bottom = '0';
            splash.style.position = 'absolute';
            splash.style.width = '4px';
            splash.style.height = '4px';
            splash.style.borderRadius = '50%';
            splash.style.background = 'rgba(255,255,255,0.5)';
            splash.style.animation = `splash ${1 + Math.random()}s linear infinite`;
            splash.style.animationDelay = `${Math.random() * 2}s`;
            splash.style.zIndex = '2';
            if (!document.querySelector('#splash-animation')) {
                const style = document.createElement('style');
                style.id = 'splash-animation';
                style.textContent = `
                        @keyframes splash {
                            0% {
                                transform: scale(0);
                                opacity: 0.7;
                            }
                            50% {
                                transform: scale(2);
                                opacity: 0.5;
                            }
                            100% {
                                transform: scale(3);
                                opacity: 0;
                            }
                        }
                    `;
                document.head.appendChild(style);
            }
            weatherAnimation.appendChild(raindrop);
            weatherAnimation.appendChild(splash);
        }
        // Add puddles at the bottom
        for(let i = 0; i < 10; i++){
            const puddle = document.createElement('div');
            puddle.style.position = 'absolute';
            puddle.style.bottom = '0';
            puddle.style.left = `${Math.random() * 90 + 5}%`;
            puddle.style.width = `${30 + Math.random() * 70}px`;
            puddle.style.height = `${5 + Math.random() * 5}px`;
            puddle.style.background = 'rgba(255,255,255,0.2)';
            puddle.style.borderRadius = '50%';
            puddle.style.filter = 'blur(2px)';
            puddle.style.animation = 'puddle-ripple 3s infinite';
            puddle.style.animationDelay = `${Math.random() * 3}s`;
            puddle.style.zIndex = '1';
            if (!document.querySelector('#puddle-animation')) {
                const style = document.createElement('style');
                style.id = 'puddle-animation';
                style.textContent = `
                        @keyframes puddle-ripple {
                            0% {
                                transform: scale(1);
                                opacity: 0.2;
                            }
                            50% {
                                transform: scale(1.05);
                                opacity: 0.3;
                            }
                            100% {
                                transform: scale(1);
                                opacity: 0.2;
                            }
                        }
                    `;
                document.head.appendChild(style);
            }
            weatherAnimation.appendChild(puddle);
        }
    }
    function createSnowAnimation() {
        // Create light clouds
        createCloudBase(3, 'light');
        // Create snowflakes
        for(let i = 0; i < 100; i++){
            const snowflake = document.createElement('div');
            snowflake.classList.add('snowflake');
            snowflake.style.left = `${Math.random() * 100}%`;
            snowflake.style.animationDuration = `${5 + Math.random() * 10}s`;
            snowflake.style.animationDelay = `${Math.random() * 5}s`;
            const size = 3 + Math.random() * 7;
            snowflake.style.width = `${size}px`;
            snowflake.style.height = `${size}px`;
            snowflake.style.opacity = 0.8 + Math.random() * 0.2;
            snowflake.style.background = 'white';
            snowflake.style.borderRadius = '50%';
            snowflake.style.position = 'absolute';
            snowflake.style.top = '-10px';
            snowflake.style.boxShadow = '0 0 10px rgba(255,255,255,0.8)';
            snowflake.style.zIndex = '2';
            snowflake.style.filter = 'blur(0.5px)';
            snowflake.style.animation = `snow ${5 + Math.random() * 10}s linear infinite`;
            // Add keyframes for snow animation if not already added
            if (!document.querySelector('#snow-animation')) {
                const style = document.createElement('style');
                style.id = 'snow-animation';
                style.textContent = `
                        @keyframes snow {
                            0% {
                                transform: translateY(-10px) translateX(0) rotate(0deg);
                            }
                            25% {
                                transform: translateY(25vh) translateX(10px) rotate(90deg);
                            }
                            50% {
                                transform: translateY(50vh) translateX(-10px) rotate(180deg);
                            }
                            75% {
                                transform: translateY(75vh) translateX(10px) rotate(270deg);
                            }
                            100% {
                                transform: translateY(calc(100vh + 10px)) translateX(0) rotate(360deg);
                            }
                        }
                    `;
                document.head.appendChild(style);
            }
            weatherAnimation.appendChild(snowflake);
        }
        // Add snow accumulation at the bottom
        const snowGround = document.createElement('div');
        snowGround.style.position = 'absolute';
        snowGround.style.bottom = '0';
        snowGround.style.left = '0';
        snowGround.style.width = '100%';
        snowGround.style.height = '15px';
        snowGround.style.background = 'rgba(255,255,255,0.3)';
        snowGround.style.borderRadius = '50% 50% 0 0';
        snowGround.style.filter = 'blur(5px)';
        snowGround.style.zIndex = '1';
        weatherAnimation.appendChild(snowGround);
    }
    function createSunnyAnimation() {
        // Create sun
        const sun = document.createElement('div');
        sun.style.position = 'absolute';
        sun.style.top = '10%';
        sun.style.right = '10%';
        sun.style.width = '150px';
        sun.style.height = '150px';
        sun.style.borderRadius = '50%';
        sun.style.background = 'radial-gradient(circle, rgba(255,215,0,1) 0%, rgba(255,165,0,0.8) 70%, rgba(255,140,0,0) 100%)';
        sun.style.boxShadow = '0 0 50px rgba(255,215,0,0.8), 0 0 100px rgba(255,165,0,0.5)';
        sun.style.animation = 'pulse 3s infinite alternate';
        sun.style.zIndex = '2';
        // Add keyframes for sun pulse animation if not already added
        if (!document.querySelector('#sun-animation')) {
            const style = document.createElement('style');
            style.id = 'sun-animation';
            style.textContent = `
                    @keyframes pulse {
                        0% {
                            transform: scale(1);
                            box-shadow: 0 0 50px rgba(255,215,0,0.8), 0 0 100px rgba(255,165,0,0.5);
                        }
                        100% {
                            transform: scale(1.05);
                            box-shadow: 0 0 70px rgba(255,215,0,0.9), 0 0 120px rgba(255,165,0,0.6);
                        }
                    }
                `;
            document.head.appendChild(style);
        }
        // Create sun rays
        for(let i = 0; i < 12; i++){
            const ray = document.createElement('div');
            ray.classList.add('sun-ray');
            ray.style.position = 'absolute';
            ray.style.top = '50%';
            ray.style.left = '50%';
            ray.style.width = '200px';
            ray.style.height = '3px';
            ray.style.background = 'linear-gradient(to right, rgba(255,215,0,0.8), rgba(255,215,0,0))';
            ray.style.transformOrigin = '0 50%';
            ray.style.transform = `rotate(${i * 30}deg)`;
            ray.style.animation = `ray-pulse 3s ${i * 0.25}s infinite alternate`;
            ray.style.zIndex = '1';
            if (!document.querySelector('#ray-animation')) {
                const style = document.createElement('style');
                style.id = 'ray-animation';
                style.textContent = `
                        @keyframes ray-pulse {
                            0% {
                                opacity: 0.5;
                                width: 200px;
                            }
                            100% {
                                opacity: 0.8;
                                width: 250px;
                            }
                        }
                    `;
                document.head.appendChild(style);
            }
            sun.appendChild(ray);
        }
        // Add lens flare effect
        const lensFlare = document.createElement('div');
        lensFlare.style.position = 'absolute';
        lensFlare.style.top = '30%';
        lensFlare.style.left = '25%';
        lensFlare.style.width = '50px';
        lensFlare.style.height = '50px';
        lensFlare.style.borderRadius = '50%';
        lensFlare.style.background = 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)';
        lensFlare.style.zIndex = '3';
        weatherAnimation.appendChild(sun);
        weatherAnimation.appendChild(lensFlare);
        // Add a few small clouds if it's not pure sunny
        if (Math.random() > 0.5) createCloudBase(2, 'light', true);
    }
    function createFogAnimation() {
        // Create base clouds
        createCloudBase(3, 'medium');
        // Create fog layers
        for(let i = 0; i < 5; i++){
            const fogLayer = document.createElement('div');
            fogLayer.classList.add('fog-layer');
            fogLayer.style.position = 'absolute';
            fogLayer.style.left = '0';
            fogLayer.style.width = '100%';
            fogLayer.style.height = `${30 + Math.random() * 40}px`;
            fogLayer.style.background = 'rgba(255, 255, 255, 0.3)';
            fogLayer.style.borderRadius = '50% 50% 0 0 / 100% 100% 0 0';
            fogLayer.style.top = `${i * 20}%`;
            fogLayer.style.filter = 'blur(15px)';
            fogLayer.style.animation = `fog-move ${20 + Math.random() * 10}s linear infinite alternate`;
            fogLayer.style.animationDelay = `${i * 2}s`;
            fogLayer.style.zIndex = '2';
            if (!document.querySelector('#fog-animation')) {
                const style = document.createElement('style');
                style.id = 'fog-animation';
                style.textContent = `
                        @keyframes fog-move {
                            0% {
                                transform: translateX(-10%);
                            }
                            100% {
                                transform: translateX(10%);
                            }
                        }
                    `;
                document.head.appendChild(style);
            }
            weatherAnimation.appendChild(fogLayer);
        }
        // Create fog particles
        for(let i = 0; i < 50; i++){
            const fogParticle = document.createElement('div');
            fogParticle.style.position = 'absolute';
            fogParticle.style.width = `${5 + Math.random() * 10}px`;
            fogParticle.style.height = `${5 + Math.random() * 10}px`;
            fogParticle.style.borderRadius = '50%';
            fogParticle.style.background = 'rgba(255, 255, 255, 0.3)';
            fogParticle.style.top = `${Math.random() * 100}%`;
            fogParticle.style.left = `${Math.random() * 100}%`;
            fogParticle.style.filter = 'blur(5px)';
            fogParticle.style.animation = `fog-particle ${10 + Math.random() * 20}s linear infinite`;
            fogParticle.style.animationDelay = `${Math.random() * 10}s`;
            fogParticle.style.zIndex = '1';
            if (!document.querySelector('#fog-particle-animation')) {
                const style = document.createElement('style');
                style.id = 'fog-particle-animation';
                style.textContent = `
                        @keyframes fog-particle {
                            0% {
                                transform: translate(0, 0) scale(1);
                                opacity: 0.3;
                            }
                            50% {
                                transform: translate(${Math.random() * 50 - 25}px, ${Math.random() * 50 - 25}px) scale(1.5);
                                opacity: 0.6;
                            }
                            100% {
                                transform: translate(0, 0) scale(1);
                                opacity: 0.3;
                            }
                        }
                    `;
                document.head.appendChild(style);
            }
            weatherAnimation.appendChild(fogParticle);
        }
    }
    function createWindAnimation() {
        // Create base clouds that move faster
        createCloudBase(4, 'medium', false, true);
        // Create wind particles
        for(let i = 0; i < 50; i++){
            const windParticle = document.createElement('div');
            windParticle.classList.add('wind-particle');
            windParticle.style.position = 'absolute';
            windParticle.style.width = `${1 + Math.random() * 3}px`;
            windParticle.style.height = `${1 + Math.random() * 1}px`;
            windParticle.style.background = 'rgba(255, 255, 255, 0.7)';
            windParticle.style.top = `${Math.random() * 100}%`;
            windParticle.style.left = '-100px';
            windParticle.style.animation = `wind ${3 + Math.random() * 2}s linear infinite`;
            windParticle.style.animationDelay = `${Math.random() * 3}s`;
            windParticle.style.zIndex = '2';
            if (!document.querySelector('#wind-animation')) {
                const style = document.createElement('style');
                style.id = 'wind-animation';
                style.textContent = `
                        @keyframes wind {
                            0% {
                                transform: translateX(-100px) translateY(0) rotate(0deg);
                                opacity: 0;
                            }
                            10% {
                                opacity: 0.3;
                            }
                            90% {
                                opacity: 0.3;
                            }
                            100% {
                                transform: translateX(calc(100vw + 200px)) translateY(${Math.random() * 50 - 25}px) rotate(${Math.random() * 20}deg);
                                opacity: 0;
                            }
                        }
                    `;
                document.head.appendChild(style);
            }
            weatherAnimation.appendChild(windParticle);
        }
        // Add blowing leaves or debris
        for(let i = 0; i < 15; i++){
            const leaf = document.createElement('div');
            leaf.style.position = 'absolute';
            leaf.style.width = `${5 + Math.random() * 5}px`;
            leaf.style.height = `${5 + Math.random() * 5}px`;
            leaf.style.borderRadius = '50%';
            leaf.style.background = `rgba(${Math.floor(Math.random() * 100 + 100)}, ${Math.floor(Math.random() * 100 + 50)}, 0, 0.7)`;
            leaf.style.top = `${Math.random() * 100}%`;
            leaf.style.left = '-50px';
            leaf.style.animation = `leaf ${5 + Math.random() * 10}s linear ${Math.random() * 5}s infinite`;
            leaf.style.zIndex = '2';
            if (!document.querySelector('#leaf-animation')) {
                const style = document.createElement('style');
                style.id = 'leaf-animation';
                style.textContent = `
                        @keyframes leaf {
                            0% {
                                transform: translateX(0) translateY(0) rotate(0deg);
                            }
                            25% {
                                transform: translateX(25vw) translateY(20px) rotate(180deg);
                            }
                            50% {
                                transform: translateX(50vw) translateY(-20px) rotate(360deg);
                            }
                            75% {
                                transform: translateX(75vw) translateY(30px) rotate(540deg);
                            }
                            100% {
                                transform: translateX(calc(100vw + 50px)) translateY(0) rotate(720deg);
                            }
                        }
                    `;
                document.head.appendChild(style);
            }
            weatherAnimation.appendChild(leaf);
        }
    } // End of createWindAnimation function
    function createThunderAnimation() {
        // Create dark clouds
        createCloudBase(4, 'dark');
        // Create rain
        createRainAnimation();
        // Create lightning flashes
        const lightningContainer = document.createElement('div');
        lightningContainer.style.position = 'absolute';
        lightningContainer.style.top = '0';
        lightningContainer.style.left = '0';
        lightningContainer.style.width = '100%';
        lightningContainer.style.height = '100%';
        lightningContainer.style.zIndex = '3';
        // Create lightning flash animation
        if (!document.querySelector('#lightning-animation')) {
            const style = document.createElement('style');
            style.id = 'lightning-animation';
            style.textContent = `
                    @keyframes lightning-flash {
                        0%, 95%, 100% {
                            opacity: 0;
                        }
                        96%, 99% {
                            opacity: 1;
                        }
                    }
                `;
            document.head.appendChild(style);
        }
        // Create multiple lightning flashes
        for(let i = 0; i < 3; i++){
            const lightning = document.createElement('div');
            lightning.style.position = 'absolute';
            lightning.style.top = '0';
            lightning.style.left = '0';
            lightning.style.width = '100%';
            lightning.style.height = '100%';
            lightning.style.background = 'rgba(255, 255, 255, 0.8)';
            lightning.style.opacity = '0';
            lightning.style.animation = `lightning-flash ${5 + Math.random() * 10}s linear infinite`;
            lightning.style.animationDelay = `${i * 2 + Math.random() * 5}s`;
            lightningContainer.appendChild(lightning);
        }
        // Create lightning bolts
        for(let i = 0; i < 2; i++)createLightningBolt(lightningContainer, i);
        weatherAnimation.appendChild(lightningContainer);
    }
    function createLightningBolt(container, index) {
        const bolt = document.createElement('div');
        bolt.style.position = 'absolute';
        bolt.style.top = '0';
        bolt.style.left = `${20 + Math.random() * 60}%`;
        bolt.style.width = '3px';
        bolt.style.height = '0';
        bolt.style.background = 'rgba(255, 255, 255, 0.9)';
        bolt.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 255, 255, 0.6)';
        bolt.style.zIndex = '4';
        bolt.style.opacity = '0';
        bolt.style.animation = `lightning-bolt ${7 + Math.random() * 10}s linear infinite`;
        bolt.style.animationDelay = `${index * 3 + Math.random() * 5}s`;
        if (!document.querySelector('#lightning-bolt-animation')) {
            const style = document.createElement('style');
            style.id = 'lightning-bolt-animation';
            style.textContent = `
                    @keyframes lightning-bolt {
                        0%, 100% {
                            height: 0;
                            opacity: 0;
                        }
                        10%, 11% {
                            height: 30vh;
                            opacity: 1;
                        }
                        12%, 13% {
                            height: 30vh;
                            opacity: 0;
                        }
                        14%, 15% {
                            height: 30vh;
                            opacity: 0.5;
                        }
                        16% {
                            height: 30vh;
                            opacity: 0;
                        }
                    }
                `;
            document.head.appendChild(style);
        }
        // Create branches for the lightning bolt
        for(let i = 0; i < 3; i++){
            const branch = document.createElement('div');
            branch.style.position = 'absolute';
            branch.style.top = `${10 + i * 30}%`;
            branch.style.left = '0';
            branch.style.width = '2px';
            branch.style.height = '0';
            branch.style.background = 'rgba(255, 255, 255, 0.8)';
            branch.style.boxShadow = '0 0 5px rgba(255, 255, 255, 0.7)';
            branch.style.transformOrigin = 'top left';
            branch.style.transform = `rotate(${30 + Math.random() * 30}deg)`;
            branch.style.opacity = '0';
            branch.style.animation = `lightning-branch ${7 + Math.random() * 10}s linear infinite`;
            branch.style.animationDelay = `${index * 3 + Math.random() * 5 + 0.1}s`;
            if (!document.querySelector('#lightning-branch-animation')) {
                const style = document.createElement('style');
                style.id = 'lightning-branch-animation';
                style.textContent = `
                        @keyframes lightning-branch {
                            0%, 100% {
                                width: 0;
                                opacity: 0;
                            }
                            10%, 11% {
                                width: 20vw;
                                opacity: 1;
                            }
                            12%, 13% {
                                width: 20vw;
                                opacity: 0;
                            }
                            14%, 15% {
                                width: 20vw;
                                opacity: 0.5;
                            }
                            16% {
                                width: 20vw;
                                opacity: 0;
                            }
                        }
                    `;
                document.head.appendChild(style);
            }
            bolt.appendChild(branch);
        }
        container.appendChild(bolt);
    }
    function createCloudyAnimation() {
        // Create multiple layers of clouds
        createCloudBase(5, 'medium');
        // Add some sun rays peeking through if it's not too cloudy
        if (Math.random() > 0.5) {
            const sunRays = document.createElement('div');
            sunRays.style.position = 'absolute';
            sunRays.style.top = '10%';
            sunRays.style.right = '10%';
            sunRays.style.width = '100px';
            sunRays.style.height = '100px';
            sunRays.style.borderRadius = '50%';
            sunRays.style.background = 'radial-gradient(circle, rgba(255,215,0,0.3) 0%, rgba(255,165,0,0.1) 70%, rgba(255,140,0,0) 100%)';
            sunRays.style.boxShadow = '0 0 30px rgba(255,215,0,0.2)';
            sunRays.style.zIndex = '1';
            weatherAnimation.appendChild(sunRays);
        }
    }
    // Helper function to create cloud base for different weather types
    function createCloudBase(cloudCount = 3, cloudType = 'medium', smallClouds = false, fastMoving = false) {
        let cloudOpacity, cloudColor, cloudSpeed;
        switch(cloudType){
            case 'light':
                cloudOpacity = '0.7';
                cloudColor = 'rgba(255, 255, 255, 0.8)';
                cloudSpeed = '80s';
                break;
            case 'dark':
                cloudOpacity = '0.9';
                cloudColor = 'rgba(100, 100, 100, 0.8)';
                cloudSpeed = '120s';
                break;
            case 'medium':
            default:
                cloudOpacity = '0.8';
                cloudColor = 'rgba(200, 200, 200, 0.8)';
                cloudSpeed = '100s';
        }
        // Adjust for fast moving clouds
        if (fastMoving) cloudSpeed = '40s';
        for(let i = 0; i < cloudCount; i++){
            const cloud = document.createElement('div');
            cloud.classList.add('cloud');
            // Determine cloud size
            let cloudWidth, cloudHeight;
            if (smallClouds) {
                cloudWidth = 100 + Math.random() * 100;
                cloudHeight = 50 + Math.random() * 30;
            } else {
                cloudWidth = 200 + Math.random() * 200;
                cloudHeight = 80 + Math.random() * 50;
            }
            cloud.style.position = 'absolute';
            cloud.style.width = `${cloudWidth}px`;
            cloud.style.height = `${cloudHeight}px`;
            cloud.style.borderRadius = '50%';
            cloud.style.background = cloudColor;
            cloud.style.opacity = cloudOpacity;
            cloud.style.top = `${i * 15 + Math.random() * 20}%`;
            cloud.style.left = `${Math.random() * 100}%`;
            cloud.style.filter = 'blur(10px)';
            cloud.style.animation = `cloud-move ${cloudSpeed} linear infinite`;
            cloud.style.animationDelay = `${-Math.random() * 100}s`;
            cloud.style.zIndex = '1';
            // Add keyframes for cloud movement if not already added
            if (!document.querySelector('#cloud-animation')) {
                const style = document.createElement('style');
                style.id = 'cloud-animation';
                style.textContent = `
                        @keyframes cloud-move {
                            0% {
                                transform: translateX(100vw);
                            }
                            100% {
                                transform: translateX(-100vw);
                            }
                        }
                    `;
                document.head.appendChild(style);
            }
            // Create additional cloud puffs
            for(let j = 0; j < 3; j++){
                const puff = document.createElement('div');
                puff.style.position = 'absolute';
                puff.style.width = `${cloudWidth * 0.6}px`;
                puff.style.height = `${cloudHeight * 0.6}px`;
                puff.style.borderRadius = '50%';
                puff.style.background = cloudColor;
                puff.style.top = `${-Math.random() * 20}%`;
                puff.style.left = `${j * 30 + Math.random() * 20}%`;
                cloud.appendChild(puff);
            }
            weatherAnimation.appendChild(cloud);
        }
    }
    // Add event listener for the refresh button
    document.getElementById('refresh-button').addEventListener('click', ()=>{
        if (navigator.geolocation) navigator.geolocation.getCurrentPosition((position)=>{
            const { latitude, longitude } = position.coords;
            getWeatherData(latitude, longitude);
        }, (error)=>{
            console.error('Error getting location:', error);
            alert('Unable to refresh weather data. Please check your location settings.');
        });
        else alert('Geolocation is not supported by your browser.');
    });
});

//# sourceMappingURL=second1st.7c0ccee6.js.map
