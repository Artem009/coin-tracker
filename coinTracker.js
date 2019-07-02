const cron = require('node-cron');
const request = require("request");
const fs = require('fs');
const {PATH, GET_COIN_PATH, INTERVAL, COINS} = require('./constants');
const {readFileJSON, writeFileJSON} = require('./utils');
const {toTimestamp, dateFormat} = require('./utils/serverTime');
const sendEmail = require('./sender');
const format = require('date-fns/format');
const analytics = require('./analitics/analitics.js');
const sale = require('./analitics/sale.js');
const deletePeriod = require('./analitics/deletePeriods.js');
const dynamic = require('./analitics/dynamic.js');
const minChanges = require('./analitics/minChanges.js');
const jwt = require('jsonwebtoken');
const config = require("./config");

const users = readFileJSON(`${PATH.USERS}`);

const getOptions = function(uri) {
    return {
        uri: uri,
        port: 3128,
        headers: {
            'CB-VERSION': '2018-08-26',
            'Accept': '*/*',
            'Accept-Language': 'de-DE,de;q=0.8,en-US;q=0.6,en;q=0.4',
            'Cache-Control': 'no-cache',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 OPR/45.0.2552.882'
        }
    }
};

const send = (email, outputSting, coinName) => {
    let emailParams = {
        to: email,
        subject: coinName, // Subject line
        text: 'Hello world?', // plain text body
        html: outputSting
    };
    sendEmail(emailParams);
};

const getLinksInEmail = (text, saveCoin, config, coinName, email) => {
    saveCoin.email = email;
    let queryString = jwt.sign(saveCoin, "secretkey");
    let textLink = `<br/><a href="https://${config.host}:${config.port}/savedCoin/message?param=${queryString}">Отслеживать</a>`;
    let binanceName = coinName.slice(0, coinName.length -4) + "_USDT";
    let textLinkBinance = `<br/><a href="https://www.binance.com/ru/trade/${binanceName}">Binance</a>`;
    text += textLink;
    text += textLinkBinance;
    return text;
};

const getAnaliticsTable = (analyticsArr, value) => {
    let text = `<table style="width: 100%; padding-top: 30px">` +
        `<tr><td>MIN</td><td>MAX</td><td>Min winnings USDT</td><td>Min winnings Percent</td><td>COUNT</td></tr>`;
    analyticsArr.map((interval) => {
        let winningsUSDT = +interval.min - +value.price;
        let winningsPercent = winningsUSDT/+interval.min;
        winningsPercent = (winningsPercent*100).toFixed(2);

        winningsUSDT = winningsUSDT.toFixed(7);

        if(value && +value.price >= +interval.min && +value.price <= +interval.max){
            text += `<tr style="background-color: green; font-weight: 800"><td>${interval.min}</td><td>${interval.max}</td><td>${winningsUSDT}</td><td>${winningsPercent}</td><td>${interval.count}</td></tr>`;
        } else {
            text += `<tr style="background-color: blueviolet; font-weight: 800"><td>${interval.min}</td><td>${interval.max}</td><td>${winningsUSDT}</td><td>${winningsPercent}</td><td>${interval.count}</td></tr>`;
        }
    });

    return text+= `</table>`;
};

const tracker = () => {
    let senderCounterObj = {};
    COINS.map((coinName) => {
        senderCounterObj[coinName] = toTimestamp();
    });

    cron.schedule('* * * * *', () => {
        let purchase =  readFileJSON('./purchased/purchased.json');
        COINS.map((coinName) => {
            let coinArr = fs.existsSync(`${PATH.COIN}${coinName}.json`) ? readFileJSON(`${PATH.COIN}${coinName}.json`) : [];

            let url = `${GET_COIN_PATH.Binance}${coinName}`;
            request.get(getOptions(url), function (err, res) {
                try {
                    if(res && res.body){
                        let value = JSON.parse(res.body);
                        if (res.body && value && value.price) {

                            let obj = {
                                time: toTimestamp(),
                                price: value.price
                            };
                            coinArr.unshift(obj);

                            if(coinArr.length > 4320){
                                coinArr.length = 4320;
                            }

                            writeFileJSON(`${PATH.COIN}${coinName}.json`, coinArr);

                            let analyticsArr = [];
                                analyticsArr = analytics(coinName, value);

                            if(analyticsArr.length > 0){
                                let borderIndex = analyticsArr.length -1;
                                for(let i = 0; i <= borderIndex; i++){
                                    if(value.price >= analyticsArr[i].min && value.price < analyticsArr[i].max){
                                        let text = dynamic(coinName, coinArr, value);

                                        if(
                                            text !== `<table style="width: 100%"><tr colspan="2">We have a growing coins!!!</tr></table><br/>`
                                            && +toTimestamp() >= +senderCounterObj[coinName]
                                        ){
                                            let analyticsObj = getAnaliticsTable(analyticsArr, value);
                                            text += analyticsObj;

                                            let saveCoin = {
                                                name: coinName,
                                                price: +value.price,
                                                time: toTimestamp(),
                                                forecast: analyticsArr
                                            };

                                            users.map((email) => {
                                                text = getLinksInEmail(text, saveCoin, config, coinName, email);
                                                send(email, text, coinName);
                                            });
                                            senderCounterObj[coinName] = +senderCounterObj[coinName] + 600000;
                                        }
                                    }
                                }
                                sale(purchase, value.price, coinName, borderIndex);
                            }
                            deletePeriod(coinName);
                        }
                    }
                }
                catch (e) {
                    console.log(e);
                }
            });
            minChanges(coinArr, coinName, users);
        });
    });
};


module.exports = tracker;