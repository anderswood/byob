
module.exports = {

  development: {
    client: 'pg',
    connection: 'postgres://localhost/byob',
    useNullAsDefault: true,
    migrations: { directory: './db/migrations' },
    seeds: { directory: './db/seeds/dev' }
  },
  testing: {
    client: 'pg',
    connection: process.env.DATABASE_URL || 'postgress://localhost/byob_test',
    useNullAsDefault: true,
    migrations: { directory: './db/migrations' },
    seeds: { directory: './db/seeds/test' }
  },
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL + `?ssl=true`,
    useNullAsDefault: true,
    migrations: { directory: './db/migrations' },
    seeds: { directory: './db/seeds/dev' }
  }

};
