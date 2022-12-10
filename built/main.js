"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.publish = exports.Images = exports.File = void 0;
const sharp_1 = __importDefault(require("sharp"));
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const fs_1 = __importDefault(require("fs"));
class File {
    constructor(Filename, Key) {
        this.Filename = "";
        this.Key = [];
        this.Data = [];
        this.Filename = Filename;
        this.Key = Key;
    }
    setKey(input) {
        this.Key = input;
    }
    push(input) {
        if (input.length == this.Key.length) {
            this.Data.push(input);
        }
        else
            throw Error("データとヘッダでながさがちがう");
        return this;
    }
}
exports.File = File;
class Images {
    constructor(filename) {
        // private file: File;
        this.file = [];
        this.filename = filename;
    }
    push(fileName, filePath) {
        this.file.push({ fileName: fileName, filePath: filePath });
        // this.fileList.push(filePath);
    }
    // private fileList: Array<string> = [];
    publish(tempDir, offset) {
        return __awaiter(this, void 0, void 0, function* () {
            const promises = [];
            const res = new File(this.filename, ["filename", "frame", "height", "width"]);
            for (let i = 0; i < this.file.length; i++) {
                const file = (0, sharp_1.default)(this.file[i].filePath);
                const metadata = yield file.metadata();
                res.push([this.file[i].fileName, (-i - offset).toFixed(), `${metadata.height}`, `${metadata.width}`]);
                promises.push(file
                    .resize({ width: 1024, height: 1024, fit: "fill" })
                    .png().toFile(tempDir + "/" + ("0000" + (9999 - i - offset).toString()).slice(-4) + ".png"));
            }
            yield Promise.all(promises);
            return {
                file: res,
                nextOffset: (offset + this.file.length + 1)
            };
        });
    }
}
exports.Images = Images;
const NUL = String.fromCharCode(0);
const FS = String.fromCharCode(28);
const GS = String.fromCharCode(29);
const RS = String.fromCharCode(30);
const US = String.fromCharCode(31);
const publish = function (input, outputFile = "output.webm", tempDirPrefix = "/tmp/st2vrc") {
    return __awaiter(this, void 0, void 0, function* () {
        const tempDir = fs_1.default.mkdtempSync(tempDirPrefix);
        let str = "";
        let promises = [];
        let imageOffset = 0;
        for (let i = 0; input.length > i; i++) {
            let file = input[i];
            if (file instanceof Images) {
                let t = yield file.publish(tempDir, imageOffset);
                file = t.file;
                imageOffset = t.nextOffset;
            }
            str += file.Filename + RS;
            str += file.Data.length + RS;
            str += file.Key.join(US) + RS;
            str += GS; // ここまでヘッダ
            file.Data.forEach(row => {
                str += row.join(US) + RS;
            });
            str += FS;
        }
        str += NUL;
        if (process.env.NODE_ENV && process.env.NODE_ENV === "development") {
            console.log(str
                .replace(/\n/g, "\\n")
                .replace(new RegExp(FS, 'g'), '\n========================================\n')
                .replace(new RegExp(GS, 'g'), '\n----------------------------------------\n')
                .replace(new RegExp(RS, 'g'), '\n')
                .replace(new RegExp(US, 'g'), ' | '));
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
            promises.push((0, sharp_1.default)(pixArray, { raw: { width: 256, height: 256, channels: 3 } })
                .rotate(-90)
                .resize({ width: 1024, height: 1024, kernel: sharp_1.default.kernel.nearest })
                .png().toFile(tempDir + "/" + ("0000" + pageIttr.toString()).slice(-4) + ".png"));
        }
        return new Promise((resolve, reject) => {
            Promise.all(promises).then(() => {
                (0, fluent_ffmpeg_1.default)()
                    .addInput(tempDir + "/%*.png")
                    .fpsInput(1)
                    .videoCodec("libvpx")
                    .videoBitrate(10000)
                    .fpsOutput(1)
                    .saveToFile(outputFile)
                    .on('end', () => {
                    fs_1.default.rmSync(tempDir, { recursive: true });
                    resolve();
                })
                    .on('error', (err) => {
                    reject(err);
                });
            }).catch((e) => {
                reject(e);
            });
        });
    });
};
exports.publish = publish;
