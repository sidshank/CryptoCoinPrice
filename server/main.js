import { Meteor } from 'meteor/meteor';
import {CollectionManager} from './collections/CollectionManager.js';
import {RouteManager} from './routing/RouteManager.js';

Meteor.startup(() => {

    var collectionManager = new CollectionManager();
    collectionManager.initializeCollections();

    var routeManager = new RouteManager(collectionManager);
    routeManager.initializeRoutes();
});
