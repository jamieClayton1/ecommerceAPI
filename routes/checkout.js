const router = require('express').Router()
const { Pool } = require ('pg');
const verify = require('./verifyToken');
const valid = require('card-validator');

const pool = new Pool({
    user: process.env.USER,
    host: process.env.HOST,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    port: process.env.PORT,
});

router.post('/', verify, async (req, res) =>{
    const client = await pool.connect();
    const cartQuery = `SELECT * FROM cart_item WHERE user_id = ${req.user.id}`
    const cartResponse = await client.query(cartQuery);
    console.log(cartResponse.rows)

    if (!cartResponse.rows[0]) res.status(404).send("Cart not found")

    const totalQuery = `SELECT SUM(product.price) FROM product LEFT JOIN cart_item ON cart_item.product_id = product.id WHERE user_id = ${req.user.id};`
    const totalResponse = await client.query(totalQuery);
    const total = totalResponse.rows[0].sum
    
    const checkoutQuery = 
    `INSERT INTO order_details (user_id, total)
        VALUES (${req.user.id}, ${total});`
    const checkoutResponse = await client.query(checkoutQuery);

    const orderIdQuery = `SELECT id FROM order_details WHERE user_id = ${req.user.id} ORDER BY id DESC LIMIT 1 `;
    const orderIdResponse = await client.query(orderIdQuery);
    const orderId = orderIdResponse.rows[0].id
    const paymentQuery =
    `INSERT INTO payment_details (order_id, amount, status) VALUES (${orderId}, ${total}, 'paid');`
    const paymentResponse = await client.query(paymentQuery);
    
    const productIdQuery = `SELECT product_id FROM cart_item WHERE user_id = ${req.user.id}`;
    const productIdResponse = await client.query(productIdQuery);
    console.log(productIdResponse.rows);
    
    productIdResponse.rows.forEach(async (item) => {
    const itemsQuery = `INSERT INTO order_items (order_id, product_id, quantity) VALUES (${orderId}, ${item.product_id} , 1);`
    const itemsResponse = await client.query(itemsQuery);
    });

    const clearCartQuery = `DELETE FROM cart_item WHERE user_id = ${req.user.id}`
    const clearCartResponse = await client.query(clearCartQuery);

    res.status(200).send("Checkout complete!");
})

module.exports = router;