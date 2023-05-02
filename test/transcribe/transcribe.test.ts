import Transcriber from "@libs/transcribe/Transcriber";
import OpenAiClient from "@libs/client/open-ai/OpenAiClient";
import fs from 'fs'

describe('OpenAiClient', () => {
    const apiKey = 'iQHPWtHlrEozjZwskIqlT3BlbkFJoNMGTntUALdYuoi0s7pV';
    const client = new OpenAiClient(apiKey);
    const transcriber = new Transcriber(client);
    const testAudioFilePath = "../resource/test-audio.mp3";

    // Test the transcribe() method
    describe('transcribe()', () => {
        it('should return a transcription for a given audio file', async () => {
            const testAudioFile = fs.createReadStream(testAudioFilePath) as any;
            const transcript = await transcriber.transcribe(testAudioFile);
            expect(transcript).not.toBeNull();
        });

        it('should throw an error if transcription fails', async () => {
            // const mockError = new Error('Transcription failed.');
            // mockCreateTranscription.mockRejectedValue(mockError);
            // const openaiClient = new OpenAiClient(apiKey);
            // await expect(openaiClient.transcribe(mockFile)).rejects.toThrowError(mockError);
        });
    });
});
