const fs = require('fs');
const {readFileJSON, writeFileJSON} = require('../utils');
const sendEmail = require('../sender');

const send = (email, outputSting, coinName) => {
    let emailParams = {
        to: email,
        subject: `minChanges ${coinName}`, // Subject line
        text: 'Hello world?', // plain text body
        html: outputSting
    };
    sendEmail(emailParams);
};

const correctPeriod = (objDifference, arrDynamic, direction, difference) => {
    if (objDifference.differenceName !== direction) {
        let addObj = {};
        for(let key in objDifference){
            addObj[key] = objDifference[key];
        }
        arrDynamic.push(addObj);
        objDifference.differenceName = direction;
        objDifference.count = 0;
        objDifference.difference = 0;
    }
    objDifference.count++;
    objDifference.difference += difference;
};

const minChanges = (coinArr, coinName, users) => {

    let arrDynamic = [];

    let objDifference = {
        difference: 0,
        count: 0,
        differenceName: "NORM"
    };

    for (let i = 0; i < coinArr.length -2; i++) {
        let difference = +coinArr[i].price - +coinArr[i + 1].price;
        if (difference < 0) {
            correctPeriod(objDifference, arrDynamic, "DOWN", difference);
        } else if (difference > 0) {
            correctPeriod(objDifference, arrDynamic, "UP", difference);
        } else if (difference === 0) {
            correctPeriod(objDifference, arrDynamic, "NORM", difference);
        }
    }

    let signalArrDynamic = [];
    arrDynamic.map((stability, index, arrDynamic) => {
        if(stability.differenceName !== "NORM"){
            signalArrDynamic.push(stability);
        }
    });

    let shotSignalArrDynamic = [];
    shotSignalArrDynamic.push(signalArrDynamic[0]);
    for(let i = 1; i < signalArrDynamic.length -1; i++){
        if(shotSignalArrDynamic[shotSignalArrDynamic.length-1].differenceName === signalArrDynamic[i].differenceName){
            shotSignalArrDynamic[shotSignalArrDynamic.length-1].count += signalArrDynamic[i].count;
            shotSignalArrDynamic[shotSignalArrDynamic.length-1].difference += signalArrDynamic[i].difference;
        } else {
            shotSignalArrDynamic.push(signalArrDynamic[i]);
        }
    }

    let sumCountUp = 0;
    let sumCountDown = 0;
    let sumDifferenceUp = 0;
    let sumDifferenceDown = 0;
    let index = 0;

    do {
        if(shotSignalArrDynamic[index].differenceName === "UP"){
            sumCountUp += shotSignalArrDynamic[index].count;
            sumDifferenceUp += shotSignalArrDynamic[index].difference;
        }
        if(shotSignalArrDynamic[index].differenceName === "DOWN"){
            sumCountDown += shotSignalArrDynamic[index].count;
            sumDifferenceDown += shotSignalArrDynamic[index].difference;
        }
        index++;
    } while (index < shotSignalArrDynamic.length -1
    && sumCountUp > sumCountDown*1.4
    && sumDifferenceUp > -sumDifferenceDown);

    if(index > 50){
        users.map((email) => {
            let text = `We have a steadily growing currency.<br/> The name: ${coinName}`;
            send(email, text, coinName);
        });
    }
};


module.exports = minChanges;