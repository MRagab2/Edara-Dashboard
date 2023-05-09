const router = require('express').Router();
const util = require ("util");

const authenticate = require("../middleware/authentication");
const authorize = require("../middleware/authorization");

const conn = require ("../db/dbConnection");

const Request = require ('../models/request');
let requestModel = new Request();

router.post("/", 
        authenticate,
        async (req, res) =>{
    try{
        const requestInfo = req.body;   
        let request = await requestModel.AddRequest(requestInfo);
        
        if(request.err)
            return res.status(400).json(request);

        res.status(200).json(request);

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
        
        const updatedInfo = await requestModel.UpdateRequest(oldID, newInfo);
        if(updatedInfo.err) 
            return res.status(404).json(updatedInfo);

        res.status(200).json(updatedInfo);
    }catch(err){
        console.log(err);
        res.status(500).json({err: err});
    }
});

router.delete("/:id", 
        authorize,
        async (req, res) => {
    try {   
        let request = await requestModel.DeleteRequest(req.params.id);
        if(request.err) return res.status(404).json(request);

        res.status(200).send(request);
    }catch(err){
        console.log(err);
        res.status(500).json({err: err});
    }
});

router.get("/",
        authorize,
        async(req, res) => {
    try{
        const requests = await requestModel.GetRequests();
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
        const requests = await requestModel.GetUserRequests(req.params.id); 
        if(requests.err) 
            return res.status(404).json(requests);
        
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
        const requests = await requestModel.GetWarehouseRequests(req.params.id); 
        if(requests.err) 
            return res.status(404).json(requests);
        
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
        const request = await requestModel.GetRequest(req.params.id);
        if(request.err) 
            return res.status(404).json(request);

        res.status(200).json(request);
    }catch(err){
        console.log(err);
        res.status(500).json({err: err});
    }
});

module.exports = router;