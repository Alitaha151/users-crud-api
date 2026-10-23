require('dotenv').config();

const app = require('./app');
const pool = require('./db');

const port = Number(process.env.PORT || 3000);
const server = app.listen(port, () => {
  console.log(`Users API listening on port ${port}`);
});

async function shutdown(signal) {
  console.log(`${signal} received. Closing server...`);
  server.close(async (error) => {
    if (error) {
      console.error('Failed to close HTTP server:', error);
      process.exitCode = 1;
    }

    try {
      await pool.end();
    } catch (poolError) {
      console.error('Failed to close MySQL pool:', poolError);
      process.exitCode = 1;
    }
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
