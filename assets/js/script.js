// Global variables
const apiKey = '6c6f4753724094c73aa3d202e8779c99';


// Function deifnitions

// The top-level fetch sequence function -- will get called based upon the 'form submission' event listener
function getForecast(city) {
    // Builds URL based on input city, fetches coordinates
    const coordFetchUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;
    fetch(coordFetchUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            // Takes coords from parsed response and builds the URL for the next fetch, using those coords
            const cityLat = data[0].lat;
            const cityLon = data[0].lon;
            const weatherFetchUrl = `http://api.openweathermap.org/data/2.5/forecast?lat=${cityLat}&lon=${cityLon}&units=imperial&appid=${apiKey}`;
            // Calls the second fetch function, which will return all the necessary data bits to fill out the HTML elements
            getWeatherFields(weatherFetchUrl);
        })
}

// The weather info fetch function; takes in the URL with the appropriate coords already put in
function getWeatherFields(url) {
    fetch(url)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            // Builds an array of objects with the required data while reformatting it
                // The first index of the array is the current day, where the rest will be the future five
                // Because the array is length 40 (3 hour chunks); going to need every 8th for each subsequent day
            const forecastArray = []
            for (let i = 0; i < data.list.length; i += 8) {
                const weatherObject = {
                    city: `${data.city.name}`,
                    date: reformatDate(data.list[i].dt_txt), 
                    icon: `https://openweathermap.org/img/w/${data.list[i].weather[0].icon}.png`,
                    temp: `Temp: ${data.list[i].main.temp} \u00B0F`, 
                    wind: `Wind: ${data.list[i].wind.speed} MPH`,
                    humidity: `Humidity: ${data.list[i].main.humidity} %`
                }
                forecastArray.push(weatherObject);
                // Need the last index (39) so I'm stepping down the counter to 31 so the increment doesn't end up omitting it
                if (i === 32) {
                    i--;
                }
            }
            buildCurrent(forecastArray[0]);
            buildFiveDay(forecastArray.slice(1, 6));
        })
}

// Test city (works!)
getForecast('Boston');

function buildCurrent(object) {
    const cityDate = $('<h2>').addClass(`mb-3 d-inline`).text(`${object.city} (${object.date})`);
    const icon = $('<img>').addClass(`mb-3 d-inline-block`).attr('src', object.icon);
    const tempEl = $('<p>').text(object.temp);
    const windEl = $('<p>').text(object.wind);
    const humidityEl = $('<p>').text(object.temp);
    $('#currentWeather').append(cityDate, icon, tempEl, windEl, humidityEl);
}

function buildFiveDay(objArray) {
    for (let o of objArray) {
        const dayCard = $('<div>').addClass('card col-2 m-3 bg-primary');
        const cardBody = $('<div>').addClass('card-body p-1');

        dayCard.append(cardBody);

        const date = $('<h4>').addClass(`card-title`).text(o.date);
        const icon = $('<img>').attr('src', o.icon);
        const tempEl = $('<p>').addClass(`card-text`).text(o.temp);
        const windEl = $('<p>').addClass(`card-text`).text(o.wind);
        const humidityEl = $('<p>').addClass(`card-text`).text(o.temp);

        cardBody.append(date, icon, tempEl, windEl, humidityEl);

        $('#cardsContainer').append(dayCard);
    }
}


{/* <section id="weatherContainer" class="col-9">
<div id="currentWeather" class="border border-success m-2">
    <!-- the current day weather info will go here -->
    <!-- <h2 class="mb-4">City and Date</h2>
    <p>Temp: number</p>
    <p>Wind: number</p>
    <p>Humidity: number</p> -->
</div>
<div id="fiveDayForecast" class="border border-danger m-2">
    <h3 class="ml-3 pb-2">5-Day Forecast:</h3>
    <div id="cardsContainer row">
        <!-- form for the card for each of the 5 days: -->

        <!-- <div class="card col-2 mx-3 bg-primary">
            <div class="card-body p-2">
                <h4 class="card-title">8/31/22</h5>
                <p class="card-text">IMAGE ICON</p>
                <p class="card-text">Temp: number</p>
                <p class="card-text">Wind: number</p>
                <p class="card-text">Humidity: number</p>
            </div>
        </div> -->
    </div> */}




// Helper function to convert the 'dt_txt' field into the format I want
    // Prbably could have used moment for this, but this was a fun little function to write
function reformatDate(dateField) {
    const dateArray = dateField.split(' ')[0].split('-');
    return `${dateArray[1]}/${dateArray[2]}/${dateArray[0]}`;
}

const sampleDate = '2022-11-04 21:00:00';

// Works!
// reformatDate(sampleDate);



// URL for icon image: `https://openweathermap.org/img/w/${weatherIcon}.png`




