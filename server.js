var express = require('express');
var sys = require("sys");
var util = require('util');
var io = require("socket.io");


app = express.createServer();

app.listen(8080);


app.configure(function(){
    app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});


var socket = io.listen(app);
var players = {};
var ball = { x:100, y:300, angle: 0.5, speed: 10 };
var event_buffer = {};
var time;

socket.on('connection', function(client) {
  client.send({ init_data: { your_id: client.sessionId, ball: ball, server_time: new Date().getTime() } });

  client.on('message', function(message){
    event_buffer[message.my_id] = message.the_event;
  });

  client.on('disconnect', function(){ sys.puts("client disconnected"); });
});
var count=0;
var time = new Date().getTime();
setInterval(function() {
    // this is basically: if event_buffer is not empty:
    for (i in event_buffer) {
        socket.broadcast({
            time: new Date().getTime(), 
            events: event_buffer
        });
        event_buffer = {};
        break;
    }
    count = count +1;
    console.log(count + "   " + (new Date().getTime() - time)/50);
}, 50);
