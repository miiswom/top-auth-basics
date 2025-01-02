const { Pool } = require("pg");

const config = require("dotenv").config({
  path: `${__dirname}/.env.test`
})

if(!process.env.PGDATABASE) {
  throw new Error("PGDATABASE not set")
}

const pool = new Pool(config);

module.exports = pool;