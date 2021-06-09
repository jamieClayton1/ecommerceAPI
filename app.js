const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv/config');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const authRoute = require('./routes/auth');
const productRoute = require('./routes/product');
const userRoute = require('./routes/user');
const cartRoute = require('./routes/cart');
const checkoutRoute = require('./routes/checkout');
const ordersRoute = require('./routes/orders');

app.use('/api/auth', authRoute);
app.use('/api/product', productRoute);
app.use('/api/user', userRoute);
app.use('/api/cart', cartRoute);
app.use('/api/checkout', checkoutRoute);
app.use('/api/orders', ordersRoute);

const pool = new Pool({
    user: process.env.USER,
    host: process.env.HOST,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    port: process.env.PORT,
});


pool.on('error', (err, client) => {
    console.error('Error:', err);
});

app.listen(8000);
