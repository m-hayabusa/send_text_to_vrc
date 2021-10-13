import sharp from "sharp";
import ffmpeg from 'fluent-ffmpeg';

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

const NUL = String.fromCharCode(0);
const FS = String.fromCharCode(28);
const GS = String.fromCharCode(29);
const RS = String.fromCharCode(30);
const US = String.fromCharCode(31);

export const publish = function (input: Array<File>, output: string = "output.webm"): void {
    let str: string = "";

    input.forEach(file => {
        str += file.Filename + RS;
        str += file.Data.length + RS;
        str += file.Key.join(US) + RS;
        str += GS // ここまでヘッダ
        file.Data.forEach(row => {
            str += row.join(US) + RS;
        });
        str += FS;
    });
    str += NUL;

    console.log(str);

    sharp({
        create: {
            width: 256,
            height: 256,
            channels: 3,
            background: { r: 255, g: 255, b: 255 }
        }
    }).raw().toBuffer((err, data, info) => {
        let pixArray = new Uint8ClampedArray(data.buffer);

        for (let i = 0; i < str.length; i++) {
            let char = str.charCodeAt(i);

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

        sharp(pixArray, { raw: { width: 256, height: 256, channels: 3 } })
            .rotate(-90)
            .resize({ width: 1024, height: 1024, kernel: sharp.kernel.nearest })
            .png().toFile("./0000.png")
            .then(() => {
                ffmpeg()
                    .addInput("%04d.png")
                    .loop(1)
                    .videoCodec("libvpx")
                    .videoBitrate(10000)
                    .fpsOutput(1)
                    .duration(1)
                    .saveToFile(output);
            });
    });
}