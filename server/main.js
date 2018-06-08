import { Meteor } from 'meteor/meteor';
import websocket from 'websocket-stream';

Meteor.startup(() => {
  // code to run on server at startup
    var ethBtcCoins = new Mongo.Collection('ethbtc');

    Meteor.publish('ethbtc', function() {
        console.log("publishing ethbtc");
        return ethBtcCoins.find();
    });

    var eosBtcCoins = new Mongo.Collection('eosbtc');
    Meteor.publish('eosbtc', function() {
        console.log("publishing eosbtc");
        return eosBtcCoins.find();
    });

    var ethBtcSocket = websocket('wss://stream.binance.com:9443/ws/ethbtc@kline_1m');
    ethBtcSocket.socket.onmessage = Meteor.bindEnvironment(function(e) {
        var data = JSON.parse(e.data).k;
        ethBtcCoins.insert(data);
    });

    var eosBtcSocket = websocket('wss://stream.binance.com:9443/ws/eosbtc@kline_1m');
    eosBtcSocket.socket.onmessage = Meteor.bindEnvironment(function(e) {
        var data = JSON.parse(e.data).k;
        eosBtcCoins.insert(data);
    });
});
