import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { HTTP } from 'meteor/http'
import { Router } from 'meteor/iron:router';
import './main.html';

    function startObserving(coinCollection, onAddedCallback) {
        return coinCollection.find().observe({
            added: onAddedCallback
        });
    }

    function coinAddedCallback(collectionName) {
        return (coinInfo) => {
            console.log("Added a coin in " + collectionName);
            console.log(coinInfo);
        };
    }

    Router.configure({
        "noRoutesTemplate": "noRoutesTemplate"
    });

    Template.PairValue.onCreated(function pairValueOnCreated() {
        this.pairSymbol = new ReactiveVar("eosbtc");
        this.pairVal = new ReactiveVar(0);

        this.eosbtcCoins = new Mongo.Collection("eosbtc");
        this.ethbtcCoins = new Mongo.Collection("ethbtc");

        Meteor.subscribe("eosbtc");
        this._eosbtcObserver = startObserving(this.eosbtcCoins, coinAddedCallback("eosbtc"));

        Meteor.subscribe("ethbtc");
        // this._ethbtcObserver = startObserving(this.ethbtcCoins, coinAddedCallback("ethbtc"));
    });

    Template.PairValue.helpers({
        pairSymbol() {
            return Template.instance().pairSymbol.get();
        },

        pairVal() {
            return Template.instance().pairVal.get();
        }
    });
    Template.PairValue.events({
        'change'(event, instance) {
            var option = event.currentTarget.value;
            instance.pairSymbol.set(option);
            HTTP.get("/" + option, {}, function() {});
            if (option === "eosbtc") {
                instance._ethbtcObserver.stop();
                instance._eosbtcObserver = startObserving(instance.eosbtcCoins, coinAddedCallback("eosbtc"));
            } else {
                instance._eosbtcObserver.stop();
                instance._ethbtcObserver = startObserving(instance.ethbtcCoins, coinAddedCallback("ethbtc"));
            }
        }
    });