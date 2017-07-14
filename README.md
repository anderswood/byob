## Resources
[NREL data source](https://developer.nrel.gov/docs/transportation/alt-fuel-stations-v1/all/): alternative fuel stations for the state of Maine.
[NREL data API](https://developer.nrel.gov/api/alt-fuel-stations/v1.json?<api_key>&state=ME)
[Live App on Heroku](https://byob-notbeer.herokuapp.com/)

## API Authorization
 **token: (expires 7/13/18)** eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImZvbyIsInBhc3N3b3JkIjoiYmFoIiwiaWF0IjoxNDk5OTgzNDA5LCJleHAiOjE1MzE1MjM0MDl9.Ca9lm4etzohrzMLwpvA5Krx-CSme-500g9sssVpES6A

## API End Points
### GET
GET **/api/v1/fuels**
* Retrieves all records from the 'fuel_types' table


GET **/api/v1/stations/fuels/:fuel_type_code**
* Retrieves all records matching the supplied fuel_type_code
* Example: `/api/v1/stations/fuels/ELEC`
* Parameters: `:fuel_type_code` - type <string> that correlates to fuel, e.g. `E85` for ethanol, code found in dataset
* Fuel code legend:
```
BD: 'Biodiesel (B20 and above)',
CNG: 'Compressed Natural Gas',
E85: 'Ethanol (E85)',
ELEC: 'Electric',
HY: 'Hydrogen',
LNG: 'Liquefied Natural Gas',
LPG: 'Liquefied Petroleum Gas (Propane)'
```

GET **/api/v1/stations**
* Retrieves all records from the 'fuel_stations' table

GET **/api/v1/stations/:station_code**
* Retrieves all records matching the supplied station_code
* Example: `/api/v1/stations/63965`
* Parameters: `:station_code` - type <integer> that correlates to a station, code found in dataset

### POST
POST **/api/v1/stations**
* Post a new station entry to the fuel_stations table
* Example JSON for stations body:
```
{
  "fuel_type_code": "CNG",
  "station_code": 4485,
  "station_name": "Bee Nissan of Auburn",
  "zip": "04210",
  "state": "ME",
  "city": "Auburn",
  "street_address": "793 Center St",
  "latitude": "44.129233",
  "longitude": "-70.22363",
  "geocode_status": "200-8"
}
```

POST **/api/v1/fuels**
* Post a new fuels entry to the fuel_types table
* Example JSON for fuels body:
```
{
	"fuel_type_code": "LM",
	"count": 0,
	"fuel_type": "liquid magma"
}
```

### PATCH
PATCH **/api/v1/fuels/:fuel_type_code/count/:count**
* Update the record count entry in the fuel_types table
* Example: `/api/v1/fuels/HY/count/23`
* Parameters: `:fuel_type_code` - type <string> that correlates to fuel, e.g. `E85` for ethanol, code found in dataset
* Parameters: `:count` - type <integer> that correlates to quantity of stations in the fuel_stations table that provide this fuel, e.g. `3`

PATCH **/api/v1/stations/:station_code/latitude/:new_lat**
* Update the latitude for a given station_code
* Example: `/api/v1/stations/62740/latitude/-44.4444`
* Parameters: `:station_code` - type <integer> that correlates to a station, code found in dataset
* Parameters: `:new_lat` - type <string>, new latitude value for the specified station


### DELETE
DELETE  **/api/v1/stations/:station_code**
* Delete the specified station from the fuel_stations table
* Example: `/api/v1/stations/63965`
* Parameters: `:station_code` - type <integer> that correlates to a station, code found in dataset

DELETE  **/api/v1/stations/fuels/:fuel_type_code**
* Delete all stations from the fuel_stations table that have the specified fuel type code
* Example: `/api/v1/stations/fuels/CNG`
* Parameters: `:fuel_type_code` - type <string> that correlates to fuel, e.g. `E85` for ethanol, code found in dataset
