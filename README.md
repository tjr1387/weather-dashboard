# Week 6 Challenge - Weather Dashboard
#### Building a current &amp; 5-day forecast for selected cities, using server-side APIs

## Description
 This page will allow the user to search for a city, returning both the current weather conditions and five-day forecast for that city, as per the Open Weather API. The searched city will also be added to a search history list (clicking on a city in the list will search that city again), as well as the browser's local storage.


## Installation

N/A

## Usage
When the user puts in a city to be searched, fetch requests to the Open Weather API will be sent for that city. The search is designed to take only the city name (any state/country after a comma will be ignored, for simplicity's sake). It should be noted that typos will either return no result (a message will show in that case) or will use whatever filtering the Open Weather API uses to automatically find the closest match (this leads to some interesting city names being chosen!). The current weather is displayed, and a five-day forecast is also displayed _using the noon time window for that day_. Below the search form is a list of searched cities, which the user can click on to get weather information for that city again (time may have passed since the last time that city was searched -- so it will perform another fetch from the API). The search history is locally stored. 

Screenshot(s): ![With a big search history!](/assets/my-mockup.png?raw=true)

Link to live site: 


## Flaws/Comments
I spent a lot of time with the 5-day / 3-hour API call, realizing that the time of day the fetch was sent impacted the index upon which the next day started. I wrote a loop to find the first instance of the 'tomorrow' date, and jumped the index head from that, to target the 'noon' timeframe for the forecast. Between doing that and accounting for some potential errors, this added a decent amount of code. It could also be said that the bodies of the fetch calls are large, as I built an object within them; I could've abstracted those into their own functions, but decided against it because the code worked and I already had like 12 functions. There is certainly some 'fat' to be trimmed in this (250 lines, yikes), but I was happy to get it to work! On another note, there was no acceptance criteria for responsiveness, so I only did added a bit of it. When the screen gets very narrow, it does get quite goofy. I used bootstrap classes for most of the styling, so it isn't particularly detailed, but it looks okay enough.


## Credits

Bootstrap, jQuery, and 'http://danhounshell.com/' blog for the 10-digit timestamp conversion algorithm


## License

MIT License (as referred to in the repo)
