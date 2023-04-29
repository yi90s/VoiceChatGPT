// Import the required AWS SDK clients and commands for Node.js
import { StartTranscriptionJobCommand, TranscribeClient } from "@aws-sdk/client-transcribe";
import datastore  from "../storage/datastore.js"
import { logger } from "../logging/logger.js"

// Set the AWS Region.
const REGION = "us-east-1"; //e.g. "us-east-1"
// Create an Amazon Transcribe service client object.
const transcribeClient = new TranscribeClient({ region: REGION });

export async function transcribe(audio, sessionId) {
	const audioFormat = 'mp3'
	var response = await datastore.put(audio, `audio_${sessionId}`, audioFormat)

	var params = {
		TranscriptionJobName: `transcript_${sessionId}`,
		LanguageCode: "en-US", 
		MediaFormat: audioFormat, 
		Media: {
			MediaFileUri: response.uri,
		},
		OutputBucketName: "voice-record-01"
	} 
	
	response = await transcribeClient.send(
		new StartTranscriptionJobCommand(params)
	);

	logger.info(`sent transcribe job#${response.TranscriptionJobName}`)

}
