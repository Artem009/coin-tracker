const express = require('express');
const router = express.Router();
const request = require("request");

//https://stackoverflow.com/questions/50304411/binance-api-hmac-signature
//https://nodejs.org/api/crypto.html#crypto_crypto_createhmac_algorithm_key_options

const axios = require('axios');
const crypto = require('crypto');
const qs = require('querystring');

const binanceConfig = {
    API_KEY: 'MkIuegjwbMOurdEpVx32AkA3j2Ze8TyvcUJ9PpnSqsROL1HckP2EkLUhBR1zzoFR',
    API_SECRET: 'TeS12NoqzFzrkvSWZGT3m8WKEZbUtrsgQV9NLpeRw27wX98YH3T1B0AkjfKStTLJ',
    HOST_URL: 'https://api.binance.com',
};

const buildSign = (data, config) => {
    return crypto.createHmac('sha256', config.API_SECRET).update(data).digest('hex');
};

const privateRequest = async (data, endPoint, type) => {
    const dataQueryString = qs.stringify(data);
    const signature = buildSign(dataQueryString, binanceConfig);

    const requestConfig =
        type === "GET" ?
     {
        method: type,
        url: binanceConfig.HOST_URL + endPoint + '?' + dataQueryString + '&signature=' + signature,
        headers: {
            'X-MBX-APIKEY': binanceConfig.API_KEY,
        }
    } :
    {
        method: type,
        url: binanceConfig.HOST_URL + endPoint,
        headers: {
            'X-MBX-APIKEY': binanceConfig.API_KEY,
        },
        data: data
    };

    try {
        console.log('URL: ', requestConfig.url);
        const response = await axios(requestConfig);
        console.log(response);
        return response;
    }
    catch (err) {
        console.log(err);
        return err;
    }
};


module.exports = (router, routerPath) => {
//Информация по аккаунту
    router.get(`${routerPath}/account`, (req, res, next) => {
        const data = {
            timestamp: Date.now(),
        };

        let result = privateRequest(data, '/api/v3/account', 'GET');

        res.send(result);
        next();
    });

    //Список сделок
    router.get(`${routerPath}/myTrades`, (req, res, next) => {
        const data = {
            symbol: 'XRPUSDT',
            timestamp: Date.now(),
        };

        let result = privateRequest(data, '/api/v3/myTrades', 'GET');
        console.log(result);
        res.send(result);
        next();
    });



// Все ордера
    router.get(`${routerPath}/allOrders`, (req, res, next) => {
        const data = {
            symbol: 'XRPUSDT',
            timestamp: Date.now(),
        };

        let result = privateRequest(data, '/api/v3/allOrders', 'GET');
        res.send(result);
        next();
    });


    router.get(`${routerPath}/user`, (req, res, next) => {
        const data = {};

        let result = privateRequest(data, '/api/v1/userDataStream', 'POST');
        res.send(result);
        next();
    });
//Добавить ордер
    router.get(`${routerPath}/order`, (req, res, next) => {
        const data = {
            symbol: 'XRP',
            timestamp: Date.now(),
        };

        let result = privateRequest(data, '/api/v3/order/test', 'POST');
        res.send(result);
        next();
    });
//Удалить ордер
    router.get(`${routerPath}/order/delete`, (req, res, next) => {
        const data = {
            symbol: 'ARKBTC',
            timestamp: Date.now(),
        };

        let result = privateRequest(data, '/api/v3/order', 'DELETE');
        res.send(result);
        next();
    });

    router.get(`${routerPath}/open`, (req, res, next) => {
        const data = {
            symbol: 'ARKBTC',
            recvWindow: 5000,
            timestamp: Date.now(),
        };

        let result = privateRequest(data, '/api/v3/openOrders', 'GET');
        res.send(result);
        next();
    });

    return router;
};
