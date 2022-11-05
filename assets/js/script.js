// Global variables
const apiKey = '6c6f4753724094c73aa3d202e8779c99';

// This get pushed to in two separate featches, so having it be global and changeable seemed necessary
let forecastArray = [];

// Function deifnitions

// The top-level fetch sequence function -- will get called based upon the 'form submission' event listener
function getForecasts(city) {
    // Builds URL based on input city, fetches coordinates
    const coordFetchUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;
    fetch(coordFetchUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            // Takes coords from parsed response and builds the URL for the next fetch, using those coords
            if (data.length) {
                console.log(data);
                const cityLat = data[0].lat;
                const cityLon = data[0].lon;
                const currentFetchUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${cityLat}&lon=${cityLon}&units=imperial&appid=${apiKey}`
                const fiveDayFetchUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${cityLat}&lon=${cityLon}&units=imperial&appid=${apiKey}`;

                // Calls the second fetch function, which will return all the necessary data bits to fill out the HTML elements
                getWeatherFields(currentFetchUrl, fiveDayFetchUrl);
            } else {
                // Shows a 'no results' message if search came up empty (i.e. badly typo-ed, un-autocomplet-able input)
                $('#currentWeather').append($('<p>').text('No results found'));
            }
        })
}

// The weather info fetch function; takes in the URL with the appropriate coords already put in
function getWeatherFields(currUrl, fiveDayUrl) {
    fetch(currUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            const currentWeatherObject = {
                city: `${data.name}`,
                date:  convertTenDigitDate(data.dt),
                icon: `https://openweathermap.org/img/w/${data.weather[0].icon}.png`,
                temp: `Temp: ${data.main.temp} \u00B0F`,
                wind: `Wind: ${data.wind.speed} MPH`,
                humidity: `Humidity: ${data.main.humidity}%`                
            }
            forecastArray.push(currentWeatherObject);
            return fiveDayUrl;
        })
    fetch(fiveDayUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            // Builds an array of objects with the required data while reformatting it
                // The first index of the array is the current day, where the rest will be the future five
                // Because the array is length 40 (3 hour chunks); going to need every 8th for each subsequent day
            for (let i = 3; i < 40; i += 8) {
                const weatherObject = {
                    city: `${data.city.name}`,
                    date: reformatDate(data.list[i].dt_txt), 
                    icon: `https://openweathermap.org/img/w/${data.list[i].weather[0].icon}.png`,
                    temp: `Temp: ${data.list[i].main.temp} \u00B0F`, 
                    wind: `Wind: ${data.list[i].wind.speed} MPH`,
                    humidity: `Humidity: ${data.list[i].main.humidity}%`
                }
                forecastArray.push(weatherObject);
            }
            buildCurrent(forecastArray[0]);
            buildFiveDay(forecastArray.slice(1, 6));
        })
}

// Using the object built from the forecast fetch call, renders the elements of the current forecast
function buildCurrent(object) {
    const cityDate = $('<h2>').addClass(`mb-3 d-inline`).text(`${object.city} (${object.date})`);
    const icon = $('<img>').addClass(`mb-3 d-inline-block`).attr('src', object.icon);
    const tempEl = $('<p>').text(object.temp);
    const windEl = $('<p>').text(object.wind);
    const humidityEl = $('<p>').text(object.humidity);
    $('#currentWeather').append(cityDate, icon, tempEl, windEl, humidityEl);
}

// Using the array of objec built from the 5-day forecast fetch call, renders its 'card' elements
function buildFiveDay(objArray) {
    for (let o of objArray) {
        const dayCard = $('<div>').addClass('card col-2 m-3 bg-primary');
        const cardBody = $('<div>').addClass('card-body p-1');

        dayCard.append(cardBody);

        const date = $('<h4>').addClass(`card-title`).text(o.date);
        const icon = $('<img>').attr('src', o.icon);
        const tempEl = $('<p>').addClass(`card-text`).text(o.temp);
        const windEl = $('<p>').addClass(`card-text`).text(o.wind);
        const humidityEl = $('<p>').addClass(`card-text`).text(o.humidity);

        cardBody.append(date, icon, tempEl, windEl, humidityEl);

        $('#cardsContainer').append(dayCard);
    }
}

// Helper function to convert the 'dt_txt' field into the format I want
    // Probably could have used moment for this, but this was a fun little function to write
function reformatDate(dateField) {
    const dateArray = dateField.split(' ')[0].split('-');
    return `${dateArray[1]}/${dateArray[2]}/${dateArray[0]}`;
}

// Convert the 10-digit timestamp (from current forecast) into proper date format

    // Give credit for this?

function convertTenDigitDate(timestamp) {
    const pubDate = new Date(timestamp * 1000);
    const twoDigitDay = pubDate.getDate().toString().length === 1 ? `0${pubDate.getDate()}` : pubDate.getDate();
    const formattedDate = `${pubDate.getMonth() + 1}/${twoDigitDay}/${pubDate.getFullYear()}`;
    return formattedDate;
}


// // Test city (works!)
// getForecasts('Boston');

// Event listeners

// City search (form submission)
$('#searchForm').submit(function(event) {
    event.preventDefault();
    // Empties container elements
    forecastArray = [];
    $('#cardsContainer, #currentWeather').empty();
    // Grab the search input from form
    const searchCity = $('#citySearch').val();
    // Run the big boy function to render the weather elements
    getForecasts(searchCity);
    // also take the step to add this to local storage

});
