import 'module-alias/register'; //must-have statement for registering typscript's path alias in node
import express from 'express';
import http from 'http';
import {Server} from "socket.io";
import logger from "@libs/logging/logger.js";
import { Chat } from '@libs/chat/Chat';
import OpenAiClient from './libs/client/open-ai/OpenAiClient';

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const chat: Chat = new Chat(new OpenAiClient('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'));

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(express.text())

app.get('/', (req, res) => {
	res.sendFile('/Users/yipeng/VoiceChatGPT/src/resource/index.html')
});

io.on('connection', (socket) => {
	logger.info(`client ${socket.id} connected\n`);

	socket.on('disconnect', ()=>{
		logger.info(`client ${socket.id} disconnected\n`)
	});

	socket.on('textMsg', async (textMsg: string) => {
		logger.info(`client ${socket.id} send a text message ${textMsg}`);
		const textReply: string = await chat.sendMessage(textMsg);
		socket.emit('textMsg', textReply);
	})
});

server.listen(3000, () => {
	logger.info('listening on *:3000');
});