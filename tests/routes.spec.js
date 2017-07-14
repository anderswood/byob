process.env.NODE_ENV = 'testing';

const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
const server = require('../server.js');

const environment = process.env.NODE_ENV || 'development';
const configuration = require('../knexfile')[environment];
const database = require('knex')(configuration);

chai.use(chaiHttp);

const jwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImZvbyIsInBhc3N3b3JkIjoiYmFoIiwiaWF0IjoxNDk5OTgzNDA5LCJleHAiOjE1MzE1MjM0MDl9.Ca9lm4etzohrzMLwpvA5Krx-CSme-500g9sssVpES6A';

describe('Client Routes', () => {

  it('should return a 404 for a route that doesn\'t exist', done => {
    chai.request(server)
    .get('/sad')
    .end((err, res) => {
      res.should.have.status(404);
      done();
    });
  });

});

describe('API Routes', () => {

  before( done => {
    database.migrate.latest()
    .then( () => {
      done();
    });
  });

  beforeEach( done => {
    database.seed.run()
    .then( ()=> {
      done();
    });
  });

  describe('GET /api/v1/fuels', () => {
    it('should return all the fuels', done => {
      chai.request(server)
      .get('/api/v1/fuels')
      .end((err, res) => {
        res.body.sort((a, b) => a.id - b.id);
        res.should.have.status(200);
        res.should.be.json;
        res.body[0].should.have.property('id');
        res.body[0].should.have.property('fuel_type_code');
        res.body[0].should.have.property('fuel_type');
        res.body[0].should.have.property('count');
        res.body[0].fuel_type_code.should.equal('E85');
        res.body[0].fuel_type.should.equal('Ethanol (E85)');
        res.body[0].count.should.equal(1);
        done();
      });
    });

    it('should return a 404 if directed to a non existent endpoint', done => {
      chai.request(server)
      .get('/api/v1/foobah')
      .end((err, res) => {
        res.should.have.status(404);
        done()
      });
    });

  });

  describe('GET /api/v1/stations/fuels/:fuel_type_code', () => {
    it('should return the list of stations associated with the fuel type code', done => {
      chai.request(server)
      .get('/api/v1/stations/fuels/ELEC')
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.body.length.should.equal(2);
        res.body.sort((a, b) => a.id - b.id);
        res.body[0].id.should.equal(2);
        res.body[0].zip.should.equal('04210');
        res.body[0].latitude.should.equal('44.129233');
        done();
      });
    });

    it('should return a 404 error if there are no stations associated with the fuel code', done => {
      chai.request(server)
      .get('/api/v1/stations/fuels/HY')
      .end((err, res) => {
        res.should.have.status(404);
        res.body.error.should.equal('Could not locate stations with fuel_type_code HY');
        done()
      });
    });

    it('should return a 404 error if the fuel type code does not exist', done => {
      chai.request(server)
      .get('/api/v1/stations/fuels/caffeine')
      .end((err, res) => {
        res.should.have.status(404);
        res.body.error.should.equal('Could not locate fuel id with fuel_type_code caffeine');
        done()
      });
    });

  });

  describe('GET /api/v1/stations', () => {
    it('should return all the stations', done => {
      chai.request(server)
      .get('/api/v1/stations')
      .end((err, res) => {
        res.body.sort((a, b) => a.id - b.id);
        res.body[0].should.have.property('id');
        res.body[0].should.have.property('fuel_type_id');
        res.body[0].should.have.property('station_code');
        res.body[0].should.have.property('station_name');
        res.body[0].should.have.property('zip');
        res.body[0].should.have.property('state');
        res.body[0].should.have.property('city');
        res.body[0].should.have.property('street_address');
        res.body[0].should.have.property('latitude');
        res.body[0].should.have.property('longitude');
        res.body[0].should.have.property('geocode_status');
        res.body[0].station_code.should.equal(41733);
        res.body[0].station_name.should.equal('Veterans Affairs - Maine Healthcare System - Togus');
        res.body[0].zip.should.equal('04330');
        res.body[0].state.should.equal('ME');
        res.body[0].city.should.equal('Augusta');
        res.body[0].street_address.should.equal('1 VA Center');
        res.body[0].latitude.should.equal('44.296869');
        res.body[0].longitude.should.equal('-69.724097');
        res.body[0].geocode_status.should.equal('GPS');
        res.should.have.status(200);
        res.should.be.json;
        done();
      });
    });

    it('should return all the stations with city Augusta for custom search', done => {
      chai.request(server)
      .get('/api/v1/stations/?city=Portland')
      .end((err, res) => {
        res.body.sort((a, b) => a.id - b.id);
        res.body.length.should.equal(2);
        res.body[0].station_code.should.equal(48404);
        res.body[0].station_name.should.equal('ReVision Energy');
        res.body[0].zip.should.equal('04103');
        res.should.have.status(200);
        res.should.be.json;
        done();
      });
    });

    it('should return error and 404 if custom search comes up empty', done => {
      chai.request(server)
      .get('/api/v1/stations/?city=Oz')
      .end((err, res) => {
        res.body.error.should.equal('No stations found corresponding to city Oz');
        res.should.have.status(404);
        res.should.be.json;
        done();
      });
    });

  });

  describe('GET /api/v1/stations/:station_code', () => {
    it('should return the stations record asociated with the station code', done => {
      chai.request(server)
      .get('/api/v1/stations/63965')
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.body.length.should.equal(1);
        res.body[0].should.have.property('street_address');
        res.body[0].should.have.property('latitude');
        res.body[0].should.have.property('longitude');
        res.body[0].street_address.should.equal('424 Main St');
        res.body[0].latitude.should.equal('44.800429');
        res.body[0].longitude.should.equal('-69.853698');
        done();
      });
    });

    it('should return a 404 error if the station code does not exist', done => {
      chai.request(server)
      .get('/api/v1/stations/100000')
      .end((err, res) => {
        res.should.have.status(404);
        res.body.error.should.equal('Could not locate station with id 100000')
        done();
      })
    })

  });

  describe('POST /api/v1/stations', () => {
    var reqBody = {
      id: 333,
      station_code: 12345,
      station_name: "Ron's Cash Fuel Inc",
      zip: '04950',
      state: 'ME',
      city: "Biddeford",
      street_address: "34 Main St",
      latitude: '54.800429',
      longitude: '-67.853698',
      geocode_status: "GPS",
      fuel_type_code: 'CNG',
      token: jwtToken
    }

    it('should create a new station', done => {
      chai.request(server)
      .post('/api/v1/stations')
      .send(reqBody)
      .end((err, res) => {
        res.should.have.status(201);
        res.should.be.json;
        res.body.should.have.property('id');
        res.body.id.should.equal(333)
        done();
      })
    })

    it('should not add a new station if missing a parameter', done => {
      delete reqBody.station_code
      chai.request(server)
      .post('/api/v1/stations')
      .send(reqBody)
      .end((err, res) => {
        res.should.have.status(422);
        done();
      });
    });

    it('should not add a new station if the fuel_type_code is invalid', done => {
      var reqBody2 = {
        id: 333,
        station_code: 12345,
        station_name: "Ron's Cash Fuel Inc",
        zip: '04950',
        state: 'ME',
        city: "Biddeford",
        street_address: "34 Main St",
        latitude: '54.800429',
        longitude: '-67.853698',
        geocode_status: "GPS",
        fuel_type_code: 'ZZ',
        token: jwtToken
      }

      chai.request(server)
      .post('/api/v1/stations')
      .send(reqBody2)
      .end((err, res) => {
        res.should.have.status(404)
        res.body.error.should.equal('Could not locate fuel id with fuel_type_code ZZ');
        done();
      });
    });

  });

  describe('POST /api/v1/fuels', () => {
    it('should create a new fuel', done => {
      chai.request(server)
      .post('/api/v1/fuels')
      .send({
        id: 18,
        fuel_type_code: 'LM',
        count: 0,
        fuel_type: 'liquid magma',
        token: jwtToken
      })
      .end((err, res) => {
        res.should.have.status(201);
        res.should.be.json;
        res.body.should.have.property('id');
        res.body.id.should.equal(18);
        done();
      });
    });

    it('should not add a new fuel if missing a parameter', done => {
      chai.request(server)
      .post('/api/v1/fuels')
      .send({
        id: 18,
        fuel_type_code: 'LM',
        count: 0,
        token: jwtToken
      })
      .end((err, res) => {
        res.should.have.status(422);
        res.body.error.should.equal('Expected format: { fuel_type_code: <string>, fuel_type: <string>, count: <integer> } You are missing a fuel_type property.')
        done();
      });
    });
  });

  describe('PATCH /api/v1/fuels/:fuel_type_code/count/:count', () => {
    it('should patch the station count to the fuel specified', done => {
      chai.request(server)
      .patch('/api/v1/fuels/HY/count/2')
      .send({token: jwtToken})
      .end((err, res) => {
        res.should.have.status(201);
        res.body.response.should.equal('Count successfully updated for HY');
        done();
      });
    });

    it('should not patch the station count to the fuel if the fuel_type_code is invalid', done => {
      chai.request(server)
      .patch('/api/v1/fuels/PLUT/count/3')
      .send({token: jwtToken})
      .end((err, res) => {
        res.should.have.status(404);
        res.body.error.should.equal('Could not locate fuel with fuel_type_code PLUT');
        done();
      });
    });

  });

  describe('PATCH /api/v1/stations/:station_code/latitude/:new_lat', () => {
    it('should patch the station latitude to the station specified', done => {
      chai.request(server)
      .patch('/api/v1/stations/61679/latitude/-33.3333')
      .send({token: jwtToken})
      .end((err, res) => {
        res.should.have.status(201);
        res.body.response.should.equal('Latitude successfully updated for station 61679');
        done();
      });
    });

    it('should not patch the station latitude if the station_code is invalid', done => {
      chai.request(server)
      .patch('/api/v1/stations/123/latitude/-33.3333')
      .send({token: jwtToken})
      .end((err, res) => {
        res.should.have.status(404);
        res.body.error.should.equal('Could not locate station with station_code 123');
        done();
      });
    });
  });

  describe('DELETE /api/v1/stations/:station_code', () => {
    it('should delete the station', done => {
      chai.request(server)
      .get('/api/v1/stations/48463')
      .end((err, res) => {
        res.should.have.status(200);
        chai.request(server)
        .delete('/api/v1/stations/48463')
        .send({token: jwtToken})
        .end((err, res) => {
          res.should.have.status(200);
          res.body.success.should.equal('Entry for station 48463 successfully deleted')
          chai.request(server)
          .get('/api/v1/stations/48463')
          .end((err, res) => {
            res.should.have.status(404);
            done();
          });
        });
      });
    });

    it('should not delete the station if the station code is invalid', done => {
      chai.request(server)
      .delete('/api/v1/stations/10000000')
      .send({token: jwtToken})
      .end((err, res) => {
        res.should.have.status(404);
        res.body.error.should.equal('Could not locate station with code 10000000');
        done();
      });
    });
  });

  describe('DELETE /api/v1/stations/fuels/:fuel_type_code', () => {
    it('should delete all stations associated with the provided fuel type code', done => {
      chai.request(server)
      .get('/api/v1/stations/fuels/ELEC')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.length.should.equal(2);
        chai.request(server)
        .delete('/api/v1/stations/fuels/ELEC')
        .send({token: jwtToken})
        .end((err, res) => {
          res.should.have.status(200);
          res.body.success.should.equal('Successfully deleted 2 stations(s) corresponding to the fuel_type_code ELEC')
          chai.request(server)
          .get('/api/v1/stations/fuels/ELEC')
          .end((err, res) => {
            res.should.have.status(404);
            done();
          });
        });
      });
    });

    it('should return 404 if there are no stations matching that fuel type', done => {
      chai.request(server)
      .delete('/api/v1/stations/fuels/LNG')
      .send({token: jwtToken})
      .end((err, res) => {
        res.should.have.status(404);
        res.body.error.should.equal('Could not locate any stations with fuel code LNG');
        done();
      });
    });

    it('should not delete the station if the fuel code is invalid', done => {
      chai.request(server)
      .delete('/api/v1/stations/fuels/Pluto')
      .send({token: jwtToken})
      .end((err, res) => {
        res.should.have.status(404);
        res.body.error.should.equal('Could not locate fuel with code Pluto');
        done();
      });
    });
  });

});
