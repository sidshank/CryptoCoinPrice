import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';
import websocket from 'websocket-stream';

// This class manages the different server-side routes in our app.
// Most notably, it manages the websocket connections associated with
// each route.
export class RouteManager {
    constructor(collectionManager) {
        this.collectionManager = collectionManager;
        this.sockets = new Map();
        this.socketSources = new Map();
    }

    /**
     * Initialize all routes for the application.
     */
    initializeRoutes() {
        this.sockets.set("eosbtc", null);
        this.socketSources.set("eosbtc", 'wss://stream.binance.com:9443/ws/eosbtc@kline_1m');

        this.sockets.set("ethbtc", null);
        this.socketSources.set("ethbtc", 'wss://stream.binance.com:9443/ws/ethbtc@kline_1m');

        Router.route("eosbtc", this.getRouteSwitchCallback("eosbtc"), { where: "server" });
        Router.route("ethbtc", this.getRouteSwitchCallback("ethbtc"), { where: "server" });
    }

    /**
     * Get the socket associated with the specified route name.
     * @param {String} name 
     */
    getSocket(name) {
        return this.sockets.get(name);
    }

    /**
     * Close all sockets.
     */
    closeSockets() {
        let allSockets = this.sockets[Symbol.iterator]();
        for (let item of allSockets) {
            if (item[1]) {
                item[1].socket.close();
            }
        }
    }

    /**
     * Open a socket for the specified route name.
     * @param {String} name 
     */
    openSocket(name) {
        let socket = websocket(this.socketSources.get(name));
        this.sockets.set(name, socket);
        return socket;
    }

    /**
     * Returns a callback function to be executed when switching between
     * routes.
     * @param {String} routeName 
     */
    getRouteSwitchCallback(routeName) {
        const routeManager = this;
        const collectionManager = this.collectionManager;

        return function() {
            console.log("Switching to " + routeName);
            routeManager.closeSockets();
            collectionManager.emptyCollections();
            let socketHandle = routeManager.openSocket(routeName);
            let coins = collectionManager.getCollection(routeName);
            socketHandle.socket.onmessage = Meteor.bindEnvironment(function(e) {
                var data = JSON.parse(e.data).k;
                // Add a "createdAt" field for the data, set to the time of
                // insertion into the database. This is used by the collection
                // on the server to automatically remove data older than
                // 10 minutes.
                data.createdAt = new Date();
                coins.insert(data);
            });
            this.response.statusCode = 200;
            this.response.end(routeName);
        };
    }
}