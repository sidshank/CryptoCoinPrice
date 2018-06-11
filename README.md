# Cryptocurrency coin price display - nextgen interview - Sid Shankar

## About

This is an app to display the  average price over time for two cryptocurrency pairs, ETH/BTC and EOS/BTC. The app provides a frontend that allows users to switch between the two pairs. When a certain symbol (pair) is selected, a websocket is opened to a 1-minute candlestick update stream on that symbol. The websocket is opened on the server, which then streams this data back to the client to chart.

## System Requirements and Installation

The app itself is hosted on:

**http://cryptocoinprice.meteorapp.com**

However, if you want to set it up on your own machine, you will need to:

1. Install Chocolatey
2. Install Meteor
3. Have mongodb installed on your system

Follow the instructions here: 

**https://www.meteor.com/install**

Once this is done, download the files in this repo into a folder of your choice. Then, at a terminal, navigate into the folder with the downloaded files, and type:

**meteor**

This should download all app dependencies, and startup the app on 

**http://localhost:3000**

## Usage

The landing page of the app shows the available symbols to choose from. Neither one is selected to begin with, and therefore the chart is empty, and not charting any data.

When a symbol is selected, after a short delay, you should start to see the average price of the selected symbol displayed.

The Y-axis shows the average price.
The X-axes shows a simple HOUR:MINUTES label.

The chart is designed to gather upto 25 data points, after which data points to the left begin shifting off the chart, as new data points are added on the right.

## How it works

The app was constructed using Meteor, a framework to rapidly prototype and build applications in Javascript.

### The frontend

All code relevant to the frontend lives in the "client" folder. The entry point for the client is **main.js**, and the structure of the page is defined in **main.html**. Most notably, Meteor provides the ability to define "templates" in the HTML files, which can then be injected into the page one or more times.

**main.html** defines a single template that holds, among other things:

1. A radio-button input group, to choose between two symbols. This could have also been two check boxes, because it seems reasonable to display two line-series in the same plot, but to keep it simple, you can only choose one symbol at a time.

2. A chart, to display data that the backend will push to the frontend.

**main.js** then defines a few methods on the template. Most notably:

1. *onCreated* is used to setup template properties that can be shared and accessed in code, such as event callbacks on DOM elements in the template. In this case, the template's *onCreated* method is used to setup "Mongo collections" (more on this later) that store information about coins, pushed to the frontend, from the backend, and also variables that keep track of which symbol we are currently charting.

2. *onRendered* is used to draw the HTML 5 based line chart, which can only be done once the DOM for the parent template is fully rendered on the page.

3. The frontend wraps up by setting up "change" event listeners on the radio-button group. The change event is used by the front end to, (a.) Stop observing any collections currently being observed. (b.) Make a HTTP GET request to the server, specifying the selected symbol as the resource to GET. This opens a websocket connection on the server to the binance streams, to gather data and stream it back to the frontend.

4. The server "streams" back coin information into the collection defined in the "onCreated" method (more on this in the **backend** section), and we are able to observe items being added to the collection, allowing us to then chart this data.

### The backend

**main.js** is the entry-point for the backend. This file is simple, it simply:

1. Initializes some "Mongo collections" (1 per symbol, with the same names as on the clients). See **CollectionManager.js**
2. Initializes "routes" on the server capable to responding to GET requests. See **RouteManager.js**. The server routes are triggered when the radio-button input choices change on the frontend, resulting in a HTTP GET request to the appropriate route. The HTTP GET request is handled by setting up a websocket to the appropriate WSS URL, and setting a callback to respond to every message received on the websocket. This callback just adds the data to the appropriate collection (created by **CollectionManager.js**)

### Pushing data from the backend to the frontend

The "secret sauce" here is the creation and naming of collections on the frontend and backend. When we create collections on the frontend and backend with the same name, and do a little extra leg work, Meteor uses DDP (Distributed Data Protocol) - which is essentially a client/server communication mechanism using publish/subscibe - to sync changes between collections on the client and server. 

When a coin is added into a server collection, we are able to observe this change to the collection on the client, and then respond to the change (in this case, by charting the data).

## Deployment specifics

Meteor apps can be hosted on **Galaxy** which is a PaaS for Meteor apps. 

1. Since this app uses Mongo collections, I first setup a Mongo database on a database hosting service (mLab).
2. I added the URL of my Mongo DB to my Meteor app settings.json file.
3. I deployed the app to galaxy, which gave me a URL for the app.

Some debugging, head-scratching and log parsing resulted in fixing some issues, and here we are.

## Meta

Developed by - Siddhartha Shankar - sidshank@umich.edu