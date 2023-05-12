import { Configuration, OpenAIApi } from "openai"
import { ChatClient } from "@src/libs/chat/Chat";

export default class OpenAiClient implements ChatClient{
    private openai: OpenAIApi;

    constructor(apiKey: string){
        const configuration = new Configuration({ apiKey });
        this.openai = new OpenAIApi(configuration);
    }

    async getTextReply(message: string): Promise<string> {
        const resp = await this.openai.createChatCompletion({
            model: "text-curie-001",
            messages: [{role: "user", content: message}],
        });
        
        const reply = resp.data.choices.pop();

        if(reply && reply.message){
            return reply.message.content;   
        }

        throw EvalError('Getting empty response from OpenAI chat completion endpoint')
    }

}