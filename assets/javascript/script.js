var APIKey = '42dcd1bbf1fe246bc2b08d6f894edf83';
var getWeatherBtn = document.getElementById('get-weather');
var weatherResult = document.getElementById('weather');
var weatherCard = document.getElementById('weather-card');
var dailyForecast = [];
var latitude = 39.1887643719098;
var longitude = -92.8261546188403;
var historyContainer = document.getElementById('search-history-container');

//Event listener to fetch user's location and dynamically update that location's 5-day weather forecast to the page upon loading
document.addEventListener('DOMContentLoaded', function () {
	getLocationAndUpdateTitle();
	retrieveLocalStorage();
});

//Function to display the 5-day forecast
function displayForecast(dailyForecast) {
	if (!Array.isArray(dailyForecast)) {
		console.error('dailyForecast is not an array:', dailyForecast);
		return;
	}
	// Clear any existing weather content
	weatherResult.textContent = '';
	// Keep track of dates already displayed
	var displayedDates = new Set();
	// Iterate through the forecast to only show 5 unique days
	for (let i = 0; i < dailyForecast.length && displayedDates.size < 5; i++) {
		var forecastDate = new Date(dailyForecast[i].dt * 1000);
		var dateKey = `${forecastDate.getFullYear()}-${
			forecastDate.getMonth() + 1
		}-${forecastDate.getDate()}`;

		// Skip duplicate dates
		if (displayedDates.has(dateKey)) {
			continue;
		}

		//Mark the date as displayed
		displayedDates.add(dateKey);

		var temperature = dailyForecast[i].main.temp;
		var temperatureFahrenheit = parseInt(((temperature - 273.15) * 9) / 5 + 32);

		//Check if array exists before trying to access it
		var description =
			dailyForecast[i].weather &&
			Array.isArray(dailyForecast[i].weather) &&
			dailyForecast[i].weather.length > 0
				? dailyForecast[i].weather[0].description
				: 'Description not available';

		//Create a forecast div container
		var forecastDiv = document.createElement('div');
		forecastDiv.classList.add('five-day-forecast');

		//Create a p element to hold the date
		var dateParagraph = document.createElement('p');
		var options = { year: 'numeric', month: '2-digit', day: '2-digit' };
		dateParagraph.textContent = forecastDate.toLocaleDateString(
			'en-US',
			options
		);
		forecastDiv.appendChild(dateParagraph);

		// Create an img element for the weather icon
		var weatherIcon = document.createElement('img');
		weatherIcon.classList.add('five-day-icon');
		weatherIcon.src =
			'https://openweathermap.org/img/wn/' +
			dailyForecast[i].weather[0].icon +
			'.png';
		weatherIcon.alt = 'Weather Icon';
		forecastDiv.appendChild(weatherIcon);

		//Create a p element to hold the temperature
		var temperatureParagraph = document.createElement('p');
		temperatureParagraph.textContent =
			'Temp : ' + temperatureFahrenheit + ' °F';
		temperatureParagraph.style.display = 'inline-block';
		forecastDiv.appendChild(temperatureParagraph);

		//Create a p element to hold the humidity
		var humidityParagraph = document.createElement('p');
		var humidity = dailyForecast[i].main.humidity;
		humidityParagraph.textContent = 'Humidity: ' + humidity + '%';
		forecastDiv.appendChild(humidityParagraph);

		//Create a p element to hold the wind speed
		var windParagraph = document.createElement('p');
		var windSpeed = dailyForecast[i].wind.speed;
		var windSpeedMPH = parseFloat((windSpeed * 2.237).toFixed(1));
		windParagraph.textContent = 'Wind Speed: ' + windSpeedMPH + 'mph';
		forecastDiv.appendChild(windParagraph);

		// Append weather result to the page
		weatherResult.appendChild(forecastDiv);
	}
}

//Event listener for the getWeather button
getWeatherBtn.addEventListener('click', function(){
		//Prevent default submission behavior
		event.preventDefault();
		//Get the user's input
		var userInput = document.getElementById('cityInput').value;
		getWeather(userInput);
});

//Function to search for weather in a specific city
function getWeather(cityName) {
	var encodedCity = encodeURIComponent(cityName);
	//Store API URL in a variable
	var queryURL =
		'https://api.openweathermap.org/geo/1.0/direct?q=' +
		encodedCity +
		'&limit=5' +
		'&appid=' +
		APIKey;
	//Make the API call to update weather card
	fetch(queryURL)
		.then((response) => response.json())
		.then((data) => {
			latitude = data[0].lat;
			longitude = data[0].lon;
			getCurrentWeather();
			loadMapScenario();
			saveToLocalStorage(cityName);
		})
		.catch((error) => {
			console.error('Error fetching weather data:', error);
		});
};

//Function to display current weather on the weather card
function displayCurrentWeather(currentWeather) {
	// Extract relevant information from the API response
	var date = new Date();
	var temperatureKelvin = currentWeather.main.temp;
	var temperatureFahrenheit = parseInt(
		((temperatureKelvin - 273.15) * 9) / 5 + 32
	);
	var humidity = currentWeather.main.humidity;
	var cloudCover = currentWeather.clouds.all;
	var iconCode = currentWeather.weather[0].icon;
	var windSpeed = currentWeather.wind.speed;
	var windSpeedMPH = parseFloat((windSpeed * 2.237).toFixed(1));

	// Update HTML elements in the weather card
	document.getElementById('date').textContent = date.toDateString();
	document.getElementById('temperature').textContent =
		'Temperature: ' + temperatureFahrenheit + ' °F';
	document.getElementById('humidity').textContent =
		'Humidity: ' + humidity + '%';
	document.getElementById('cloud-cover').textContent =
		'Cloud Cover: ' + cloudCover + '%';
	document.getElementById('wind-speed').textContent =
		'Wind Speed: ' + windSpeedMPH + ' mph';

	// Update weather icon
	var weatherIcon = document.getElementById('weather-icon');
	weatherIcon.src = 'https://openweathermap.org/img/wn/' + iconCode + '.png';
	//Update Wind Direction Icon
	var windDirectionIcon = document.getElementById('wind-direction-icon');
	var windDirectionDegrees = currentWeather.wind.deg;
	windDirectionIcon.style.transform = 'rotate(' + windDirectionDegrees + 'deg)';

	// Display the weather card
	weatherCard.style.display = 'block';
}

//Function to dynamically display town name in the header based on the location searched
function getLocationAndUpdateTitle() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function (position) {
			latitude = position.coords.latitude;
			longitude = position.coords.longitude;
			getCurrentWeather();
			loadMapScenario();
		});
	} else {
		alert('Geolocation is not supported by your browser');
	}
}

//Function to set the radar map center to the users location and display the map with a rain overlay
function loadMapScenario() {
	var map = new Microsoft.Maps.Map(document.getElementById('myMap'), {
		/* No need to set credentials if already passed in URL */
		center: new Microsoft.Maps.Location(latitude, longitude),
		zoom: 4,
	});
	//Set the map center default to the user's location
	var location = new Microsoft.Maps.Location(latitude, longitude);
	map.setView({ center: location, zoom: 8 });

	//Update the map with a rain overlay
	var urlTemplate =
		'https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-{timestamp}/{zoom}/{x}/{y}.png';
	var timestamps = [
		'900913-m50m',
		'900913-m45m',
		'900913-m40m',
		'900913-m35m',
		'900913-m30m',
		'900913-m25m',
		'900913-m20m',
		'900913-m15m',
		'900913-m10m',
		'900913-m05m',
		'900913',
	];
	var tileSources = [];
	for (var i = 0; i < timestamps.length; i++) {
		var tileSource = new Microsoft.Maps.TileSource({
			uriConstructor: urlTemplate.replace('{timestamp}', timestamps[i]),
		});
		tileSources.push(tileSource);
	}
	var animatedLayer = new Microsoft.Maps.AnimatedTileLayer({
		mercator: tileSources,
		frameRate: 500,
	});
	map.layers.insert(animatedLayer);
}

//Function to fetch current weather and update the forecast display
function getCurrentWeather() {
	var currentWeatherURL =
		'https://api.openweathermap.org/data/2.5/weather?lat=' +
		latitude +
		'&lon=' +
		longitude +
		'&appid=' +
		APIKey;

	fetch(currentWeatherURL)
		.then((response) => response.json())
		.then((currentWeather) => {
			var townName = currentWeather.name;
			// Update the title with the town name
			var yourLocalWeather = document.getElementById('your-local-weather');
			yourLocalWeather.textContent = `Current Weather for ${townName}`;
			displayCurrentWeather(currentWeather);
			getForecastWeather();
		})
		.catch((error) => {
			console.error('Error fetching current weather data:', error);
		});
}

//Function to fetch and display the 5 day forecast data
function getForecastWeather() {
	// Fetch forecast data
	var forecastURL =
		'https://api.openweathermap.org/data/2.5/forecast?lat=' +
		latitude +
		'&lon=' +
		longitude +
		'&appid=' +
		APIKey;


	fetch(forecastURL)
		.then((response) => response.json())
		.then((forecastData) => {
			// Display the 5-day forecast
			displayForecast(forecastData.list);
		})
		.catch((error) => {
			console.error('Error fetching forecast data:', error);
		});
}

//If the clicked element is a button, retrieve the text content
historyContainer.addEventListener('click', function() {
	if (event.target.matches('button')) {
		var cityName = event.target.textContent;
		getWeather(cityName);
	}
});

//Retrieve search history from local storage and parse it into a JS object
function retrieveLocalStorage() {
	var searchHistory = localStorage.getItem('history')
		if (searchHistory) {
			searchHistory = JSON.parse(searchHistory)
			displayParsedHistory(searchHistory)
		}
};


//Create and append a button for a uniquely searched city
function displayParsedHistory(searchHistory) {
	historyContainer.textContent = '';
	for (var i = 0; i < searchHistory.length; i++) {
		var buttonEl = document.createElement('button');
		buttonEl.textContent = searchHistory[i];
		historyContainer.appendChild(buttonEl);
	} 
}

//Save search history to local storage
function saveToLocalStorage(cityName) {
	var searchHistory = JSON.parse(localStorage.getItem('history')) || [];
		if (searchHistory.includes(cityName)) {
			return;
		}
		searchHistory.push(cityName)
		localStorage.setItem('history', JSON.stringify(searchHistory))
		displayParsedHistory(searchHistory);
}