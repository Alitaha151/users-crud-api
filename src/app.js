const express = require('express');
const usersRouter = require('./users');

const app = express();

app.use(express.json({ limit: '10kb' }));
app.use('/api/users', usersRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ error: 'Request body must contain valid JSON.' });
  }

  if (error.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body is too large.' });
  }

  console.error(error);
  return res.status(500).json({ error: 'Internal server error.' });
});

module.exports = app;
