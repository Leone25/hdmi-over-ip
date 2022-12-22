import { config } from './config.js';

import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import dgram from 'dgram';

let app = express();
let server = http.Server(app);
let io = new Server(server, {
  serveClient: true,
});

app.use('/', express.static('./site'));

io.on('connection', (socket) => {
    console.log('New client connected');
    socket.on('disconnect', () => console.log('Client disconnected'));
    socket.join('video');
})

var client = dgram.createSocket('udp4');

client.on('listening', function () {
    var address = client.address();
    console.log('UDP Client listening on ' + address.address + ":" + address.port);
    client.setBroadcast(true)
    client.setMulticastTTL(128); 
    client.addMembership(config.sourceHost, address.address);
});

client.on('message', function (message, remote) {   
    io.to('video').emit('video', message);
});

client.bind(config.sourcePort, config.sourceHost);



server.listen(config.port, () => {
	console.log(`App listening on port ${config.port}`);
});
