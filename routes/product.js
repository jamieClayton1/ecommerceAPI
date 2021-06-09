const router = require('express').Router();
const { Pool } = require ('pg');

const pool = new Pool({
    user: process.env.USER,
    host: process.env.HOST,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    port: process.env.PORT,
});

const categoryQuery = async function(req, res, next) {
    console.log("middleware")
    if(!req.query.category) {
        console.log("No query found")
        return next();
    }
    else {
    console.log("Query recieved")
    const client = await pool.connect();
        const productCategoryQuery = `SELECT * FROM product WHERE category_id = $1`
        const productCategoryValues = [req.query.category]
        console.log(productCategoryValues);
        const productCategoryResponse = await client.query(productCategoryQuery, productCategoryValues);
        res.status(200).send(productCategoryResponse.rows);
    }
    }


router.get('/', categoryQuery, async (req,res) => {
    console.log(req.query)
    const client = await pool.connect();
    const productQuery = `SELECT * FROM product`;
    const productResponse = await client.query(productQuery);
    console.log(productResponse.rows);
    res.status(200).send(productResponse.rows);
    }
)

router.get('/categories', async (req,res) => {
    const client = await pool.connect();
    const categoryQuery = `SELECT * FROM product_category`
    const categoryResponse = await client.query(categoryQuery);
    res.status(200).send(categoryResponse.rows);
})


router.get('/:productId', async (req,res) => {
    const client = await pool.connect();
    const productQuery = `SELECT * FROM product WHERE id = $1`;
    const productValues = [req.params.productId]
    const productResponse = await client.query(productQuery, productValues);
    console.log(productResponse.rows);
    res.status(200).send(productResponse.rows);
})





module.exports = router;