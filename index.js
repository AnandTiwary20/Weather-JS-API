//Tried My best to Explain the codes and calling of the required and most important features of the code through comments .



//API KEY PASTED HERE
const API_KEY = '1f6bc7de25ff530f7c7cbbcffeaf7bf8';
const API_URL = 'https://api.openweathermap.org/data/2.5';

// DOM Elements
const searchInput = document.getElementById('location-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const recentCitiesDropdown = document.getElementById('recent-cities-dropdown');
const recentCitiesList = document.getElementById('recent-cities-list');
const quickLocationBtns = document.querySelectorAll('.quick-location-btn');

// Unit conversion elements
const unitCelsius = document.getElementById('unit-celsius');
const unitFahrenheit = document.getElementById('unit-fahrenheit');
const unitKelvin = document.getElementById('unit-kelvin');

// Current unit state (default: Celsius)
let currentUnit = 'celsius';
let currentWeatherData = null;

// Current weather elements
const cityName = document.getElementById('city');
const currentDate = document.getElementById('date');
const temperature = document.getElementById('temp');
const weatherImg = document.getElementById('weather-icon');
const weatherDesc = document.getElementById('description');

// Weather details
const windSpeed = document.getElementById('wind');
const humidity = document.getElementById('humidity');
const pressure = document.getElementById('pressure');

// Forecast container
const forecastList = document.getElementById('forecast');

function init() {
  updateDate();
  
  // Search functionality
  searchBtn.addEventListener('click', handleSearch);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
  });
  
  // Location button
  locationBtn.addEventListener('click', getCurrentLocationWeather);
  
  // Quick location buttons
  quickLocationBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const city = e.target.getAttribute('data-city') || e.target.closest('.quick-location-btn').getAttribute('data-city');
      if (city) {
        searchInput.value = city;
        handleSearch();
      }
    });
  });
  
  // Unit conversion
  unitCelsius.addEventListener('click', () => setTemperatureUnit('celsius'));
  unitFahrenheit.addEventListener('click', () => setTemperatureUnit('fahrenheit'));
  unitKelvin.addEventListener('click', () => setTemperatureUnit('kelvin'));
  
  // Setup recent cities dropdown
  setupRecentCitiesDropdown();
  
  // Load default city weather
  fetchWeather('Delhi');
  
  // Highlight current unit
  updateUnitButtons();
}

function setupRecentCitiesDropdown() {
  // Toggle dropdown on input click
  searchInput.addEventListener('click', (e) => {
    e.stopPropagation();
    const cities = getRecentCities();
    if (cities.length > 0) {
      recentCitiesDropdown.classList.toggle('hidden');
    }
  });
  
  // Hide dropdown when clicking outside
  document.addEventListener('click', () => {
    if (!recentCitiesDropdown.classList.contains('hidden')) {
      recentCitiesDropdown.classList.add('hidden');
    }
  });
  
  // Prevent dropdown from closing when clicking inside it
  recentCitiesDropdown.addEventListener('click', (e) => {
    e.stopPropagation();
  });
}

// Updating recent cities using Dropdown
function updateRecentCitiesDropdown() {
  const cities = getRecentCities();
  
  if (cities.length === 0) {
    recentCitiesDropdown.classList.add('hidden');
    return;
  }
  
  // Clear previous list
  recentCitiesList.innerHTML = '';
  
  // Add each city to the dropdown
  cities.forEach(city => {
    const cityElement = document.createElement('div');
    cityElement.className = 'px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center';
    
    // Add location icon
    const icon = document.createElement('i');
    icon.className = 'fas fa-map-marker-alt text-blue-500 mr-2';
    
    cityElement.appendChild(icon);
    cityElement.appendChild(document.createTextNode(city));
    
    cityElement.addEventListener('click', (e) => {
      e.stopPropagation();
      searchInput.value = city;
      handleSearch();
      recentCitiesDropdown.classList.add('hidden');
    });
    
    recentCitiesList.appendChild(cityElement);
  });
  
  // Position the dropdown below the input
  const inputRect = searchInput.getBoundingClientRect();
  recentCitiesDropdown.style.width = `${inputRect.width}px`;
  recentCitiesDropdown.style.top = `${inputRect.bottom + window.scrollY}px`;
  recentCitiesDropdown.style.left = `${inputRect.left + window.scrollX}px`;
  
  recentCitiesDropdown.classList.remove('hidden');
}

// Save a city to recent searches USING THE FUNCTION saveCityToRecent
function saveCityToRecent(city) {
  let cities = getRecentCities();
  
  // (to avoid duplicates WE WILL REMOVE THE CITIES)
  cities = cities.filter(c => c.toLowerCase() !== city.toLowerCase());
  
  // Add to the beginning of the array
  cities.unshift(city);
  
  // Keep only the 5 most recent
  if (cities.length > 5) {
    cities = cities.slice(0, 5);
  }
  
  // Save to local storage ( We can use MongoDB or SQL lite too mam/sir but we avoid it because the project is simple.)
  localStorage.setItem('recentCities', JSON.stringify(cities));
  
  // Update the dropdown
  updateRecentCitiesDropdown();
}

// Temperature conversion functions
function celsiusToFahrenheit(c) {
    return (c * 9/5) + 32;
  }
  
  function celsiusToKelvin(c) {
    return c + 273.15;
  }
  
// Get recent cities from local storage
function getRecentCities() {
  const citiesJson = localStorage.getItem('recentCities');
  return citiesJson ? JSON.parse(citiesJson) : [];
}

// Show today's date in a nice format
function updateDate() {
  const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
  currentDate.textContent = new Date().toLocaleDateString('en-US', options);
}

// Handle search button click using the function handleSearch THAT TASKES THE LOCATION FROM THE USER AND CALLS THE FUNCTION fetchWeather
function handleSearch() {
  const location = searchInput.value.trim();
  if (location) {
    saveCityToRecent(location);
    fetchWeather(location);
  }
}

// Get weather for a city USING THE FUNCTION fetchWeather THAT TAKES THE LOCATION FROM THE USER AND CALLS THE FUNCTION
async function fetchWeather(city) {
  try {
    // Show loading state
    cityName.textContent = 'Loading...';
    
    // Get current weather
    const currentRes = await fetch(`${API_URL}/weather?q=${city}&units=metric&appid=${API_KEY}`);
    if (!currentRes.ok) throw new Error('City not found');
    
    const currentData = await currentRes.json();
    updateCurrentWeather(currentData);
    
    // Get forecast
    const forecastRes = await fetch(`${API_URL}/forecast?q=${city}&units=metric&appid=${API_KEY}`);
    const forecastData = await forecastRes.json();
    showForecast(forecastData);
    
  } catch (err) {
    alert('Oops! Could not get weather data. Please try again.');
    console.error('Error:', err);
  }
}

// Update the UI with current weather data
function updateCurrentWeather(data) {
  // Save current weather data for unit conversion
  currentWeatherData = data;
  
  // Update location and description
  cityName.textContent = `${data.name}, ${data.sys.country}`;
  weatherDesc.textContent = data.weather[0].description;
  weatherImg.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  
  // Update temperature based on current unit
  updateTemperatureDisplay();
  
  // Update weather details
  windSpeed.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
  humidity.textContent = `${data.main.humidity}%`;
  pressure.textContent = `${data.main.pressure} hPa`;
  
  // Update search input
  searchInput.value = data.name;
  
  // Add to recent searches
  saveCityToRecent(data.name);
}

// Show 5-day forecast
function showForecast(data) {
  // Clear previous forecast
  forecastList.innerHTML = '';
  
  // Get one forecast per day (around noon)
  const dailyForecast = [];
  const today = new Date().toDateString();
  
  data.list.forEach(item => {
    const date = new Date(item.dt * 1000);
    if (date.toDateString() !== today && date.getHours() === 12 && dailyForecast.length < 5) {
      dailyForecast.push(item);
    }
  });
  
  // Create forecast cards
  dailyForecast.forEach(day => {
    const date = new Date(day.dt * 1000);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const temp = Math.round(day.main.temp);
    const icon = day.weather[0].icon;
    
    const card = `
      <div class="bg-white p-4 rounded-xl shadow text-center">
        <p class="font-medium">${dayName}</p>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="weather" class="mx-auto w-16 h-16">
        <p class="text-2xl font-bold">${temp}°</p>
        <p class="text-sm text-gray-500">${day.weather[0].description}</p>
      </div>
    `;
    
    forecastList.insertAdjacentHTML('beforeend', card);
  });
}

// Get weather for current location ..
function getCurrentLocationWeather() {
  if (!navigator.geolocation) {
    alert("Your browser doesn't support geolocation. Please enter a city name.");
    return;
  }
  
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        
        // Get current weather
        const currentRes = await fetch(`${API_URL}/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`);
        const currentData = await currentRes.json();
        updateCurrentWeather(currentData);
        
        // Get forecast
        const forecastRes = await fetch(`${API_URL}/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`);
        const forecastData = await forecastRes.json();
        showForecast(forecastData);
        
      } catch (err) {
        alert('Oops! Could not get weather data for your location.');
        console.error('Error:', err);
      }
    },
    (error) => {
      alert("Couldn't get your location. Please allow location access or enter a city name.");
      console.error('Geolocation error:', error);
    }
  );
}


// Update temperature display based on current unit 
function updateTemperatureDisplay() {
  if (!currentWeatherData) return;
  
  let temp = currentWeatherData.main.temp;
  let feelsLike = currentWeatherData.main.feels_like;
  
  switch(currentUnit) {
    case 'fahrenheit':
      temp = celsiusToFahrenheit(temp);
      feelsLike = celsiusToFahrenheit(feelsLike);
      temperature.textContent = `${Math.round(temp)}°F`;
      break;
    case 'kelvin':
      temp = celsiusToKelvin(temp);
      feelsLike = celsiusToKelvin(feelsLike);
      temperature.textContent = `${Math.round(temp)}K`;
      break;
    default: // celsius
      temperature.textContent = `${Math.round(temp)}°C`;
  }
}

// Set temperature unit and update display
function setTemperatureUnit(unit) {
  if (unit === currentUnit) return;
  
  currentUnit = unit;
  updateUnitButtons();
  
  if (currentWeatherData) {
    updateTemperatureDisplay();
  }
  
  // Save preference to localStorage
  localStorage.setItem('temperatureUnit', unit);
}

// Update unit toggle buttons
function updateUnitButtons() {
    // Remove all active classes
    unitCelsius.classList.remove('bg-blue-600', 'text-white');
    unitFahrenheit.classList.remove('bg-blue-600', 'text-white');
    unitKelvin.classList.remove('bg-blue-600', 'text-white');
    
    // Add active class to current unit
    switch(currentUnit) {
      case 'fahrenheit':
        unitFahrenheit.classList.add('bg-blue-600', 'text-white');
        break;
      case 'kelvin':
        unitKelvin.classList.add('bg-blue-600', 'text-white');
        break;
      default: // celsius
        unitCelsius.classList.add('bg-blue-600', 'text-white');
    }
  }
  
// Load saved temperature unit preference
function loadTemperaturePreference() {
  const savedUnit = localStorage.getItem('temperatureUnit');
  if (savedUnit && ['celsius', 'fahrenheit', 'kelvin'].includes(savedUnit)) {
    currentUnit = savedUnit;
    updateUnitButtons();
  }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
  loadTemperaturePreference();
  init();
});