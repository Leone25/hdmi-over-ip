import { config } from './config.js';

import { spawn } from 'child_process';
import dgram from 'dgram'; 

var server = dgram.createSocket("udp4"); 
server.bind(config.sourcePort, '0.0.0.0', () => {
    server.setBroadcast(true)
    server.setMulticastTTL(128);
    server.addMembership(config.sourceHost);

    const ffmpeg = spawn('ffmpeg', [
        '-i',
        config.sourceUrl,
        '-c',
        'copy',
        '-bsf',
        'hevc_mp4toannexb',
        '-f',
        'hevc',
        'pipe:',
    ]);

    ffmpeg.stdout.on('data', (data) => {
        //console.log(`sent data`);
        server.send(data, 0, data.length, config.sourcePort, config.sourceHost);
    });

    ffmpeg.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });
});
