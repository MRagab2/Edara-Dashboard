const util = require ("util");
const bcrypt =require("bcrypt");
const crypto = require('crypto');

const conn = require ("../db/dbConnection");
const query = util.promisify(conn.query).bind(conn);

module.exports = class User{

    async Login(email, password){

        const user = await query ("SELECT * FROM users WHERE email = ? ",email);
        if(!user[0]) 
            return {
                errors: [{
                    msg: "not correct email or password !"
                }]
            };

        const passwordCheck = await bcrypt.compare(password, user[0].password);
        if(!passwordCheck) 
            return {
                errors: [{
                    msg: "not correct email or password !"
                }]
            };

        delete user[0].password;
        return user[0];
    }

    async AddUser(userInfo){

        let userChek = await query("SELECT * FROM users WHERE email = ?", userInfo.email);
        if(userChek[0]) 
            return {
                err : "User already exists"
            };

        userInfo.password = await bcrypt.hash(userInfo.password, 10);
        userInfo.token = crypto.randomBytes(10).toString('hex');

        await query('INSERT INTO users SET ? ',userInfo);
        
        delete userInfo.password;
        return userInfo;
    }

    async UpdateUser(oldID, newInfo){
        
        let user = await query("SELECT * FROM users WHERE id = ?", oldID);
        if(!user[0]) 
            return {
                err : "User doesn't exist.."
            };
            
        if(newInfo.warehouseID){
            const warehouseCheck = await query('SELECT * FROM warehouses WHERE id = ?', newInfo.warehouseID);
            if(!warehouseCheck[0] || warehouseCheck[0].status != 'active') 
                return {
                    err:"Warehouse Doesn't Exist "
                };
            if(warehouseCheck[0].supervisorID) 
                return {
                    err:"Warehouse Already Occupied "
                };

            await query('UPDATE warehouses SET supervisorID = NULL WHERE supervisorID = ?', user[0].id);
            await query('UPDATE warehouses SET supervisorID = ? WHERE id = ?', [user[0].id, newInfo.warehouseID]);
        }

        if(newInfo.status == 'inactive'){
            await query('UPDATE warehouses SET supervisorID = NULL WHERE supervisorID = ?', user[0].id);
            await query('UPDATE users SET warehouseID = NULL WHERE id = ?', user[0].id);
        }

        user = await query("SELECT * FROM users WHERE id = ?", oldID);
        const userInfo = {
            name: newInfo.name? newInfo.name: user[0].name,
            phone: newInfo.phone? newInfo.phone: user[0].phone,
            status: newInfo.status? newInfo.status: user[0].status,
        };
        await query('UPDATE users SET ?  WHERE id = ?',[userInfo, user[0].id]);
        
        user = await query("SELECT * FROM users WHERE id = ?", oldID);
        return user[0];    
    }

    async DeleteUser(id){
        
        const user = await query("SELECT * FROM users WHERE id = ?", id);
        if(!user[0]) 
            return {
                err : "User doesn't exist.."
            };

        await query('DELETE FROM `users` WHERE `id` = ?', user[0].id);
        return {
            msg: "Deleted"
        };
    }

    async GetUsers(){
        
        let users = await query("SELECT * FROM users WHERE role != 'admin'");
        users.forEach(user => {
            delete user.password;
        });

        return users;
    }

    async GetUser(id){
        
        let user = await query("SELECT * FROM users WHERE id = ?", id);
        if(!user[0]) 
            return {
                err : "User doesn't exist.."
            };
        delete user[0].password;

        return user;
    }
};