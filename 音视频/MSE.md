## Media Source Extensions

在没有 MSE 出现之前，前端对 video 的操作，仅仅局限在对视频文件的操作，而并不能对视频流做任何相关的操作。现在 MSE 提供了一系列的[接口](https://developer.mozilla.org/en-US/docs/Web/API/MediaSource)，使开发者可以直接提供 media stream。

### 入门实例

这可以参考 google 的 [MSE 简介](https://developers.google.com/web/fundamentals/getting-started/primers/media-source-extensions)

```js
var vidElement = document.querySelector('video');

if (window.MediaSource) {
  var mediaSource = new MediaSource();
  vidElement.src = URL.createObjectURL(mediaSource);
  mediaSource.addEventListener('sourceopen', sourceOpen);
} else {
  console.log("The Media Source Extensions API is not supported.")
}

function sourceOpen(e) {
  URL.revokeObjectURL(vidElement.src);
  var mime = 'video/webm; codecs="opus, vp9"';
  var mediaSource = e.target;
  var sourceBuffer = mediaSource.addSourceBuffer(mime);
  var videoUrl = 'droid.webm';
  fetch(videoUrl)
    .then(function(response) {
      return response.arrayBuffer();
    })
    .then(function(arrayBuffer) {
      sourceBuffer.addEventListener('updateend', function(e) {
        if (!sourceBuffer.updating && mediaSource.readyState === 'open') {
          mediaSource.endOfStream();
        }
      });
      sourceBuffer.appendBuffer(arrayBuffer);
    });
}
```

可以从上面的代码看出，一套完整的执行代码，不仅需要使用 MSE 而且，还有一下这些相关的 API。

- HTMLVideoElement.getVideoPlaybackQuality()
- SourceBuffer
- SourceBufferList
- TextTrack.sourceBuffer
- TrackDefault
- TrackDefaultList
- URL.createObjectURL()
- VideoPlaybackQuality
- VideoTrack.sourceBuffer

我们简单讲解一下上面的流程。根据 google 的阐述，整个过程可以为：

![image.png-16kB](http://static.zybuluo.com/jimmythr/63522jzln6l5qrgpwqv5toy0/image.png)

- 第一步，通过异步拉取数据。
- 第二步，通过 MediaSource 处理数据。
- 第三步，将数据流交给 audio/video 标签进行播放。

而中间传递的数据都是通过 `Buffer` 的形式来进行传递的。

![image.png-29.5kB](http://static.zybuluo.com/jimmythr/acildyi1pgy43kbi9x0pcj5h/image.png)

中间有个需要注意的点，MS 的实例通过 `URL.createObjectURL()` 创建的 url 并不会同步连接到 video.src。换句话说，`URL.createObjectURL()` 只是将底层的流（MS）和 video.src 连接中间者，一旦两者连接到一起之后，该对象就没用了。

那么什么时候 MS 才会和 video.src 连接到一起呢？

创建实例都是同步的，但是底层流和 video.src 的连接时异步的。MS 提供了一个 `sourceopen` 事件给我们进行这项异步处理。一旦连接到一起之后，该 URL object 就没用了，处于内存节省的目的，可以使用 `URL.revokeObjectURL(vidElement.src)` 销毁指定的 URL object。

```
mediaSource.addEventListener('sourceopen', sourceOpen);

function sourceOpen(){
    URL.revokeObjectURL(vidElement.src)
}
```

#### MS 对流的解析

MS 提供了我们对底层音视频流的处理，那一开始我们怎么决定以何种格式进行编解码呢？

这里，可以使用 `addSourceBuffer(mime)` 来设置相关的编码器：

```
  var mime = 'video/webm; codecs="opus, vp9"';  
  var sourceBuffer = mediaSource.addSourceBuffer(mime);  
```

然后通过，异步拉取相关的音视频流：

```
fetch(url)
.then(res=>{
    return res.arrayBuffer();
})
.then(buffer=>{
    sourceBuffer.appendBuffer(buffer);
})
```

如果视频已经传完了，而相关的 Buffer 还在占用内存，这时候，就需要我们显示的中断当前的 Buffer 内容。那么最终我们的异步处理结果变为：

```
fetch(url)
.then(res=>{
    return res.arrayBuffer();
})
.then(function(arrayBuffer) {
      sourceBuffer.addEventListener('updateend', function(e) {
      // 是否有持续更新的流
        if (!sourceBuffer.updating && mediaSource.readyState === 'open') {
        // 没有，则中断连接
          mediaSource.endOfStream();
        }
      });
      sourceBuffer.appendBuffer(arrayBuffer);
    });
```



## MediaSource

MS(MediaSource) 可以理解为多个视频流的管理工具。以前，我们只能下载一个清晰度的流，并且不能平滑切换低画质或者高画质的流，而现在我们可以利用 MS 实现这里特性。我们先来简单了解一下他的 API。

### MS 的创建

创建一个 MS:

```
var mediaSource = new MediaSource();
```

### 相关方法

#### addSourceBuffer()

该是用来返回一个具体的视频流，接受一个 mimeType 表示该流的编码格式。例如：

```
var mimeType = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';
var sourceBuffer = mediaSource.addSourceBuffer(mimeType);
```

sourceBuffer 是直接和视频流有交集的 API。例如：

```
function sourceOpen (_) {
  var mediaSource = this;
  var sourceBuffer = mediaSource.addSourceBuffer(mimeCodec);
  fetchAB(assetURL, function (buf) {
    sourceBuffer.addEventListener('updateend', function (_) {
      mediaSource.endOfStream();
      video.play();
    });
    // 通过 fetch 添加视频 Buffer
    sourceBuffer.appendBuffer(buf);
  });
};
```

它通过 `appendBuffer` 直接添加视频流，实现播放。不过，在使用 `addSourceBuffer` 创建之前，还需要保证当前浏览器是否支持该编码格式。

#### removeSourceBuffer()

用来移除某个 sourceBuffer。移除也主要是考虑性能原因，将不需要的流移除以节省相应的空间，格式为：

```
mediaSource.removeSourceBuffer(sourceBuffer);
```

#### endOfStream()

用来表示接受的视频流的停止，注意，这里并不是断开，相当于只是下好了一部分视频，然后你可以进行播放。此时，MS 的状态变为：`ended`。例如：

```
  var mediaSource = this;
  var sourceBuffer = mediaSource.addSourceBuffer(mimeCodec);
  fetchAB(assetURL, function (buf) {
    sourceBuffer.addEventListener('updateend', function (_) {
      mediaSource.endOfStream(); // 结束当前的接受
      video.play(); // 可以播放当前获得的流
    });
    sourceBuffer.appendBuffer(buf);
  });
```

#### isTypeSupported()

该是用来检测当前浏览器是否支持指定视频格式的解码。格式为：

```
var isItSupported = mediaSource.isTypeSupported(mimeType); // 返回值为 Boolean
```

mimeType 可以为 type 或者 type + codec。

例如：

```
// 不同的浏览器支持不一样，不过基本的类型都支持。
MediaSource.isTypeSupported('audio/mp3'); // false，这里应该为 audio/mpeg 
MediaSource.isTypeSupported('video/mp4'); // true
MediaSource.isTypeSupported('video/mp4; codecs="avc1.4D4028, mp4a.40.2"'); // true
```

这里有一份具体的 [mimeType](https://wiki.whatwg.org/wiki/Video_type_parameters#Browser_Support) 参考列表。

### MS 的状态

当 MS 从创建开始，都会自带一个 `readyState` 属性，用来表示其当前打开的状态。MS 有三个状态：

- closed: 当前 MS 没有和 media element(比如：video.src) 相关联。创建时，MS 就是该状态。
- open: source 打开，并且准备接受通过 sourceBuffer.appendBuffer 添加的数据。
- ended: 当 endOfStream() 执行完成，会变为该状态，此时，source 依然和 media element 连接。

```
var mediaSource = new MediaSource;
mediaSource.readyState; // 默认为 closed
```

当由 closed 变为 open 状态时，需要监听 `sourceopen` 事件。

```
video.src = URL.createObjectURL(mediaSource);
mediaSource.addEventListener('sourceopen', sourceOpen);
```

MS 针对这几个状态变化，提供了相关的事件：`sourceopen`，`sourceended`，`sourceclose`。

- sourceopen: 当 “closed” to “open” 或者 “ended” to “open” 时触发。
- sourceended: 当 “open” to “ended” 时触发。
- sourceclose: 当 “open” to “closed” 或者 “ended” to “closed” 时触发。

MS 还提供了其他的监听事件 sourceopen，sourceended，sourceclose，updatestart，update，updateend，error，abort，addsourcebuffer，removesourcebuffer. 这里主要选了比较重要的，其他的可以参考官方文档。

### MS 属性

1. **duration**: 获得当前媒体播放的时间，既可以设置(get)，也可以获取(set)。单位为 s(秒)

```
mediaSource.duration = 5.5; // 设置媒体流播放的时间
var myDuration = mediaSource.duration; // 获得媒体流开始播放的时间
```

在实际应用中为：

```
sourceBuffer.addEventListener('updateend', function (_) {
      mediaSource.endOfStream();
      mediaSource.duration = 120; // 设置当前流播放的时间
      video.play();
    });
```

2. **readyState**: 获得当前 MS 的状态。取值上面已经讲过了: `closed`，`open`，`ended`。

```
var mediaSource = new MediaSource;
  //此时的 mediaSource.readyState 状态为 closed
```

以及：

```
sourceBuffer.addEventListener('updateend', function (_) {
      mediaSource.endOfStream(); // 调用该方法后结果为：ended
      video.play();
});
```

- closed: 当前的 MS 并没有和 HTMLMedia 元素连接
- open: MS 已经和 HTMLMedia 连接，并且等待新的数据被添加到 SB 中去。
- ended: 当调用 `endOfStream` 方法时会触发，并且此时依然和 HTMLMedia 元素连接。

closed 和 ended 到的区别关键点在于有没有和 HTMLMedia 元素连接。

其对应的还有三个监听事件：

- sourceopen: 当状态变为 `open` 时触发。常常在 MS 和 HTMLMedia 绑定时触发。
- sourceended: 当状态变为 `ended` 时触发。
- sourceclose: 当状态变为 `closed` 时触发。

**sourceopen 触发**

`sourceopen` 事件相同于是一个总领事件，只有当 sourceopen 时间触发后，后续对于 MS 来说，才是一个可操作的对象。

通常来说，只有当 MS 和 video 元素成功绑定时，才会正常触发：

```
let mediaSource = new MediaSource();
vidElement.src = URL.createObjectURL(mediaSource);
```

其实这简单的来说，就是给 MS 添加 HTML media 元素。其整个过程为：

1. 先延时 media 元素的 load 事件，将 `delaying-the-load-event-flag` 设置为 false
2. 将 `readyState` 设置为 open。
3. 触发 MS 的 sourceopen 事件

**sourceended 触发**

sourceended 的触发条件其实很简单，只有当你调用 endOfStream 的时候，会进行相关的触发。

```
mediaSource.endOfStream();
```

**sourceclose 的触发**

sourceclose 是在 media 元素和 MS 断开的时候，才会触发。那这个怎么断开呢？

如果要手动触发 sourceclose 事件的话，则需要下列步骤：

1. 将 readyState 设置为 closed
2. 将 MS.duration 设置为 NaN
3. 移除 activeSourceBuffers 上的所有 Buffer
4. 触发 activeSourceBuffers 的 `removesourcebuffer` 事件
5. 移除 sourceBuffers 上的 SourceBuffer。
6. 触发 sourceBuffers 的 `removesourcebuffer` 事件
7. 触发 MediaSource 的 `sourceclose` 事件



3. **sourceBuffers**

它返回的是一个 `SourceBufferList` 的对象，里面可以获取当前 MS 上挂载的所有 SB。不过，只有当 MS 为 `open` 状态的时候，它才可以访问。具体使用为：

```
let SBs = mediaSource.sourceBuffers;
```

那我们怎么获取到具体的 SB 对象呢？因为，其返回值是 `SourceBufferList` 对象，具体格式为：

```
interface SourceBufferList : EventTarget {
    readonly attribute unsigned long length;
             attribute EventHandler  onaddsourcebuffer;
             attribute EventHandler  onremovesourcebuffer;
    getter SourceBuffer (unsigned long index);
};
```

简单来说，你可以直接通过 index 来访问具体的某个 SB:

```
let SBs = mediaSource.sourceBuffers;

let SB1 = SBs[0];
```

SBL 对象还提供了 `addsourcebuffer` 和 `removesourcebuffer` 事件，如果你想监听 SB 的变化，可以直接通过 SBL 来做。这也是为什么 MS 没有提供监听事件的一个原因。

所以，删除某一个 SB 就可以通过 SBL 查找，然后，利用 remove 方法移除即可：

```
let SBs = mediaSource.sourceBuffers;

let SB1 = SBs[0];

mediaSource.removeSourceBuffer(SB1);
```

4. **activeSourceBuffers**

activeSourceBuffers 实际上是 sourceBuffers 的子集，返回的同样也是 SBL 对象。为什么说也是子集呢？

因为 ASBs 包含的是当前正在使用的 SB。因为前面说了，每个 SB 实际上都可以具体代表一个 track，比如，video track，audio track，text track 等等，这些都算。那怎么标识正在使用的 SB 呢？

很简单，不用标识啊，因为，控制哪一个 SB 正在使用是你来决定的。如果非要标识，就需要使用到 HTML 中的 video 和 audio 节点。通过

```
audioTrack = media.audioTracks[index]
videoTrack = media.videoTracks[index]

// media 为具体的 video/audio 的节点
// 返回值就是 video/audio 的底层 tracks

audioTrack = media.audioTracks.getTrackById( id )
videoTrack = media.videoTracks.getTrackById( id )

videoTrack.selected // 返回 boolean 值，标识是否正在被使用
```



### MS duration 修正机制

MS 的 duration 实际上就是 media 中播放的时延。通常来说，A/V track 实际上是两个独立的播放流，这中间必定会存在先关的差异时间。但是，media 播放机制永远会以最长的 duration 为准。

这种情况对于 live stream 的播放，特别适合。因为 liveStream 是不断动态添加 buffer，但是 buffer 内部会有一定的时长的，而 MS 就需要针对这个 buffer 进行动态更新。

整个更新机制为：

1. 当前 MS.duration 更新为 new duration。

2. 如果 new duration 比 sourceBuffers 中的最大的 pts 小，这时候就会报错。

3. 让最后一个的 sample 的 end time 为所后 timeRanges 的 end time。

4. 将 new duration 设置为当前 SourceBuffer 中最大的 endTime。

5. 将 video/audio 的播放时长（duration） 设置为最新的 new duration。

   

## SourceBuffer

SourceBuffer 是由 `mediaSource` 创建，并直接和 `HTMLMediaElement` 接触。简单来说，它就是一个流的容器，里面提供的 `append()`，`remove()` 来进行流的操作，它可以包含一个或者多个 `media segments`。同样，接下来，我们再来看一下该构造函数上的基本属性和内容。

### 基础内容

前面说过 sourceBuffer 主要是一个用来存放流的容器,它的基本架构:

```
interface SourceBuffer : EventTarget {
             attribute AppendMode          mode;
    readonly attribute boolean             updating;
    readonly attribute TimeRanges          buffered;
             attribute double              timestampOffset;
    readonly attribute AudioTrackList      audioTracks;
    readonly attribute VideoTrackList      videoTracks;
    readonly attribute TextTrackList       textTracks;
             attribute double              appendWindowStart;
             attribute unrestricted double appendWindowEnd;
             attribute EventHandler        onupdatestart;
             attribute EventHandler        onupdate;
             attribute EventHandler        onupdateend;
             attribute EventHandler        onerror;
             attribute EventHandler        onabort;
    void appendBuffer(BufferSource data);
    void abort();
    void remove(double start, unrestricted double end);
};
```

上面这些属性决定了其 sourceBuffer 整个基础。

播放模式`mode` 的取值有两个，一个是 `segments`，一个是 `sequence`。

**segments** 表示 A/V 的播放时根据你视频播放流中的 pts 来决定，该模式也是最常使用的。因为音视频播放中，最重要的就是 pts 的排序。因为，pts 可以决定播放的时长和顺序，如果一旦 A/V 的 pts 错开，有可能就会造成 A/V sync drift。

**sequence** 则是根据空间上来进行播放的。每次通过 `appendBuffer` 来添加指定的 Buffer 的时候，实际上就是添加一段 A/V segment。此时，播放器会根据其添加的位置，来决定播放顺序。还需要注意，在播放的同时，你需要告诉 SB，这段 segment 有多长，也就是该段 Buffer 的实际偏移量。而该段偏移量就是由 `timestampOffset` 决定的。整个过程用代码描述一下就是：

```
sb.appendBuffer(media.segment);
sb.timestampOffset += media.duration;
```

另外，如果你想手动更改 `mode` 也是可以的，不过需要注意几个先决条件：

1. 对应的 SB.updating 必须为 false.
2. 如果该 parent MS 处于 `ended` 状态，则会手动将 MS readyState 变为 `open` 的状态。

然后另外两个就是 `buffered` 和 `updating`。

- buffered：返回一个 [timeRange](https://developer.mozilla.org/en-US/docs/Web/API/TimeRanges) 对象。用来表示当前被存储在 SB 中的 buffer。
- updating: 返回 Boolean，表示当前 SB 是否正在被更新。例如: SourceBuffer.appendBuffer(), SourceBuffer.appendStream(), SourceBuffer.remove() 调用时。

另外还有一些其他的相关属性，比如 textTracks,timestampOffset,trackDefaults



### 如何界定 track

这里先声明一下，track 和 SB 并不是一一对应的关系。他们的关系只能是 SB : track = 1: 1 or 2 or 3。即，一个 SB可能包含，一个 A/V track(1)，或者，一个 Video track ，一个Audio track(2)，或者 再额外加一个 text track(3)。

上面也说过，推荐将 track 和 SB 设置为一一对应的关系，应该这样比较好控制，比如，移除或者同步等操作。具体编码细节我们有空再说，这里先来说一下，SB 里面怎么决定 track 的播放。

track 最重要的特性就是 pts ，duration，access point flag。track 中 最基本的单位叫做 Coded Frame，表示具体能够播放的音视频数据。它本身其实就是一些列的 media data，并且这些 media data 里面必须包含 pts，dts，sampleDuration 的相关信息。在 SB 中，有几个基本内部属性是用来标识前面两个字段的。

- `last decode timestamp`: 用来表示最新一个 frame 的编码时间（pts）。默认为 null 表示里面没有任何数据
- `last frame duration`: 表示 coded frame group 里面最新的 frame 时长。
- `highest end timestamp`: 相当于就是最后一个 frame 的 pts + duration
- `need random access point flag`: 这个就相当于是同步帧的意思。主要设置是根据音视频流 里面具体字段决定的，和前端这边编码没关系。
- `track buffer ranges`: 该字段表示的是 coded frame group 里面，每一帧对应存储的 pts 范围。

这里需要特别说一下 last frame duration 的概念，其实也就是 `Coded Frame Duration` 的内容。

`Coded Frame Duration` 针对不同的 track 有两种不同的含义。一种是针对 video/text 的 track，一种是针对 audio 的 track:

- video/text: 其播放时长（duration）直接是根据 pts 直接的差值来决定，和你具体播放的 samplerate 没啥关系。虽然，官方也有一个计算 refsampelDuration 的公式：`duration = timescale / fps`，不过，由于视频的帧率是动态变化的，没什么太大的作用。
- audio: audio 的播放时长必须是严格根据采样频率来的，即，其播放时间必须和你自己定制的 timescale 以及 sampleRate 一致才行。针对于 AAC，因为其采样频率常为 `44100Hz`，其固定播放时长则为：`duration = 1024 / sampleRate * timescale`

**所以，如果你在针对 unstable stream 做同步的话，一定需要注意这个坑。有时候，dts 不同步，有可能才是真正的同步。**

我们再回到上面的子 title 上-- `如果界定 track`。一个 SB 里面是否拥有一个或者多个 track，主要是根据里面的视频格式来决定的。打个比方，比如，你是在编码 MP4 的流文件。它里面的 track 内容，则是根据 `moov box` 中的 `trak box` 来判断的。即，如果你的 MP4 文件只包含一个，那么，里面的 track 也有只有一个。

### SB buffer 的管理

SB 内部的状态，通常根据一个属性：`updating` 值来更新。即，它只有 true 或者 false 两种状态：

- true：当前 SB 正在处理添加或者移除的 segment
- false：当前 SB 处于空闲状态。当且仅当 updating = false 的时候，才可以对 SB 进行额外的操作。

SB 内部的 buffer 管理主要是通过 `appendBuffer(BufferSource data)` 和 `remote()` 两个方法来实现的。当然，并不是所有的 Buffer 都能随便添加给指定的 SB，这里面是需要条件和相关顺序的。

- 该 buffer，必须满足 MIME 限定的类型
- 该 buffer，必须包含 initialization segments（IS） 和 media segments（MS）.

下图是相关的支持 [MIME](https://w3c.github.io/media-source/byte-stream-format-registry.html)：

![image.png-107.1kB](http://static.zybuluo.com/jimmythr/m9zrb2j86mll6567lq36s4bn/image.png)

这里需要提醒大家一点，MSE 只支持 fmp4 的格式。具体内容可以参考: [FMP4 基本解析](https://www.villainhr.com/page/2017/08/21/学好 MP4，让直播更给力)。上面提到的 IS 和 MS 实际上就是 FMP4 中不同盒子的集合而已。

这里简单阐述一下：

#### Initialization segments

FMP4 中的 IS 实际上就是：`ftyp + moov`。里面需要包含指定的 track ID，相关 media segment 的解码内容。下面为基本的格式内容：

```
[ftyp] size=8+24
  major_brand = isom
  minor_version = 200
  compatible_brand = isom
  compatible_brand = iso2
  compatible_brand = avc1
  compatible_brand = mp41
[mdat] 
[moov] 
  [mvhd] 
    timescale = 1000
    duration = 13686
    duration(ms) = 13686
  [trak] 
  [trak] 
  [udta] 
```

具体内容编码内容，我们就放到后面来讲解，具体详情可以参考：[W3C Byte Stream Formats](https://w3c.github.io/media-source/#byte-stream-format-specs%BC%8C%E8%AE%A9%E7%9B%B4%E6%92%AD%E6%9B%B4%E7%BB%99%E5%8A%9B)。我们可以把 IS 类比为一个文件描述头，该头可以指定该音视频的类型，track 数，时长等。

#### Media Segment

MS 是具体的音视频流数据，在 FMP4 格式中，就相当于为 `moof + mdat` 两个 box。MS 需要包含已经打包和编码时间后的数据，其会参考最近的 IS 头内容。

相关格式内容，可以直接参考 [MP4 格式解析](https://www.villainhr.com/page/2017/08/21/学好 MP4，让直播更给力)。

在了解了 MS 和 IS 之后，我们就需要使用相应的 API 添加/移除 buffer 了。

这里，需要注意一下，在添加 Buffer 的时候，你需要了解你所采用的 `mode` 是哪种类型，`sequence` 或者 `segments`。这两种是完全两种不同的添加方式。

**segments**

这种方式是直接根据 MP4 文件中的 pts 来决定播放的位置和顺序，它的添加方式极其简单，只需要判断 updating === false，然后，直接通过 appendBuffer 添加即可。

```
if (!sb.updating) {
    let MS = this._mergeBuffer(media.tmpBuffer);
           
    sb.appendBuffer(MS); // ****

    media.duration += lib.duration; 
    media.tmpBuffer = [];
}
```

**sequence**

如果你是采用这种方式进行添加 Buffer 进行播放的话，那么你也就没必要了解 FMP4 格式，而是了解 MP4 格式。因为，该模式下，SB 是根据具体添加的位置来进行播放的。所以，如果你是 FMP4 的话，有可能就有点不适合了。针对 sequence 来说，每段 buffer 都必须有自己本身的指定时长，每段 buffer 不需要参考的 `baseDts`，即，他们直接可以毫无关联。那 sequence 具体怎么操作呢？

简单来说，在每一次添加过后，都需要根据指定 SB 上的 `timestampOffset`。该属性，是用来控制具体 Buffer 的播放时长和位置的。

```
if (!sb.updating) {
    let MS = this._mergeBuffer(media.tmpBuffer);
           
    sb.appendBuffer(MS); // ****

    sb.timestampOffset += lib.duration; // ****
    media.tmpBuffer = [];
}
```

### 控制播放片段

如果要在 video 标签中控制指定片段的播放，一般是不可能的。因为，在加载整个视频 buffer 的时候，视频长度就已经固定的，剩下的只是你如果在 video 标签中控制播放速度和音量大小。而在 MSE 中，如何在已获得整个视频流 Buffer 的前提下，完成底层视频 Buffer 的切割和指定时间段播放呢？

这里，需要利用 SB 下的 `appendWindowStart` 和 `appendWindowEnd` 这两个属性。

他们两个属性主要是为了设置，当有视频 Buffer 添加时，只有符合在 [start,end] 之间的 media frame 才能 append，否则，无法 append。例如：

```
sourceBuffer.appendWindowStart = 2.0;
sourceBuffer.appendWindowEnd = 5.0;
```

设置添加 Buffer 的时间戳为 [2s,5s] 之间。`appendWindowStart` 和 `appendWindowEnd` 的基准单位为 `s`。该属性值，通常在添加 Buffer 之前设置。

### SB 内存释放

SB 内存释放其实就和在 JS 中，将一个变量指向 null 一样的过程。

```
var a = new ArrayBuffer(1024 * 1000);
a = null; // start garbage collection
```

在 SB 中，简单的来说，就是移除指定的 time ranges’ buffer。需要用到的 API 为：

```
remove(double start, unrestricted double end);
```

具体的步骤为：

- 找到具体需要移除的 segment。
- 得到其开始（start）的时间戳（以 s 为单位）
- 得到其结束（end）的时间戳（以 s 为单位）
- 此时，updating 为 true，表明正在移除
- 完成之后，出发 updateend 事件

如果，你想直接清空 Buffer 重新添加的话，可以直接利用 `abort()` API 来做。它的工作是清空当前 SB 中所有的 segment，使用方法也很简单，不过就是需要注意不要和 remove 操作一起执行。更保险的做法就是直接，通过 `updating===false` 来完成：

```
if(sb.updating===false){
    sb.abort();
}
```

这时候，abort 的主要流程为：

- 确保 MS.readyState===“open”

- 将 appendWindowStart 设置为 pts 原始值，比如，0

- 将 appendWindowEnd 设置为正无限大，即，`Infinity`。

  

### 事件触发

在 SB 中，相关事件触发包括：

- updatestart： 当 updating 由 false 变为 true。
- update：当 append()/remove() 方法被成功调用完成时，updating 由 true 变为 false。
- updateend: append()/remove() 已经结束
- error: 在 append() 过程中发生错误，updating 由 true 变为 false。
- abort: 当 append()/remove() 过程中，使用 `abort()` 方法废弃时，会触发。此时，updating 由 true 变为 false。

注意上面有两个事件比较类似：`update` 和 `updateend`。都是表示处理的结束，不同的是，update 比 updateend 先触发。

```
sourceBuffer.addEventListener('updateend', function (e) {
    // 当指定的 buffer 加载完后，就可以开始播放
      mediaSource.endOfStream();
      video.play();
    });
```

### 相关方法

SB 处理流的方法就是 +/- ： appendBuffer, remove。另外还有一个中断处理函数 `abort()`。

- appendBuffer(ArrayBuffer)：用来添加 ArrayBuffer。该 ArrayBuffer 一般是通过 fetch 的 `response.arrayBuffer();` 来获取的。
- remove(start, end)： 用来移除具体某段的 media segments。
  - @param start/end: 都是时间单位（s）。用来表示具体某段的 media segments 的范围。
- abort(): 用来放弃当前 append 流的操作。不过，该方法的业务场景也比较有限。它只能用在当 SB 正在更新流的时候。即，此时通过 fetch,已经接受到新流，并且使用 appendBuffer 添加，此为开始的时间。然后到 updateend 事件触发之前，这段时间之内调用 `abort()`。有一个业务场景是，当用户移动进度条，而，此时 fetch 已经获取前一次的 media segments，那么可以使用 `abort` 放弃该操作，转而请求新的 media segments。具体可以参考：[abort 使用](https://github.com/nickdesaulniers/netfix/blob/gh-pages/demo/bufferWhenNeeded.html#L92-L101)



[官网](https://w3c.github.io/media-source/)