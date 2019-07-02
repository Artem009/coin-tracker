const  PATH = {
    USERS: "users/users.json",
    COIN: "coinStory/",
    STAT: "stat/"
};

const GET_COIN_PATH = {
  Binance: "https://www.binance.com/api/v3/ticker/price?symbol="
};

const INTERVAL = {
    "now": 0,
    "10 min ago": 10,
    "20 min ago": 20,
    "30 min ago": 30,
    "40 min ago": 40,
    "50 min ago": 50,
    "hour ago": 60,
    "1 hour and 10 min ago": 70,
    "1 hour and 20 min ago": 80,
    "1 hour and 30 min ago": 90,
    "1 hour and 40 min ago": 100,
    "1 hour and 50 min ago": 110,
    "2 hours ago": 120,
    "2 hours and 10 min ago": 130,
    "2 hours and 20 min ago": 140,
    "2 hours and 30 min ago": 150,
    "2 hours and 40 min ago": 160,
    "2 hours and 50 min ago": 170,
    "3 hours ago": 180,
    "3 hours and 10 min ago": 190,
    "3 hours and 20 min ago": 200,
    "3 hours and 30 min ago": 210,
    "3 hours and 40 min ago": 220,
    "3 hours and 50 min ago": 230,
    "4 hours ago": 240,
    "4 hours and 10 min ago": 250,
    "4 hours and 20 min ago": 260,
    "4 hours and 30 min ago": 270,
    "4 hours and 40 min ago": 280,
    "4 hours and 50 min ago": 290,
    "5 hours ago": 300,
    "5 hours and 10 min ago": 310,
    "5 hours and 20 min ago": 320,
    "5 hours and 30 min ago": 330,
    "5 hours and 40 min ago": 340,
    "5 hours and 50 min ago": 350,
    "6 hours ago": 360
};

const COINS = [
    "BTCUSDT",
    "ETHUSDT",
    "LTCUSDT",
    "XRPUSDT",
    "EOSUSDT",
    "BNBUSDT",
    "ADAUSDT",
    "XLMUSDT",
    "TRXUSDT",
    "XMRUSDT",
    "DASHUSDT",
    "IOTAUSDT",
    "ETCUSDT",
    "NEOUSDT",
    "ONTUSDT",
    "BATUSDT",
    "ZECUSDT",
    "QTUMUSDT",
    "WAVESUSDT",
    "ZRXUSDT",
    "BTTUSDT",
    "ZILUSDT",
    "LINKUSDT"];

module.exports = {PATH, GET_COIN_PATH, INTERVAL, COINS};