# Cryptocurrency coin price display - nextgen interview - Sid Shankar

## About

This is an app to display the  average price over time for two cryptocurrency pairs, ETH/BTC and EOS/BTC. The app provides a frontend that allows ussers to switch between the two pairs. When a certain symbol (pair) is selected, a websocket is opened to a 1-minute candlestick update stream on that symbol. The websocket is opened on the server, which then streams this data back to the client to chart.

## System Requirements and Installation

The app itself is hosted on: cryptocoinprice.meteorapp.com

However, if you want to set it up on your own machine, you will need to:

1. Install Chocolatey
2. Install Meteor
3. Have mongodb installed on your system

Follow the instructions here: https://www.meteor.com/install

Once this is done, download the files in this repo into a folder of your choice. Then, at a terminal, navigate into the folder with the downloaded files, and type:

meteor

This should download all app dependencies, and startup the app on "localhost:3000".

## Usage

The landing page of the app shows the available symbols to choose from. Neither one is selected to begin with, and therefore the chart is empty, and not charting any data.

When a symbol is selected, after a short delay, you should start to see the average price of the selected symbol displayed.

The Y-axis shows the average price.
The X-axes shows a simple HOUR:MINUTES label.

The chart is designed to gather upto 25 data points, after which data points to the left begin shifting off the chart, as new datapoints are added on the right.

## Meta

Developed by - Siddhartha Shankar - sidshank@umich.edu