const fs = require("fs");
const prod = (process.env.NODE_ENV === 'production');

const index = {
    port: 5000,
    host: prod ? "crypiter.com" : "localhost",
    httpsOptions:{
        key: fs.readFileSync('./cert/key.pem'),
        cert: fs.readFileSync('./cert/cert.pem'),
    },
    static_dir: {
        root: './static',
        options: {}
    }
};

module.exports = index;