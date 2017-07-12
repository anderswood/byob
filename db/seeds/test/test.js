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

const processStationData = Data => {
  let fuelDataProcessed = [{
    fuel_type_code:
    fuel_type:
    count:
    stations: []
  },




  ];
  //
  // fuelsArr.forEach((fuel, i) => {
  //   fuelDataProcessed.push({
  //     fuel_type_code: fuel,
  //     fuel_type: fuelCodeLegend[fuel],
  //     count: stationData.station_counts.fuels[fuel].total,
  //     stations: []
  //   })
  //
  //   stationData.fuel_stations.forEach( station => {
  //     if(station.fuel_type_code === fuel) {
  //       fuelDataProcessed[i].stations.push(station);
  //     };
  //   });
  //
  // });

  return fuelDataProcessed;
};

const createFuelType = (knex, fuel) => {
  return knex('fuel_types').insert({
    fuel_type_code: fuel.fuel_type_code,
    fuel_type: fuel.fuel_type,
    count: fuel.count,
  }, 'id')
  .then(fuelTypesId => {
    let fuelStationPromises = [];

    fuel.stations.forEach( (station, i) => {
      if (i > 4) { return }; // seed only up to 4 stations per fuel for testing
      fuelStationPromises.push(
        createFuelStation(knex, {
          station_code: station.id,
          fuel_type_code: station.fuel_type_code,
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
