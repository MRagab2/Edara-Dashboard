const router = require('express').Router();
const fs = require('fs');

const authenticate = require("../middleware/authentication");
const authorize = require("../middleware/authorization");
const upload = require('../middleware/uploadImages');

const Product = require ('../models/Product');
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
        let product = await productModel.DeleteProduct(req.params.id);
        if(product.err) return res.status(404).json(product);

        res.status(200).send(product);
    }catch(err){
        console.log(err);
        res.status(500).json({err: err});
    }
});

router.get("/",
        authorize,
        async(req, res) => {
    try{
        const products = await productModel.GetProducts();
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
        const products = await productModel.GetWarehouseProducts(req.params.id);
        if(products.err) 
            return res.status(404).json(products);

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
        const product = await productModel.GetProduct(req.params.id);
        if(product.err) 
            return res.status(404).json(product);

        res.status(200).json(product);
    }catch(err){
        console.log(err);
        res.status(500).json({err: err});
    }
});

module.exports = router;