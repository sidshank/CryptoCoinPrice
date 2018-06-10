// This is the entry point for client side of the app.
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { HTTP } from 'meteor/http'
import { Router } from 'meteor/iron:router';
import { CoinChart } from './CoinChart.js';
import './main.html';

// This app uses Meteor's iron router to do resource routing.
// Iron router expects some client side routes, but this app only
// uses server routes, so we need the line below to tell iron router
// "we know what we're doing, don't bother me about it!"
Router.configure({
    "noRoutesTemplate": "noRoutesTemplate"
});

Template.PairValue.onCreated(function pairValueOnCreated() {
    this.pairSymbol = new ReactiveVar("");

    // Create client-side Mongolite collections.
    this.coinMap = new Map();
    this.coinMap.set("eosbtc", new Mongo.Collection("eosbtc"));
    this.coinMap.set("ethbtc", new Mongo.Collection("ethbtc"));

    // "subscribing" to a channel with the same name as a Mongolite
    // collection results in the client-side collection syncing with
    // a server-side collection with the same name.

    // NOTE: We could setup a websocket on the server side to stream back
    // coin data to the client, but this is way more convenient - sshankar
    Meteor.subscribe("eosbtc");
    Meteor.subscribe("ethbtc");
    this.activeObserver = null;
});

// When the template finishes rendering ...
Template.PairValue.onRendered(function pairValueRendered() {
    // Initialize the chart to plot the average value
    const ctx = document.getElementById("coinChart");
    this.chart = new CoinChart(ctx);
});

Template.PairValue.helpers({
    // Simple helper to get the value of the currently selected
    // symbol
    pairSymbol() {
        return Template.instance().pairSymbol.get();
    }
});

const startObserving = (coinCollection, onAddedCallback) => {
    return coinCollection.find().observe({
        added: onAddedCallback
    });
}

const getCoinAddedCallback = (collectionName, chart) => {
    return (coinInfo) => {
        console.log("Added a coin in " + collectionName);

        const open = Number.parseFloat(coinInfo.o);
        const high = Number.parseFloat(coinInfo.h);
        const close = Number.parseFloat(coinInfo.c);
        const low = Number.parseFloat(coinInfo.l);
        
        const value = (low + high + open + close) / 4;

        const date = new Date();
        const label = date.getHours() + ":" + date.getMinutes();

        chart.addData(label, value, low, high);
    };
}

Template.PairValue.events({
    // Bind to the CHANGE event on the radio button inputs. 
    'change'(event, instance) {
        
        // Get the name of the currency pair symbol the user has chosen
        const option = event.currentTarget.value;
        instance.pairSymbol.set(option);

        // If we're actively observing a symbol, stop observing
        if (instance.activeObserver) {
            instance.activeObserver.stop();
        }

        // Remove all data from chart and prepare it for showing data
        // for the new currency pair symbol
        instance.chart.removeData();
        instance.chart.setDatasetLabel(0, "Average price of " + option);

        // Setup an observer on the collection which is expected to receive
        // data on newly added coins.
        if (instance.coinMap.has(option)) {
            instance.activeObserver = startObserving(instance.coinMap.get(option), 
                getCoinAddedCallback(option, instance.chart));
        }

        // Send a GET request to the server, to begin streaming back
        // the coin information for the selected symbol.
        HTTP.get("/" + option, {}, function() {});
    }
});