export default interface Client{
    transcribe(audioFile: Buffer | File): Promise<string>
}