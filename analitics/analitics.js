const fs = require('fs');
const {readFileJSON, writeFileJSON} = require('../utils');
const {toTimestamp} = require('../utils/serverTime');

const analytics = (coinName, value) => {
//analytical mechanism
    let result = [];

    let coinStatObj = fs.existsSync(`./stat/${coinName}.json`) ? readFileJSON(`./stat/${coinName}.json`) : {};

    coinStatObj.min = coinStatObj.min ? coinStatObj.min : value.price;
    coinStatObj.min = +coinStatObj.min >  +value.price ? value.price : coinStatObj.min;

    coinStatObj.max = coinStatObj.max ? coinStatObj.max : value.price;
    coinStatObj.max = +coinStatObj.max <  +value.price ? value.price : coinStatObj.max;

    coinStatObj.count = coinStatObj.count !== undefined ? +coinStatObj.count + 1 : 0;

    if(coinStatObj.count > 1440 && !coinStatObj.data){
        let difference = +coinStatObj.max - +coinStatObj.min;
        let data = [];

        let step = +difference / 15;
        coinStatObj.step = step;

        for(let i = 0; i < 15; i++){
            let period = {
                min: +coinStatObj.min + step*i,
                max: +coinStatObj.min + step*(i+1),
                count : 1
            };
            data.push(period);
        }
        coinStatObj.data = data;
    }

    if(coinStatObj.count > 1440 && coinStatObj.data){
        let countMin = 0;
        let countMax = 0;
        coinStatObj.data.map((period, number) => {
            if(number === 0 && period.min === value.price){
                coinStatObj.data[number].count++;
            }
            if(period.min < value.price && period.max >= value.price){
                coinStatObj.data[number].count++;
                coinStatObj.data[number].lastTime = toTimestamp();
            }
            if(value.price < period.min){
                countMin++;
            }
            if(value.price > period.max){
                countMax++;
            }
        });

        if(countMin >= coinStatObj.data.length){
            let periodMin = {
                min: +coinStatObj.data[0].min - coinStatObj.step,
                max: +coinStatObj.data[0].min,
                count : 1
            };
            coinStatObj.data.unshift(periodMin);
        }
        if(countMax >= coinStatObj.data.length){
            let periodMax = {
                min: +coinStatObj.data[coinStatObj.data.length -1].max,
                max: +coinStatObj.data[coinStatObj.data.length -1].max + coinStatObj.step,
                count : 1
            };
            coinStatObj.data.push(periodMax);
        }
    }

    let dataCountLength = 0;
    if(coinStatObj.data){
        coinStatObj.data.map((period) => {dataCountLength += period.count});
    }

    if(dataCountLength > 4320){
        coinStatObj.data.map((period, index) => {
            if(coinStatObj.data[index].count > 0){
                coinStatObj.data[index].count--;
            }
         });
    }

    writeFileJSON(`./stat/${coinName}.json`, coinStatObj);

    if(coinStatObj.count > 2880 && coinStatObj.data){
        let arrLookingMoment = [];
        coinStatObj.data.map((period) => {
            arrLookingMoment.push(period);
        });

        arrLookingMoment.sort((a, b) => {
            return a.min - b.min;
        });

        arrLookingMoment = arrLookingMoment.filter((period) => {
            return period.count > 0;
        });

        result = arrLookingMoment;
    }
    return result;
};

module.exports = analytics;