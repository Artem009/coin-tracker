'use strict';

const express = require('express');
const router = express.Router();

const user = require('./user');
const savedCoin = require('./savedCoin');
const getCoin = require('./getCoin');
const removeCoin = require('./removeCoin');
const getCoinStat = require('./getCoinStat');
const lookAll = require('./lookAll');

module.exports = function () {
    user(router, '/user');
    savedCoin(router, '/savedCoin');
    getCoin(router, '/getCoin');
    removeCoin(router, '/removeCoin');
    getCoinStat(router, '/getCoinStat');
    lookAll(router, '/look');

    router.use(function (req, res, next) {
        if (!req.route) {
            let err = new Error('Route Not Found') ;
            err.status = 404;

            return next(err)
        }
        next()
    });

    return router;
};