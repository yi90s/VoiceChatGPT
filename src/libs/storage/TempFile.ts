/* eslint-disable @typescript-eslint/no-empty-function */
import {promises as fs} from 'fs'
import os from 'os'
import path from 'path'
import logger from '@libs/logging/logger';


class TempFile{
    private readonly tempDir: string = os.tmpdir();
    private static instance: TempFile;

    private constructor(){}

    public static getInstance(): TempFile{
        if(this.instance == null){
            this.instance = new TempFile()
        }
        return this.instance;
    }
    
    public async write(fileName: string, buff: Buffer): Promise<string>{
        const destPath: string = path.join(this.tempDir, fileName);

        try{
            await fs.writeFile(destPath, buff);
        }catch(err){
            logger.error(`Error writing to temp file: ${destPath}`);
            throw err;
        }

        return destPath;
    }

    public async read(filePath: string): Promise<File | null>{
        const fullPath = path.resolve(filePath);
        let fileData: Buffer;

        try{
            fileData = await fs.readFile(fullPath);
        }catch(err){
            logger.error(`Error reading temp file: ${err}`);
            return null;
    }
    
        return new File([fileData], path.basename(fullPath));
    }
}

export default TempFile;