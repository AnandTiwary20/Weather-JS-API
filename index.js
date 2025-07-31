//API KEY PASTED HERE
const API_KEY = '1f6bc7de25ff530f7c7cbbcffeaf7bf8';
const API_URL = 'https://api.openweathermap.org/data/2.5';

//=
const searchInput = document.getElementById('location-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const recentCitiesDropdown = document.getElementById('recent-cities-dropdown');
const recentCitiesList = document.getElementById('recent-cities-list');

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
  searchBtn.addEventListener('click', handleSearch);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
  });
  
  locationBtn.addEventListener('click', getCurrentLocationWeather);
  
  
  setupRecentCitiesDropdown();
  
  // Load default city weather
  fetchWeather('Delhi');
}

// Set up the recent cities dropdown
function setupRecentCitiesDropdown() {
  // Show dropdown when input is focused
  searchInput.addEventListener('focus', () => {
    updateRecentCitiesDropdown();
  });
  
  // Hide dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !recentCitiesDropdown.contains(e.target)) {
      recentCitiesDropdown.classList.add('hidden');
    }
  });
}

// Update the recent cities dropdown with current data
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
    cityElement.className = 'px-4 py-2 hover:bg-gray-100 cursor-pointer';
    cityElement.textContent = city;
    cityElement.addEventListener('click', () => {
      searchInput.value = city;
      handleSearch();
      recentCitiesDropdown.classList.add('hidden');
    });
    recentCitiesList.appendChild(cityElement);
  });
  
  recentCitiesDropdown.classList.remove('hidden');
}

// Save a city to recent searches
function saveCityToRecent(city) {
  let cities = getRecentCities();
  
  // Remove if already exists (to avoid duplicates)
  cities = cities.filter(c => c.toLowerCase() !== city.toLowerCase());
  
  // Add to the beginning of the array
  cities.unshift(city);
  
  // Keep only the 5 most recent
  if (cities.length > 5) {
    cities = cities.slice(0, 5);
  }
  
  // Save to local storage
  localStorage.setItem('recentCities', JSON.stringify(cities));
  
  // Update the dropdown
  updateRecentCitiesDropdown();
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

// Handle search button click
function handleSearch() {
  const location = searchInput.value.trim();
  if (location) {
    saveCityToRecent(location);
    fetchWeather(location);
  }
}

// Get weather for a city
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
  cityName.textContent = `${data.name}, ${data.sys.country}`;
  temperature.textContent = Math.round(data.main.temp);
  weatherDesc.textContent = data.weather[0].description;
  weatherImg.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  
  // Update weather details
  windSpeed.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
  humidity.textContent = `${data.main.humidity}%`;
  pressure.textContent = `${data.main.pressure} hPa`;
  
  // Update search input
  searchInput.value = data.name;
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

// Get weather for current location
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

// Start the app when the page loads
document.addEventListener('DOMContentLoaded', init);