'use strict';

//Application set
const express = require('express');
require('dotenv').config();
const cors = require('cors');
const pg = require('pg');
const superagent = require('superagent');
const server = express();
server.use(cors());
const PORT = process.env.PORT || 3000;
const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });




// ROUTES
server.get('/location',locationHandelr);
server.get('/weather', weatherHandler);
server.get('/parks', parksHandler);
server.get('/get',getloc);
server.get('*',generalHandler);

//sql functions
function addloc(loc){
  let search_query = loc.search_query;
  let formatted_query = loc.formatted_query;
  let lat = loc.latitude;
  let lon = loc.longitude;
  let sql = 'INSERT INTO people (search_query,formatted_query,latitude,longitude) VALUES ($1,$2,$3,$4) RETURNING *;';
  let values = [search_query,formatted_query,lat,lon];
  client.query(sql,values);
}

function getloc(req,res){
  let sql = 'SELECT * FORM locations;';
  client.query(sql).then(info => {
    res.send(info.rows);
  }).catch(error=>{
    res.send(error);
  });
}


// Routes Handlers
function locationHandelr(req,res){
  let cityName = req.query.city;
  let sql = `SELECT * FROM locations WHERE search_query=$1 ;`;
  let val = [cityName];
  client.query(sql,val).then(info => {
    if (info.rows.length !==0){
      res.send(info.rows[0]);
    }else{

      let key = process.env.LOCATION_KEY;
      let locURL = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${cityName}&format=json`;
      superagent.get(locURL)
        .then(geoData=>{
          let gData = geoData.body;
          let locationData = new Location(cityName,gData);
          addloc(locationData);
          res.send(locationData);
        })
        .catch(error=>{
          console.log(error);
          res.send(error);
        });
    }
  }).catch(error=>{
    res.send(error);
  });

}

function weatherHandler(req,res){
  let latName = req.query.latitude;
  let lonName = req.query.longitude;
  let key = process.env.WEATHER_KEY;
  let weaURL = `http://api.weatherbit.io/v2.0/forecast/daily?key=${key}&lat=${latName}&lon=${lonName}&days=5`;
  superagent.get(weaURL)
    .then(geoData=>{
      let gData = geoData.body.data;
      let weaData = gData.map((element)=>{
        return new Weathers(element);
      });
      res.send(weaData);
    })
    .catch(error=>{
      res.send(error);
    });

}

function parksHandler(req,res){
  let cityName = req.query.search_query;
  console.log(req.query);
  let key = process.env.PARKS_KEY;
  let parksUrl = `https://developer.nps.gov/api/v1/parks?q=${cityName}&api_key=${key}`;

  superagent.get(parksUrl).then(p=>{
    console.log(p.body);
    let parksData=p.body.data;
    let parkRus = parksData.map((element)=>
    {
      return new ParkCons(element);
    });
    console.log(parkRus);
    res.send(parkRus);
  }).catch(error=>{
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

function ParkCons(cityAdd){
  this.name=cityAdd.fullName;
  this.address=cityAdd.address;
  this.fee='0';
  this.des=cityAdd.description;
  this.url=cityAdd.url;
}

server.listen(PORT,()=>{
  console.log(`listening on port ${PORT}`);
});

//demo help:

// app.get('/test', testHandler);
// app.get('/add', addDataHandler);
// app.get('/people',getDataHandler);
// app.get('*', notFoundHandler); //Error Handler

//localhost:3010/add?first_name=roaa&last_name=AbuAleeqa
// function addDataHandler(req,res){
//   console.log(req.query);
//   let firstName = req.query.first_name;
//   let lastName = req.query.last_name;
//   //safe values
//   let SQL = `INSERT INTO people (first_name,last_name) VALUES ($1,$2) RETURNING *;`;
//   let safeValues = [firstName,lastName];
//   client.query(SQL,safeValues)
//     .then(result=>{
//       res.send(result.rows);
//     })
//     .catch(error=>{
//       res.send(error);
//     });
// }

// //localhost:3010/people
// function getDataHandler(req,res){
//   let SQL = `SELECT * FROM people;`;
//   client.query(SQL)
//     .then(result=>{
//       res.send(result.rows);
//     })
//     .catch(error=>{
//       res.send(error);
//     });
// }

// client.connect()
//   .then(() => {
//     app.listen(PORT, () =>
//       console.log(`listening on ${PORT}`)
//     );

//   });
