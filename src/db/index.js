const { Pool } = require("pg")
const config = require("../config/config")

const pool = new Pool(config.db)

const checkDatabaseConnection = async () => {
  try {
    const client = await pool.connect()
    client.release()
    return true
  } catch (error) {
    console.error("Database connection error:", error)
    return false
  }
}

pool.on("error", (err) => {
  console.error("Database connection error:", err)
})

const query = async (text, params) => {
  let client
  try {
    client = await pool.connect()
    return await client.query(text, params)
  } catch (error) {
    console.error("Query execution error:", error)
    throw error
  } finally {
    if (client) {
      client.release()
    }
  }
}

module.exports = {
  query,
  pool,
  checkDatabaseConnection,
}
