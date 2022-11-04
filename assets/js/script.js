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
            // Calls the element building functions which will use specific pieces of the returned data
            console.log(data.list[0].dt_txt, 
                data.list[0].weather[0].icon, 
                data.list[0].main.temp, 
                data.list[0].wind.speed,
                data.list[0].main.humidity);
        })
}

// Test city (works!)
// getForecast('Boston');





// Helper function to convert the 'dt_txt' field into the format I want
    // Prbably could have used moment for this, but this was a fun little function to write
function reformatDate(dateField) {
    const dateArray = dateField.split(' ')[0].split('-');
    console.log(`${dateArray[1]}/${dateArray[2]}/${dateArray[0]}`);
}

const sampleDate = '2022-11-04 21:00:00';

// Works!
// reformatDate(sampleDate);








