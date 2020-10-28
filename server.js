
'use strict';
// Constructor
function Location(city, locationData) {
    this.search_query = city;
    this.formated_query = locationData[0].display_name;
    this.latitude = locationData[0].lat;
    this.longitude = locationData[0].lon;

}
function Weather(weatherData) {

    this.forecast=weatherData.weather.description;
    this.time=weatherData.datetime;
   

    this.foreCast = weatherData.weather.description;
    this.time = weatherData.datetime;


}
function Trails(trailsData) {
    this.name = trailsData.name;
    this.location = trailsData.location;
    this.length = trailsData.length;
    this.stars = trailsData.stars;
    this.star_votes = trailsData.star_votes;
    this.summary = trailsData.summary;
    this.trail_url = trailsData.trail_url;
    this.conditions = trailsData.conditions;
    this.condition_date = trailsData.condition_date;
    this.condition_time = trailsData.condition_time;
}
// Defining Application Dependencies
const express = require('express');
const { request, response } = require('express');
const superagent = require('superagent');
const cors = require('cors');
const pg = require('pg');
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const DATABASE = process.env.DATABASE;
const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const TRAIL_API_KEY = process.env.TRAIL_API_KEY;

const client = new pg.Client(DATABASE);


const app = express();
app.use(cors());
// Routes
app.get('/', welcomePage);
app.get('/location', getLocation);
app.get('/weather', getWeather);
app.get('/trails', getTrails);
app.get('/add-location',getLocation);

app.get('/get-locations', (req, res) => {
    const location = 'SELECT * FROM location ;';
    client.query(location).then(result => {
        res.status(200).json(result.rows);
    });
});
app.use('*', notFound);
function handlErrors(response) {
    if (response.status === 500) {
        resp.status(500).send('Sorry, something went wrong');
    }
}


// Helpers 
function welcomePage(request, response) {
    response.status(200).send('Home Page Welcome to express');
};

function getLocation(request, response) {
    // const locationData = require('./data/location.json');
    const city = request.query.city;
    const url = `https://eu1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${city}&format=json`;
    let locationArr = [];
    superagent.get(url).then(locationData => {
        locationArr.push(new Location(city, locationData.body));
        // response.json(location);
        const newValues = 'INSERT INTO location (search_query,formated_query,latitude,longitude) VALUES($1,$2,$3,$4);';
        const saveValues = [locationArr[0].search_query, locationArr[0].formated_query, locationArr[0].latitude, locationArr[0].longitude];
        //response.json(location);
        client.query(newValues, saveValues).then(data => {
            response.status(200).json(data);
        });
        // .catch(console.error);

    });
}   

       

function getWeather(request, response) {
    // const weatherData = require('./data/weather.json');
    const city = request.query.search_query;
    const longitude = request.query.longitude;
    const latitude = request.query.latitude;
    const url = `https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&lat=${longitude}&lon=${latitude}&key=${WEATHER_API_KEY}`;
    let weatherArray = [];
    superagent.get(url).then(weatherData => {
        // let info=element.weather.description;
        // let time=element.datetime;
        weatherData.body.data.map((data => {
            weatherArray.push(new Weather(data))
        }))
        response.json(weatherArray);
        // handlErrors(response);
        // return (weather);

    
    })
    .catch(() => {
        response.status(500).send('Weather Error');
      })
}
function getTrails(request,response){
    const latitude=request.query.latitude;
    const longitude=request.query.longitude;
    const url=`https://www.hikingproject.com/data/get-trails?lat=${latitude}&lon=${longitude}&key=${TRAIL_API_KEY}`;
    let trailsArray=[];
    superagent.get(url).then(trailsData =>{
     trailsData.body.trails.map((data =>{
         console.log(data);
         trailsArray.push(new Trails(data));
     }))
     response.json(trailsArray)
    //  handlErrors(response);


    }).catch(() => {
            response.status(500).send('Weather Error');
        })
    }

function notFound(request, response) {
    response.status(404).send('Not found');
}

//   app.listen(PORT, () => console.log(`App is listening on port ${PORT}`));
client.connect().then(() => {
    app.listen(PORT, () => console.log(`Listening to port ${PORT}`));
}).catch(error => {
        console.log('error', error)
    });
