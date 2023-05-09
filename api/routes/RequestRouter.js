const router = require('express').Router();
const util = require ("util");

const authenticate = require("../middleware/authentication");
const authorize = require("../middleware/authorization");

const conn = require ("../db/dbConnection");

// authorize [CREATE, UPDATE, DELETE, LIST]
router.post("/", 
        authenticate,
        async (req, res) =>{
    try{
        const query = util.promisify(conn.query).bind(conn);

        const checkProduct = await query('SELECT * FROM products WHERE id = ?',req.body.productID);
        if(!checkProduct[0]) return res.status(404).json({msg: "Product not found"});
        
        const checkUser = await query('SELECT * FROM users WHERE id = ?',req.body.userID);
        if(!checkUser[0] || checkUser[0].status != 'active') return res.status(404).json({msg: "User not found"});
        
        const checkWarehouse = await query('SELECT * FROM warehouses WHERE id = ?',req.body.warehouseID);
        if(!checkWarehouse[0] || checkWarehouse[0].status != 'active') return res.status(404).json({msg: "Warehouse not found"});
        
        const request = {
            productID: req.body.productID,
            quantity: req.body.quantity,
            userID: req.body.userID,
            warehouseID: req.body.warehouseID,
        };   

        const productStock = await query('SELECT * FROM `products` WHERE id = ?', request.productID);
        if(productStock[0].stock < request.quantity * -1 ) return res.status(400).json({msg: "insufficient stock"}); 

        await query('INSERT INTO `requests` SET ?', request);
        res.status(200).json({msg: "request created"});

    }catch(err){
        console.log(err);
        res.status(500).json({err: err});
    }
});

router.put("/:id", 
        authorize,
        async (req, res) => {
    try{
        const query = util.promisify(conn.query).bind(conn);
        const request = await query('SELECT * FROM `requests` WHERE id =?', req.params.id);
        if(!request[0]) return res.status(404).json({msg: "request not found"});

        let productIDNew = req.body.productID  ? req.body.productID  : request[0].productID ;
        let quantityNew = req.body.quantity ? req.body.quantity : request[0].quantity;
        let userIDNew = req.body.userID  ? req.body.userID : request[0].userID ;
        let warehouseIDNew = req.body.warehouseID ? req.body.warehouseID : request[0].warehouseID;
        let statusNew = req.body.status ? req.body.status : request[0].status;
        
        const requestNew = {
            productID: productIDNew,
            quantity: quantityNew,
            userID: userIDNew,
            warehouseID: warehouseIDNew,
            status: statusNew,
        };
        if(req.body.status == 'accepted'){
            const product = await query('SELECT * FROM products WHERE id = ?',productIDNew)
            const stockNew = Number(product[0].stock) + quantityNew
            await query('UPDATE products SET stock = ? WHERE id = ?',[stockNew, productIDNew]);
        }

        await query('UPDATE `requests` SET ? WHERE `id` = ?',[requestNew, request[0].id]);
        res.status(200).json({msg: "request updated"});
    }catch(err){
        console.log(err);
        res.status(500).json({err: err});
    }
});

router.delete("/:id", 
        authorize,
        async (req, res) => {
    try {   
        const query = util.promisify(conn.query).bind(conn);
        const request = await query('SELECT * FROM `requests` WHERE id = ?', req.params.id);
        if(!request[0]) return res.status(404).json({msg: "request not found" });
        await query('DELETE FROM `requests` WHERE `id` = ?', request[0].id);

        res.status(200).json({msg: "request deleted"});
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
        const requests = await query('SELECT * FROM `requests` ORDER BY `status` DESC');
        res.status(200).json(requests);
    }catch(err){
        console.log(err);
        res.status(500).json({err: err});
    }
});

router.get("/userRequests/:id",
        authenticate,
        async(req, res) => {
    try{
        const query = util.promisify(conn.query).bind(conn);
        const checkUser = await query('SELECT * FROM users WHERE id = ?',req.params.id); 
        if(!checkUser[0]) return res.status(404).json({msg: "User not found"});
    
        const requests = await query('SELECT * FROM `requests` WHERE userID = ? ORDER BY `status` DESC',req.params.id);
        res.status(200).json(requests);
    }catch(err){
        console.log(err);
        res.status(500).json({err: err});
    }
});

router.get("/warehouseRequests/:id",
        authenticate,
        async(req, res) => {
    try{
        const query = util.promisify(conn.query).bind(conn);
        const checkWarehouse = await query('SELECT * FROM warehouses WHERE id = ?',req.params.id); 
        if(!checkWarehouse[0]) return res.status(404).json({msg: "Warehouse not found"});
        
        const requests = await query('SELECT * FROM `requests` WHERE warehouseID = ? ORDER BY `status` DESC',req.params.id);
        res.status(200).json(requests);
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
        const request = await query('SELECT * FROM `requests` WHERE `id` = ?', req.params.id);
        if(!request[0]) return res.status(404).json({msg:'request not found...'});

        res.status(200).json(request[0]);
    }catch(err){
        console.log(err);
        res.status(500).json({err: err});
    }
});

router.get("/",
        async (req, res)=>{
    try{
        const query = util.promisify(conn.query).bind(conn);
        const requests = await query('SELECT * FROM `requests` ORDER BY `status` DESC');

        res.status(200).json(requests);
    }catch(err){
        console.log(err);
        res.status(500).json({err: err});
    }
});
    
router.get("/checkPending",
        async (req, res)=>{
    try{
        const query = util.promisify(conn.query).bind(conn);
        const requests = await query("SELECT * FROM `requests` WHERE status = 'pending' ");

        res.status(200).json(requests[0]);
    }catch(err){
        console.log(err);
        res.status(500).json({err: err});
    }
});

module.exports = router;