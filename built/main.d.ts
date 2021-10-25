export declare class File {
    constructor(Filename: string, Key: Array<string>);
    Filename: string;
    Key: Array<string>;
    Data: Array<Array<string>>;
    setKey(input: Array<string>): void;
    push(input: Array<string>): File;
}
export declare const publish: (input: Array<File>, outputFile?: string, tempDirPrefix?: string) => void;
