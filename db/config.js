require('dotenv').config()

module.exports = {
  development: {
    database: 'esg_events_development',
    dialect: 'postgres',
    host: process.env.DB_SERVER || 'localhost',
    port: process.env.DB_PORT || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD
  },
  test: {
    database: 'esg_events_test',
    dialect: 'postgres',
    host: process.env.DB_SERVER || 'localhost',
    port: process.env.DB_PORT || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    ssl: true,
    dialectOptions: {
      ssl: { rejectUnauthorized: false }
    }
  }
}
