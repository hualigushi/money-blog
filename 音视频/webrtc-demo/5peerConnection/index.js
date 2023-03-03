const localVideo = document.querySelector('video#localvideo')
const remoteVideo = document.querySelector('video#remotevideo')

const btnStart = document.querySelector('button#start')
const btnCall = document.querySelector('button#call')
const btnHangup = document.querySelector('button#hangup')

const offer = document.querySelector('textarea#offer')
const answer = document.querySelector('textarea#answer')

let localStream
let pc1
let pc2

function getMediaStream (stream){
    localVideo.srcObject = stream
    localStream = stream
}

function handleError(err){
    console.log('Failed to get media Stream',err)
}

function start (){
    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
        console.log('the getUserMedia is not support')
        return
    }
const constraints ={
    video: true,
    audio: false
}
    navigator.mediaDevices.getUserMedia(constraints)
    .then(getMediaStream)
    .catch(handleError)
}

function getRemoteStream (e){
    remoteVideo.srcObject = e.streams[0]
}

function getOffer (desc){
    pc1.setLocalDescription(desc)
    offer.value = desc.sdp

    pc2.setRemoteDescription(desc)
    pc2.createAnswer().then(getAnswer)
    .catch(handleAnswerError)

}

function getAnswer(desc){
    pc2.setLocalDescription(desc)
    answer.value = desc.sdp
    pc1.setRemoteDescription(desc)
}

function handleAnswerError(e){
    console.log('Failed to create answer',e)
}

function handleOfferError (e) {
    console.log('Failed to create offer',e)
}

function call(){
    // 公网中使用
// const pc = new RTCPeerConnection({
//     iceServers: [
//       // 目前我在用的，免费STUN 服务器
//       {
//         urls: 'stun:stun.voipbuster.com ',
//       },
//       // 谷歌的好像都失效了，不过你们可以试试
//       {
//         urls: 'stun:stun.l.google.com:19301',
//         // urls: 'stun:stun.l.google.com:19302',
//         // urls: 'stun:stun.l.google.com:19303',
//         // ...
//       },
//       // TURN 服务器,这个对服务器压力太大了，目前没找到免费的，后续我在自己的服务器上弄一个
//       {
//         urls: 'turn:turn.xxxx.org',
//         username: 'webrtc',
//         credential: 'turnserver',
//       },
//       {
//         urls: 'turn:turn.ap-southeast-1.aliyuncs.com:443?transport=tcp',
//         username: 'test',
//         credential: 'test',
//       },
//     ],
//   })
    pc1 = new RTCPeerConnection()
    pc2 = new RTCPeerConnection()
    pc1.onicecandidate = (e)=>{
        pc2.addIceCandidate(e.candidate)
    }
    pc2.onicecandidate = (e)=>{
        pc1.addIceCandidate(e.candidate)
    }
    pc2.ontrack = getRemoteStream

    localStream.getTracks().forEach((track)=>{
        pc1.addTrack(track, localStream)
    })

    const offerOptions ={
        offerToReceiveAudio: 0,
        offerToReceiveVideo: 1
    }
    pc1.createOffer(offerOptions).then(getOffer)
    .catch(handleOfferError)
}
function hangup (){
    pc1.close()
    pc2.close()
    pc1 = null
    pc2 = null
}
btnStart.onclick= start
btnCall.onclick = call
btnHangup.onclick = hangup