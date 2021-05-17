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

    const ordersQuery = `SELECT * FROM order_details WHERE user_id = $1`;
    const ordersValues = [req.user.id]
    const ordersResponse = await client.query(ordersQuery, ordersValues);
    res.status(200).send(ordersResponse.rows);
})

router.get('/:orderId', verify, async (req, res) => {
    const client = await pool.connect();

    const ordersQuery =
    `SELECT order_id, total, product_id, quantity 
    FROM order_items 
    LEFT JOIN order_details 
    ON order_details.id = order_items.order_id 
    WHERE order_items.order_id = $1 AND order_details.user_id = $2;`
    const ordersValues = [req.params.orderId, req.user.id]

    const ordersResponse = await client.query(ordersQuery, ordersValues);
    
    res.status(200).send(ordersResponse.rows);
})

module.exports = router;