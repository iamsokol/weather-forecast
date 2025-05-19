const { pool } = require("./index")
const migration = require("./migrations/01_init")

const migrate = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    const { rows } = await pool.query("SELECT * FROM migrations WHERE name = $1", ["01_init"])

    if (rows.length === 0) {
      await migration.up()

      await pool.query("INSERT INTO migrations (name) VALUES ($1)", ["01_init"])
    }
  } catch (error) {
    console.error("Error executing migrations:", error)
    throw error
  }
}

module.exports = migrate
