const { query } = require("../index")

const up = async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      city VARCHAR(255) NOT NULL,
      frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('fifteen_minutes', 'hourly', 'daily')),
      confirmed BOOLEAN DEFAULT FALSE,
      confirmation_token VARCHAR(255) UNIQUE,
      unsubscribe_token VARCHAR(255) UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(email, city)
    );
  `)

  await query(`
    CREATE INDEX IF NOT EXISTS idx_subscriptions_email ON subscriptions(email);
    CREATE INDEX IF NOT EXISTS idx_subscriptions_confirmation_token ON subscriptions(confirmation_token);
    CREATE INDEX IF NOT EXISTS idx_subscriptions_unsubscribe_token ON subscriptions(unsubscribe_token);
    CREATE INDEX IF NOT EXISTS idx_subscriptions_frequency ON subscriptions(frequency);
  `)
}

const down = async () => {
  await query(`
    DROP TABLE IF EXISTS subscriptions;
  `)
}

module.exports = {
  up,
  down,
}
