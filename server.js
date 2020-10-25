'use strict';
// Constructor
function Location(city, locationData) {
    this.search_query = city;
    this.formated_query = locationData.display_name;
    this.latitude = locationData.lat;
    this.longitude = locationData.lon;
}
function Weather(weatherData) {
    // this.data = weatherData.city_name;
    // this.city_name = weatherData.data.location.city;
    // this.timezone=weatherData.timezone;
    this.foreCast=description;
    this.time=datetime;
}
// Defining Application Dependencies
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const app = express();
app.use(cors());
// Routes
app.get('/', (reqeust, response) => {
    response.status(200).send('Home Page Welcome to express');
});
app.get('/location', (request, response) => {
    const locationData = require('./data/location.json');
    const city = request.query.city;
    let location;
    locationData.forEach(locationData => {
        location = new Location(city, locationData);
    });
    response.json(location);
});
app.get('/weather', (request, response)=>{
    const weatherData = require('./data/weather.json');
    let weather = [];
    weatherData.data.forEach(element => {
        let info=element.weather.description;
        let time=element.datetime;
        weather.push(new Weather(info,time));
    });
    response.json(weather);
});
app.use('*', (request, resp) => {
  resp.status(404).send('Not found');
});
app.listen(PORT, () => console.log(`App is listening on port ${PORT}`));
