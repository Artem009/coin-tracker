const fs = require('fs');
const {readFileJSON, writeFileJSON} = require('../utils');
const {toTimestamp, dateFormat} = require('../utils/serverTime');
const {PATH, GET_COIN_PATH, INTERVAL, COINS} = require('../constants');
const map = require('lodash/map');

const getOutPut = (analysisEx, coinName, savePriseAtMoment) => {
    const readBTC = readFileJSON("./coinStory/BTCUSDT.json");

    let text = `<table style="width: 100%">` +
        `<tr><td>Name:</td><bold>${coinName}</bold></tr>` +
        `<tr><td>Growing Percent:</td><bold>${analysisEx.signalPercent} %.</bold></tr>` +
        `<tr><td>Check Price:</td><bold>${savePriseAtMoment[analysisEx.signalMoment]} USDT</bold></tr>` +
        `<tr><td>Last Price:</td><bold>${savePriseAtMoment.now} USDT</bold></tr></table>` +
        `<table style="padding-top: 30px">` +
        `<tr><td>Moment</td><td>Time</td><td>Coin USD Price</td><td>Difference</td><td>Percent</td><td>BTC USDT Price</td><td>COIN/BTC</td></tr>`;

    let arr = map(savePriseAtMoment, (value, key) => key);

    arr.map((moment, index, arr) => {
        let time = new Date();
        time.setMinutes(time.getMinutes() - INTERVAL[moment]);

        const options = {
            year: time.getFullYear(),
            month: time.getMonth() < 10 ? `0${time.getMonth()}` : time.getMonth(),
            day: time.getDate() < 10 ? `0${time.getDate()}` : time.getDate(),
            hour: time.getHours() < 10 ? `0${time.getHours()}` : time.getHours(),
            minute: time.getMinutes() < 10 ? `0${time.getMinutes()}` : time.getMinutes(),
            second: time.getSeconds() < 10 ? `0${time.getSeconds()}` : time.getSeconds()
        };

        time = `${options.day}.${options.month}.${options.year} ${options.hour}:${options.minute}:${options.second}`;

        let color = "white";
        let difference = 0;
        let comparison = 0;
        let percent = 0;
        if(index < arr.length -1){
            color = savePriseAtMoment[arr[index]] > savePriseAtMoment[arr[index + 1]] ? "green" : "red";
            difference = +savePriseAtMoment[arr[index]] - +savePriseAtMoment[arr[index + 1]];
            difference = difference.toFixed(7);
            comparison = +savePriseAtMoment[arr[index]]/+savePriseAtMoment[arr[index+1]];
            percent = comparison > 1 ? ((comparison - 1)*100).toFixed(2) : `-${((1 - comparison)*100).toFixed(2)}`;
        }

        if (moment === analysisEx.signalMoment) color = "yellow";

        let btcUsdtPrice = readBTC[INTERVAL[moment]].price;
        let coinBtcPrice = savePriseAtMoment[moment]/btcUsdtPrice*100;

        text += `<tr><td style="background-color: ${color}">${moment}</td>
        <td style="background-color: ${color}">${time}</td>
        <td style="background-color: ${color}">${savePriseAtMoment[moment]}</td>
        <td style="background-color: ${color}">${(+difference).toFixed(7)}</td>
        <td style="background-color: ${color}">${percent} %</td>
        <td style="background-color: ${color}">${(+btcUsdtPrice).toFixed(2)}</td>
        <td style="background-color: ${color}">${(+coinBtcPrice).toFixed(7)}%</td></tr>`;
    });

    return `${text}</table>`;
};

const dynamic = (coinName, coinArr, value) => {
    //dynamic mechanism
    let obj = {
        time: toTimestamp(),
        price: value.price
    };
    coinArr.unshift(obj);
    coinArr.length > 4320 ? coinArr.pop() : false;
    writeFileJSON(`${PATH.COIN}${coinName}.json`, coinArr);

    let savePriseAtMoment = {};

    for(let momentName in INTERVAL){
        let moment = INTERVAL[momentName];
        if(moment < coinArr.length){
            if(coinArr[moment] !== null){
                savePriseAtMoment[momentName] = coinArr[moment].price;
            }
        }
    }

    let arrSavePriseAtMoment = [];
    for(let nameAtMoment in savePriseAtMoment){
        let el = {
            name: nameAtMoment,
            price: savePriseAtMoment[nameAtMoment]
        };
        arrSavePriseAtMoment.push(el);
    }

    let arrComparison = [];
    for(let i = 0; i < arrSavePriseAtMoment.length -1; i++){
        let difference = arrSavePriseAtMoment[i].price - arrSavePriseAtMoment[i+1].price;
        let comparison = arrSavePriseAtMoment[i].price/arrSavePriseAtMoment[i+1].price;
        let percent = comparison > 1 ? ((comparison - 1)*100).toFixed(2) : `-${((1 - comparison)*100).toFixed(2)}`;

        let differenceAtPresent = arrSavePriseAtMoment[0].price - arrSavePriseAtMoment[i+1].price;
        let comparisonAtPresent = arrSavePriseAtMoment[0].price/arrSavePriseAtMoment[i+1].price;
        let percentAtPresent = comparisonAtPresent > 1 ? ((comparisonAtPresent - 1)*100).toFixed(2) : `-${((1 - comparisonAtPresent)*100).toFixed(2)}`;

        let comparisonEx = {
            earlyName: arrSavePriseAtMoment[i].name,
            earlyPrice: arrSavePriseAtMoment[i].price,
            laterName: arrSavePriseAtMoment[i+1].name,
            laterPrice: arrSavePriseAtMoment[i+1].price,
            difference: difference,
            percent: percent,
            differenceAtPresent: differenceAtPresent,
            percentAtPresent: percentAtPresent,
        };
        arrComparison.push(comparisonEx);
    }

    let analysis = {
        priceUp: 0,
        priceDown: 0,
        countUp: 0,
        countDown: 0,
        signalMoment: "",
    };

    let analysisArr = [];

    arrComparison.map((comparisonEx) => {
        analysis.priceUp = comparisonEx.difference > 0 ? analysis.priceUp +  comparisonEx.difference : analysis.priceUp;
        analysis.priceDown = comparisonEx.difference < 0 ? analysis.priceDown +  comparisonEx.difference : analysis.priceDown;
        analysis.countUp = comparisonEx.percent > 0 ? analysis.countUp + 1 : analysis.countUp;
        analysis.countDown = comparisonEx.percent < 0 ? analysis.countDown + 1 : analysis.countDown;
        analysis.signalMoment = comparisonEx.percentAtPresent >= 2 ? comparisonEx.laterName : "";

        if(analysis.signalMoment !== ""){
            let analysisSave = {};
            for(let param in analysis){
                analysisSave[param] = analysis[param];
            }
            analysisSave.signalPercent = comparisonEx.percentAtPresent;
            analysisArr.push(analysisSave);
        }
    });

    let output = `<table style="width: 100%"><tr colspan="2">We have a growing coins!!!</tr></table><br/>`;
    let text = '';

    let specialSignal = [];

    const readBTC = readFileJSON("./coinStory/BTCUSDT.json");

    for(let i = 0; i < 10; i++){
        if(value && value.price !== undefined){
            if(+value.price/+coinArr[i].price >= 1.01){
                let obj = {
                    price: +value.price,
                    priceEarly: +coinArr[i].price,
                    moment: `${i + 1} minute ago`,
                    percent: (+(+value.price/+coinArr[i].price -1)*100).toFixed(2) + "%",
                    btcPercent: (+(+coinArr[i].price/+readBTC[i].price)*100).toFixed(7) + "%",
                };
                specialSignal.push(obj);
            }
        }
    }

    if(specialSignal.length > 0){
        text += `<table style="width: 100%"><tr colspan="6"><bold>This currency showed rapid growth.</bold></tr>
        <tr style="background-color: green"><td>Name</td><td>Period</td><td>Price now</td><td>Price early</td><td>Percent</td><td>BTC Percent</td></tr>`;
        specialSignal.map((signal) => {
            text += `<tr style="background-color: yellow"><td>${coinName}</td><td>${signal.moment}</td><td>${signal.price}</td><td>${signal.priceEarly}</td><td>${signal.percent}</td><td>${signal.btcPercent}</td></tr>`;
        });
        text += `</table><br/>`;
        output += text;
    }

    analysisArr.map((analysisEx) => {
        let priceTrue = analysisEx.priceUp/-analysisEx.priceDown >= 5;
        let countTrue = analysisEx.countUp/analysisEx.countDown >= 3;
        if(priceTrue && countTrue && analysisEx.countUp > 3){
            text = getOutPut(analysisEx, coinName, savePriseAtMoment);
        } else if(analysisEx.countUp === 3 && analysisEx.priceUp/-analysisEx.priceDown >= 3) {
            text = getOutPut(analysisEx, coinName, savePriseAtMoment);
        } else if(analysisEx.countUp < 3 && analysisEx.priceUp > -analysisEx.priceDown) {
            text = getOutPut(analysisEx, coinName, savePriseAtMoment);
        } else {
            text = "";
        }
    });
    output += text;
    return output;
};

module.exports = dynamic;