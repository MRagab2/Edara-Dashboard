const conn = require ("../db/dbConnection");
const util = require ("util");

const authentication =async (req, res, next) =>{
    try{
        const query = util.promisify(conn.query).bind(conn);
        const {token} = req.headers; 
        if(!token) return res.status(403).json({msg: "sorry you must login first"});

        const user = await query("SELECT * FROM users WHERE token = ? ", token);
        if(!user[0] || user[0].status != 'active') return res.status(403).json({msg: "you are not authorized to access this route !"});
        
        next();
    }catch(err){
        console.log(err);
        res.status(500).json({err: err});
    }
};

module.exports = authentication;