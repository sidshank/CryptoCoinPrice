// This is the entry point for the server side of the app
import { Meteor } from 'meteor/meteor';
import {CollectionManager} from './collections/CollectionManager.js';
import {RouteManager} from './routing/RouteManager.js';

Meteor.startup(() => {

    var collectionManager = new CollectionManager(["eosbtc", "ethbtc"]);
    collectionManager.initializeCollections();

    var routeManager = new RouteManager(collectionManager);
    routeManager.initializeRoutes();
});
