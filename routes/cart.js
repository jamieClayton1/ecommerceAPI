const router = require('express').Router();
const { response } = require('express');
const { Pool } = require ('pg');
const verify = require('./verifyToken');

const pool = new Pool({
    user: process.env.USER,
    host: process.env.HOST,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    port: process.env.PORT,
});

router.post('/add', verify, async (req, res) => {
    const client = await pool.connect();
    const cartQuery = `INSERT INTO cart_item (product_id, user_id) VALUES ($1, $2);`
    const cartValues = [req.body.product_id, req.user.id]
    const cartResponse = await client.query(cartQuery, cartValues);
    res.status(200).send("Added to cart!");
});

router.post('/delete/:id', verify, async (req,res) => {
    const client = await pool.connect();
    const cartQuery = `DELETE FROM cart_item WHERE id = $1`;
    const cartValues = [req.params.id]
    const cartResponse = await client.query(cartQuery,  cartValues);
    res.status(200).send("Removed from cart.");
})

router.get('/', verify, async (req, res) => {
    const client = await pool.connect();
    const cartQuery = `SELECT * FROM cart_item WHERE user_id = $1`
    const cartValues = [req.user.id]
    const cartResponse = await client.query(cartQuery, cartValues);
    res.status(200).send(cartResponse.rows);
})



module.exports = router;