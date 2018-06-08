import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

Template.hello.onCreated(function helloOnCreated() {
  // counter starts at 0
  this.counter = new ReactiveVar(0);
});

Template.hello.helpers({
  counter() {
    return Template.instance().counter.get();
  },
});

Template.hello.events({
  'click button'(event, instance) {
    // increment the counter when button is clicked
    instance.counter.set(instance.counter.get() + 1);
  },
});

    var ethBtcCoins = new Mongo.Collection('ethbtc');
    ethBtcCoins.find().observe({
        added: function(coinInfo) {
            console.log("Added a coin in ethBtc");
        }  
    });

    Meteor.subscribe('ethbtc', {
        onReady: function () {
            // called when data is ready to be fetched
            console.log("ethbtc ready");
            console.log(ethBtcCoins.find().fetch());
        },

        onStop: function () {
          // called when data publication is stopped
        }
    });

    var eosBtcCoins = new Mongo.Collection('eosbtc');
    eosBtcCoins.find().observe({
        added: function(coinInfo) {
            console.log("Added a coin in eosBtc");
        }  
    });

    Meteor.subscribe('eosbtc', {
        onReady: function () {
            // called when data is ready to be fetched
            console.log("eosbtc ready");
            console.log(eosBtcCoins.find().fetch());
        },

        onStop: function () {
          // called when data publication is stopped
        }
    });
