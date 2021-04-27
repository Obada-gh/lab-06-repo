'use strict';

//to run the server
//1- npm start
//2- node server.js
//3- nodemon

//Application Depandancies
const express = require('express');
require('dotenv').config();
const cors = require('cors');
const superagent = require('superagent');

//Application Setup
const server = express();
const PORT = process.env.PORT || 5000;
server.use(cors()); //open for any request from any client

//Routes
server.get('/location',locationHandelr);
server.get('/weather', weatherHandler);
server.get('*',generalHandler);

//Routes Handlers
//http://localhost:3000/location?city=amman
function locationHandelr(req,res)
{
  // need the get the location data from locatioIQ API server
  // send a request using superagent library to locationIQ
  // console.log(req.query); //{ city: 'amman' }
  let cityName = req.query.city;
  // console.log(cityName);
  let key = process.env.LOCATION_KEY;
  let locURL = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${cityName}&format=json`;
  // console.log('before superagent');
  superagent.get(locURL) //send a request locatioIQ API
    .then(geoData=>{
      // console.log(geoData.body);
      let gData = geoData.body;
      let locationData = new Location(cityName,gData);
      res.send(locationData);
      // console.log('inside superagent');
    })
  // console.log('after superagent');
    .catch(error=>{
      console.log(error);
      res.send(error);
    });
}

function weatherHandler(req,res){
  // let getData = require('./data/weather.json');
  let cityName = req.query.city;
  let key = process.env.WEATHER_KEY;
  let weaURL = `http://api.weatherbit.io/v2.0/forecast/daily?key=${key}&city=${cityName}&days=5`;
  superagent.get(weaURL) //send a request locatioIQ API
    .then(geoData=>{
      console.log(geoData);
      let gData = geoData.body.data;
      // let newArr=[];
      // gData.data.forEach(element => {
      //   let WeathersData = new Weathers(element);
      //   newArr.push(WeathersData);

      // });
      // res.send(newArr);
      let weaData = gData.map((element)=>{
        return new Weathers(element);

      });
      res.send(weaData);
    // console.log('inside superagent');
    })
  // console.log('after superagent');
    .catch(error=>{

      res.send(error);
    });


}

function generalHandler(req,res){
  let errObj = {
    status: 404,
    resText: 'sorry! this page not found'
  };
  res.status(404).send(errObj);
}

//constructors
function Location(cityName,locData){
  this.search_query = cityName;
  this.formatted_query = locData[0].display_name;
  this.latitude = locData[0].lat;
  this.longitude = locData[0].lon;
}

function Weathers (weatherData)
{
  this.forecast = weatherData.weather.description;
  this.time = weatherData.valid_date;
}

server.listen(PORT,()=>{
  console.log(`listening on port ${PORT}`);
});


// key = pk.f0bc8641e2c37a790cc832f1ab9dde9f
// url = GET https://us1.locationiq.com/v1/search.php?key=YOUR_ACCESS_TOKEN&q=SEARCH_STRING&format=json
