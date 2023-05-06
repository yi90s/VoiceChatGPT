/* eslint-disable @typescript-eslint/no-var-requires */
import { S3Client, GetObjectCommand, GetObjectCommandOutput } from "@aws-sdk/client-s3";
import { Response } from "aws-sdk";
import {createWriteStream} from 'fs'
import {Readable} from 'stream'

const region = 'us-east-1'

const s3Client = new S3Client({region: region});


function getObject(bucketName: string, objectKey: string){
    const params = {
        Bucket: bucketName,
        Key: objectKey
    }

    const command = new GetObjectCommand(params);
    return s3Client.send(command);
}

const resp = getObject('voice-record-01', 'transcript_be94e383-f77b-4964-a6d8-acb85e2a76b4.json');

resp.then()

