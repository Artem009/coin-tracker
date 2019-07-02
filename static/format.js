const  {dateFormat} = require('../utils/serverTime');
function format(timestamp) {
    return dateFormat(timestamp/1000, "YYYY-MM-DD");
}

module.exports = format;