const express = require('express');
const router = express.Router();
const request = require("request");
const {readFileJSON, writeFileJSON} = require('../utils');
const fs = require('fs');

module.exports = (router, routerPath) => {
    router.get(`${routerPath}`, (req, res, next) => {
        let coin = {};
        if(req && req.query && req.query.name){
            let name = req.query.name;
            coin = fs.existsSync(`./stat/${name}.json`) ? readFileJSON(`./stat/${name}.json`) : {};
        }
        res.send(coin);
        next();
    });

    return router;
};
