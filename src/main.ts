import sharp from "sharp";
import ffmpeg from 'fluent-ffmpeg';
import fs from "fs";

export type FileLike = File | Images;

export class File {
    constructor(Filename: string, Key: Array<string>) {
        this.Filename = Filename;
        this.Key = Key;
    }

    Filename: string = "";
    Key: Array<string> = [];
    Data: Array<Array<string>> = [];

    setKey(input: Array<string>): void {
        this.Key = input;
    }

    push(input: Array<string>): File {
        if (input.length == this.Key.length) {
            this.Data.push(input);
        } else
            throw Error("データとヘッダでながさがちがう");
        return this;
    }
}

export class Images {
    constructor(filename: string) {
        this.filename = filename;
    }

    private filename: string;

    // private file: File;
    private file: Array<{ fileName: string, filePath: string }> = [];

    push(fileName: string, filePath: string) {
        this.file.push({ fileName: fileName, filePath: filePath });
        // this.fileList.push(filePath);
    }

    // private fileList: Array<string> = [];

    async publish(tempDir: string, offset: number) {
        const promises: Array<Promise<any>> = [];

        const res = new File(this.filename, ["filename", "frame", "height", "width"]);

        for (let i = 0; i < this.file.length; i++) {
            const file = sharp(this.file[i].filePath);
            const metadata = await file.metadata();

            res.push([this.file[i].fileName, (-i - offset).toFixed(), `${metadata.height}`, `${metadata.width}`]);

            promises.push(file
                .resize({ width: 1024, height: 1024, fit: "fill" })
                .png().toFile(tempDir + "/" + ("0000" + (9999 - i - offset).toString()).slice(-4) + ".png"));
        }

        await Promise.all(promises);

        return {
            file: res,
            nextOffset: (offset + this.file.length + 1)
        };
    }
}

const NUL = String.fromCharCode(0);
const FS = String.fromCharCode(28);
const GS = String.fromCharCode(29);
const RS = String.fromCharCode(30);
const US = String.fromCharCode(31);

export const publish = async function (input: Array<FileLike>, outputFile: string = "output.webm", tempDirPrefix: string = "/tmp/st2vrc"): Promise<void> {
    const tempDir = fs.mkdtempSync(tempDirPrefix);
    let str: string = "";
    let promises: Array<Promise<any>> = [];
    let imageOffset = 0;

    for (let i = 0; input.length > i; i++) {
        let file = input[i];
        if (file instanceof Images) {
            let t = await file.publish(tempDir, imageOffset);
            file = t.file;
            imageOffset = t.nextOffset;
        }
        str += file.Filename + RS;
        str += file.Data.length + RS;
        str += file.Key.join(US) + RS;
        str += GS // ここまでヘッダ
        file.Data.forEach(row => {
            str += row.join(US) + RS;
        });
        str += FS;
    }

    str += NUL;

    if (process.env.NODE_ENV && process.env.NODE_ENV === "development") {
        console.log(
            str
                .replace(/\n/g, "\\n")
                .replace(new RegExp(FS, 'g'), '\n========================================\n')
                .replace(new RegExp(GS, 'g'), '\n----------------------------------------\n')
                .replace(new RegExp(RS, 'g'), '\n')
                .replace(new RegExp(US, 'g'), ' | ')
        )
    }

    const pageCnt = Math.ceil(str.length * 2 / (256 * 256));

    for (let pageIttr = 0; pageIttr < pageCnt; pageIttr++) {
        let pixArray = new Uint8ClampedArray(256 * 256 * 3);
        pixArray.fill(255);

        for (let i = 0; i * 2 < 256 * 256 && (i + 256 * 256 / 2 * pageIttr) < str.length; i++) {
            let char = str.charCodeAt(i + 256 * 256 / 2 * pageIttr);

            for (let j = 0; j < 2; j++) {
                let tmp;

                if (j % 2 == 1)
                    tmp = char & 0x00FF;
                else
                    tmp = (char & 0xFF00) >> 8;

                // R
                if (((tmp >> 0) & 0b111) == 0b000)
                    pixArray[i * 6 + j * 3 + 0] = (0.125 - 0.0625) * 256;
                else if (((tmp >> 0) & 0b111) == 0b001)
                    pixArray[i * 6 + j * 3 + 0] = (0.250 - 0.0625) * 256;
                else if (((tmp >> 0) & 0b111) == 0b010)
                    pixArray[i * 6 + j * 3 + 0] = (0.375 - 0.0625) * 256;
                else if (((tmp >> 0) & 0b111) == 0b011)
                    pixArray[i * 6 + j * 3 + 0] = (0.500 - 0.0625) * 256;
                else if (((tmp >> 0) & 0b111) == 0b100)
                    pixArray[i * 6 + j * 3 + 0] = (0.625 - 0.0625) * 256;
                else if (((tmp >> 0) & 0b111) == 0b101)
                    pixArray[i * 6 + j * 3 + 0] = (0.750 - 0.0625) * 256;
                else if (((tmp >> 0) & 0b111) == 0b110)
                    pixArray[i * 6 + j * 3 + 0] = (0.875 - 0.0625) * 256;
                else if (((tmp >> 0) & 0b111) == 0b111)
                    pixArray[i * 6 + j * 3 + 0] = (1.000) * 256;

                // G
                if (((tmp >> 3) & 0b111) == 0b000)
                    pixArray[i * 6 + j * 3 + 1] = (0.125 - 0.0625) * 256;
                else if (((tmp >> 3) & 0b111) == 0b001)
                    pixArray[i * 6 + j * 3 + 1] = (0.250 - 0.0625) * 256;
                else if (((tmp >> 3) & 0b111) == 0b010)
                    pixArray[i * 6 + j * 3 + 1] = (0.375 - 0.0625) * 256;
                else if (((tmp >> 3) & 0b111) == 0b011)
                    pixArray[i * 6 + j * 3 + 1] = (0.500 - 0.0625) * 256;
                else if (((tmp >> 3) & 0b111) == 0b100)
                    pixArray[i * 6 + j * 3 + 1] = (0.625 - 0.0625) * 256;
                else if (((tmp >> 3) & 0b111) == 0b101)
                    pixArray[i * 6 + j * 3 + 1] = (0.750 - 0.0625) * 256;
                else if (((tmp >> 3) & 0b111) == 0b110)
                    pixArray[i * 6 + j * 3 + 1] = (0.875 - 0.0625) * 256;
                else if (((tmp >> 3) & 0b111) == 0b111)
                    pixArray[i * 6 + j * 3 + 1] = (1.000) * 256;

                // B
                if (((tmp >> 6) & 0b11) == 0b00)
                    pixArray[i * 6 + j * 3 + 2] = (0.125 - 0.0625) * 256;
                else if (((tmp >> 6) & 0b11) == 0b01)
                    pixArray[i * 6 + j * 3 + 2] = (0.250 - 0.0625) * 256;
                else if (((tmp >> 6) & 0b11) == 0b10)
                    pixArray[i * 6 + j * 3 + 2] = (0.375 - 0.0625) * 256;
                else if (((tmp >> 6) & 0b11) == 0b11)
                    pixArray[i * 6 + j * 3 + 2] = (0.500 - 0.0625) * 256;
                else if (((tmp >> 6) & 0b11) == 0b00)
                    pixArray[i * 6 + j * 3 + 2] = (0.625 - 0.0625) * 256;
                else if (((tmp >> 6) & 0b11) == 0b01)
                    pixArray[i * 6 + j * 3 + 2] = (0.750 - 0.0625) * 256;
                else if (((tmp >> 6) & 0b11) == 0b10)
                    pixArray[i * 6 + j * 3 + 2] = (0.875 - 0.0625) * 256;
                else if (((tmp >> 6) & 0b11) == 0b11)
                    pixArray[i * 6 + j * 3 + 2] = (1.000) * 256;
            }
        }

        promises.push(sharp(pixArray, { raw: { width: 256, height: 256, channels: 3 } })
            .rotate(-90)
            .resize({ width: 1024, height: 1024, kernel: sharp.kernel.nearest })
            .png().toFile(tempDir + "/" + ("0000" + pageIttr.toString()).slice(-4) + ".png")
        );
    }

    return new Promise<void>((resolve, reject) => {
        Promise.all(promises).then(() => {
            ffmpeg()
                .addInput(tempDir + "/%*.png")
                .fpsInput(1)
                .videoCodec("libvpx")
                .videoBitrate(10000)
                .fpsOutput(1)
                .saveToFile(outputFile)
                .on('end', () => {
                    fs.rmSync(tempDir, { recursive: true });
                    resolve();
                })
                .on('error', (err) => {
                    reject(err);
                })
        }).catch((e) => {
            reject(e);
        })
    });
}