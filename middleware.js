'use strict'

// All middlewares are used here.
const express = require('express');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const config = require('./config');
const routes = require('./routes');
const host = config.host;

module.exports = function (app) {
    // Static files are files that clients download as they are from the server.
    // Create a new directory, public. Koa, by default doesn't allow you to
    // serve static files.
    // https://expressjs.com/en/starter/static-files.html
    app.set('view engine', 'html');
    app.use(express.static(config.static_dir.root));

    // Add favicon.
    app.use(favicon(config.static_dir.root + '/favicon.ico'));

    app.use(bodyParser.urlencoded({
        extended: true
    }));

    // Add bodyParser.
    app.use(bodyParser.json());

    // need cookieParser middleware before we can do anything with cookies
    app.use(cookieParser());

    // Allow http://localhost:3000 to access this api via websocket.
    // https://enable-cors.org/server_expressjs.html
    app.use(function (req, res, next) {
        res.header('Access-Control-Allow-Origin', host);
        res.header('Access-Control-Allow-Credentials', true);
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next()
    });

    const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn()
    const statusMonitor = require('express-status-monitor')();
    app.use(statusMonitor);
    app.get('/status', ensureLoggedIn, statusMonitor.pageRoute);

    // Mount page routes, e.g /.
    app.use('/', routes());

    // Handle 200.
    // Or you can use express-mung to intercept the response body. Read this post for how to:
    // https://ciphertrick.com/2016/04/04/express-middleware-to-intercept-response-body/
    app.use((req, res, next) => {
        if (res.body !== undefined) {
            res.body = {
                status: 200,
                data: res.body,
            };
            res.json(res.body);
        } else {
            next();
        }
    });

    // Handle error - 404, 500, etc.
    // http://expressjs.com/en/guide/error-handling.html
    app.use((err, req, res, next) => {
        res.body = {
            status: err.status,
            message: err.message
        };

        res.status(err.status || 500);
        res.json(res.body);
    });
};