
token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImZvbyIsInBhc3N3b3JkIjoiYmFoIiwiaWF0IjoxNDk5OTgzNDA5LCJleHAiOjE1MzE1MjM0MDl9.Ca9lm4etzohrzMLwpvA5Krx-CSme-500g9sssVpES6A


GET /api/v1/fuels

GET /api/v1/stations/fuels/:fuel_type_code
    /api/v1/stations/fuels/ELEC

GET /api/v1/stations

GET /api/v1/stations/:station_code
    /api/v1/stations/63965

POST /api/v1/stations

let exampleBodyStations = {
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


POST /api/v1/fuels

let exampleBodyFuels = {
	"fuel_type_code": "LM",
	"count": 0,
	"fuel_type": "liquid magma"
}

PATCH /api/v1/fuels/:fuel_type_code/count/:count
      /api/v1/fuels/HY/count/23

PATCH /api/v1/stations/:station_code/latitude/:new_lat
      /api/v1/stations/62740/latitude/-44.4444

DELETE  /api/v1/stations/:station_code
        /api/v1/stations/63965
//no feedback, update code 204?

DELETE  /api/v1/stations/fuels/:fuel_type_code
        /api/v1/stations/fuels/CNG
//no feedback, update code 204?
