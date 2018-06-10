import { Meteor } from 'meteor/meteor';

export class CollectionManager {
    constructor() {
        this.collections = new Map();
    }

    createCollection(name) {
        if (this.getCollection(name)) {
            return;
        }
        let collection = new Mongo.Collection(name);
        this.collections.set(name, collection);
        if (collection.rawDatabase()) {
            let db = collection.rawDatabase();
            db.createIndex(name, { "createdAt": 1 }, { expireAfterSeconds: 600 });
        } 
        return collection;
    }

    initializeCollections() {
        this.createCollection("eosbtc");
        this.createCollection("ethbtc");

        Meteor.publish("ethbtc", function() {
            console.log("Begin syncing ethbtc coins on server and client...");
            return this.collections.get("ethbtc").find();
        }.bind(this));
        Meteor.publish("eosbtc", function() {
            console.log("Begin syncing eosbtc coins on server and client...");
            return this.collections.get("eosbtc").find();
        }.bind(this));
    }

    emptyCollection(name) {
        console.log(name);
        this.collections.get(name).remove({}, function() {});
    }

    emptyCollections() {
        for (let entry of this.collections.entries()) {
            this.emptyCollection(entry[0]);
        }
    }

    getCollection(name) {
        return this.collections.get(name);
    }

    getCollections() {
        return this.collections.values();
    }
}