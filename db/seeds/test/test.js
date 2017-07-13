// api docs: https://developer.nrel.gov/docs/transportation/alt-fuel-stations-v1/all/
// api url: https://developer.nrel.gov/api/alt-fuel-stations/v1.json?api_key=k1onvU04gZwHtHoFt5FkecebH1URhP2aTxaBgez4&state=ME
const stationData = require('../ME-list.json');

const fuelsArr = Object.keys(stationData.station_counts.fuels);
const fuelCodeLegend = {
  BD: 'Biodiesel (B20 and above)',
  CNG: 'Compressed Natural Gas',
  E85: 'Ethanol (E85)',
  ELEC: 'Electric',
  HY: 'Hydrogen',
  LNG: 'Liquefied Natural Gas',
  LPG: 'Liquefied Petroleum Gas (Propane)'
}

const E85Station = {
  id: 1,
  station_code: 41733,
  station_name: "Veterans Affairs - Maine Healthcare System - Togus",
  zip: '04330',
  state: 'ME',
  city: "Augusta",
  street_address: "1 VA Center",
  latitude: '44.296869',
  longitude: '-69.724097',
  geocode_status: "GPS"
};
const ElecStation1 = {
  id: 2,
  station_code: 44280,
  station_name: "Lee Nissan of Auburn",
  zip: '04210',
  state: 'ME',
  city: "Auburn",
  street_address: "793 Center St",
  latitude: '44.129233',
  longitude: '-70.22363',
  geocode_status: "200-8"
};
const ElecStation2 = {
  id: 3,
  station_code: 48404,
  station_name: "ReVision Energy",
  zip: '04103',
  state: 'ME',
  city: "Portland",
  street_address: "142 Presumpscot St",
  latitude: '43.686832',
  longitude: '-70.260117',
  geocode_status: "GPS"
};
const BDStation = {
  id: 4,
  station_code: 48463,
  station_name: "Acadia National Park - Bar Harbor Fuel System",
  zip: '04609',
  state: 'ME',
  city: "Bar Harbor",
  street_address: "Rt 233 McFarland Hill",
  latitude: '44.398072',
  longitude: '-68.283333',
  geocode_status: "GPS"
};
const CNGStation = {
  id: 5,
  station_code: 61679,
  station_name: "Bangor Natural Gas ",
  zip: '04401',
  state: 'ME',
  city: "Bangor",
  street_address: "498 Maine Ave",
  latitude: '44.8094139',
  longitude: '-68.8046418',
  geocode_status: "200-8"
};
const LPGStation1 = {
  id: 6,
  station_code: 62740,
  station_name: "U-Haul",
  zip: '04101',
  state: 'ME',
  city: "Portland",
  street_address: "411 Marginal Way",
  latitude: '43.670522',
  longitude: '-70.257538',
  geocode_status: "200-8"
};
const LPGStation2 = {
  id: 7,
  station_code: 63965,
  station_name: "Bob's Cash Fuel Inc",
  zip: '04950',
  state: 'ME',
  city: "Madison",
  street_address: "424 Main St",
  latitude: '44.800429',
  longitude: '-69.853698',
  geocode_status: "GPS"
};

const processStationData = Data => {
  let fuelDataProcessed = [
    {
      id: 11,
      fuel_type_code: 'E85',
      fuel_type: 'Ethanol (E85)',
      count: 1,
      stations: [E85Station]
    },
    {
      id: 12,
      fuel_type_code: 'ELEC',
      fuel_type: 'Electric',
      count: 2,
      stations: [ElecStation1, ElecStation2]
    },
    {
      id: 13,
      fuel_type_code: 'HY',
      fuel_type: 'Hydrogen',
      count: 0,
      stations: []
    },
    {
      id: 14,
      fuel_type_code: 'LNG',
      fuel_type: 'Liquefied Natural Gas',
      count: 0,
      stations: []
    },
    {
      id: 15,
      fuel_type_code: 'BD',
      fuel_type: 'Biodiesel (B20 and above)',
      count: 1,
      stations: [BDStation]
    },
    {
      id: 16,
      fuel_type_code: 'CNG',
      fuel_type: 'Compressed Natural Gas',
      count: 1,
      stations: [CNGStation]
    },
    {
      id: 17,
      fuel_type_code: 'LPG',
      fuel_type: 'Liquefied Petroleum Gas (Propane)',
      count: 2,
      stations: [LPGStation1, LPGStation2]
    }
  ];

  return fuelDataProcessed;
};

const createFuelType = (knex, fuel) => {

  return knex('fuel_types').insert({
    id: fuel.id,
    fuel_type_code: fuel.fuel_type_code,
    fuel_type: fuel.fuel_type,
    count: fuel.count,
  }, 'id')
  .then(fuelTypesId => {
    let fuelStationPromises = [];

    fuel.stations.forEach( (station) => {
      fuelStationPromises.push(
        createFuelStation(knex, {
          id: station.id,
          station_code: station.station_code,
          station_name: station.station_name,
          zip: station.zip,
          state: station.state,
          city: station.city,
          street_address: station.street_address,
          latitude: station.latitude,
          longitude: station.longitude,
          geocode_status: station.geocode_status,
          fuel_type_id: fuelTypesId[0]
        })
      );
    });

    return Promise.all(fuelStationPromises);
  })

};

const createFuelStation = (knex, station) => {
  return knex('fuel_stations').insert(station);
};

exports.seed = (knex, Promise) => {
  let fuelDataProcessed = processStationData(stationData)

  return knex('fuel_stations').del()
  .then( () => knex('fuel_types').del())
  .then( () => {
    let fuelTypePromises = [];

    fuelDataProcessed.forEach(fuelType => {
      fuelTypePromises.push(createFuelType(knex, fuelType))
    });

    return Promise.all(fuelTypePromises);
  })
  .catch( error => console.log(`Error seeding data: ${error}`));

};
