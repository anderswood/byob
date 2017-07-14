const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const jwt = require('jsonwebtoken');
// const dotenv = require('dotenv');
// const config = dotenv.config().parsed;

const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

app.use(express.static(`${__dirname}/`));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.set('port', process.env.PORT || 3000);


// /////////////////////////////
// ********* JWT ********* //
// /////////////////////////////

app.set('secretKey', process.env.CLIENT_SECRET);
if (!process.env.CLIENT_SECRET || !process.env.USERNAME || !process.env.PASSWORD) {
  throw 'Make sure you have a CLIENT_SECRET, USERNAME, and PASSWORD in your .env file'
}

app.post('/authenticate', (req, res) => {
  const user = req.body;

  if (user.username !== process.env.USERNAME || user.password !== process.env.PASSWORD) {
    res.status(403).send({
      success: false,
      message: 'Invalid Credentials'
    });
  } else {
    let token = jwt.sign(user, app.get('secretKey'), {
      expiresIn: 3.154e+7 // expires in 1 year
    });

    res.json({
      success: true,
      username: user.username,
      token
    });
  }

});

const checkAuth = (req, res, next) => {
  const token = req.body.token ||
                req.params.token ||
                req.headers['authorization'];

  if (token) {
    jwt.verify(token, app.get('secretKey'), (error, decoded) => {
      if (error) {
        return res.status(403).send({
          success: false,
          message: 'Invalid authorization token.'
        });
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    return res.status(403).send({
      success: false,
      message: 'You must be authorized to hit this endpoint'
    });
  }
};

///////////////////////////////
//********* ROUTES *********//
///////////////////////////////

app.get('/api/v1/fuels', (req, res) => {
  database('fuel_types').select()
  .then( fuels => {
    if (fuels.length) {
      res.status(200).json(fuels);
    } else {
      res.status(404).json({
        error: 'No fuels were found'
      });
    }
  });
});

app.get('/api/v1/stations/fuels/:fuel_type_code', (req, res) => {
  database('fuel_types').where('fuel_type_code', req.params.fuel_type_code).select()
  .then( fuel => {
    if (fuel.length) {
      database('fuel_stations').where('fuel_type_id', fuel[0].id).select()
      .then( stations => {
        if (stations.length) {
          res.status(200).json(stations);
        } else {
          res.status(404).json({
            error: `Could not locate stations with fuel_type_code ${req.params.fuel_type_code}`
          });
        }
      });
    } else {
      res.status(404).json({
        error: `Could not locate fuel id with fuel_type_code ${req.params.fuel_type_code}`
      });
    }
  })
  .catch( error => {
    res.status(500).json({ error })
  });
});

app.get('/api/v1/stations', (req, res) => {
  let prop = Object.keys(req.query)

  if (prop.length) {
    database('fuel_stations').where(prop[0], req.query[prop[0]]).select()
    .then( stations => {
      if (stations.length) {
        res.status(200).json(stations);
      } else {
        res.status(404).json({
          error: `No stations found corresponding to ${prop[0]} ${req.query[prop[0]]}`
        });
      }
    });
  } else {
    database('fuel_stations').select()
    .then( stations => {
      if (stations.length) {
        res.status(200).json(stations);
      } else {
        res.status(404).json({
          error: 'No stations found'
        });
      }
    });
  }
});

app.get('/api/v1/stations/:station_code', (req, res) => {
  database('fuel_stations').where('station_code', req.params.station_code).select()
  .then( station => {
    if (station.length) {
      res.status(200).json(station);
    } else {
      res.status(404).json({
        error: `Could not locate station with id ${req.params.station_code}`
      });
    }
  })
  .catch( error => {
    res.status(500).json({ error })
  });
});

app.post('/api/v1/stations', checkAuth, (req, res) => {
  for (let requiredParam of ['station_code', 'station_name', 'zip', 'state', 'city', 'street_address', 'latitude', 'longitude', 'geocode_status', 'fuel_type_code']) {
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
    }
  }

  delete req.body.token
  database('fuel_types').where('fuel_type_code', req.body.fuel_type_code).select()
  .then( fuel => {
    if (fuel.length) {
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
    }
  })
  .catch( error => {
    res.status(500).json({ error });
  });

});

app.post('/api/v1/fuels', checkAuth, (req, res) => {
  for (let requiredParam of ['fuel_type_code', 'fuel_type']) {
    if (!req.body[requiredParam]) {
      return res.status(422).json({
        error: `Expected format: { fuel_type_code: <string>, fuel_type: <string>, count: <integer> } You are missing a ${requiredParam} property.`
      });
    }
  }
  delete req.body.token
  database('fuel_types').insert(req.body, 'id')
  .then(fuel => {
    res.status(201).json({ id: fuel[0] });
  })
  .catch(error => {
    res.status(500).json({ error });
  });
});

app.patch('/api/v1/fuels/:fuel_type_code/count/:count', checkAuth, (req, res) => {
  database('fuel_types').where('fuel_type_code', req.params.fuel_type_code).select()
  .then( fuel => {
    if (!fuel.length) {
      return res.status(404).json({
        error: `Could not locate fuel with fuel_type_code ${req.params.fuel_type_code}`
      })
    } else {
      database('fuel_types').where('fuel_type_code', req.params.fuel_type_code).update('count', req.params.count)
      .then(qtyItemsPatched => {
        if (qtyItemsPatched) {
          res.status(201).json({ response: `Count successfully updated for ${req.params.fuel_type_code}`});
        } else {
          res.status()
        }
      });
    }
  })
  .catch( error => {
    res.status(500).json({ error });
  });
});

app.patch('/api/v1/stations/:station_code/latitude/:new_lat', checkAuth, (req, res) => {
  database('fuel_stations').where('station_code', req.params.station_code).select()
  .then( station => {
    if (!station.length) {
      return res.status(404).json({
        error: `Could not locate station with station_code ${req.params.station_code}`
      })
    } else {
      database('fuel_stations').where('station_code', req.params.station_code).update('latitude', req.params.new_lat)
      .then(qtyItemsPatched => {
        if (qtyItemsPatched) {
          res.status(201).json({ response: `Latitude successfully updated for station ${req.params.station_code}`});
        } else {
          res.status()
        }
      });
    }
  })
  .catch( error => {
    res.status(500).json({ error });
  });
});

app.delete('/api/v1/stations/:station_code', checkAuth, (req, res) => {
  database('fuel_stations').where('station_code', req.params.station_code).del()
  .then( qtyRowDel => {
    if (qtyRowDel) {
      res.status(200).json({success: `Entry for station ${req.params.station_code} successfully deleted`});
    } else {
      res.status(404).json({
        error: `Could not locate station with code ${req.params.station_code}`
      });
    }
  })
  .catch( error => {
    res.status(500).json({ error })
  });

})

app.delete('/api/v1/stations/fuels/:fuel_type_code', checkAuth, (req, res) => {
  database('fuel_types').where('fuel_type_code', req.params.fuel_type_code).select()
  .then( fuel => {
    if (fuel.length) {
      database('fuel_stations').where('fuel_type_id', fuel[0].id).del()
      .then( qtyRowDel => {
        if (qtyRowDel) {
          res.status(200).json({success: `Successfully deleted ${qtyRowDel} stations(s) corresponding to the fuel_type_code ${req.params.fuel_type_code}`});
        } else {
          res.status(404).json({
            error: `Could not locate any stations with fuel code ${req.params.fuel_type_code}`
          });
        }
      });
    } else {
      res.status(404).json({
        error: `Could not locate fuel with code ${req.params.fuel_type_code}`
      });
    }
  })
  .catch( error => {
    res.status(500).json({ error })
  });
})


if (!module.parent) {
  app.listen(app.get('port'), () => {
    console.log(`server is running on port ${app.get('port')}`);
  })
}

module.exports = app;
