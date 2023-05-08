import 'module-alias/register'; //must-have statement for registering typscript's path alias in node
import express from 'express';
import http, { STATUS_CODES } from 'http';
import {Server} from "socket.io";
import logger from "@libs/logging/logger.js";
import Transcriber from '@libs/transcribe/Transcriber.js';
import AwsClient from './libs/client/aws/AwsClient';
import { SNSClient, SubscribeCommand } from "@aws-sdk/client-sns";


const app = express();
const server = http.createServer(app);
const io = new Server(server);
const transcriber: Transcriber = new Transcriber(new AwsClient());

app.get('/', (req, res) => {
	res.sendStatus(200);
});

// const sns = new SNSClient({region: 'us-east-1'});
// const params = {
// 	Protocol: 'http',
// 	TopicArn: 'arn:aws:sns:us-east-1:488175762329:TranscriptionJobs',
// 	Endpoint: '/sns/handle-message'
// };
// const data = sns.send(new SubscribeCommand(params));
// logger.info("Successfully subscribed to SNS topic.",  data);

// app.post('/sns/handle-message', (req, res)=>{
// 	logger.info(`Received SNS message: ${JSON.stringify(req.body)}`);
// 	res.status(200);
// });

io.on('connection', (socket) => {
	logger.info(`client ${socket.id} connected\n`);

	socket.on('disconnect', ()=>{
		logger.info(`client ${socket.id} disconnected\n`)
	});

	socket.on('textMsg', (text) => {
		logger.info(`client ${socket.id} send a text message ${text}`);
	})

	socket.on('audioMsg', async (audio: Blob) => {
		logger.info(`client ${socket.id} send an audio message`);
		
		// const audioFilePath: string = await TempFile.getInstance().write(`audio#${socket.id}`, audio);
		// const file: File | null = await TempFile.getInstance().read(audioFilePath);

		if (audio !== null){
			const transcript: string = await transcriber.transcribe(audio); 
			socket.emit(transcript);
		}else{
			socket.emit('failed to process audio');
		}
	})
});

server.listen(3000, () => {
	logger.info('listening on *:3000');
});