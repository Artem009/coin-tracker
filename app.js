const https = require("https");
const express = require("express");
const app = express();
const config = require("./config");
const middleware = require('./middleware');
const tracker = require('./coinTracker');


const server = https.createServer(config.httpsOptions, app);
middleware(app);
tracker();


server.listen(config.port, () => console.log('Server started'));