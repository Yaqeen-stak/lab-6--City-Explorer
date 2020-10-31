
'use strict';
// Constructor
function Location(city, locationData) {
    this.search_query = city;
    this.formated_query = locationData[0].display_name;
    this.latitude = locationData[0].lat;
    this.longitude = locationData[0].lon;

}
function Weather(weatherData) {

    this.forecast = weatherData.weather.description;
    this.time = weatherData.datetime;
    this.foreCast = weatherData.weather.description;
    this.time = weatherData.datetime;


}
function Movies(moviesData){
    this.title=moviesData.title;
    this.overview=moviesData.overview;
    this.average_votes=moviesData.average_votes;
    this.total_votes=moviesData.total_votes;
    this.image_url='https://image.tmdb.org/t/p/w500/${moviesData.poster_path}';
    this.popularity=moviesData.popularity;
    this.released_on=moviesData.released_on
}
function Yelp(yelpData){
    this.name=yelpData.name;
    this.image_url=yelpData.image_url;
    this.price=yelpData.price;
    this.rating=yelpData.rating;
    this.url=yelpData.url;
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
const superagent = require('superagent');
const cors = require('cors');
const pg = require('pg');
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL;
const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const TRAIL_API_KEY = process.env.TRAIL_API_KEY;
const MOVIE_API_KEY =process.env.MOVIE_API_KEY;
const YELP_API_KEY=process.env.YELP_API_KEY;

const client = new pg.Client(DATABASE_URL);
console.log(DATABASE_URL)

const app = express();
app.use(cors());
// Routes
app.get('/', welcomePage);
app.get('/location', getLocation);
app.get('/weather', getWeather);
app.get('/trails', getTrails);


// app.get('/get-locations', (req, res) => {
//     const location = 'SELECT * FROM location ;';
//     client.query(location).then(result => {
//         res.status(200).json(result.rows);
//     });
// });
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
    const location = 'SELECT * FROM location WHERE search_query=$1;';
    const safvar = [city];
    client.query(location,safvar).then(result => {
        if (!(result.rowCount === 0)) {
            response.status(200).json(result.rows[0]);
        } else {
            const url = `https://eu1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${city}&format=json`;
            let location;
            superagent.get(url).then(locationData => {
                location = (new Location(city, locationData.body));
                // response.json(location);
                const newValues = 'INSERT INTO location (search_query,display_name,lat,lon) VALUES($1,$2,$3,$4);';
                const saveValues = [location.search_query, location.formated_query, location.latitude, location.longitude];
                //response.json(location);
                client.query(newValues, saveValues).then(data => {
                    response.status(200).json(location);
                })
                

            }).catch(()=> response.status(404).send('not found'));
        }
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
function getMovies(request,response) {
    const city=request.query.search_query;
   
    const url =`https://api.themoviedb.org/3/movie/550?api_key=${MOVIE_API_KEY}`
    let moviesArray=[];
    superagent.get(url).then(moviesData=>{
        moviesData.body.movies((data=>{
         moviesArray.push(new Movies(data));   
        }))
        response.json(moviesArray)
    }).catch(()=>{
        response.status(500).send('Movies Error');
    })
}
function getYelp(request,response){
    const city=request.query.search_query;
    const latitude = request.query.latitude;
    const longitude = request.query.longitude;  
    const url =' https://api.yelp.com/v3/businesses/search'
    const page=request.query.page;
    let offset=5*(page-1);
    const queryParams={
        location:region,
        latitude:latitude,
        longitude:longitude,
        api_key:YELP_API_KEY,
        offset:offset,
        limit:5,
    };
    let yelpArray=[];
    superagent.get(url).query(queryParams).then(data=>{
        yelpArray.body.yelp((data=>{
            yelpArray.push(new Yelp(data));
        }))
        response.json(yelpArray)
    }).catch(()=>{
        response.status(500).send('Yelp Error');
 
    })
}
function getTrails(request, response) {
    const latitude = request.query.latitude;
    const longitude = request.query.longitude;
    const url = `https://www.hikingproject.com/data/get-trails?lat=${latitude}&lon=${longitude}&key=${TRAIL_API_KEY}`;
    let trailsArray = [];
    superagent.get(url).then(trailsData => {
        trailsData.body.trails.map((data => {
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

client.connect().then(() => {
    app.listen(PORT, () => console.log(`Listening to port ${PORT}`));
}).catch(error => {
    console.log('error', error)
});
