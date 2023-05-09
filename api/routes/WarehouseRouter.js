const router = require('express').Router();
const {body, validationResult} = require('express-validator');

const authenticate = require("../middleware/authentication");
const authorize = require("../middleware/authorization");

const Warehouse = require ('../models/warehouse');
let warehouseModel = new Warehouse();

// authorize [CREATE, UPDATE, DELETE, LIST]
router.post("/",
        authorize,
        body("name") 
            .isString() 
            .withMessage("please enter a vaild warehouse name"),
        body("location") 
            .isString() 
            .withMessage("please enter a vaild location"),
        async (req, res) => {
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({errors:errors.array ()});
        
        let warehouseInfo = {
            name: req.body.name,
            location: req.body.location,
        }
        let warehouse = await warehouseModel.AddWarehouse(warehouseInfo);

        if (warehouse.err) 
            return res.status(400).json(warehouse);

        res.status(200).json(warehouse);
    }catch(err){
        console.log(err);
        res.status(500).json({err: err});
    }
});

router.put("/:id",
        authorize,
        async (req, res) => {
    try{
        const oldID = req.params.id;
        const newInfo = req.body;

        const updatedInfo = await warehouseModel.UpdateWarehouse(oldID, newInfo);

        if(updatedInfo.err) return res.status(404).json(updatedInfo);

        res.status(200).json(updatedInfo);
    }catch(err){
        console.log(err);
        res.status(500).json({err: err});
    }
});

router.delete("/:id",
        authorize,
        async(req, res) => {
    try {   
        let warehouse = await warehouseModel.DeleteWarehouse(req.params.id);
        if(warehouse.err) return res.status(404).json(warehouse);

        res.status(200).send(warehouse);
    }catch(err){
        console.log(err);
        res.status(500).json({err: err});
    }
});

router.get("/",
        authorize,
        async (req, res) => {
    try{
        const warehouses = await warehouseModel.GetWarehouses();
        res.status(200).json(warehouses);
    }catch(err){
        console.log(err);
        res.status(500).json({err: err});
    }
});

router.get("/:id",
        authorize,
        async (req, res) => {
    try{
        const warehouse = await warehouseModel.GetWarehouse(req.params.id);
        if(warehouse.err) 
            return res.status(404).json(warehouse);

        res.status(200).json(warehouse);
}catch(err){
    console.log(err);
    res.status(500).json({err: err});
}
});

module.exports = router;