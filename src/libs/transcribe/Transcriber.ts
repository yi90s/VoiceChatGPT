// myCloudServiceTranscription.ts
import Client from '@libs/client/Client';

export default class Transcriber {
	private client: Client;

	constructor(client: Client){
		this.client = client;
	}

	public async transcribe(audioFile: Blob): Promise<string> {
		return await this.client.transcribe(audioFile);
		
	}
}
