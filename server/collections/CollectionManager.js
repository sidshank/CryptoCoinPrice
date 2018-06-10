import { Meteor } from 'meteor/meteor';

export class CollectionManager {
    constructor() {
        this.collections = new Map();
    }

    initializeCollections() {
        this.collections.set("eosbtc", new Mongo.Collection("eosbtc"));
        this.collections.set("ethbtc", new Mongo.Collection("ethbtc"));

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