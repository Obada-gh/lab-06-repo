'use strict';

const express = require('express');
require('dotenv').config();

const cors = require('cors');

const server = express();

const PORT = process.env.PORT || 4000;

server.use(cors());



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

server.get('/weather',(req,res)=>{
  let weatherData = require('./data/weather.json');
  let weatherArr = [];
  weatherData.data.forEach((element)=>{

    let weatherRes = new Weather(element.weather.description,element.valid_date);
    weatherArr.push(weatherRes);

  });
  res.send(weatherArr);
  console.log(weatherArr);

});


function Weather(description,time){
  this.forecast= description;
  this.time= time;
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

// function stringtData(date){
//   let dateString = new Date(date);
//   // dateString = date.toDateString();
//   return dateString;
// } mapy will use
