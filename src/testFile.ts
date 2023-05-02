/* eslint-disable @typescript-eslint/no-var-requires */
import "module-alias/register";
import fs from 'fs'
import Transcriber  from '@libs/transcribe/Transcriber';
import OpenAiClient from '@libs/client/open-ai/OpenAiClient';

const trans: Transcriber = new Transcriber(new OpenAiClient('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'));

const file: File = fs.createReadStream('./test/resource/test-audio.mp3') as any;
// const transcript: string = trans.transcribe(file);

// console.log(transcript);