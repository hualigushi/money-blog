const videoplayer = document.querySelector('video#player')
const recordplayer = document.querySelector('video#recordplayer')
const btnRecord = document.querySelector('button#record')
const btnPlay = document.querySelector('button#recplay')
const btnDownload = document.querySelector('button#download')
let buffer
let mediaRecorder

function gotMediaStream(stream){
    videoplayer.srcObject = stream
    window.stream = stream
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
            //     volume:0,
            //     sampleRate: 1, // 采样频率
            //     echoCancellation: true, // 回音消除
            //     autoGainControl: true,
            //     noiseSuppression: true, // 降噪
            // }
        }
        navigator.mediaDevices.getUserMedia(constraints).then(gotMediaStream)
    }
}

startVideo()

function handledatavailable (e) {
    if(e && e.data && e.data.size > 0){
        buffer.push(e.data)
    }
}
function startRecord (){
    buffer = []
    const options ={
        mimeType: 'video/webm;codecs=vp8'
    }
    if(!MediaRecorder.isTypeSupported(options.mimeType)){
        console.log('not support')
        return
    }

    try {
        mediaRecorder = new MediaRecorder(window.stream, options)
        mediaRecorder.ondataavailable = handledatavailable
        mediaRecorder.start(10) // 每隔10秒存储数据
    } catch(e){
        console.log("startRecord ~ e", e)
        
    }
    
}

function stopRecord (){
    mediaRecorder.stop()
}

btnRecord.onclick = ()=>{
    if(btnRecord.textContent === 'Start Record'){
        startRecord()
        btnRecord.textContent = 'Stop Record'
        btnPlay.disabled = true
        btnDownload.disabled = true
    } else {
        stopRecord()
        btnRecord.textContent = 'Start Record'
        btnPlay.disabled = false
        btnDownload.disabled = false
    }
}

btnPlay.onclick = ()=>{
    let blob = new Blob(buffer, {
        type: 'video/webm'
    })
    console.log(window.URL.createObjectURL(blob))
    recordplayer.src = window.URL.createObjectURL(blob) // 媒体文件
    recordplayer.srcObject = null // 实时流时不需要
    recordplayer.controls = true
    recordplayer.play()
}
btnDownload.onclick = () => {
    let blob = new Blob(buffer, {
        type: 'video/webm'
    })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.style.display = 'none'
    a.download = 'aaa.webm'
    a.click()
}