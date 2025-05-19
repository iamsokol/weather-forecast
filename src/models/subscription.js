const db = require("../db")
const crypto = require("crypto")

const SubscriptionModel = {
  async create(email, city, frequency) {
    const validFrequencies = ["fifteen_minutes", "hourly", "daily"]
    if (!validFrequencies.includes(frequency)) {
      throw new Error('Frequency must be one of: "fifteen_minutes", "hourly", "daily"')
    }

    const confirmationToken = crypto.randomBytes(32).toString("hex")
    const unsubscribeToken = crypto.randomBytes(32).toString("hex")

    try {
      const result = await db.query(
        `INSERT INTO subscriptions (email, city, frequency, confirmation_token, unsubscribe_token)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (email, city) 
         DO UPDATE SET 
           frequency = $3,
           confirmation_token = $4,
           unsubscribe_token = $5,
           confirmed = FALSE,
           updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [email, city, frequency, confirmationToken, unsubscribeToken],
      )

      return result.rows[0]
    } catch (error) {
      console.error("Error creating subscription:", error)
      throw error
    }
  },

  async confirmByToken(token) {
    try {
      const result = await db.query(
        `UPDATE subscriptions 
         SET confirmed = TRUE, updated_at = CURRENT_TIMESTAMP
         WHERE confirmation_token = $1
         RETURNING *`,
        [token],
      )

      return result.rows[0] || null
    } catch (error) {
      console.error("Error confirming subscription:", error)
      throw error
    }
  },

  async deleteByToken(token) {
    try {
      const result = await db.query(
        `DELETE FROM subscriptions 
         WHERE unsubscribe_token = $1
         RETURNING *`,
        [token],
      )

      return result.rows[0] || null
    } catch (error) {
      console.error("Error deleting subscription:", error)
      throw error
    }
  },

  async deleteByEmailAndCity(email, city) {
    try {
      const result = await db.query(
        `DELETE FROM subscriptions 
         WHERE email = $1 AND city = $2
         RETURNING *`,
        [email, city],
      )

      return result.rows[0] || null
    } catch (error) {
      console.error("Error deleting subscription:", error)
      throw error
    }
  },

  async getActiveByFrequency(frequency) {
    try {
      const result = await db.query(
        `SELECT * FROM subscriptions 
         WHERE confirmed = TRUE AND frequency = $1`,
        [frequency],
      )

      return result.rows
    } catch (error) {
      console.error("Error getting subscriptions:", error)
      throw error
    }
  },

  async getByEmail(email) {
    try {
      const result = await db.query(
        `SELECT * FROM subscriptions 
         WHERE email = $1 AND confirmed = TRUE`,
        [email],
      )

      return result.rows
    } catch (error) {
      console.error("Error getting subscriptions:", error)
      throw error
    }
  },

  async exists(email, city) {
    try {
      const result = await db.query(
        `SELECT * FROM subscriptions 
         WHERE email = $1 AND city = $2 AND confirmed = TRUE`,
        [email, city],
      )

      return result.rows.length > 0
    } catch (error) {
      console.error("Error checking subscription:", error)
      throw error
    }
  },
}

module.exports = SubscriptionModel
