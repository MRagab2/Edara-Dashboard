const util = require ("util");

const conn = require ("../db/dbConnection");
const query = util.promisify(conn.query).bind(conn);

module.exports = class Warehouse{

    constructor(){};

    async AddWarehouse(warehouseInfo){

        const warehouseCheck = await query('SELECT * FROM warehouses WHERE name = ?', warehouseInfo.name);
        if (warehouseCheck[0]) 
            return {
                err: 'Warehouse Already Existed'
            };

        await query('INSERT INTO `warehouses` SET ?', warehouseInfo);
        return {
            msg: "Warehouse created"
        };
    }

    async UpdateWarehouse(oldID, newInfo){
        
        let warehouse = await query('SELECT * FROM `warehouses` WHERE id = ?', oldID);
        if(!warehouse[0]) 
            return {
                msg: "warehouse not found"
            };

        if(newInfo.supervisorID){
            const userCheck = await query('SELECT * FROM users WHERE id = ?', newInfo.supervisorID);
            if(!userCheck[0] || userCheck[0].status != 'active') 
                return {
                    err:"User Doesn't Exist "
                };
            if(userCheck[0].warehouseID) 
                return {
                    msg:"Warehouse Already Occupied "
                };

            await query('UPDATE users SET warehouseID = NULL WHERE warehouseID = ?', warehouse[0].id);
            await query('UPDATE users SET warehouseID = ? WHERE id = ?', [warehouse[0].id, newInfo.supervisorID]);
        }

        if(newInfo.status == 'inactive'){
            await query('UPDATE users SET warehouseID = NULL WHERE warehouseID = ?', warehouse[0].id);
            await query('UPDATE warehouses SET supervisorID = NULL WHERE id = ?', warehouse[0].id);
        }

        warehouse = await query('SELECT * FROM `warehouses` WHERE id = ?', oldID);
        const warehouseInfo = {
            name: newInfo.name ? newInfo.name : warehouse[0].name,
            location: newInfo.location ? newInfo.location : warehouse[0].location,
            status: newInfo.status ? newInfo.status : warehouse[0].status,
            supervisorID: newInfo.supervisorID ? newInfo.supervisorID : warehouse[0].supervisorID,
        };
        await query('UPDATE `warehouses` SET ? WHERE `id` = ?',[warehouseInfo, warehouse[0].id]);
       
        warehouse = await query('SELECT * FROM `warehouses` WHERE id = ?', oldID);
        return warehouse[0];
    }

    async DeleteWarehouse(id){
        
        const warehouse = await query('SELECT * FROM `warehouses` WHERE id =?', id);
        if(!warehouse[0]) 
            return {
                msg: "warehouse not found"
            };

        await query('DELETE FROM `warehouses` WHERE `id` = ?', warehouse[0].id);
        return {
            msg: "warehouse deleted"
        };
    }

    async GetWarehouses(){
        
        let warehouses = await query("SELECT * FROM `warehouses`");
        return warehouses;
    }

    async GetWarehouse(id){
        
        let warehouse = await query("SELECT * FROM `warehouses` WHERE id = ?", id);
        if(!warehouse[0]) 
            return {
                err : "Warehouse doesn't exist.."
            };

        return warehouse[0];
    }
};