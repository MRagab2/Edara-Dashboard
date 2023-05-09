const util = require ("util");

const conn = require ("../db/dbConnection");
const query = util.promisify(conn.query).bind(conn);

module.exports = class Request{

    constructor(){};

    async AddRequest(requestInfo){

        const checkProduct = await query('SELECT * FROM products WHERE id = ?', requestInfo.productID);
        if(!checkProduct[0]){
            return {
                err: "Product Doesn't Exist.."
            };
        } 
        
        const checkUser = await query('SELECT * FROM users WHERE id = ?', requestInfo.userID);
        if(!checkUser[0]){
            return {
                err: "User Doesn't Exist.."
            };
        }
        const checkWarehouse = await query('SELECT * FROM warehouses WHERE id = ?', requestInfo.warehouseID);
        if(!checkWarehouse[0]){
            return {
                err: "Warehouse Doesn't Exist.."
            };
        }

        const request = {
            productID: requestInfo.productID,
            quantity: requestInfo.quantity,
            userID: requestInfo.userID,
            warehouseID: requestInfo.warehouseID,
        };

        const productStock = await query('SELECT * FROM `products` WHERE id = ?', request.productID);
        if(productStock[0].stock < request.quantity * -1 ) 
            return {
                err: "insufficient stock"
            }

        await query('INSERT INTO `requests` SET ?', request);
        return {
            msg: "request sent"
        };
    }

    async UpdateRequest(oldID, newInfo){
        
        const request = await query('SELECT * FROM `requests` WHERE id =?', oldID);
        if(!request[0]) {
            return {
                err: "request not found"
            };
        }

        let requestInfo = {
            quantity : newInfo.quantity ? newInfo.quantity : request[0].quantity,
            status : newInfo.status ? newInfo.status : request[0].status,
        }
        if(newInfo.status == 'accepted'){
            const product = await query('SELECT * FROM products WHERE id = ?',request[0].productID)
            const stockNew = ( Number(product[0].stock) + Number(requestInfo.quantity) );
            await query('UPDATE products SET stock = ? WHERE id = ?',[stockNew, request[0].productID]);
        }

        await query('UPDATE `requests` SET ? WHERE `id` = ?',[requestInfo, request[0].id]);
        return {
            msg: "request updated"
        };
    }

    async DeleteRequest(id){
        
        const request = await query('SELECT * FROM `requests` WHERE id =?', id);
        if(!request[0]) 
            return {
                err: "request not found"
            };
        
        await query('DELETE FROM `requests` WHERE `id` = ?', request[0].id);
        
        return {
            msg: "request deleted"
        };
    }

    async GetRequests(){
        
        let requests = await query("SELECT * FROM `requests` ORDER BY `status` DESC");
        return requests;
    }

    async GetRequest(id){
        
        let request = await query("SELECT * FROM `requests` WHERE id = ?", id);
        if(!request[0]) 
            return {
                err : "request doesn't exist.."
            };

        return request[0];
    }

    async GetWarehouseRequests(warehouseID){
        const checkWarehouse = await query('SELECT * FROM warehouses WHERE id = ?',warehouseID); 
        if(!checkWarehouse[0]) 
            return {
                err: "Warehouse not found"
            };

        const requests = await query('SELECT * FROM `requests` WHERE warehouseID = ? ORDER BY `status` DESC',warehouseID);
        
        return requests;
    } 

    async GetUserRequests(userID){
        const checkUser = await query('SELECT * FROM users WHERE id = ?',userID); 
        if(!checkUser[0]) 
            return {
                err: "User not found"
            };

        const requests = await query('SELECT * FROM `requests` WHERE userID = ?',userID);
        
        return requests;
    } 
};