process.env.NODE_ENV = 'testing';

const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
const server = require('../server.js');

const environment = process.env.NODE_ENV || 'development';
const configuration = require('../knexfile')[environment];
const database = require('knex')(configuration);


chai.use(chaiHttp);

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
        const sortedBody = res.body.sort((a, b) => a.id - b.id);

        res.should.have.status(200);
        res.should.be.json;
        sortedBody[0].should.have.property('id');
        sortedBody[0].should.have.property('fuel_type_code');
        sortedBody[0].should.have.property('fuel_type');
        sortedBody[0].should.have.property('count');
        sortedBody[0].fuel_type_code.should.equal('E85');
        sortedBody[0].fuel_type.should.equal('Ethanol (E85)');
        sortedBody[0].count.should.equal(1);
        done();
      });
    });

    it('should return a 404 if directed to a non existent endpoint', () => {
      chai.request(server)
      .get('/api/v1/foobah')
      .end((err, res) => {
        res.should.have.status(404);
        done()
      });
    });

  });

  describe('GET /api/v1/stations', () => {
    it('should return all the stations', done => {
      chai.request(server)
      .get('/api/v1/stations')
      .end((err, res) => {
        const sortedBody = res.body.sort((a, b) => a.id - b.id);

        sortedBody[0].should.have.property('id');
        sortedBody[0].should.have.property('fuel_type_id');
        sortedBody[0].should.have.property('station_code');
        sortedBody[0].should.have.property('station_name');
        sortedBody[0].should.have.property('zip');
        sortedBody[0].should.have.property('state');
        sortedBody[0].should.have.property('city');
        sortedBody[0].should.have.property('street_address');
        sortedBody[0].should.have.property('latitude');
        sortedBody[0].should.have.property('longitude');
        sortedBody[0].should.have.property('geocode_status');
        sortedBody[0].station_code.should.equal(41733);
        sortedBody[0].station_name.should.equal('Veterans Affairs - Maine Healthcare System - Togus');
        sortedBody[0].zip.should.equal();
        sortedBody[0].state.should.equal(41733);
        sortedBody[0].city.should.equal(41733);
        sortedBody[0].street_address.should.equal(41733);
        sortedBody[0].latitude.should.equal(41733);
        sortedBody[0].longitude.should.equal(41733);
        sortedBody[0].geocode_status.should.equal(41733);
        console.log(sortedBody);
        res.should.have.status(200);
        res.should.be.json;
        done();
      });
    });
  });


});
