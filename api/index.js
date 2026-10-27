const app = require('../master-ppt-ai/backend/src/app');
const { initializeDatabase } = require('../master-ppt-ai/backend/src/config/database');

let initialized = false;

module.exports = async (req, res) => {
  if (!initialized) {
    try {
      await initializeDatabase();
      initialized = true;
    } catch (err) {
      console.error('DB init error:', err.message);
      // Continue anyway - tables might already exist
      initialized = true;
    }
  }
  return app(req, res);
};
