const router = require('express').Router();
const fs = require('fs');
const util = require ("util");

const authenticate = require("../middleware/authentication");
const authorize = require("../middleware/authorization");
const upload = require('../middleware/uploadImages');

const conn = require ("../db/dbConnection");
const Product = require ('../models/product');
let productModel = new Product();

// authorize [CREATE, UPDATE, DELETE, LIST]
router.post("/", 
        authorize,
        upload.single('image'),
        async (req, res) =>{
    try{    
        let productInfo = req.body;
        productInfo.file = req.file;
        let product = await productModel.AddProduct(productInfo);

        console.log(req.file);

        if(product.err)
            return res.status(400).json(product);

        res.status(200).json(product);

    }catch(err){
        fs.unlinkSync('./upload/' + req.file.filename);
        console.log(err);
        res.status(500).json({err: err});
    }
});

router.put("/:id", 
        authorize,
        upload.single('image'),
        async (req, res) => {
    try{
        const oldID = req.params.id;
        const newInfo = req.body;
        newInfo.file = req.file;
        
        const updatedInfo = await productModel.UpdateProduct(oldID, newInfo);
        if(updatedInfo.err) 
            return res.status(404).json(updatedInfo);

        res.status(200).json(updatedInfo);
    }catch(err){
        fs.unlinkSync('./upload/' + req.file.filename);
        console.log(err);
        res.status(500).json({err: err});
    }
});

router.delete("/:id", 
        authorize,
        async (req, res) => {
    try {   
        const query = util.promisify(conn.query).bind(conn);
        const product = await query('SELECT * FROM `products` WHERE id =?', req.params.id);

        if(!product[0]) return res.status(404).json({msg: "product not found"});

        fs.unlinkSync('./upload/' + product[0].image);
        await query('DELETE FROM `products` WHERE `id` = ?', product[0].id);

        res.status(200).json({msg: "product deleted"});
    }catch(err){
        console.log(err);
        res.status(500).json({err: err});
    }
});

router.get("/",
        authorize,
        async(req, res) => {
    try{
        const query = util.promisify(conn.query).bind(conn);
        const products = await query('SELECT * FROM `products`');
        products.map(product =>{
            product.image = `http://${req.hostname}:4000/${product.image}`
        });
        res.status(200).json(products);
    }catch(err){
        console.log(err);
        res.status(500).json({err: err});
    }
});

router.get("/warehouseProducts/:id",
        authenticate,
        async(req, res) => {
    try{
        const query = util.promisify(conn.query).bind(conn);
        const checkWarehouse = await query('SELECT * FROM warehouses WHERE id = ?',req.params.id); 
        if(!checkWarehouse[0]) return res.status(404).json({msg: "Warehouse not found"});

        const products = await query('SELECT * FROM `products` WHERE warehouseID = ?',req.params.id);
        products.map(product =>{
            product.image = `http://${req.hostname}:4000/${product.image}`
        });
        res.status(200).json(products);
    }catch(err){
        console.log(err);
        res.status(500).json({err: err});
    }
});

router.get("/:id",
        authorize,
        async (req, res) => {
    try{
        const query = util.promisify(conn.query).bind(conn);
        const product = await query('SELECT * FROM `products` WHERE `id` = ?', req.params.id);
        if(!product[0]) return res.status(404).json({msg:'product not found...'});

        res.status(200).json(product[0]);
    }catch(err){
        console.log(err);
        res.status(500).json({err: err});
    }
});

module.exports = router;