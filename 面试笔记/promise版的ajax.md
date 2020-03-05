```
const ajaxPromise =  param => {
  return new Promise((resovle, reject) => {
    var xhr = new XMLHttpRequest();
    xhr.open(param.type || "get", param.url, true);
    xhr.send(param.data || null);
 
    xhr.onreadystatechange = () => {
     var DONE = 4; // readyState 4 代表已向服务器发送请求
     var OK = 200; // status 200 代表服务器返回成功
     if(xhr.readyState === DONE){
      if(xhr.status === OK){
        resovle(JSON.parse(xhr.responseText));
      } else{
        reject(JSON.parse(xhr.responseText));
      }
     }
    }
  })
}
```