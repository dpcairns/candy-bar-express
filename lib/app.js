const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging 

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});

app.get('/api/candies', async(req, res) => {
  try {
    const data = await client.query('SELECT * from candies where owner_id=$1', [req.userId]);
    
    console.log('=============================\n');
    console.log('|| req.userId', req.userId);
    console.log('\n=============================');

    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/candies/:id', async(req, res) => {
  try {
    console.log('=============================\n');
    console.log('|| req.userId', req.userId);
    console.log('\n=============================');
    const id = req.params.id;
    const data = await client.query('select * from candies where id=$1 and owner_id=$2', [id, req.userId]);
    
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/candies', async(req, res) => {
  try {
    const data = await client.query(`
      INSERT into candies (name, category, yumminess, has_chocolate, owner_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [
      req.body.name,
      req.body.category,
      req.body.yumminess,
      req.body.has_chocolate,
      req.userId]);
    
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;
