import 'module-alias/register'; //must-have statement for registering typscript's path alias in node
import express from 'express';
import http from 'http';
import {Server} from "socket.io";
import logger from "@libs/logging/logger.js";
import Transcriber from '@libs/transcribe/Transcriber.js';
import OpenAiClient from '@libs/client/open-ai/OpenAiClient.js';
import TempFile from './libs/storage/TempFile';
import fs from "fs"

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const transcriber: Transcriber = new Transcriber(new OpenAiClient('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'));

app.get('/', (req, res) => {
	res.sendFile('C:/Users/wd976609/VoiceChatGPT/index.html');
});

io.on('connection', (socket) => {
	logger.info(`client ${socket.id} connected\n`);

	socket.on('disconnect', ()=>{
		logger.info(`client ${socket.id} disconnected\n`)
	});

	socket.on('textMsg', (text) => {
		logger.info(`client ${socket.id} send a text message ${text}`);
	})

	socket.on('audioMsg', async (audio: Buffer) => {
		logger.info(`client ${socket.id} send an audio message`);
		
		const audioFilePath: string = await TempFile.getInstance().write(`audio#${socket.id}`, audio);
		// const file: File | null = await TempFile.getInstance().read(audioFilePath);

		if (audioFilePath !== null){
			const transcript: string = await transcriber.transcribe(fs.createReadStream(audioFilePath) as any); 
			socket.emit(transcript);
		}else{
			socket.emit('failed to process audio');
		}
	})
});

server.listen(3000, () => {
	logger.info('listening on *:3000');
});