const express = require('express');
const cors = require('cors');
const { initializeDb, getDb } = require('./db');
const app = express();
const inventoryRouter = require('./routes/inventory');
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');

(async () => {
  try {
    await initializeDb(); // Initialize database connection
    console.log('Database initialized successfully');

    const db = getDb(); // Get the database connection object

    app.use(express.json());
    app.use(cors({ origin: 'http://localhost:3000' }));
    app.use('/api', inventoryRouter(db)); // Pass the db object, not the function
    app.use('/api/auth', authRouter(db)); // Pass the db object, not the function
    app.use('/api', usersRouter(db)); // Pass the db object, not the function

    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Server failed to start:', err);
    process.exit(1);
  }
})();