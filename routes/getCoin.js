const express = require('express');
const router = express.Router();
const request = require("request");
const {readFileJSON, writeFileJSON} = require('../utils');
const fs = require('fs');

module.exports = (router, routerPath) => {
    router.get(`${routerPath}`, (req, res, next) => {
        let result = [];
        if(req && req.query){
            let savedCoinsArr = fs.existsSync("./purchased/purchased.json") ? readFileJSON("./purchased/purchased.json") : [];
            if(req.query.name){
                savedCoinsArr.map((coin, index) =>{
                    if(coin.name === req.query.name){
                        result.push(coin);
                    }
                });
            } else {
                result = result.concat(savedCoinsArr);
            }
        }
        res.send(result);
        next();
    });

    return router;
};
