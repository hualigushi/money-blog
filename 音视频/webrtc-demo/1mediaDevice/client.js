if(!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices){
    console.log('enumerateDevices is not support')
} else {
    navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError)
}

function gotDevices(devicesInfos){
    devicesInfos.forEach(item=>{
        console.log(`deviceID(设备ID): ${item.deviceId}\n
                     label(设备的名字):${item.label}\n
                     kind(设备的种类):${item.kind}\n
                     groupID(两个设备的groupID 相同，说明是同一个物理设备):${item.groupId}`)
    })
}