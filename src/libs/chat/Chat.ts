import logger from "@libs/logging/logger";

export interface ChatClient{
    getTextReply(message: string): Promise<string>
}

export class Chat{
    private client: ChatClient;

    constructor(client: ChatClient){
        this.client = client;
    }

    public async sendMessage(message: string): Promise<string>{
        logger.info(`Sending chat message "${message}"`);
        
        const reply: string = await this.client.getTextReply(message);
        return reply;
    }
}