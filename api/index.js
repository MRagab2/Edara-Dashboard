const express = require("express");
const app = express();
const cors = require("cors");

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static("upload"));
app.use(cors());

const login = require("./routes/LoginRouter");
const products = require("./routes/ProductRouter");
const warehouse = require("./routes/WarehouseRouter");
const user = require("./routes/UserRouter");
const request = require("./routes/RequestRouter");

app.use("/login",login);
app.use("/user",user);
app.use("/warehouse",warehouse);
app.use("/product",products);
app.use("/request",request);

app.listen(4000,"localhost", ()=>{
    console.log("SERVER IS RUNINNG AT: "+4000);
});