const express = require('express');
const { Pool } = require ('pg');
const bodyParser = require('body-parser');
require('dotenv/config');

const app = express();
app.use(bodyParser.json());

const authRoute = require('./routes/auth');
const productRoute = require('./routes/product');
const userRoute = require('./routes/user');
const cartRoute = require('./routes/cart');
const checkoutRoute = require('./routes/checkout');
const ordersRoute = require('./routes/orders');

app.use('/auth', authRoute);
app.use('/product', productRoute);
app.use('/user', userRoute);
app.use('/cart', cartRoute);
app.use('/checkout', checkoutRoute);
app.use('/orders', ordersRoute);

const pool = new Pool({
    user: process.env.USER,
    host: process.env.HOST,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    port: process.env.PORT,
});


app.get('/', async (req, res) => {
    try {
        const client = await pool.connect();
        const query = 'SELECT * FROM user_details';
        const response = await client.query(query);
        res.send(response);
        res.status(200).end()
    } catch (err) {
        console.error(err)
    }
});

/*app.get('/:userID', async (req, res) => {
    try {
        const client = await pool.connect();
        const id = req.params.userID
        const query = `SELECT * FROM user_details WHERE id = ${id};`
        const response = await client.query(query);
        res.send(response);
        res.status(200).end();
    } catch (err) {
            console.error(err)
    }
}) */

app.post('/', async (req, res) => {

    try {
    const newUser = await req.body;
    const query = `INSERT INTO user_details (username, email, first_name, last_name) VALUES ('${newUser.username}', '${newUser.email}', '${newUser.first_name}', '${newUser.last_name}');`
    const client = await pool.connect();
    client.query(query);
    res.status(200)
    .send("Request to post complete")
    .end()
    } catch (err) {
        console.error(err)
    }
})

app.delete('/:userID', async (req, res) => {
    try {
        const client = await pool.connect();
        const id = req.params.userID
        const query = `DELETE FROM user_details WHERE id = ${id};`
        client.query(query);
        res.status(200)
        .send("Request to delete complete")
        .end();
    } catch (err) {
            console.error(err)
    }
})

app.patch('/:userID/editName/:newName', async (req, res) => {
    try {
        const client = await pool.connect();
        const query = `UPDATE user_details SET first_name = '${req.params.newName}' WHERE id = ${req.params.userID};`
        client.query(query);
        res.status(200)
        .send("Request to update complete")
        .end();
    } catch (err) {
            console.error(err)
    }
})


pool.on('error', (err, client) => {
    console.error('Error:', err);
});

app.listen(3000);
