const router = require('express').Router();
const e = require('express');
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
    const userQuery = 
    `SELECT *
    FROM user_details
    LEFT JOIN user_address
    ON user_address.user_id = user_details.id
    LEFT JOIN user_payment
    ON user_payment.user_id = user_details.id
    WHERE user_payment.user_id = $1;
    `
    const userValues = [req.user.id]
    const userResponse = await client.query(userQuery, userValues);
    res.status(200).send(userResponse.rows);
    console.log(userResponse.rows);
})

router.patch('/', verify, async (req, res) => {
    const client = await pool.connect();
    const tableEdit = req.body.table;
    const columnEdit = req.body.column;
    const valueEdit = req.body.value;
    
    const editQuery = () => {
    if (tableEdit == 'user_details') {
        return `UPDATE user_details
        SET ${columnEdit} = '${valueEdit}'
        WHERE id = ${req.user.id};`  
    } else {
        return `UPDATE ${tableEdit}
        SET ${columnEdit} = '${valueEdit}'
        WHERE user_id = ${req.user.id};`  
    }
}
    const editResponse = await client.query(editQuery());
    res.status(200).send("Update complete");

})

module.exports = router;