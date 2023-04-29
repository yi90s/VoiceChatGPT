// Import required AWS SDK clients and commands for Node.js.
import { PutObjectCommand, GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import {logger} from "../logging/logger.js";
import path from 'path'

// Set the AWS Region.
const REGION = "us-east-1"; //e.g. "us-east-1"
// Create an Amazon S3 service client object.
const s3Client = new S3Client({ region: REGION });

function getUri(bucketName, key){
    return `s3://${bucketName}/${key}`;
}

export async function put(binary, filename, ext){
    var param = {
        Bucket: 'voice-record-01',
        Key: path.join(filename, ext),
        Body: binary
    }
    const res = await s3Client.send(new PutObjectCommand(param))

    logger.info(`send object#${param.Key} to Bucket:${param.Bucket}`)

    return {'uri':getUri(param.Bucket,param.Key)};
}

export async function get(bucketName, key){
    var param = {
        Bucket: bucketName,
        Key: key
    }

    const response = await s3Client.send(new GetObjectCommand(param));

    const objectContent = response.Body.toString('utf-8');
    console.log('Object content:', objectContent);
}

