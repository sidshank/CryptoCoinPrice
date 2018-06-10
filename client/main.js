import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { HTTP } from 'meteor/http'
import { Router } from 'meteor/iron:router';
import { anychart } from 'meteor/anychart:anychart';
import './main.html';

    function startObserving(coinCollection, onAddedCallback) {
        return coinCollection.find().observe({
            added: onAddedCallback
        });
    }

    function coinAddedCallback(collectionName, dataSet) {
        return (coinInfo) => {
            console.log("Added a coin in " + collectionName);
            var dataPoint = {};
            dataPoint.value = (Number.parseFloat(coinInfo.o) + 
                Number.parseFloat(coinInfo.h) + 
                Number.parseFloat(coinInfo.c) + 
                Number.parseFloat(coinInfo.l)) / 4;
                console.log(dataPoint.value);
            dataPoint.x = ++dataNum;

            if (dataNum > 20) {
                dataSet.remove(0);
            }
            dataSet.append(dataPoint);
        };
    }

    Router.configure({
        "noRoutesTemplate": "noRoutesTemplate"
    });

    Template.PairValue.onCreated(function pairValueOnCreated() {
        this.pairSymbol = new ReactiveVar("");
        this.pairVal = new ReactiveVar(0);

        this.eosbtcCoins = new Mongo.Collection("eosbtc");
        this.ethbtcCoins = new Mongo.Collection("ethbtc");

        Meteor.subscribe("eosbtc");
        Meteor.subscribe("ethbtc");
        this._eosbtcObserver = null;
        this._ethbtcObserver = null;
    });

    var chart;
    var dataSet;
    var dataNum = 0;

    Template.PairValue.onRendered(function pairValueRendered() {
        var container = this.find("#chartContainer");

        // Turn Meteor Collection to simple array of objects.
        var data = this.eosbtcCoins.find({}).fetch();
        dataSet = anychart.data.set(data);

        //  ----- Standard Anychart API in use -----
        chart = anychart.line(dataSet);

        chart.crosshair()
            .enabled(true)
            .yLabel(false)
            .yStroke(null);

        // set tooltip mode to point
        chart.tooltip().positionMode('point');

        chart.yAxis().title('Average Price');
        chart.xAxis().labels().padding(5);

        if (this.pairSymbol.get().length === 0) {
            chart.title('Average price over time');
        } else {
            chart.title('Average price of ' + this.pairSymbol.get() + ' over time');
        }        

        chart.autoRedraw(true);
        chart.container(container).draw();
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
                if (instance._ethbtcObserver) {
                    instance._ethbtcObserver.stop();
                }
                var dataCount = dataSet.getRowsCount();
                for (var i = dataCount - 1; i >= 0; i--) {
                    dataSet.remove(i);
                }
                dataNum = 0;
                instance._eosbtcObserver = startObserving(instance.eosbtcCoins, coinAddedCallback("eosbtc", dataSet));
                chart.title('Average price of ' + instance.pairSymbol.get() + ' over time');
            } else {
                if(instance._eosbtcObserver) {
                    instance._eosbtcObserver.stop();
                }
                var dataCount = dataSet.getRowsCount();
                for (var i = dataCount - 1; i >= 0; i--) {
                    dataSet.remove(i);
                }
                dataNum = 0;
                instance._ethbtcObserver = startObserving(instance.ethbtcCoins, coinAddedCallback("ethbtc", dataSet));
                chart.title('Average price of ' + instance.pairSymbol.get() + ' over time');
            }
        }
    });