import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { HTTP } from 'meteor/http'
import { Router } from 'meteor/iron:router';
import Chart from 'chart.js';
import './main.html';

    function startObserving(coinCollection, onAddedCallback) {
        return coinCollection.find().observe({
            added: onAddedCallback
        });
    }

    function coinAddedCallback(collectionName, chart) {
        return (coinInfo) => {
            console.log("Added a coin in " + collectionName);
            let open = Number.parseFloat(coinInfo.o);
            let high = Number.parseFloat(coinInfo.h);
            let close = Number.parseFloat(coinInfo.c);
            let low = Number.parseFloat(coinInfo.l);
            var value = (low + high + open + close) / 4;
            var date = new Date();
            var label = date.getHours() + ":" + date.getMinutes();
            addData(chart, label, value, low, high);
        };
    }

    function addData(chart, label, value, l, h) {
        chart.data.labels.push(label);
        if(chart.data.labels.length === 25) {
            chart.data.labels.shift();
        }
        chart.data.datasets.forEach((dataset) => {
            dataset.data.push(value);
            if (dataset.data.length === 26) {
                dataset.data.shift();
            }
        });
        if (0 === chart.options.scales.yAxes[0].ticks.suggestedMin) {
            chart.options.scales.yAxes[0].ticks.suggestedMin = 0.995*value;
            chart.options.scales.yAxes[0].ticks.min = 0.995*value;
        }
        if (1 ===  chart.options.scales.yAxes[0].ticks.suggestedMax) {
            chart.options.scales.yAxes[0].ticks.suggestedMax = 1.005*value;
            chart.options.scales.yAxes[0].ticks.max = 1.005*value;
        }

        chart.update();
    }
    
    function removeData(chart) {
        chart.data.labels = [];
        chart.data.datasets.forEach((dataset) => {
            dataset.data = [];
        });
        chart.options.scales.yAxes[0].ticks.suggestedMin = 0;
        chart.options.scales.yAxes[0].ticks.min = 0;
        chart.options.scales.yAxes[0].ticks.suggestedMax = 1;
        chart.options.scales.yAxes[0].ticks.max = 1;
        chart.update();
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

    // var chart;
    // var dataSet;
    // var dataNum = 0;

    Template.PairValue.onRendered(function pairValueRendered() {
        var ctx = document.getElementById("myChart");
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Average price',
                    data: [],
                    backgroundColor: "rgba(1,1,1,0)",
                    borderColor: 'rgba(255,99,132,1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero:true,
                            suggestedMin: 0,
                            suggestedMax: 1,
                            min: 0,
                            max: 1
                        }
                    }]
                }
            }
        });
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
                removeData(instance.chart);
                instance.chart.data.datasets[0].label = "Avg. price of EOSBTC";
                instance._eosbtcObserver = startObserving(instance.eosbtcCoins, coinAddedCallback("eosbtc", instance.chart));
            } else {
                if(instance._eosbtcObserver) {
                    instance._eosbtcObserver.stop();
                }
                removeData(instance.chart);
                instance.chart.data.datasets[0].label = "Avg. price of ETHBTC";
                instance._ethbtcObserver = startObserving(instance.ethbtcCoins, coinAddedCallback("ethbtc", instance.chart));
            }
        }
    });