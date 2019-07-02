const fs = require('fs');
const {readFileJSON, writeFileJSON} = require('../utils');
const {toTimestamp, dateFormat, toDate} = require('../utils/serverTime');


const deletePeriods = (coinName) => {
    let coinStat = fs.existsSync(`./stat/${coinName}.json`) ? readFileJSON(`./stat/${coinName}.json`) : {};
    let data = coinStat.data;
    if(data[0].count === 0){
        coinStat.data.shift();
    }
    if(data[data.length -1].count === 0){
        coinStat.data.pop();
    }

    writeFileJSON(`./stat/${coinName}.json`, coinStat);
};

module.exports = deletePeriods;