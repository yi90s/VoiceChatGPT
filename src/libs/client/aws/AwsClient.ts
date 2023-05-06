import Client from "@libs/client/Client";
import { TranscribeClient, StartTranscriptionJobCommand, LanguageCode } from '@aws-sdk/client-transcribe';
import { S3Client, PutObjectCommand, GetObjectCommand, GetObjectCommandOutput } from '@aws-sdk/client-s3';
import path from 'path'
import { uuid } from 'uuidv4';
import logger from '@src/libs/logging/logger'
import { log } from "winston";

export default class AwsClient implements Client{
    private s3Client: S3Client;
    private transClient: TranscribeClient;

    constructor(){
        const region = 'us-east-1'

        this.s3Client = new S3Client({region: region});
        this.transClient = new TranscribeClient({region: region});
    }

    public async transcribe(audioFile: Blob): Promise<string> {
        const bucketName = 'voice-record-01';
        const guid = uuid();
        const audioFileName = `audio_${guid}.mp3`;
        const transcriptionJobName = `transcript_${guid}`;
        
        await this.putObject(bucketName, audioFileName, audioFile);
        const transcriptS3Uri: string = await this.startTranscription('s3://voice-record-01/audio_8d2f1680-ae6b-41d8-98d8-d3882e19699f.mp3', transcriptionJobName);

        const [bucket, ...keyParts] = transcriptS3Uri.substring(5).split('/');
        const objectKey = keyParts.join('/');
        const resp: GetObjectCommandOutput = await this.getObject(bucket, objectKey);
        
        if (resp.Body){
            const transcriptResp = JSON.parse(resp.Body.toString());
            return transcriptResp.results.transcripts[0]
        }

        throw new Error("Method not implemented.");
    }

    
    private async putObject(bucketName: string, objectKey: string, data: Blob): Promise<void>{
        const params = {
            Bucket: bucketName,
            Key: objectKey,
            Body: data
        }

        const command = new PutObjectCommand(params);
        logger.info(`Sending object to ${this.buildS3Uri(bucketName, objectKey)}`);
        await this.s3Client.send(command);
    }

    private async getObject(bucketName: string, objectKey: string): Promise<GetObjectCommandOutput>{
        const params = {
            Bucket: bucketName,
            Key: objectKey
        }

        const command = new GetObjectCommand(params);
        logger.info(`Getting object from ${this.buildS3Uri(bucketName, objectKey)}`);
        return await this.s3Client.send(command);
    }
    
    private async startTranscription(audioS3Uri: string, transcriptionJobName: string): Promise<string>{
        const outBucketName = 'voice-record-01';

        const params = {
            TranscriptionJobName: transcriptionJobName,
            LanguageCode: LanguageCode.EN_US,
            MediaFormat: 'mp3',
            Media: {
                MediaFileUri: audioS3Uri
            },
            OutputBucketName: outBucketName
        }
        const command = new StartTranscriptionJobCommand(params);
        logger.info(`Starting transcription ${transcriptionJobName} for audio ${audioS3Uri}}`);
        await this.transClient.send(command);
        
        return this.buildS3Uri(outBucketName, transcriptionJobName+'.json');
    }

    private buildS3Uri(bucketName: string, objectKey: string){
        return `s3://${bucketName}/${objectKey}`;
    }
}