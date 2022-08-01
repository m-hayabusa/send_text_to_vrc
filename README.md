# send_text_to_vrc

## これは
VRChatへ文字列と画像をまとめて動画に載せて送るためのライブラリです
[m-hayabusa/VRC_get_text_from_video](https://github.com/m-hayabusa/VRC_get_text_from_video) と組み合わせて使います
[m-hayabusa/send_text_to_vrc_example](https://github.com/m-hayabusa/send_text_to_vrc_example) あたりを参考にしてください

```
$ sudo apt install ffmpeg
$ yarn add https://github.com/m-hayabusa/send_text_to_vrc.git
```

```javascript
import * as send_text_to_vrc from "send_text_to_vrc";

const files = [];

const table = new send_text_to_vrc.File("list", ["name", "comment"]);
table.push(["エビフライ", "1つ"]);
table.push(["卵", "1パック"]);
files.push(table);

const images = new send_text_to_vrc.Images("img");
images.push("エビフライの画像", "./ebifly.png");
images.push("卵の画像", "./egg.png");
files.push(images);

send_text_to_vrc.publish(files, "./kaimonolist.webm");
// この後、生成された kaimonolist.webm をhttp経由でアクセスできるようにする必要があります
```
