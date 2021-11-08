# send_text_to_vrc

## これは
VRChatへ文字列を動画に載せて送るためのライブラリです
[m-hayabusa/VRC_get_text_from_video](https://github.com/m-hayabusa/VRC_get_text_from_video) と組み合わせて使います
[m-hayabusa/send_text_to_vrc_example](https://github.com/m-hayabusa/send_text_to_vrc_example) あたりを参考にしてください

```
$ sudo apt install ffmpeg
$ yarn add https://github.com/m-hayabusa/send_text_to_vrc.git
```

```javascript
import * as send_text_to_vrc from "send_text_to_vrc";
const files = [];
const file = new send_text_to_vrc.File("買い物リスト", ["name", "comment"]);
file.push(["エビフライ", "1つ"]);
file.push(["卵", "1パック"]);
files.push(file);
send_text_to_vrc.publish(files, "./output.webm");
```
