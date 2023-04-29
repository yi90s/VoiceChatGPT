import express from 'express';
import http from 'http';
import {Server} from "socket.io";
import * as sessions from "./libs/session/session.js";
import {logger} from "./libs/logging/logger.js";
import {transcribe} from "./libs/transcribe/transcribe.js"

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.get('/', (req, res) => {
	res.sendFile('C:/Users/wd976609/VoiceChatGPT/index.html');
});

io.on('connection', (socket) => {
	sessions.create(socket.id)
	logger.info(`client ${socket.id} connected\n`);

	socket.on('disconnect', ()=>{
		sessions.remove(socket.id);
		logger.info(`client ${socket.id} disconnected\n`)
	});

	socket.on('textMsg', (text) => {
		logger.info(`client ${socket.id} send a text message ${text}`);
	})

	socket.on('audioMsg', (audio) => {
		logger.info(`client ${socket.id} send an audio message`);
		transcribe(audio, socket.id);
	})
});

server.listen(3000, () => {
	logger.info('listening on *:3000');
});