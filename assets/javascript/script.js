var APIKey = '42dcd1bbf1fe246bc2b08d6f894edf83';
var city;
var getWeatherBtn = document.getElementById('get-weather');
var weatherResult = document.getElementById('weather');

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

function displayForecast(dailyForecast) {
    //Clear any existing weather content
    weatherResult.textContent = '';
    //Iterate through the forecast to only show 5 days
    for (let i = 0; i < 5 && i < dailyForecast.length; i++) {
        var forecastDate = new Date(dailyForecast[i].dt * 1000)
        var temperature = dailyForecast[i].temp;
        
        //Check if array exists before trying to access it
        var description = dailyForecast[i].weather && Array.isArray(dailyForecast[i].weather) && dailyForecast[i].weather.length > 0 
        ? dailyForecast[i].weather[0].description 
        : 'Description not available';
        
        //Create a forecast div container
        var forecastDiv = document.createElement('div');
        //Create a p element to hold the date
        var dateParagraph = document.createElement('p');
        dateParagraph.textContent = 'Date: ' + forecastDate.toDateString();
        forecastDiv.appendChild(dateParagraph);
        //Create a p element to hold the current temperature
        var temperatureParagraph = document.createElement('p');
        temperatureParagraph.textContent = 'Temperature: ' + temperature + ' °C';
        forecastDiv.appendChild(temperatureParagraph);
        //Create a p element to hold weather description
        var descriptionParagraph = document.createElement('p');
        descriptionParagraph.textContent = 'Description: ' + description;
        forecastDiv.appendChild(descriptionParagraph);
        //Append weather result to the page
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
    // Assuming 'weatherResult' is the HTML element where you want to display the current weather
    var weatherResult = document.getElementById('weather');

    // Clear any existing content
    weatherResult.textContent = '';

    // Extract relevant information from the API response
    var temperature = currentWeather.main.temp;
    var description = currentWeather.weather[0].description;

    // Create HTML elements to display the information
    var temperatureParagraph = document.createElement('p');
    temperatureParagraph.textContent = 'Current Temperature: ' + temperature + ' °C';

    var descriptionParagraph = document.createElement('p');
    descriptionParagraph.textContent = 'Description: ' + description;

    // Append the created elements to the weatherResult container
    weatherResult.appendChild(temperatureParagraph);
    weatherResult.appendChild(descriptionParagraph);
}