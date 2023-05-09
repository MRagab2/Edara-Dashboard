const conn = require ("../db/dbConnection");
const util = require ("util");

const authorization =async (req, res, next) =>{
try{
    const query = util.promisify(conn.query).bind(conn);
    const tokenCheck = req.headers.token; 
    
    if(tokenCheck){
        const isAdmin = await  query("select * from users where token = ? ", [tokenCheck]);
        if(isAdmin[0] && isAdmin[0].role == "admin"){
            next();
        } else{
            res.status(403).json({
                msg: "you are not authorized to access this route !",
            });
        }
    }else{
        res.status(403).json({
            msg: "sorry you must login first"
        });
    }
}catch(err){
    console.log(err);
    res.status(500).json({err: err});
}
};

module.exports = authorization;