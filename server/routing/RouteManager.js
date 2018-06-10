import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';
import websocket from 'websocket-stream';

export class RouteManager {
    constructor(collectionManager) {
        this.collectionManager = collectionManager;
        this.sockets = new Map();
        this.socketSources = new Map();
    }

    getSocket(name) {
        return this.sockets.get(name);
    }

    closeSockets() {
        let allSockets = this.sockets[Symbol.iterator]();
        for (let item of allSockets) {
            if (item[1]) {
                item[1].socket.close();
            }
        }
    }

    openSocket(name, closeOthers) {
        let socket = websocket(this.socketSources.get(name));
        this.sockets.set(name, socket);
        return socket;
    }

    getRouteSwitchCallback(routeName) {
        var routeManager = this;
        var collectionManager = this.collectionManager;

        return function() {
            console.log("Switching to " + routeName);
            routeManager.closeSockets();
            collectionManager.emptyCollections();
            let socketHandle = routeManager.openSocket(routeName);
            let coins = collectionManager.getCollection(routeName);
            socketHandle.socket.onmessage = Meteor.bindEnvironment(function(e) {
                var data = JSON.parse(e.data).k;
                coins.insert(data);
            });
            this.response.statusCode = 200;
            this.response.end(routeName);
        };
    }

    initializeRoutes() {
        this.sockets.set("eosbtc", null);
        this.socketSources.set("eosbtc", 'wss://stream.binance.com:9443/ws/eosbtc@kline_1m');

        this.sockets.set("ethbtc", null);
        this.socketSources.set("ethbtc", 'wss://stream.binance.com:9443/ws/ethbtc@kline_1m');

        Router.route("eosbtc", this.getRouteSwitchCallback("eosbtc"), { where: "server" });
        Router.route("ethbtc", this.getRouteSwitchCallback("ethbtc"), { where: "server" });
    }
}