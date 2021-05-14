const router = require('express').Router();
const { Pool } = require ('pg');
const verify = require('./verifyToken');

const pool = new Pool({
    user: process.env.USER,
    host: process.env.HOST,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    port: process.env.PORT,
});


router.get('/', verify, async (req, res) => {
    const client = await pool.connect();

    const ordersQuery = `SELECT * FROM order_details WHERE user_id = ${req.user.id}`;
    const ordersResponse = await client.query(ordersQuery);
    res.status(200).send(ordersResponse.rows);
})

router.get('/:orderId', verify, async (req, res) => {
    const client = await pool.connect();

    const ordersQuery =
    `SELECT order_id, total, product_id, quantity 
    FROM order_items 
    LEFT JOIN order_details 
    ON order_details.id = order_items.order_id 
    WHERE order_items.order_id = ${req.params.orderId} AND order_details.user_id = ${req.user.id};`

    const ordersResponse = await client.query(ordersQuery);
    
    res.status(200).send(ordersResponse.rows);
})

module.exports = router;