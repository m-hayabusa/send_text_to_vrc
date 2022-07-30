export declare class File {
    constructor(Filename: string, Key: Array<string>);
    Filename: string;
    Key: Array<string>;
    Data: Array<Array<string>>;
    setKey(input: Array<string>): void;
    push(input: Array<string>): File;
}
export declare class Images {
    constructor(filename: string);
    private filename;
    private file;
    push(fileName: string, filePath: string): void;
    publish(tempDir: string, offset: number): {
        file: File;
        nextOffset: number;
    };
}
export declare const publish: (input: Array<File | Images>, outputFile?: string, tempDirPrefix?: string) => Promise<void>;
