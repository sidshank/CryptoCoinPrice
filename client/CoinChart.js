import Chart from 'chart.js';

export class CoinChart {

    constructor(context) {
        this.MAX_DATA_POINTS = 25;
        this.chart = new Chart(context, {
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
        this.resetChartData();
    }

    resetChartData() {
        this.chart.data.labels = [];
        this.chart.data.datasets.forEach((dataset) => {
            dataset.data = [];
        });
    }

    setDatasetLabel(datasetNumber, label) {
        if (this.chart.data.datasets[datasetNumber]) {
            this.chart.data.datasets[datasetNumber].label = label;
        }
    }

    addData(label, value, l, h) {
        this.chart.data.labels.push(label);
        if(this.chart.data.labels.length > this.MAX_DATA_POINTS) {
            this.chart.data.labels.shift();
        }

        this.chart.data.datasets.forEach((dataset) => {
            dataset.data.push(value);
            if (dataset.data.length > this.MAX_DATA_POINTS) {
                dataset.data.shift();
            }
        });

        // When we get the first data point, we scale the chart. Since this is
        // just a toy / demo app, the scale picked here is somewhat arbitrary
        // and is meant to show even small deviations in the incoming data.
        if (0 === this.chart.options.scales.yAxes[0].ticks.suggestedMin) {
            this.chart.options.scales.yAxes[0].ticks.suggestedMin = 0.995*value;
            this.chart.options.scales.yAxes[0].ticks.min = 0.995*value;
        }
        if (1 === this.chart.options.scales.yAxes[0].ticks.suggestedMax) {
            this.chart.options.scales.yAxes[0].ticks.suggestedMax = 1.005*value;
            this.chart.options.scales.yAxes[0].ticks.max = 1.005*value;
        }

        this.chart.update();
    }
    
    removeData() {
        this.resetChartData();
        this.chart.options.scales.yAxes[0].ticks.suggestedMin = 0;
        this.chart.options.scales.yAxes[0].ticks.min = 0;
        this.chart.options.scales.yAxes[0].ticks.suggestedMax = 1;
        this.chart.options.scales.yAxes[0].ticks.max = 1;
        this.chart.update();
    }
}