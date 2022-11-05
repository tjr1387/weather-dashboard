// Global variables
const apiKey = '6c6f4753724094c73aa3d202e8779c99';

    // Global containers for the current weather object, and the five day forecast object array
let currentObject;
let forecastArray = [];

// let currFetchDone;
// let fiveDayFetchDone;

    // Grabbing current day of month to use as comparison to target the starting index of tomorrows day of month in hte five day forecast
const currDay = new Date().getDate();


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

                const cityLat = data[0].lat;
                const cityLon = data[0].lon;
                const currentFetchUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${cityLat}&lon=${cityLon}&units=imperial&appid=${apiKey}`
                const fiveDayFetchUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${cityLat}&lon=${cityLon}&units=imperial&appid=${apiKey}`;

                // Calls the second fetch function, which will return all the necessary data bits to fill out the HTML elements
                getWeatherFields(currentFetchUrl, fiveDayFetchUrl);
            } else {
                // Shows a 'no results' message if search came up empty (i.e. badly typo-ed, un-autocomplet-able input)
                $('#currentWeather').append($('<p>').text('No results found -- please check for typos'));
            }
        })
}

// The weather info fetch function; takes in the URL with the appropriate coords already put in
    // It'd probably be better to have these in two separate functions; the object assignments could also be abstracted out into helper functions
function getWeatherFields(currUrl, fiveDayUrl) {
    fetch(currUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            const currentWeatherObject = {
                city: `${data.name}`,
                date:  convertTenDigitDate(data.dt),
                icon: {url: `https://openweathermap.org/img/w/${data.weather[0].icon}.png`,
                       alt: `${data.weather[0].main}`},
                temp: `Temp: ${data.main.temp} \u00B0F`,
                wind: `Wind: ${data.wind.speed} MPH`,
                humidity: `Humidity: ${data.main.humidity}%`                
            };
            currentObject = currentWeatherObject;

            return fiveDayUrl;
        })
    fetch(fiveDayUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            // Loop to find the first element (midnight) of tomorrow in the 40-length forecast list
                // This index changes depending on the time of day the fetch is made, hence the comparison loop
            let startIndex = 0;
            for (let elem of data.list) {
                // Extracting the day-of-the-month out of the data.list, to compare with today's day-of-the-month
                elemDay = reformatDate(elem.dt_txt).split('/')[1];
                // Need loose equality here so that string (leading zero or not) to number all pop equal (['5', '05', 5] are all loosely equal e.g.)
                if (elemDay == currDay + 1) {
                    // Break from the loop the moment we get to the first array item that is the next day, captured by the value of 'startIndex'
                    break;
                }
                startIndex++;
            }
            // Builds an array of objects with the required data while reformatting it
                // Using the starting index (+ 4) to pinpoint noon of the next day, then incremeenting by 8 so its noon for the subsequent ones
                // Chose noon because that's a decent time (somewhere middle of day) to give a forecast (times like 3AM or 9PM probably wouldn't be)
            for (let i = startIndex + 4; i < 40; i += 8) {
                const properIcon = forceDayIcon(data.list[i].weather[0].icon);
                const weatherObject = {
                    city: `${data.city.name}`,
                    date: reformatDate(data.list[i].dt_txt), 
                    icon: {url: `https://openweathermap.org/img/w/${properIcon}.png`,
                           alt: `${data.list[i].weather[0].main}`},
                    temp: `Temp: ${data.list[i].main.temp} \u00B0F`, 
                    wind: `Wind: ${data.list[i].wind.speed} MPH`,
                    humidity: `Humidity: ${data.list[i].main.humidity}%`
                }
                forecastArray.push(weatherObject);
            }
            buildCurrent(currentObject);
            buildFiveDay(forecastArray);
        })
}

// Using the object built from the forecast fetch call, renders the elements of the current forecast
function buildCurrent(object) {
    const cityDate = $('<h2>').addClass(`mb-3 d-inline`).text(`${object.city} (${object.date})`);
    const icon = $('<img>').addClass(`mb-3 d-inline-block px-2`).attr({'src': object.icon.url, 'alt': object.icon.alt});
    const tempEl = $('<p>').text(object.temp);
    const windEl = $('<p>').text(object.wind);
    const humidityEl = $('<p>').text(object.humidity);
    $('#currentWeather').append(cityDate, icon, tempEl, windEl, humidityEl);
}

// Using the array of object built from the 5-day forecast fetch call, renders its 'card' elements
function buildFiveDay(objArray) {
    for (let o of objArray) {
        const dayCard = $('<div>').addClass('card col-2 m-3 bg-primary');
        const cardBody = $('<div>').addClass('card-body p-1');

        dayCard.append(cardBody);

        const date = $('<h4>').addClass(`card-title`).text(o.date);
        const icon = $('<img>').attr({'src': o.icon.url, 'alt': o.icon.alt});
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

// Helper function to convert the 10-digit timestamp (from current forecast) into the uniform date format

    // Give credit for this?

function convertTenDigitDate(timestamp) {
    const pubDate = new Date(timestamp * 1000);
    const twoDigitDay = pubDate.getDate().toString().length === 1 ? `0${pubDate.getDate()}` : pubDate.getDate();
    const formattedDate = `${pubDate.getMonth() + 1}/${twoDigitDay}/${pubDate.getFullYear()}`;
    return formattedDate;
}

// Helper function that strips the state off of the input
function cityOnly (string) {
    let result = string;
    if (string.includes(',')) {
        result = string.split(',')[0]
    }
    return result
}
// Helper function to ensure the icon given is for daytime
    // There are some 'night' icons associated with forecasts from noon, which is an error on the APIs part
function forceDayIcon (string) {
    let stringArray = string.split('');
    stringArray[stringArray.length - 1] = 'd';
    const result = stringArray.join('');
    return result;
}

// Event listeners

// City search (form submission)
$('#searchForm').submit(function(event) {
    event.preventDefault();
    // Empties container elements
    forecastArray = [];
    $('#cardsContainer, #currentWeather').empty();
    // Grab the search input from form and strip the state (or, anything after a comma) off
    const searchedVal = $('#citySearch').val();
    const searchCity = cityOnly(searchedVal);
    // Run the big boy function to render the weather elements
    getForecasts(searchCity);
    // also take the step to add this to local storage -- should actually do this somewhere else in the chain (inside getForecassts probably)

});
