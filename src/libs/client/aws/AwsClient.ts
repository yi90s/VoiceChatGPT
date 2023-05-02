import Client from "@libs/client/Client";
import AWS from 'aws-sdk';

export default class AwsClient implements Client{
    private s3Client: AWS.S3;
    private transClient: AWS.TranscribeService;

    constructor(accessKey: string, secretKey: string){
        const region = 'us-east-01'
        AWS.config.update({
            accessKeyId: accessKey,
            secretAccessKey: secretKey,
            region: region
          });

        this.s3Client = new AWS.S3();
        this.transClient = new AWS.TranscribeService();
    }

    public async transcribe(audioFile: Blob|ArrayBuffer): Promise<string> {
        const bucketName = 'voice-record-01';
        const fileName = "random";
        
        this.putObject(bucketName, fileName, audioFile);
        this.sendTranscription(this.buildS3Uri(bucketName, fileName));
        throw new Error("Method not implemented.");
    }

    
    private putObject(bucketName: string, objectKey: string, data: AWS.S3.Body): void{
        const params = {
            Bucket: bucketName,
            Key: objectKey,
            Body: data
        }
        this.s3Client.putObject(params);
    }

    private getObject(bucketName: string, objectKey: string): object{
        const params = {
            Bucket: bucketName,
            Key: objectKey
        }
        const object: object = this.s3Client.getObject(params);

        return object;
    }
    
    private sendTranscription(s3Uri: string): void{

        const params = {
            TranscriptionJobName: 'my-transcription-job',
            LanguageCode: 'en-US',
            MediaFormat: 'mp3',
            Media: {
                MediaFileUri: s3Uri
            },
            OutputBucketName: 'voice-record-01'
        }

        const resp = this.transClient.startTranscriptionJob(params);

        return ;
    }

    private buildS3Uri(bucketName: string, objectKey: string){
        return `s3://${bucketName}/${objectKey}`;
    }
}