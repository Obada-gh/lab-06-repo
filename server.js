'use strict';

const express = require('express');
require('dotenv').config();

const cors = require('cors');

const server = express();

const PORT = process.env.PORT || 4000;
server.use(express.static('.server.js'));
server.use(cors());

// server.get('/data',(req,res)=>{
//   res.status(200).send('Hi from the data page, I am the server !!!');
// });

server.get('/location',(req,res)=>{
  let locationData = require('./data/location.json');

  let locationRes = new Location(locationData);
  console.log(locationRes);

  res.send(locationRes);

});

function Location(locData){
  this.search_query = 'Lynnwood';
  this.formatted_query = locData[0].display_name;
  this.latitude = locData[0].lat;
  this.longitude = locData[0].lon;
}

server.get('*',(req,res)=>{
  let errObj = {
    status: 500,
    resText: 'sorry! wrong page :)'
  };
  res.status(404).send(errObj);
});

server.listen(PORT,()=>{
  console.log(`listening on port ${PORT}`);
});

// server.get('./weather',(req,res)=>{

//   let weatherData = require('./data/location.json');
//   let weatherRes = new Weather(weatherData);
//   console.log(weatherRes);
// });

server.get('/weather',(req,res)=>{
  let weatherData = require('./data/weather.json').data;
  let weatherArr = [];
  weatherData.forEach((element)=>{

    let weatherRes = new Weather(element);
    weatherArr.push(weatherRes);

  });
  res.send(weatherArr);
  console.log(weatherArr);

});


function Weather(weaData){
  this.forecast= weaData.weather.description;
  this.time= stringtData(weaData.datetime);
}

function stringtData(date){
  let dateString = new Date(date);
  // dateString = date.toDateString();
  return dateString;
}
