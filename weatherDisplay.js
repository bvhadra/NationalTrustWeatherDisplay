(function() {
    // Function to get property coordinates
    function getPropertyCoordinates() {
      // Check if coordinates are stored in a global variable
      if (window.propertyCoordinates) {
        return window.propertyCoordinates;
      }
      
      // Check if coordinates are in localStorage
      const storedCoords = localStorage.getItem('propertyCoordinates');
      if (storedCoords) {
        return JSON.parse(storedCoords);
      }
      
      // Extract from page content (example selector, adjust as needed)
      const coordsElement = document.querySelector('meta[name="geo.position"]');
      if (coordsElement) {
        const [lat, lon] = coordsElement.content.split(';');
        return { lat: parseFloat(lat), lon: parseFloat(lon) };
      }
      
      // Fallback to default coordinates if not found
      console.warn('Property coordinates not found, using default');
      return { lat: 52.3411, lon: -1.8243 }; // Default to Packwood House
    }
  
    // Function to fetch weather data
    async function fetchWeatherData(lat, lon) {
      const appid = 'a2ef86c41a'; // Mock API key
      const url = `https://europe-west1-amigo-actions.cloudfunctions.net/recruitment-mock-weather-endpoint/forecast?appid=${appid}&lat=${lat}&lon=${lon}`;
      
      try {
        const response = await fetch(url);
        return await response.json();
      } catch (error) {
        console.error('Error fetching weather data:', error);
        return null;
      }
    }
  
    // Function to create weather display
    function createWeatherDisplay(weatherData) {
      if (!weatherData || !weatherData.list || weatherData.list.length === 0) {
        return null;
      }
  
      const currentWeather = weatherData.list[0];
      const temp = Math.round(currentWeather.main.temp);
      const description = currentWeather.weather[0].description;
  
      const weatherElement = document.createElement('div');
      weatherElement.innerHTML = `
        <h3>Current Weather</h3>
        <p>${temp}°C, ${description}</p>
      `;
      weatherElement.style.cssText = `
        background-color: #f0f0f0;
        padding: 10px;
        border-radius: 5px;
        margin-top: 20px;
      `;
  
      return weatherElement;
    }
  
    // Function to insert weather display
    function insertWeatherDisplay(weatherElement) {
      const targetElement = document.querySelector('.main-content');
      if (targetElement && weatherElement) {
        targetElement.insertBefore(weatherElement, targetElement.firstChild);
      }
    }
  
    // Enhanced A/B testing implementation
    function implementABTesting() {
      const testGroup = localStorage.getItem('weatherTestGroup');
      if (testGroup === null) {
        const isTestGroup = Math.random() < 0.5;
        localStorage.setItem('weatherTestGroup', isTestGroup ? 'test' : 'control');
        return isTestGroup;
      }
      return testGroup === 'test';
    }
  
    // Function to track user behavior
    function trackUserBehavior(isTestGroup) {
      const startTime = Date.now();
      const group = isTestGroup ? 'test' : 'control';
  
      // Track time spent on page
      window.addEventListener('beforeunload', () => {
        const timeSpent = Date.now() - startTime;
        // In a real scenario, send this data to an analytics service
        console.log(`User in ${group} group spent ${timeSpent}ms on page`);
      });
  
      // Track clicks on specific elements (e.g., "Plan your visit" button)
      document.querySelectorAll('.plan-visit-button').forEach(button => {
        button.addEventListener('click', () => {
          console.log(`User in ${group} group clicked "Plan your visit"`);
        });
      });
    }
  
    // Main function
    async function addWeatherToPage() {
      const showWeather = implementABTesting();
      trackUserBehavior(showWeather);
      
      if (showWeather) {
        const { lat, lon } = getPropertyCoordinates();
        const weatherData = await fetchWeatherData(lat, lon);
        const weatherElement = createWeatherDisplay(weatherData);
        insertWeatherDisplay(weatherElement);
      }
    }
  
    // Run the script
    addWeatherToPage();
  })();