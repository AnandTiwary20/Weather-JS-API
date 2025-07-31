// API Configuration
const API_KEY = 'YOUR_OPENWEATHER_API_KEY'; // Replace with your OpenWeatherMap API key
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// DOM Elements
const locationInput = document.getElementById('location-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const cityElement = document.getElementById('city');
const dateElement = document.getElementById('date');
const tempElement = document.getElementById('temp');
const weatherIcon = document.getElementById('weather-icon');
const descriptionElement = document.getElementById('description');
const windElement = document.getElementById('wind');
const humidityElement = document.getElementById('humidity');
const pressureElement = document.getElementById('pressure');
const forecastContainer = document.getElementById('forecast');

// Initialize the app
function init() {
    // Set current date
    updateDate();
    
    // Event Listeners
    searchBtn.addEventListener('click', () => {
        const location = locationInput.value.trim();
        if (location) {
            getWeatherByCity(location);
        }
    });
    
    locationBtn.addEventListener('click', getWeatherByLocation);
    
    // Load default city (can be changed)
    getWeatherByCity('New York');
}

// Update current date
function updateDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date();
    dateElement.textContent = today.toLocaleDateString('en-US', options);
}

// Get weather by city name
async function getWeatherByCity(city) {
    try {
        // Get current weather
        const currentWeatherUrl = `${BASE_URL}/weather?q=${city}&units=metric&appid=${API_KEY}`;
        const currentResponse = await fetch(currentWeatherUrl);
        
        if (!currentResponse.ok) {
            throw new Error('City not found');
        }
        
        const currentData = await currentResponse.json();
        updateCurrentWeather(currentData);
        
        // Get forecast
        const forecastUrl = `${BASE_URL}/forecast?q=${city}&units=metric&appid=${API_KEY}`;
        const forecastResponse = await fetch(forecastUrl);
        const forecastData = await forecastResponse.json();
        updateForecast(forecastData);
        
    } catch (error) {
        alert('Error fetching weather data. Please try again.');
        console.error('Error:', error);
    }
}

// Get weather by geolocation
function getWeatherByLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    // Get current weather
                    const currentWeatherUrl = `${BASE_URL}/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`;
                    const currentResponse = await fetch(currentWeatherUrl);
                    const currentData = await currentResponse.json();
                    updateCurrentWeather(currentData);
                    
                    // Get forecast
                    const forecastUrl = `${BASE_URL}/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`;
                    const forecastResponse = await fetch(forecastUrl);
                    const forecastData = await forecastResponse.json();
                    updateForecast(forecastData);
                    
                } catch (error) {
                    alert('Error fetching weather data. Please try again.');
                    console.error('Error:', error);
                }
            },
            (error) => {
                alert('Unable to retrieve your location. Please enter a city name.');
                console.error('Geolocation error:', error);
            }
        );
    } else {
        alert('Geolocation is not supported by your browser. Please enter a city name.');
    }
}

// Update current weather UI
function updateCurrentWeather(data) {
    cityElement.textContent = `${data.name}, ${data.sys.country}`;
    tempElement.textContent = Math.round(data.main.temp);
    descriptionElement.textContent = data.weather[0].description;
    weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    windElement.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`; // Convert m/s to km/h
    humidityElement.textContent = `${data.main.humidity}%`;
    pressureElement.textContent = `${data.main.pressure} hPa`;
    
    // Update input field
    locationInput.value = data.name;
}

// Update forecast UI
function updateForecast(data) {
    // Clear previous forecast
    forecastContainer.innerHTML = '';
    
    // Get daily forecast (one per day)
    const dailyForecast = [];
    const today = new Date().toDateString();
    
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000).toDateString();
        const time = new Date(item.dt * 1000).getHours();
        
        // Only include one forecast per day (around noon)
        if (date !== today && time === 12 && dailyForecast.length < 5) {
            dailyForecast.push(item);
        }
    });
    
    // Create forecast cards
    dailyForecast.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        const temp = Math.round(item.main.temp);
        const icon = item.weather[0].icon;
        
        const forecastCard = document.createElement('div');
        forecastCard.className = 'bg-white rounded-xl p-4 shadow-md text-center';
        forecastCard.innerHTML = `
            <p class="font-medium text-gray-700">${day}</p>
            <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="weather icon" class="mx-auto w-16 h-16">
            <p class="text-2xl font-bold">${temp}°</p>
            <p class="text-sm text-gray-500 capitalize">${item.weather[0].description}</p>
        `;
        
        forecastContainer.appendChild(forecastCard);
    });
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);