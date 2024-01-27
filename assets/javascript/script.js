var APIKey = '42dcd1bbf1fe246bc2b08d6f894edf83';
var city;
var getWeatherBtn = document.getElementById('get-weather');
var weatherResult = document.getElementById('weather');
var weatherCard = document.getElementById('weather-card');
var dailyForecast = [];

//Event listener to fetch user's location and dynamically update that location's 5-day weather forecast to the page upon loading
document.addEventListener('DOMContentLoaded', function () {
    getLocationAndFetchWeather();
});

//Function to get the user's location and that location's weather
function getLocationAndFetchWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            //Get the user's coordinates
            var latitude = position.coords.latitude;
            var longitude = position.coords.longitude;
            
            //API Call for current weather
            var currentWeatherURL = 'https://api.openweathermap.org/data/2.5/weather?lat=' + latitude + '&lon=' + longitude + '&appid=' + APIKey;

            fetch(currentWeatherURL)
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    //Display the current weather
                    displayCurrentWeather(data);
                })
                .catch(error => {
                    console.error('Error fetching weather data:', error);
                });

                //API Call for 5-day forecast
                var forecastURL = 'https://api.openweathermap.org/data/2.5/forecast?lat=' + latitude + '&lon=' + longitude + '&appid=' + APIKey;

                fetch(forecastURL)
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    //Display the 5 day forecast
                    displayForecast(data.list);
                })
                .catch(error => {
                    console.error('Error fetching weather data:', error);
                });
        });
    } else {
        alert('Geolocation is not supported by your browser');
    }
}

function displayForecast(dailyForecast, location) {
    // Clear any existing weather content
    weatherResult.textContent = '';
    // Keep track of dates already displayed
    var displayedDates = new Set();
    // Iterate through the forecast to only show 5 unique days
    for (let i = 0; i < dailyForecast.length && displayedDates.size < 5; i++) {
        var forecastDate = new Date(dailyForecast[i].dt * 1000);
        var dateKey = `${forecastDate.getFullYear()}-${forecastDate.getMonth() + 1}-${forecastDate.getDate()}`;

        // Skip duplicate dates
        if (displayedDates.has(dateKey)) {
            continue;
        }

        // Mark the date as displayed
        displayedDates.add(dateKey);

        var temperature = dailyForecast[i].main.temp;
        var temperatureFahrenheit = parseInt((temperature - 273.15) * 9/5 + 32);

        // Check if array exists before trying to access it
        var description = dailyForecast[i].weather && Array.isArray(dailyForecast[i].weather) && dailyForecast[i].weather.length > 0
            ? dailyForecast[i].weather[0].description
            : 'Description not available';

        // Create a forecast div container
        var forecastDiv = document.createElement('div');
        forecastDiv.classList.add('five-day-forecast')
        
        // Create a p element to hold the user's location
        var locationParagraph = document.createElement('p');
        locationParagraph.textContent = 'Location: ' + location;
        forecastDiv.appendChild(locationParagraph);

        // Create a p element to hold the date
        var dateParagraph = document.createElement('p');
        dateParagraph.textContent = 'Date: ' + forecastDate.toDateString();
        forecastDiv.appendChild(dateParagraph);

        // Create a p element to hold the current temperature
        var temperatureParagraph = document.createElement('p');
        temperatureParagraph.textContent = 'Temperature: ' + temperatureFahrenheit + ' °F';
        forecastDiv.appendChild(temperatureParagraph);

        // Create a p element to hold weather description
        var descriptionParagraph = document.createElement('p');
        descriptionParagraph.textContent = 'Description: ' + description;
        forecastDiv.appendChild(descriptionParagraph);

        // Append weather result to the page
        weatherResult.appendChild(forecastDiv);
    }
}


getWeatherBtn.addEventListener('click', function getWeather() {
    //Get the user's input
    var userInput = document.getElementById('cityInput').value;
    //Reassign city variable
    city = userInput
    //Store API URL in a variable
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + APIKey;
    //Make the API call
    fetch(queryURL)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            weatherResult.textContent = "Temperature: " + data.main.temp + "°C";
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
        });
});





function displayCurrentWeather(currentWeather) {
    // Extract relevant information from the API response
    var date = new Date();
    var temperatureKelvin = currentWeather.main.temp;
    var temperatureFahrenheit = parseInt((temperatureKelvin - 273.15) * 9/5 + 32);
    var humidity = currentWeather.main.humidity;
    var cloudCover = currentWeather.clouds.all;
    var chanceOfRain = currentWeather.rain ? currentWeather.rain['1h'] : 0; // Check if rain data is available
    var iconCode = currentWeather.weather[0].icon;
    var windSpeed = currentWeather.wind.speed;
    var windSpeedMPH = parseFloat((windSpeed * 2.237).toFixed(1));

    // Update HTML elements in the weather card
    document.getElementById('date').textContent = 'Date: ' + date.toDateString();
    document.getElementById('temperature').textContent = 'Temperature: ' + temperatureFahrenheit + ' °F';
    document.getElementById('humidity').textContent = 'Humidity: ' + humidity + '%';
    document.getElementById('cloud-cover').textContent = 'Cloud Cover: ' + cloudCover + '%';
    document.getElementById('chance-of-rain').textContent = 'Chance of Rain: ' + chanceOfRain + ' mm';
    document.getElementById('wind-speed').textContent = 'Wind Speed: ' + windSpeedMPH + " mph"

    // Update weather icon
    var weatherIcon = document.getElementById('weather-icon');
    weatherIcon.src = 'http://openweathermap.org/img/wn/' + iconCode + '.png';
    //Update Wind Direction Icon
    var windDirectionIcon = document.getElementById('wind-direction-icon');
    var windDirectionDegrees = currentWeather.wind.deg;
    windDirectionIcon.style.transform = 'rotate(' + windDirectionDegrees + 'deg)';

    // Display the weather card
    weatherCard.style.display = 'block';
}







function getLocationAndUpdateTitle() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            // Get the user's coordinates
            var latitude = position.coords.latitude;
            var longitude = position.coords.longitude;

            // Fetch the town name using a reverse geocoding API
            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${APIKey}`)
                .then(response => response.json())
                .then(data => {
                    // Extract the town name from the API response
                    var townName = data.name;

                    // Update the title with the town name
                    var yourLocalWeather = document.getElementById('your-local-weather');
                    yourLocalWeather.textContent = `Current Weather for ${townName}`;

                    var location = document.getElementById('')`${townName}`;
                    displayForecast(dailyForecast, location);
                })
                .catch(error => {
                    console.error('Error fetching weather data:', error);
                })
        })
    } else {
        alert('Geolocation is not supported by your browser');
    }
}

// Call the function to update the title when the page loads
document.addEventListener('DOMContentLoaded', function() {
    getLocationAndUpdateTitle();
});








function loadMapScenario() {
    var map = new Microsoft.Maps.Map(document.getElementById('myMap'), {
        /* No need to set credentials if already passed in URL */
        center: new Microsoft.Maps.Location(39.1887643719098, -92.8261546188403),
        zoom: 4
    });
    //Set the map center default to the user's location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var userLocation = new Microsoft.Maps.Location(position.coords.latitude, position.coords.longitude);
            map.setView({ center: userLocation, zoom: 9 });
        });
    //Update the map with a rain overlay
    var urlTemplate = 'https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-{timestamp}/{zoom}/{x}/{y}.png';
    var timestamps = ['900913-m50m', '900913-m45m', '900913-m40m', '900913-m35m', '900913-m30m', '900913-m25m', '900913-m20m', '900913-m15m', '900913-m10m', '900913-m05m', '900913'];
    var tileSources = [];
    for (var i = 0; i < timestamps.length; i++) {
        var tileSource = new Microsoft.Maps.TileSource({
            uriConstructor: urlTemplate.replace('{timestamp}', timestamps[i])
        });
        tileSources.push(tileSource);
    }
    var animatedLayer = new Microsoft.Maps.AnimatedTileLayer({ mercator: tileSources, frameRate: 500 });
    map.layers.insert(animatedLayer);
}};
