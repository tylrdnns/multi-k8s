const keys = require('./keys');

//Express App Setup
//express stores values of calculated fib numbers from index values
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

//create new express app, object that receives and responds to any http requests coming/going to react app
const app = express();
//cross origin resource sharing, allows us to make req from one domain (that the react app is running on) to a completely different domain/port (that express api is hosted on) 
app.use(cors());
//parse incoming req from react app and turn into json that the express api can work with
app.use(bodyParser.json());

//Postgres Client Setup
//postgres is a sql type db
//postgres stores indices of any submitted value
const { Pool } = require('pg');
const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort
});

//table to house index values
pgClient.on("connect", (client) => {
    client
      .query("CREATE TABLE IF NOT EXISTS values (number INT)")
      .catch((err) => console.error(err));
  });

//Redis Client Setup
const redis = require('redis');
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});
const redisPublisher = redisClient.duplicate();

// Express route handlers

app.get('/', (req, res) => {
    res.send('Hi');
});

app.get('/values/all', async (req, res) => {
    const values = await pgClient.query('SELECT * from values');

    res.send(values.rows);
});

app.get('/values/current', async (req, res) => {
    redisClient.hgetall('values', (err, values) => {
        res.send(values);
    });
});

app.post('/values', async (req, res) => {
    const index = req.body.index;

    if (parseInt(index) > 40) {
        return res.status(422).send('Index too high');
    }

    redisClient.hset('values', index, 'Nothing yet!');
    redisPublisher.publish('insert', index);
    pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);

    res.send({ working: true });
});

app.listen(5000, err => {
    console.log('Listening');
})