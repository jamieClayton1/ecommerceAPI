const router = require('express').Router();
const { Pool } = require ('pg');
const jwt = require('jsonwebtoken');
const { registerValidation, loginValidation } = require('../validate');
const bcrypt = require('bcryptjs');


const pool = new Pool({
    user: process.env.USER,
    host: process.env.HOST,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    port: process.env.PORT,
});

//Register new user:

router.post('/register', async (req, res) => {
    
    const {error} = registerValidation(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);

   try {
    const newUser = await req.body;
    const query = `
    INSERT INTO user_details (username, email, first_name, last_name, password) 
    VALUES ($1, $2, $3, $4, $5);`
    const values = [newUser.username, newUser.email, newUser.first_name, newUser.last_name, hashPassword];
    const client = await pool.connect();
    client.query(query, values);
    res.status(200)
    .send("Request to post complete")
    .end()
    } catch (err) {
        console.error(err)
    }
}

);

// Log in

router.post('/login', async (req, res) => {

    const client =  await pool.connect();
    
    const {error} = loginValidation(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const emailQuery = `SELECT email FROM user_details WHERE email = $1`
    const values = [req.body.email]
     const emailResponse = await client.query(emailQuery, values);
     const validEmail = emailResponse.rows[0].email;
     console.log(validEmail);
    if (validEmail != req.body.email) return res.status(400).send('Email is not found');

    const passwordQuery = `SELECT password FROM user_details WHERE email = $1`;
    const passwordValues = [req.body.email]
    const passwordResponse = await client.query(passwordQuery, passwordValues);
    console.log(passwordResponse.rows[0].password);
    const validPass = await bcrypt.compare(req.body.password, passwordResponse.rows[0].password);
    if (!validPass) return res.status(400).send('Invalid password');

    const tokenQuery = `SELECT id FROM user_details WHERE email = $1;`
    const tokenValues = [req.body.email]
    const tokenResponse = await client.query(tokenQuery, tokenValues);
    const tokenId = tokenResponse.rows[0].id;
    console.log(tokenId);

    const token =
    jwt.sign({id: tokenId}, process.env.TOKEN_SECRET);

    res.header('auth-token', token).send(token);
})

module.exports = router;