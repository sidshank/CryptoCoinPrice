import { Meteor } from 'meteor/meteor';

// A class to manage the server-side collections in the app.
export class CollectionManager {

    constructor(collectionNames) {
        this.collections = new Map();
        this.collectionNames = [].concat(collectionNames);
    }

    /**
     * Initialize all collections used in this app.
     */
    initializeCollections() {

        this.collectionNames.forEach((cName) => {
            this.createCollection(cName);

            // Ordinarily, meteor apps automatically sync server and client collections
            // with the same name. However, I manually removed that functionality from
            // this app, and am putting in the API calls to show the synchronization being
            // setup, via PUBLISH calls.
            Meteor.publish(cName, () => {
                console.log("Begin syncing " + cName + " coins on server and client...");

                // Here's the critial part. We get a Mongo collection, and call
                // FIND() on it, which returns a cursor. Doing this in the call to
                // publish is what sets up the synchrony between client and server
                // Mongo collections.
                return this.collections.get(cName).find();
            });
        });
    }

    /**
     * Create a collection with the specified name
     * @param {String} name 
     */
    createCollection(name) {
        if (this.getCollection(name)) {
            return;
        }
        let collection = new Mongo.Collection(name);
        this.collections.set(name, collection);
        if (collection.rawDatabase()) {
            // Here, we're setting up a TTL index to set an expiry policy for
            // the data.
            let db = collection.rawDatabase();
            db.createIndex(name, { "createdAt": 1 }, { expireAfterSeconds: 600 });
        } 
        return collection;
    }

    /**
     * Empty all the records in the specified collection
     * @param {String} name 
     */
    emptyCollection(name) {
        this.collections.get(name).remove({}, function() {});
    }

    /**
     * Empty all collections
     */
    emptyCollections() {
        for (let entry of this.collections.entries()) {
            this.emptyCollection(entry[0]);
        }
    }

    /**
     * Get collection with the specified name.
     * @param {String} name 
     */
    getCollection(name) {
        return this.collections.get(name);
    }
}