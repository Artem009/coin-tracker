const fs = require('fs');
const {readFileJSON, writeFileJSON} = require('../utils');
const sendEmail = require('../sender');
const {toTimestamp, dateFormat, toDate} = require('../utils/serverTime');

const send = (email, outputSting, coinName) => {
    let emailParams = {
        to: email,
        subject: coinName, // Subject line
        text: 'Hello world?', // plain text body
        html: outputSting
    };
    sendEmail(emailParams);
};

const getSellMessage = (purchase, purchased, price) => {
    let name = purchase.name;
    let priceStart = purchase.price;
    let timeStart = purchase.time/1000;
    timeStart = toDate(+timeStart);
    let winningsUSDT = price - priceStart;
    let winninsPercent = winningsUSDT/priceStart;
    winninsPercent = (winninsPercent*100).toFixed(2);

    let text = `<table style="width: 100%">` +
        `<tr><td><bold>JACKPOT!!!!!</bold></td></tr>` +
        `<tr><td><bold>COIN NAME:</bold></td><bold>${name}</bold></tr>` +
        `<tr><td><bold>Time Start:</bold></td><bold>${timeStart}</bold></tr>` +
        `<tr><td><bold>Price Start:</bold></td><bold>${priceStart}</bold></tr>` +
        `<tr><td><bold>Price Now:</bold></td><bold>${price}</bold></tr>`+
        `<tr><td><bold>Winnings USDT:</bold></td><bold>${winningsUSDT}</bold></tr>`+
        `<tr><td><bold>Winnings Percent:</bold></td><bold>${winninsPercent} %</bold></tr></table>`;

        let binanceName = name.slice(0, name.length -4) + "_USDT";

        let textLinkBinance = `<br/><a href="https://www.binance.com/ru/trade/${binanceName}">Binance</a>`;
        text += textLinkBinance;

    return `${text}`;
};

const sale = (purchase, value, coinName, borderIndex) => {
        purchase.map((coin, index) => {
            if(coinName === coin.name){
                let forecast = coin.forecast;
                let price = coin.price;
                for(let i = 0; i < forecast.length; i++){
                    if(+forecast[i].max >= +value && +forecast[i].min < +value && +price*1.05 < +forecast[i].min){
                        let sellMessage = getSellMessage(coin, forecast[i], value);
                        send(coin.email, sellMessage, "JACKPOT");
                    }
                }
            }
        });
};

module.exports = sale;