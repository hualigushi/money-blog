// devices
const videoplayer = document.querySelector('video#player')
const audioplayer = document.querySelector('audio#audioplayer')

// picture
const snapshot = document.querySelector('button#snapshot')
const picture = document.querySelector('canvas#picture')

function gotMediaStream(stream){
    videoplayer.srcObject = stream
    audioplayer.srcObject = stream

    const videoTrack = stream.getVideoTracks()[0]
    console.log("gotMediaStream ~ videoTrack", videoTrack)
    const videoConstrains = videoTrack.getSettings()// 视频约束配置
// {
//     aspectRatio: 1.3333333333333333
//     deviceId: "c3c8f56c954043b47c6c23b79744657addf4dc8654116101a5f5d5ecf64771d8"
//     frameRate: 30
//     groupId: "95d748e2a31c51b48065f44ae154006e0ed0bbe541d0a1d07029dc47fe19ac6c"
//     height: 480
//     resizeMode: "none"
//     width: 640
// }
    console.log("🚀 ~ file: client.js ~ line 12 ~ gotMediaStream ~ videoConstrains", videoConstrains)
}

function startVideo(){

    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
        console.log('not support getUserMedia')
    } else {
        const constraints ={
            video: {
                width: 640,
                height: 480,
                frameRate: 30, // 帧率
            },
            audio: false
            // {
            //     volume:0,// 音量
            //     sampleRate: 1, // 采样频率
            //     sampleSize: 1, // 采样大小
            //     echoCancellation: true, // 回音消除
            //     autoGainControl: true, // 自动增益
            //     noiseSuppression: true, // 降噪
            //     latency: // 延迟
            //      channleCount //通道
            
            // }
        }
        navigator.mediaDevices.getUserMedia(constraints).then(gotMediaStream)
        // navigator.mediaDevices.getDisplayMedia(constraints).then(gotMediaStream) // getDisplayMedia 播放桌面方法
    }
}

startVideo();

snapshot.onclick = function(){
    picture.width=640
    picture.height=320
    picture.getContext('2d').drawImage(videoplayer,0,0,picture.width,picture.height)
}