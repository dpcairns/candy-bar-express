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
    const data = await client.query(`
        SELECT 
          candies.id, 
          candies.name, 
          categories.name as category, 
          candies.yumminess, 
          candies.has_chocolate, 
          candies.category_id,
          candies.owner_id
        FROM candies
        JOIN categories
        ON candies.category_id = categories.id
      `);
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

// this endpoint will be used in tomorrow's lab to hydrate our dropdown with category options
app.get('/categories', async(req, res) => {
  try {
    const data = await client.query('SELECT * from categories');
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/candies/:id', async(req, res) => {
  try {
    const id = req.params.id;
    const data = await client.query(`
      SELECT 
      candies.id, 
      candies.name, 
      categories.name as category, 
      candies.yumminess, 
      candies.has_chocolate, 
      candies.category_id,
      candies.owner_id
    FROM candies
    JOIN categories
    ON candies.category_id = categories.id
    WHERE candies.id=$1`, [id]);
    
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.delete('/candies/:id', async(req, res) => {
  try {
    const id = req.params.id;
    const data = await client.query('delete from candies where id=$1 returning *', [id]);
    
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.post('/candies', async(req, res) => {
  try {
    const data = await client.query(`
      insert into candies (name, yumminess, has_chocolate, category_id, owner_id) 
      values ($1, $2, $3, $4, $5)
      returning *
      `, 
    [
      req.body.name, 
      req.body.yumminess, 
      req.body.has_chocolate, 
      req.body.category_id,
      1
    ]);
    
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

// our put route needs the ID of the item to update
app.put('/candies/:id', async(req, res) => {
  // we get that id through req.params
  const id = req.params.id;

  try {
    // then we update the candy
    const data = await client.query(`
      UPDATE candies
      SET name = $1, yumminess = $2, has_chocolate = $3, category = $4
      WHERE id=$5
      returning *;
    `,
    // this array is for SQL query sanitization
    [
      req.body.name, 
      req.body.yumminess, 
      req.body.has_chocolate, 
      req.body.category,
      id,
    ]);
    
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;
