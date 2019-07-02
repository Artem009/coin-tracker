const express = require('express');
const router = express.Router();
const request = require("request");
const {readFileJSON, writeFileJSON} = require('../utils');
const {toDate} = require('../utils/serverTime');
const fs = require('fs');
const {COINS, PATH} = require('../constants');

const percent = (minute, coinInformation) => {
    let result = +coinInformation[0].price/+coinInformation[minute].price;
    if(result > 1){
        result = `<p style="color: green;">+${((result -1)*100).toFixed(3)}%</p>`;
    } else if (result < 1){
        result = `<p style="color: red;">-${((1 -result)*100).toFixed(3)}%</p>`;
    } else {
        result = `<p style="color: indigo;">0%</p>`;
    }
    return result;
};

const countPercent = (minute, coinInformation) => +coinInformation.length >= +minute ? percent(minute, coinInformation) : "no information";


module.exports = (router, routerPath) => {
    router.get(`${routerPath}/all`, (req, res, next) => {
        let result = "";
        COINS.map((name) => {
            let stat = fs.existsSync(`${PATH.STAT}${name}.json`) ? readFileJSON(`${PATH.STAT}${name}.json`) : {};
            let nameBlock = `<div><a href="/look/coin?name=${name}"><div style='display: inline-block; width: 60px; height: 20px; background-color: yellow; border: 1px solid black; padding: 9px 0 0 0; text-align: center; font-size: 10px'>${name}</div>`;
            result += nameBlock;

            let story = fs.existsSync(`${PATH.COIN}${name}.json`) ? readFileJSON(`${PATH.COIN}${name}.json`) : [];
            let lastPrice = story[0].price;

            stat.data.map((period) => {
                let color = 'yellow';
                if(+period.min <= +lastPrice && +lastPrice < +period.max){
                    color = 'green';
                }
                let analyticalBlock =
                `<div style='display: inline-block; width: 20px; height: 20px; background-color: ${color}; border: 1px solid black; padding: 9px 0 0 0; text-align: center; font-size: 10px'>${period.count}</div>`;
                result += `${analyticalBlock}`;
            });

            result += `</a></div>`;
        });


        res.send(result);
        next();
    });

    router.get(`${routerPath}/coin`, (req, res, next) => {
        let result = "";
        if(req.query.name){
            let name = req.query.name;
            let stat = fs.existsSync(`${PATH.STAT}${name}.json`) ? readFileJSON(`${PATH.STAT}${name}.json`) : {};

            let story = fs.existsSync(`${PATH.COIN}${name}.json`) ? readFileJSON(`${PATH.COIN}${name}.json`) : [];
            let lastPrice = story[0].price;

            let nameBlock = `<div style='width: 300px; height: 50px; background-color: yellow; border: 1px solid black; padding: 4px 0 0 0; text-align: center; font-size: 15px'>
                <div>${name}</div>
                <div>PRICE NOW</div>
                <div>${lastPrice}</div>
            </div>`;
            result += nameBlock;

            stat.data.map((period) => {
                let color = 'yellow';
                if(+period.min <= +lastPrice && +lastPrice < +period.max){
                    color = 'green';
                }

                let time = period.lastTime ? period.lastTime/1000 : "no information";

                if(time !== "no information"){
                    time = toDate(+time);

                    let options = {
                        year: time.getFullYear(),
                        month: time.getMonth() < 10 ? `0${time.getMonth()+1}` : time.getMonth()+1,
                        day: time.getDate() < 10 ? `0${time.getDate()}` : time.getDate(),
                        hour: time.getHours() < 10 ? `0${time.getHours()}` : time.getHours(),
                        minute: time.getMinutes() < 10 ? `0${time.getMinutes()}` : time.getMinutes(),
                        second: time.getSeconds() < 10 ? `0${time.getSeconds()}` : time.getSeconds()
                    };

                    time = `${options.day}.${options.month}.${options.year} ${options.hour}:${options.minute}:${options.second}`;
                }

                let percent = +lastPrice > period.min ? -((+lastPrice/period.min -1)*100).toFixed(2) : ((1 - +lastPrice/period.min)*100).toFixed(2);
                percent += ' %';

                let analyticalBlock =
                    `<div style='width: 300px; height: 90px; background-color: ${color}; border: 1px solid black; padding: 4px 0 0 0; text-align: center; font-size: 15px'>
                        <div>MIN: ${period.min}</div>
                        <div>MAX: ${period.max}</div>
                        <div>COUNT: ${period.count}</div>
                        <div>TIME: ${time}</div>
                        <div>PERCENT: ${percent}</div>
                    </div>`;
                result += `${analyticalBlock}`;
            });

        };

        res.send(result);
        next();
    });

    router.get(`${routerPath}/dynamic`, (req, res, next) => {
        let result = "<table style=\"width: 100%; border: 2px solid black; border-collapse: collapse\">";
        result += `<tr><th style="border: 3px solid black">NAME</th>
                   <th style="border: 3px solid black">now</th>
                   <th style="border: 3px solid black">5 min</th>
                   <th style="border: 3px solid black">15 min</th>
                   <th style="border: 3px solid black">30 min</th>
                   <th style="border: 3px solid black">1 hour</th>
                   <th style="border: 3px solid black">2 hours</th>
                   <th style="border: 3px solid black">3 hours</th>
                   <th style="border: 3px solid black">6 hours</th>
                   <th style="border: 3px solid black">12 hours</th>
                   <th style="border: 3px solid black">1 day</th>
                   <th style="border: 3px solid black">2 days</th>
                   <th style="border: 3px solid black">3 days</th>
                   </tr>`;
        COINS.map((name) => {
            let coinInformation = fs.existsSync(`${PATH.COIN}${name}.json`) ? readFileJSON(`${PATH.COIN}${name}.json`) : [];
            result += `<tr><th style="border: 3px solid black">${name}</th>`;
                [0, 5, 15, 30, 60, 120, 180, 360, 720, 1440, 2880, 4319].map((minute) => {
                    if(req.query.param === "percent"){
                        result +=
                            `<th style="border: 3px solid black">
                                ${countPercent(minute, coinInformation)}
                            </th>`
                    } else {
                        result +=
                            `<th style="border: 3px solid black">
                                ${coinInformation.length >= minute ? coinInformation[minute].price : "no information"}
                            </th>`
                    }
                });
            result += `</tr>`;
        });

        result += "</table>";
        res.send(result);
        next();
    });

    return router;
};
