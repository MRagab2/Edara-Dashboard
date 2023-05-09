const util = require ("util");
const fs = require('fs');


const conn = require ("../db/dbConnection");
const query = util.promisify(conn.query).bind(conn);

module.exports = class Product{

    constructor(){};

    async AddProduct(productInfo){

        if(!productInfo.file) {
            return {
                err: "Image Required"
            };
        }
        
        const checkWarehouse = await query('SELECT * FROM warehouses WHERE id = ?', productInfo.warehouseID);
        if(!checkWarehouse[0]){
            fs.unlinkSync('./upload/' + productInfo.file.filename);
            return {
                err: "Warehouse Doesn't Exist.."
            };
        } 
        const product = {
            name: productInfo.name,
            stock: productInfo.stock,
            description: productInfo.description ? productInfo.description : 'null',
            warehouseID: productInfo.warehouseID,
            image: productInfo.file.filename,
        };
        await query('INSERT INTO `products` SET ?', product);
        return {
            msg: "product created"
        };
    }

    async UpdateProduct(oldID, newInfo){
        
        const product = await query('SELECT * FROM `products` WHERE id =?', oldID);

        if(!product[0]) {
            if(newInfo.file)
                fs.unlinkSync('./upload/' + newInfo.file.filename);
            return {
                err: "product not found"
            };
        }

        if(newInfo.warehouseID) {
            let warehouseCheck = await query('SELECT * FROM `warehouses` WHERE id = ?', newInfo.warehouseID);
            if(!warehouseCheck[0]) {
                if(newInfo.file)
                    fs.unlinkSync('./upload/' + newInfo.file.filename);
                return {
                    err: "warehouse not found"
                };
            }
                
        }

        let imageNew;
        if(newInfo.file){
            imageNew = newInfo.file.filename ;
            fs.unlinkSync('./upload/' + product[0].image);
        }else{
            imageNew = product[0].image;
        }

        let productInfo = {
            name: newInfo.name ? newInfo.name : product[0].name,
            description: newInfo.description ? newInfo.description : product[0].description,
            stock: newInfo.stock ? newInfo.stock : product[0].stock,
            warehouseID: newInfo.warehouseID ? newInfo.warehouseID : product[0].warehouseID,
            image: imageNew,
        }
      
        await query('UPDATE `products` SET ? WHERE `id` = ?',[productInfo, product[0].id]);
        return {
            msg: "product updated"
        };
    }

    async DeleteProduct(id){
        
        const product = await query('SELECT * FROM `products` WHERE id =?', id);
        if(!product[0]) 
            return {
                err: "product not found"
            };
        
        fs.unlinkSync('./upload/' + product[0].image);
        await query('DELETE FROM `products` WHERE `id` = ?', product[0].id);
        
        return {
            msg: "product deleted"
        };
    }

    async GetProducts(){
        
        let products = await query("SELECT * FROM `products`");
        products.map(product =>{
            product.image = `http://localhost:4000/${product.image}`
        });
        return products;
    }

    async GetProduct(id){
        
        let product = await query("SELECT * FROM `products` WHERE id = ?", id);
        if(!product[0]) 
            return {
                err : "product doesn't exist.."
            };

        return product[0];
    }

    async GetWarehouseProducts(warehouseID){
        const checkWarehouse = await query('SELECT * FROM warehouses WHERE id = ?',warehouseID); 
        if(!checkWarehouse[0]) 
            return {
                err: "Warehouse not found"
            };

        const products = await query('SELECT * FROM `products` WHERE warehouseID = ?',warehouseID);
        products.map(product =>{
            product.image = `http://${req.hostname}:4000/${product.image}`
        });

        return products;
    } 
};