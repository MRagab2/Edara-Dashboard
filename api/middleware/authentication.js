const conn = require ("../db/dbConnection");
const util = require ("util");

const authentication =async (req, res, next) =>{
    try{
        const query = util.promisify(conn.query).bind(conn);

        const tokenCheck = req.headers.token; 
        if(!tokenCheck) 
            return res.status(403).json({
                msg: "sorry you must login first"
            });

        const userCheck = await query("SELECT * FROM users WHERE token = ? ", tokenCheck);
        if(!userCheck[0] || userCheck[0].status != 'active') 
            return res.status(403).json({
                msg: "you are not authorized to access this route !"
            });
        
        next();
    }catch(err){
        console.log(err);
        res.status(500).json({err: err});
    }
};

module.exports = authentication;