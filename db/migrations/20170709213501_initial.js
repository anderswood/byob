
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('fuel_types', table => {
      table.increments('id').primary();
      table.string('fuel_type_code');
      table.string('fuel_type');
      table.integer('count');
      table.timestamps(true, true);
    }),
    knex.schema.createTable('fuel_stations', table => {
      table.increments('id').primary();
      table.integer('fuel_type_id').unsigned();
      table.foreign('fuel_type_id').references('fuel_types.id');
      table.integer('station_code');
      table.string('fuel_type_code');
      table.string('station_name');
      table.string('zip');
      table.string('state');
      table.string('city');
      table.string('street_address');
      table.string('latitude');
      table.string('longitude');
      table.string('geocode_status');
      table.timestamps(true, true);
    })
  ]);

};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('fuel_stations'),
    knex.schema.dropTable('fuel_types')
  ]);

};
