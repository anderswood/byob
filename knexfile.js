
module.exports = {

  development: {
    client: 'pg',
    connection: 'postgres://localhost/publications',
    useNullAsDefault: true,
    migrations: { directory: './db/migrations' },
    seeds: { directory: './db/seeds/dev' }
  }

};
