const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors()); // add special CORS HEADERS to ever request
app.use(express.json()); // adds a BODY to POST requests
app.use(express.urlencoded({ extended: false })); // i don't know what this does but we need it
app.use(morgan('dev')); // http logging for every request

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

app.get('/candies', async(req, res) => {
  try {
    const data = await client.query('SELECT * from candies');
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/candies/:id', async(req, res) => {
  try {
    const id = req.params.id;
    const data = await client.query('select * from candies where id=$1', [id]);
    
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.post('/candies', async(req, res) => {
  try {
    const data = await client.query(`
      insert into candies (name, yumminess, has_chocolate, category, owner_id) 
      values ($1, $2, $3, $4, $5)`, 
    [
      req.body.name, 
      req.body.yumminess, 
      req.body.has_chocolate, 
      req.body.category,
      1
    ]);
    
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;
