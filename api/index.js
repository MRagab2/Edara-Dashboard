const express = require("express");
const app = express();
const util = require('util');

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static("upload"));
const cors = require("cors");
app.use(cors());

const conn = require ("./db/dbConnection");

//Middlewares
const authorize = require("./middleware/authorization");

// End Points

const login = require("./routes/LoginRouter");
const products = require("./routes/ProductRouter");
const warehouse = require("./routes/WarehouseRouter");
const user = require("./routes/UserRouter");
const request = require("./routes/RequestRouter");

app.use("/login",login);
app.use("/users",user);
app.use("/warehouse",warehouse);
app.use("/products",products);
app.use("/request",request);
app.get("/homess",
        authorize,
        async (req, res)=>{
    try{
        const query = util.promisify(conn.query).bind(conn);
        const user = await query("SELECT * FROM users WHERE role != 'admin'");
        
        for(i in user){
            delete user[i].password;
        }
        res.status(200).json(user);
    }catch(err){
        console.log(err);
        res.status(500).json({err: err});
    }
});

// Listening
app.listen(4000,"localhost", ()=>{
    console.log("SERVER IS RUNINNG AT: "+4000);
});