import Client from "@libs/client/Client";
import { TranscribeClient, StartTranscriptionJobCommand } from '@aws-sdk/client-transcribe';
import { S3Client, PutObjectCommand, GetObjectCommand, GetObjectCommandOutput } from '@aws-sdk/client-s3';
import path from 'path'

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
        const fileName = "random";
        
        this.putObject(bucketName, fileName, audioFile);
        const transcriptS3Uri: string = await this.startTranscription(this.buildS3Uri(bucketName, fileName), 'transcript_random');

        const [bucket, ...keyParts] = transcriptS3Uri.substring(5).split('/');
        const objectKey = keyParts.join('/');
        const resp = await ((await this.getObject(bucket, objectKey)).Body?.transformToString());
        if (resp != null){
            return JSON.parse(resp).results.transcripts[0]
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

        await this.s3Client.send(command);
    }

    private async getObject(bucketName: string, objectKey: string): Promise<GetObjectCommandOutput>{
        const params = {
            Bucket: bucketName,
            Key: objectKey
        }

        const command = new GetObjectCommand(params);

        return await this.s3Client.send(command);
    }
    
    private async startTranscription(audioS3Uri: string, transcriptionJobName: string): Promise<string>{
        const outBucketName = 'voice-record-01';

        const params = {
            TranscriptionJobName: transcriptionJobName,
            IdentifyLanguage: true,
            MediaFormat: 'mp3',
            Media: {
                MediaFileUri: audioS3Uri
            },
            OutputBucketName: outBucketName
        }
        const command = new StartTranscriptionJobCommand(params);
        
        await this.transClient.send(command);
        return this.buildS3Uri(outBucketName, transcriptionJobName+'.json');
    }

    private buildS3Uri(bucketName: string, objectKey: string){
        return `s3://${bucketName}/${objectKey}`;
    }
}