const express = require('express');
const router = express.Router();
const request = require("request");
const {readFileJSON, writeFileJSON} = require('../utils');
const fs = require('fs');
const {COINS} = require('../constants.js');
const config = require('../config');

module.exports = (router, routerPath) => {
    router.get(`${routerPath}`, (req, res, next) => {
        let result = `<form method=\"GET\" action=\"https://${config.host}:5000/removeCoin/logic?\">`;
        result += "<div><input type=\"radio\" name=\"email\" value=\"artemstrigkov@gmail.com\"/><label for=\"email\">artemstrigkov@gmail.com</label></div>";
        result += "<div><input type=\"radio\" name=\"email\" value=\"zherdin.mark@gmail.com\"/><label for=\"email\">zherdin.mark@gmail.com</label></div>";

        const button = (name) => `<button name="name" value="${name}" style="display: block; width: 150px; height: 50px; background-color: green;">${name}</button>`;

        COINS.map((name) => {
            result += button(name);
        });

        result += "</form>";

        res.send(result);
        next();
    });

    router.get(`${routerPath}/logic`, (req, res, next) => {
        let savedCoinsArr = [];
        if(req && req.query){
            let name = req.query.name;
            let email = req.query.email;
            savedCoinsArr = fs.existsSync("./purchased/purchased.json") ? readFileJSON("./purchased/purchased.json") : [];
            savedCoinsArr.map((coin, index, savedCoinsArr) => {
                if(coin.name === name && coin.email === email){
                    savedCoinsArr.splice(index, 1);
                    writeFileJSON("./purchased/purchased.json", savedCoinsArr);
                }
            })
        }
        res.send(savedCoinsArr);
        next();
    });

    return router;
};
