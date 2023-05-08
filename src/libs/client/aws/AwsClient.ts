import Client from "@libs/client/Client";
import { TranscribeClient, StartTranscriptionJobCommand, LanguageCode, StartTranscriptionJobCommandOutput } from '@aws-sdk/client-transcribe';
import { S3Client, PutObjectCommand, GetObjectCommand, GetObjectCommandOutput, PutObjectCommandOutput } from '@aws-sdk/client-s3';
import path from 'path'
import { uuid } from 'uuidv4';
import logger from '@src/libs/logging/logger'
import {Readable} from 'stream'
import fs from 'fs'

export default class AwsClient implements Client{
    private static S3_BUCKET_NAME = 'voice-chat-gpt';
    private static S3_AUDIO_DIR = 'audio';
    private static S3_TRANSCRIPT_DIR = 'transcript';
    private s3Client: S3Client;
    private transClient: TranscribeClient;

    constructor(){
        //TODO: move it to configuration
        const region = 'us-east-1'

        this.s3Client = new S3Client({region: region});
        this.transClient = new TranscribeClient({region: region});
    }

    public async transcribe(audioFile: Blob): Promise<string> {
        const guid = uuid();
        const audioFileName = `${guid}.mp3`;
        const audioFileObjectKey = `${AwsClient.S3_AUDIO_DIR}/${audioFileName}`;
        const transcriptionJobName = `transcript_${guid}`;
        
        const putResp = await this.putObject(AwsClient.S3_BUCKET_NAME, audioFileObjectKey, audioFile);
        // const transResp = await this.startTranscription(this.buildS3Uri(AwsClient.S3_BUCKET_NAME,audioFileObjectKey), transcriptionJobName);
        // const getResp: GetObjectCommandOutput = await this.getObject(AwsClient.S3_BUCKET_NAME, transcriptionJobName+'.json');
        
        // if (getResp.Body){
        //     (getResp.Body as Readable).pipe(fs.createWriteStream('./test.json'));
        // }

        return '123';
    }

    
    private async putObject(bucketName: string, objectKey: string, data: Blob): Promise<PutObjectCommandOutput>{
        const params = {
            Bucket: bucketName,
            Key: objectKey,
            Body: data
        }

        const command = new PutObjectCommand(params);
        logger.info(`Sending object to ${this.buildS3Uri(bucketName, objectKey)}`);
        return await this.s3Client.send(command);
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
    
    private async startTranscription(audioS3Uri: string, transcriptionJobName: string): Promise<StartTranscriptionJobCommandOutput>{
        const params = {
            TranscriptionJobName: transcriptionJobName,
            LanguageCode: LanguageCode.EN_US,
            MediaFormat: 'mp3',
            Media: {
                MediaFileUri: audioS3Uri
            },
            OutputBucketName : AwsClient.S3_BUCKET_NAME,
            OutputKey: AwsClient.S3_TRANSCRIPT_DIR
        }
        const command = new StartTranscriptionJobCommand(params);
        logger.info(`Starting transcription ${transcriptionJobName} for audio ${audioS3Uri}}`);
        return await this.transClient.send(command);
    }

    private buildS3Uri(bucketName: string, objectKey: string){
        return `s3://${bucketName}/${objectKey}`;
    }
}