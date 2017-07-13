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

// GET /api/v1/fuels/:fuel_type_code
app.get('/api/v1/stations/fuels/:fuel_type_code', (req, res) => {
  database('fuel_types').where('fuel_type_code', req.params.fuel_type_code).select()
  .then( fuel => {
    if(fuel.length) {
      database('fuel_stations').where('fuel_type_id', fuel[0].id).select()
      .then( stations => {
        if(stations.length) {
          res.status(200).json(stations);
        } else {
          res.status(404).json({
            error: `Could not locate stations with fuel_type_code ${req.params.fuel_type_code}`
          });
        };
      });
    } else {
      res.status(404).json({
        error: `Could not locate fuel id with fuel_type_code ${req.params.fuel_type_code}`
      });
    };
  })
  .catch( error => {
    res.status(500).json({ error })
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
app.get('/api/v1/stations/:station_code', (req, res) => {
  database('fuel_stations').where('station_code', req.params.station_code).select()
  .then( station => {
    if (station.length) {
      res.status(200).json(station);
    } else {
      res.status(404).json({
        error: `Could not locate station with id ${req.params.station_code}`
      });
    };
  })
  .catch( error => {
    res.status(500).json({ error })
  });
});

// GET /api/v1/stations/:fuel


// GET /api/v1/stations/:zip

// 2 POST
// POST /api/v1/stations
app.post('/api/v1/stations', (req, res) => {
  for (let requiredParam of ['station_code', 'station_name', 'zip', 'state', 'city', 'street_address', 'latitude', 'longitude', 'geocode_status','fuel_type_code']) {
    if (!req.body[requiredParam]) {
      return res.status(422).json({
        error: `Expected format:
        {
          station_code: <integer>,
          station_name: <string>,
          zip: <integer>,
          state: <string>,
          city: <string>,
          street_address: <string>,
          latitude: <string>,
          longitude: <string>,
          geocode_status: <string>,
          fuel_type_code: <string>
        }
        You are missing a ${requiredParam} property.`
      });
    };
  };

  database('fuel_types').where('fuel_type_code', req.body.fuel_type_code).select()
  .then( fuel => {
    if(fuel.length) {
      req.body.fuel_type_id = fuel[0].id;
      delete req.body.fuel_type_code;
      database('fuel_stations').insert(req.body, 'id')
      .then( stationId => {
        res.status(201).json({ id: stationId[0]});
      })
      .catch( error => {
        res.status(500).json({ error });
      })
    } else {
      res.status(404).json({
        error: `Could not locate fuel id with fuel_type_code ${req.body.fuel_type_code}`
      });
    };
  })
  .catch( error => {
    res.status(500).json({ error });
  });

});

// POST /api/v1/fuel
app.post('/api/v1/fuels', (req, res) => {
  for (let requiredParam of ['fuel_type_code', 'fuel_type']) {
    if (!req.body[requiredParam]) {
      return res.status(422).json({
        error: `Expected format: { fuel_type_code: <string>, fuel_type: <string>, count: <integer> } You are missing a ${requiredParam} property.`
      });
    };
  };

  database('fuel_types').insert(req.body, 'id')
  .then(fuel => {
    res.status(201).json({ id: fuel[0] });
  })
  .catch(error => {
    res.status(500).json({ error });
  });
});

// 2 PUT/PATCH
// PUT /api/v1/fuels/count
app.patch('/api/v1/fuels/:fuel_type_code/:count', (req, res) => {
  let fuelTypeCode = req.params.fuel_type_code;
  let count = req.params.count;
  database('fuel_types').where('fuel_type_code', fuelTypeCode).update('count', count)
  .then(qtyItemsPatched => {
    res.status(201).json({ response: `Count successfully updated for ${fuelTypeCode}`});
  })
  .catch( error => {
    res.status(500).json({ error })
  });
});


// PATCH /api/v1/

// 2 DELETE
// DELETE /api/v1/stations
app.delete('/api/v1/stations/:station_code', (req, res) => {
  database('fuel_stations').where('station_code', req.params.station_code).del()
  .then( qtyRowDel => {
    if (qtyRowDel === 1) {
      res.status(204).json({rowsDel: qtyRowDel});
    } else {
      res.status(404).json({
        error: `Could not locate station with code ${req.params.station_code}`
      });
    };
  })
  .catch( error => {
    res.status(500).json({ error })
  });

})

// DELETE /api/v1/fuel


if (!module.parent) {
  app.listen(app.get('port'), () => {
    console.log(`server is running on port ${app.get('port')}`);
  })
}

module.exports = app;
