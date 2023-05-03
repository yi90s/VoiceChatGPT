export default interface Client{
    transcribe(audioFile: Blob): Promise<string>
}