1. 
```
let image = new Image();
image.src = src + '?v=' + Math.random();
image.crossOrigin = 'Anonymous'; // 支持跨域图片

image.onload = function() {
    let canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    let ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, image.width, image.height);
    canvas.toDataURL('image/png'); // 可选其他值 image/jpeg
};
```
服务器存储那边也要做相应的设置

图片服务器需要配置Access-Control-Allow-Origin



2.
如果不想修改图片服务器的设置 可以用下面这种做法

以php为例

先用php加载图片 然后转换成base64编码 用来给img标签的src使用

这样canvas加载img就不会有跨域的问题了

3. 
ajax和URL.createObjectURL()方法
```
var xhr = new XMLHttpRequest();
xhr.onload = function () {
    var url = URL.createObjectURL(this.response);
    var img = new Image();
    img.onload = function () {
        // 此时你就可以使用canvas对img为所欲为了
        // ... code ...
        // 图片用完后记得释放内存
        URL.revokeObjectURL(url);
    };
    img.src = url;
};
xhr.open('GET', url, true);
xhr.responseType = 'blob';
xhr.send();
```
