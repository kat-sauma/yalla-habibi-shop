/* eslint-disable indent */
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

app.get('/clothes', async (req, res) => {
  try {
    const data = await client.query('SELECT * from clothes');

    res.json(data.rows);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});

app.get('/clothes/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const data = await client.query('SELECT * from clothes where id=$1', [id]);

    res.json(data.rows[0]);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});

app.post('/clothes', async (req, res) => {
  try {
    const data = await client.query(`
    insert into clothes (clothing_id, name, img_url, description, category_id, size, price, owner_id)
    values ($1, $2, $3, $4, $5, $6, $7, $8)
    returning *
    `,
      [
        req.body.clothing_id,
        req.body.name,
        req.body.img_url,
        req.body.description,
        req.body.category_id,
        req.body.size,
        req.body.price,
        1
      ]);

    res.json(data.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/clothes/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const data = await client.query(`
    UPDATE clothes
    SET clothing_id = $1, name = $2, img_url = $3, description = $4, category_id= $5, size = $6, price = $7 
    WHERE id = $8
    returning *;
    `,
      [
        req.body.clothing_id,
        req.body.name,
        req.body.img_url,
        req.body.description,
        req.body.category_id,
        req.body.size,
        req.body.price,
        id,
      ]);

    res.json(data.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/clothes/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const data = await client.query('delete from clothes where id=$1 returning *', [id]);

    res.json(data.rows[0]);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;
