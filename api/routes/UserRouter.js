const router = require('express').Router();
const {body, validationResult} = require('express-validator');

const authenticate = require("../middleware/authentication");
const authorize = require("../middleware/authorization");
const User = require ('../models/user');
let userModel = new User();

// authorize [CREATE, UPDATE, DELETE, LIST]
router.post("/",
        authorize,
        body("name")
            .isString().
            withMessage("please enter supervisor's name"),
        body("email")
            .isEmail()
            .withMessage("please enter a valid email !"),
        body("phone")
            .isLength({min:10})
            .withMessage("please enter valid phone number"),
        body("password")
            .isLength({min:6})
            .withMessage("password shouldn't be less than 6 characters"),
        async (req, res) => {
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({errors:errors.array ()});
        
        let userInfo = {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            password:req.body.password,
            warehouseID: req.body.warehouseID? req.body.warehouseID: null
        };
        userInfo =  await userModel.AddUser(userInfo);

        if(userInfo.err) return res.status(404).json(userInfo);

        res.status(200).json(userInfo);
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

            const updatedInfo = await userModel.UpdateUser(oldID, newInfo);

            if(updatedInfo.err) return res.status(404).json(updatedInfo);

            res.status(200).json(updatedInfo);
          
        }catch(err){
            console.log(err);
            res.status(500).json({err: err});
        }
});

router.delete("/:id",
        authorize,
        async (req, res) => {
    try{
        let user = await userModel.DeleteUser(req.params.id);
        if(user.err) return res.status(404).json(user);

        res.status(200).send(user);
    }catch(err){
        console.log(err);
        res.status(500).json({err: err});
    }
});

router.get("/",
        authorize,
        async (req, res) => {
    try{
        const users = await userModel.GetUsers();
        res.status(200).json(users);
    }catch(err){
        console.log(err);
        res.status(500).json({err: err});
    }
});

router.get("/:id",
        authenticate,
        async (req, res) => {
    try{
        const user = await userModel.GetUser(req.params.id);
        if(user.err) 
            return res.status(404).json(user);

        res.status(200).json(user);
    }catch(err){
        console.log(err);
        res.status(500).json({err: err});
    }
});

module.exports = router;