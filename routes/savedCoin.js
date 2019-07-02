const express = require('express');
const router = express.Router();
const request = require("request");
const jwt = require('jsonwebtoken');
const {readFileJSON, writeFileJSON} = require('../utils');
const {toTimestamp} = require('../utils/serverTime');
const fs = require('fs');
const {COINS} = require('../constants.js');
const config = require('../config');

module.exports = (router, routerPath) => {
    router.get(`${routerPath}/message`, (req, res, next) => {
        let result = 'Coin forecast is saved';
        if(req && req.query){
            let savedCoinsArr = fs.existsSync("./purchased/purchased.json") ? readFileJSON("./purchased/purchased.json") : [];
            let saveCoin = req.query.param;
            const decode_saveCoin = jwt.verify(saveCoin, "secretkey");
            savedCoinsArr.push(decode_saveCoin);

            writeFileJSON("./purchased/purchased.json", savedCoinsArr);
        }
        res.send(result);
        next();
    });

    router.get(`${routerPath}/add`, (req, res, next) => {
        let result = `<form method=\"GET\" action=\"https://${config.host}:5000/savedCoin/add/logic?\">`;
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

    router.get(`${routerPath}/add/logic`, (req, res, next) => {
        let result = 'Coin forecast is saved';
        if(req && req.query){
            let savedCoinsArr = fs.existsSync("./purchased/purchased.json") ? readFileJSON("./purchased/purchased.json") : [];

            if(req.query.email && req.query.name){
                let email = req.query.email;
                let name = req.query.name;

                let statCoinsArr = fs.existsSync(`./stat/${name}.json`) ? readFileJSON(`./stat/${name}.json`) : [];
                let coinNow = fs.existsSync(`./coinStory/${name}.json`) ? readFileJSON(`./coinStory/${name}.json`) : [];
                coinNow = coinNow[0];
                let savesCoinObj = {
                    name: name,
                    price: coinNow.price,
                    time: toTimestamp(),
                    forecast: statCoinsArr.data,
                    email: email
                };

                savedCoinsArr.push(savesCoinObj);
            }

            writeFileJSON("./purchased/purchased.json", savedCoinsArr);
        }
        res.send(result);
        next();
    });

    return router;
};
