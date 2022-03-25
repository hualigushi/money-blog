## 什么是 Web Audio Api

首先引用一下 MDN 上对 Web Audio Api 的一段描述：

> The Web Audio API involves handling audio operations inside an audio context, and has been designed to allow modular routing. Basic audio operations are performed with audio nodes, which are linked together to form an audio routing graph.

大致的意思就是 Web Audio API 需要在音频上下文中处理音频的操作，并具有模块化路由的特点。基本的音频操作是通过音频节点来执行的，这些音频节点被连接在一起形成音频路由图。

我们可以从上面这段文字中提取出几个关键词：

- **音频上下文**
- **音频节点**
- **模块化**
- **音频图**

### 音频上下文(AudioContext)

音频中的 `AudioContext` 可以类比于 `canvas` 中的 `context`，其中包含了一系列用来处理音频的 `API`，简而言之，就是可以用来控制音频的各种行为，比如播放、暂停、音量大小等等等等。创建音频的 `context` 比创建 `canvas` 的 `context` 简单多了（考虑代码的简洁性，下面代码都不考虑浏览器的兼容情况）：

```
const audioContext = new AudioContext();
```

在继续了解 `AudioContext` 之前，我们先来回顾一下，平时我们是如何播放音频的：

```
<audio autoplay src="path/to/music.mp3"></audio>
```

或者：

```
const audio = new Audio();
audio.autoplay = true;
audio.src = 'path/to/music.mp3';
```

没错，非常简单的几行代码就实现了音频的播放，但是这种方式播放的音频，只能控制播放、暂停等等一些简单的操作。但是如果我们想要控制音频更「高级」的属性呢，比如声道的合并与分割、混响、音调、声相控制和音频振幅压缩等等，可以做到吗？答案当然是肯定的，一切都基于 `AudioContext`。我们以最简单的栗子来了解一下 `AudioContext` 的用法：

```
<!DOCTYPE html>
<html>
<head>
    <title>audio</title>
</head>
<body>
    <button id="play">PLAY</button>
    <script type="text/javascript">
        const URL = 'demo.m4a';
        const audioContext = new AudioContext();
        const playAudio = async function (buffer) {
            const source = audioContext.createBufferSource();
            console.log(source instanceof AudioNode);
            source.buffer = buffer;
            source.connect(audioContext.destination);
            source.start();
        };
        const getBuffer = function (url) {
            const request = new XMLHttpRequest();
            return new Promise((resolve, reject) => {
                request.open('GET', url, true);
                request.responseType = 'arraybuffer';
                request.onload = () => {
                    audioContext.decodeAudioData(request.response, buffer => buffer ? resolve(buffer) :
                        reject('decoding error'));
                };
                request.onerror = error => reject(error);
                request.send();
            });
        };
        async function play() {
            const buffer = await getBuffer(URL);
            buffer && playAudio(buffer);
        }
        window.addEventListener('click',function () {
            play()
        })
    </script>
</body>
</html>
```

- 通过 `ajax` 把音频数据请求下来；
- 通过 `audioContext.decodeAudioData()` 方法把音频数据转换成我们所需要的 `buffer` 格式；
- 通过 `playAudio()` 方法把音频播放出来。

达到效果和刚刚提到的播放音频的方式一毛一样。这里需要重点讲一下 `playAudio` 这个函数，我提取出了三个关键点：

- `source`
- `connect`
- `destination`

你可以试着以这种方式来理解这三个关键点：首先我们通过 `audioContext.createBufferSource()` 方法创建了一个「容器」 `source` 并装入接收进来的「水」 `buffer`；其次通过「管道」 `connect` 把它和「出口」 `destination` 连接起来；最终「出口」 `destination` 「流」出来的就是我们所听到的音频了。

![img](https://mmbiz.qpic.cn/mmbiz_png/c2icHwgzmCGzwblaw8lxCN5aMIDLa44JNElhFmiaFicqOro7I7WHMVFPxjMwzEhefsPNBebLCbfyVJgBSTk8d1SmQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

**重点理解这三个关键点的关系**。

**注意：Audio 和 Web Audio 是不一样的，它们之间的关系大概像这样：**

![img](https://mmbiz.qpic.cn/mmbiz_png/c2icHwgzmCGzwblaw8lxCN5aMIDLa44JNWF4CAiaK3LoWfm9mdgwrnYdhZN11sc4aT4ibqsBgxzPC3dCzSqldQqLQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

**Audio:**

- 简单的音频播放器；
- 「单线程」的音频；

**Web Audio:**

- 音频合成；
- 可以做音频的各种处理；
- 游戏或可交互应用中的环绕音效；
- 可视化音频等等等等。

### 音频节点(AudioNode)

那么什么是音频节点呢？可以把它理解为是通过「管道」 `connect` 连接在「容器」 `source`和「出口」 `destination` 之间一系列的音频「处理器」。 `AudioContext` 提供了许多「处理器」用来处理音频，比如音量「处理器」 `GainNode`、延时「处理器」 `DelayNode` 或声道合并「处理器」 `ChannelMergerNode` 等等。

前面所提到的「管道」 `connect` 也是由音频节点 `AudioNode` 提供的，所以你猜的没错，「容器」 `source` 也是一种音频节点。

```
const source = audioContext.createBufferSource();
console.log(source instanceof AudioNode); // true
```

`AudioNode` 还提供了一系列的方法和属性：

- `.context` (read only): `audioContext` 的引用
- `.channelCount`: 声道数
- `.connect()`: 连接另外一个音频节点
- `.start()`: 开始播放
- `.stop()`: 停止播放

#### GainNode

![img](https://mmbiz.qpic.cn/mmbiz_png/c2icHwgzmCGzwblaw8lxCN5aMIDLa44JNv1U6rHUxibVAEptK7CSGOLET1D8TqhHvQkUdyWL0YxNFybmFaznTW2w/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

前面有提到音频处理是通过一个个「处理器」来处理的，那么在实际应用中怎么把我们想要的「处理器」装上去呢？

```
const source = audioContext.createBufferSource();
const gainNode = audioContext.createGain();
const buffer = await getBuffer(URL);
source.buffer = buffer;
source.connect(gainNode);
gainNode.connect(source.destination);
const updateVolume = volume => gainNode.gain.value = volume;
```

可以发现和上面提到的 `playAudio` 方法很像，区别只是 `source` 不直接 connect 到 `source.destination`，而是先 connect 到 `gainNode`，然后再通过 `gainNode` connect 到 `source.destination`。这样其实就把「音量处理器」装载上去了，此时我们通过更新 `gainNode.gain.value` 的值（ `0-1` 之间）就可以控制音量的大小了。

```
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Audio</title>
   
</head>

<body>
    <div class="container">
        <button id="play">PLAY</button>
        <button id="vol">VOL</button>
    </div>
    <script>
        const MUSIC_RESOURCE_URL = 'demo2.mp3';
        const audioContext = new AudioContext();

        function getBuffer(url) {
            const request = new XMLHttpRequest();
            return new Promise((resolve, reject) => {
                request.open('GET', url, true);
                request.responseType = 'arraybuffer';
                request.onload = () => {
                    audioContext.decodeAudioData(request.response, buffer => buffer ? resolve(buffer) :
                        reject('decoding error'));
                };
                request.onerror = error => reject(error);
                request.send();
            });
        }

        function play() {
            getBuffer(MUSIC_RESOURCE_URL).then(buffer => {
                console.log(buffer);
                playAudio(buffer, audioContext);
            }).catch(error => {
                console.log('error', error);
            });

            function playAudio(buffer, audioContext) {
                const source = audioContext.createBufferSource();
                const gainNode = audioContext.createGain();
                source.buffer = buffer;
                source.loop = true;
                source.connect(gainNode);
                gainNode.connect(audioContext.destination);

                document.getElementById('vol').addEventListener('click', function (ev) {
                    gainNode.gain.value = Math.random()
                    console.log('vol', gainNode.gain.value)
                });

                console.log('source.start(0)');
                source.start(0);
            }
        }
        document.getElementById('play').addEventListener('click', function () {
            play()
        })
    </script>
</body>

</html>
```



#### BiquadFilterNode(waiting for perfection)

![img](https://mmbiz.qpic.cn/mmbiz_png/c2icHwgzmCGzwblaw8lxCN5aMIDLa44JNHVo1vYjtke2ibjbicd8h5LrwVE7E7FacetJCAqcjPVkV0QL2skjfbp3A/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

不知道怎么翻译这个「处理器」，暂且叫做低阶滤波器吧，简单来说它就是一个通过过滤音频的数字信号进而达到控制 **音调** 的音频节点。把它装上：

```
const filterNode = audioContext.createBiquadFilter();
// ...
source.connect(filterNode);
filterNode.connect(source.destination);
const updateFrequency = frequency => filterNode.frequency.value = frequency;
```

这样一来我们就可以通过 `updateFrequency()` 方法来控制音频的音调（频率）了。当然，除了 `frequency`我们还可以调整的属性还有：

- `.Q`: quality factor;
- `.type`: lowpass, highpass, bandpass, lowshelf, highshelf, peaking, notch, allpass;
- `.detune`: detuning of the frequency in cents.

```
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Audio</title>
</head>

<body>
    <div class="container">
        <button id="play">PLAY</button>
        <ul>
            <li>lowpass</li>
            <li>highpass</li>
            <li>bandpass</li>
            <li>lowshelf</li>
            <li>highshelf</li>
            <li>peaking</li>
            <li>notch</li>
            <li>allpass</li>
        </ul>
    </div>
    <script>
        const MUSIC_RESOURCE_URL = 'demo2.mp3';
        const audioContext = new AudioContext();

        function getBuffer(url) {
            const request = new XMLHttpRequest();
            return new Promise((resolve, reject) => {
                request.open('GET', url, true);
                request.responseType = 'arraybuffer';
                request.onload = () => {
                    audioContext.decodeAudioData(request.response, buffer => buffer ? resolve(buffer) :
                        reject('decoding error'));
                };
                request.onerror = error => reject(error);
                request.send();
            });
        }

        function play() {
            getBuffer(MUSIC_RESOURCE_URL).then(buffer => {
                console.log(buffer);
                playAudio(buffer, audioContext);
            }).catch(error => {
                console.log('error', error);
            });

            function playAudio(buffer, audioContext) {
                const source = audioContext.createBufferSource();
                const filter = audioContext.createBiquadFilter();

                source.buffer = buffer;
                source.connect(filter);
                filter.connect(audioContext.destination);

                source.start(0);
                document.querySelector('ul').addEventListener('click', function (e) {
                    console.log(e.path[0].innerHTML)
                      
                    filter.type = e.path[0].innerHTML
                })
            }
        }
        document.getElementById('play').addEventListener('click', function () {
            play()
        })
    </script>
</body>

</html>
```



#### PannerNode

我们可以调用 PannerNode 的 `.setPosition()` 方法来做出非常有意思的 3D 环绕音效：

```
<input type="range" name="rangeX" value="0" max="10" min="-10">
const rangeX = document.querySelector('input[name="rangeX"]');
const source = audioContext.createBufferSource();
const pannerNode = audioContext.createPanner();
source.connect(pannerNode);
pannerNode.connect(source.destination);
rangeX.addEventListener('input', () => pannerNode.setPosition(rangeX.value, 0, 0));
```

还是老方法「装上」 `PannerNode` 「处理器」，然后通过监听 `range` 控件的 `input` 事件，通过 `.setPosition()` 方法更新 **声源相对于听音者的位置**，这里我只简单的更新了声源相对于听音者的 `X` 方向上的距离，当值为负值时，声音在左边，反之则在右边。

你可以这么去理解 `PannerNode`，它把你（听音者）置身于一个四面八方都非常空旷安静的空间中，其中还有一个音响（声源），而 `.setPosition()` 方法就是用来控制 **音响** 在空间中 **相对于你（听音者）** 的位置的，所以上面这段代码可以控制声源在你左右俩耳边来回晃动（带上耳机）。

当然，对于 `PannerNode` 来说，还有许多属性可以使得 3D 环绕音效听上去更逼真，比如：

- `.distanceModel`: 控制音量变化的方式，有 3 种可能的值： `linear`, `inverse` 和 `exponential`；
- `.maxDistance`: 表示 **声源** 和 **听音者** 之间的最大距离，超出这个距离后，听音者将不再能听到声音；
- `.rolloffFactor`: 表示当 **声源** 远离 **听音者** 的时候，音量以多快的速率减小；



```
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Audio</title>
</head>

<body>
    <div class="container">
        <button id="play">PLAY</button>
        <input type="range" name="rangeX" value="0" max="10" min="-10">
    </div>
    <script>
        const MUSIC_RESOURCE_URL = 'demo2.mp3';
        const audioContext = new AudioContext();

        function getBuffer(url) {
            const request = new XMLHttpRequest();
            return new Promise((resolve, reject) => {
                request.open('GET', url, true);
                request.responseType = 'arraybuffer';
                request.onload = () => {
                    audioContext.decodeAudioData(request.response, buffer => buffer ? resolve(buffer) :
                        reject('decoding error'));
                };
                request.onerror = error => reject(error);
                request.send();
            });
        }

        function play() {
            getBuffer(MUSIC_RESOURCE_URL).then(buffer => {
                console.log(buffer);
                playAudio(buffer, audioContext);
            }).catch(error => {
                console.log('error', error);
            });

            function playAudio(buffer, audioContext) {
                const source = audioContext.createBufferSource();
                const pannerNode = audioContext.createPanner();
                source.buffer = buffer;
                source.loop = true;
                source.connect(pannerNode);
                pannerNode.connect(audioContext.destination);
                pannerNode.panningModel = 'HRTF';
                pannerNode.distanceModel = 'inverse';

                const rangeX = document.querySelector('input[name="rangeX"]');
                rangeX.addEventListener('input', () => pannerNode.setPosition(rangeX.value, 0, 0));

                source.start(0);
            }
        }
        document.getElementById('play').addEventListener('click', function () {
            play()
        })
    </script>
</body>

</html>
```



#### 多个音频源

前面有提到过，在 `AudioContext` 中可以同时使用多个「处理器」去处理一个音频源，那么多个音频源 `source` 可以同时输出吗？答案当然也是肯定的，在 `AudioContext` 中可以有多个音频处理通道，它们之间互不影响：

![img](https://mmbiz.qpic.cn/mmbiz_png/c2icHwgzmCGzwblaw8lxCN5aMIDLa44JNKlCVJ6hOPmflWpdlwvicOujxmhtNymYad3CefWXqUWonv0eJFdAQJRA/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

```
const sourceOne = audioContext.createBufferSource();
const sourceTwo = audioContext.createBufferSource();
const gainNodeOne = audioContext.createGain();
const gainNodeTwo = audioContext.createGain();
sourceOne.connect(gainNodeOne);
sourceTwo.connect(gainNodeTwo);
gainNodeOne.connect(audioContext.destination);
gainNodeTwo.connect(audioContext.destination);
```



```
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Audio</title>
</head>

<body>
    <div class="container">
        <button id="play">PLAY</button>
    </div>
    <script>
        const MUSIC_RESOURCE_URL = 'demo2.mp3';
        const MUSIC_RESOURCE_URL_TWO = 'demo.m4a';
        const audioContext = new AudioContext();

        function getBuffer(url) {
            const request = new XMLHttpRequest();
            return new Promise((resolve, reject) => {
                request.open('GET', url, true);
                request.responseType = 'arraybuffer';
                request.onload = () => {
                    audioContext.decodeAudioData(request.response, buffer => buffer ? resolve(buffer) :
                        reject('decoding error'));
                };
                request.onerror = error => reject(error);
                request.send();
            });
        }

        function play() {
            getBuffer(MUSIC_RESOURCE_URL).then(bufferOne => {
                console.log(bufferOne);
                getBuffer(MUSIC_RESOURCE_URL_TWO).then(bufferTwo => {
                    console.log(bufferTwo);
                    playAudio(bufferOne, bufferTwo)
                }).catch(error => {
                    console.log('error', error);
                });
            }).catch(error => {
                console.log('error', error);
            });

            getBuffer(MUSIC_RESOURCE_URL).then(buffer => {
                console.log(buffer);
                playAudio(buffer, audioContext);
            }).catch(error => {
                console.log('error', error);
            });

            function playAudio(bufferOne, bufferTwo) {
                const sourceOne = audioContext.createBufferSource();
                const sourceTwo = audioContext.createBufferSource();
                const gainNodeOne = audioContext.createGain();
                const gainNodeTwo = audioContext.createGain();

                sourceOne.buffer = bufferOne;
                sourceTwo.buffer = bufferTwo;

                sourceOne.connect(gainNodeOne);
                sourceTwo.connect(gainNodeTwo);
                gainNodeOne.connect(audioContext.destination);
                gainNodeTwo.connect(audioContext.destination);

                sourceOne.start();
                sourceTwo.start();
            }
        }
        document.getElementById('play').addEventListener('click', function () {
            play()
        })
    </script>
</body>

</html>
```



### 模块化(Modular)

![img](https://mmbiz.qpic.cn/mmbiz_png/c2icHwgzmCGzwblaw8lxCN5aMIDLa44JNUERt8Px1WicrUOIHufia5RZeWP6O6bJds6YDDhvmKA0IAOC7HuvxEWXA/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

通过前面 **音频节点** 的介绍，相信你们已经感受到了 Web Audio 的模块化设计了，它提供了一种非常方便的方式来为音频装上( `connect`)不同的「处理器」 `AudioNode`。不仅一个音频源可以使用多个「处理器」，而多个音频源也可以合并为一个「输出」 `destination`。

得益于 Web Audio 的模块化设计，除了上面提到的模块（ `AudioNode`），它还提供了非常多的可配置的、高阶的、开箱即用的模块。所以通过使用这些模块，我们完全可以创建出功能丰富的音频处理应用。

![img](https://mmbiz.qpic.cn/mmbiz_png/c2icHwgzmCGzwblaw8lxCN5aMIDLa44JNUGNWyj95aoh9r6Bng2WVDpeZN7EUkoDHqPu5fiac1IicECNTe875PCXA/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

> An audio graph is a set of interconnected audio nodes.

现在我们知道了，音频的处理都是通过 **音频节点** 来处理的，而多个音频节点 `connect` 到一起就形成了 **音频导向图（Audio Routing Graph）**，简而言之就是多个相互连接在一起的音频节点。
