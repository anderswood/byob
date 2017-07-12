const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

app.set('port', process.env.PORT || 3000);

app.use(express.static(`${__dirname}/`));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// 4 GET
// GET /api/v1/fuels
app.get('/api/v1/fuels', (req, res) => {
  database('fuel_types').select()
  .then( fuels => {
    if (fuels.length) {
      res.status(200).json(fuels);
    } else {
      res.status(404).json({
        error: 'No fuels were found'
      });
    };
  });
});

// GET /api/v1/stations
app.get('/api/v1/stations', (req, res) => {
  database('fuel_stations').select()
  .then( stations => {
    if(stations.length) {
      res.status(200).json(stations);
    } else {
      res.status(404).json({
        error: 'No stations found'
      });
    };
  });
});

// GET /api/v1/stations/:id

// GET /api/v1/stations/:fuel

// GET /api/v1/stations/:zip

// 2 POST
// POST /api/v1/station

// POST /api/v1/fuel

// 2 PUT/PATCH
// PUT /api/v1/fuels/count

// PATCH /api/v1/

// 2 DELETE
// DELETE /api/v1/station

// DELETE /api/v1/fuel


if (!module.parent) {
  app.listen(app.get('port'), () => {
    console.log(`server is running on port ${app.get('port')}`);
  })
}

module.exports = app;
