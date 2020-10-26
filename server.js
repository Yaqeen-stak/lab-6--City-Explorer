'use strict';
// Constructor
function Location(city, locationData) {
    this.search_query = city;
    this.formated_query = locationData.display_name;
    this.latitude = locationData.lat;
    this.longitude = locationData.lon;
}
function Weather(info,time) {
    // this.data = weatherData.city_name;
    // this.city_name = weatherData.data.location.city;
    // this.timezone=weatherData.timezone;
    this.foreCast=info;
    this.time=time;
}
// Defining Application Dependencies
const express = require('express');
const superagent = require('superagent');
const cors = require('cors');
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const GEOIQ=process.env.GEOIQ;
const app = express();
app.use(cors());
// Routes
app.get('/', welcomePage);
app.get('/location',locationData);
app.get('/weather',weatherData);
app.use('*', notFound);

function handlErrors (response){
    if (response.status=== 500){
    resp.status(500).send('Sorry, something went wrong');
    }
}
  
 
// Helpers 
function welcomePage(reqeust, response) {
    response.status(200).send('Home Page Welcome to express');
};

function locationData (request, response) {
    // const locationData = require('./data/location.json');
    const city = request.query.city;
    const url= `https://eu1.locationiq.com/v1/search.php?key=${GEOIQ}&q=${city}&format=json`;
    superagent.get(url).then(locationData =>{
        let location= new Location(city, locationData.body);
        response.json(location);
          handlErrors(response);
    }).catch(console.error); 
}
function weatherData (request, response){
    const weatherData = require('./data/weather.json');
    let weather = [];
    weatherData.data.forEach(element => {
        let info=element.weather.description;
        let time=element.datetime;
        weather.push(new Weather(info,time));
    });
    response.json(weather);
    handlErrors(response);
};

function notFound(request, resp) {
    resp.status(404).send('Not found');
  };

  app.listen(PORT, () => console.log(`App is listening on port ${PORT}`));
