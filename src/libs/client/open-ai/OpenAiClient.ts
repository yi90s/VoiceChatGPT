import { Configuration, OpenAIApi } from "openai"
import logger from "@libs/logging/logger";
import Client from "@libs/client/Client";

export default class OpenAiClient implements Client{
    private openai: OpenAIApi;

    constructor(apiKey: string){
        const configuration = new Configuration({ apiKey });
        this.openai = new OpenAIApi(configuration);
    }

    public async transcribe(audioFile: File): Promise<string>{
        try{
            const resp = await this.openai.createTranscription(audioFile, 'wisper-1');
            return resp.data.text
        }catch(err){
            logger.error(`Error transcribing audio: ${err}`);
            throw err
        }
    }
}