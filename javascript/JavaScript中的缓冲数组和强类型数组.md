## 1.什么是ArrayBuffer

你可以把ArrayBuffer当做一个内存的容器，以下代码声明了1kb的内存空间，但是你不可以直接通过数组下标获取的里面的数据。

```js
//声明1kb的内存空间
var buffer = new ArrayBuffer(1024);
console.log(buffer[0]) //..undefined
```



## 2.Javascript的强类型数组



强类型数组有三种基本类型：

- Int 整数
- Uint 无符号整数
- Float IEEE754浮点数



根据这些类型MDN给出了JavaScript的以下几个API：

- Int8Array
- Uint8Array
- Uint8ClampedArray
- Int16Array
- Uint16Array
- Int32Array
- Uint32Array
- Float32Array
- Float64Array



**基本使用**

```js
//创建一个有3个元素的8bit无符号整型
var a=new Uint8Array(3);
var b = new Uint8Array([1,2,3]); 
//假如输入一个非数字呢
var c = new Uint8Array([258,1.3,-23,"hello"]);
console.log(a); // Uint8Array(3) [0,0,0,buffer...]
console.log(b); // Uint8Array(3) [1,2,3,buffer...]
console.log(c); // Uint8Array(3) [2,1,233,0,buffer...]
```

![img](https://pic2.zhimg.com/80/v2-b0e9423a951e28d51e490847211e0d51_720w.jpg)



诶，我们可以发现在输入258的时候，范围溢出了uint8的0~255位，输入值就变成了258-255 = 2 了。浮点型直接去了尾数，－23二进制是[11101001](tel:11101001)即得233 ，字符串型变成了0。





## 2.通过强类型数组来使用ArrayBuffer

```js
var buffer=new ArrayBuffer(2);
var a=new Uint8Array(buffer);
var b=new Int8Array(buffer);
a[0]=100;
a[1]=255;
console.log(a); // Uint8Array(2) [100,255]
console.log(b); //Int8Array(2) [100, -1]
```

我们发现Int8类型在输入255的时候，溢出了–128 到 127的范围，输入值就变成了-128+255-128 = -1 了。



## 3.Uint8ClampedArray和Uint8Array的区别

就拿上例来说：

```js
var c = new Uint8Array([258,1.3,-23,"hello"]);
console.log(c); // Uint8Array(3) [2,1,233,0,buffer...]
var d = new Uint8ClampedArray([258,1.3,-23,"hello"]);
console.log(d); // Uint8ClampedArray(3) [255,1,0,0,buffer...]
```

在处理溢出的时候，Uint8ClampedArray将**超出255的值归到了255**，将**负数值全部归为了0**。



## **4.实例分析**

## **一、使用Canvas读取图片像素信息的实例：**

```js
var canvas = document.createElement('canvas');
var context = canvas.getContext('2d');
var image = new Image();
image.src = 'test.jpg';
image.onload = function() {
  context.drawImage(image, 0, 0, this.width, this.height);
  imageData = context.getImageData(0, 0, this.width, this.height).data;
  console.log(imageData); //Uint8ClampedArray(1048576) [2, 2, 14, 255, 2, 2,  …]
}
```

可以见得，canvas的api为了**提高读取效率**也使用了Uint8ClampedArray



## **二、读取音频高低数据（用作音频可视化）的实例**：

```js
var url = "http://localhost/test.mp3"
var xhr = new XMLHttpRequest();
var AudioContext = new AudioContext();
xhr.open("GET", url);
xhr.responseType = "arraybuffer";
xhr.onload = function(data){
   musicData = data.target.response;
   musicData = AudioContext.decodeAudioData(musicData,function(buffer){
      var analyser = AudioContext.createAnalyser(buffer);
      var arr = new Uint8Array(analyser.frequencyBinCount);
      var bufferSource = AudioContext.createBufferSource();
      bufferSource.connect(analyser);
      analyser.connect(AudioContext.destination);
      bufferSource.buffer = buffer;
      bufferSource.start();
      function v(){
        //analyser.getByteFrequencyData 要求传入一个Uint8Array,并且我们让它不断的更新
        audio = analyser.getByteFrequencyData(arr);
        console.log(arr);
        requestAnimationFrame(v);
      }
      requestAnimationFrame(v);
   });
}
xhr.send();
```

上传一张结果图：

![img](https://pic4.zhimg.com/80/v2-52ef547b1f28fd5783a622c0ca1e6b5f_720w.jpg)



## **三、使用二进制数据加密前端资源文件url链接：**

```js
<body>
  <audio id="audio" controls></audio>
</body>
<script type="text/javascript">
var url = "http://localhost/test.mp3"
var xhr = new XMLHttpRequest();
xhr.open("GET", url);
xhr.responseType = "arraybuffer";
xhr.onload = function(){
  var arrayBuffer = new Uint8Array(this.response);
  // 把资源文件转成blob用用户不可以直接下载使用的格式来转化，起到加密的作用
  var blob = new Blob([arrayBuffer], {type: 'mine'});
  var url = window.URL.createObjectURL(blob);
  document.getElementById('audio').src = url;
  console.log(url);
}
xhr.send();
</script>
```

上传一张结果图：

![img](https://pic4.zhimg.com/80/v2-72ca8ba97630fa935626fb210324f243_720w.jpg)



## **四、bitmap（位图）**

问题：访客统计问题，10万个访客需要验证是它否存在也许用数组就可以容易实现了，那么当你有50亿个访客的时候呢。



这是一个后端常见的访客统计问题，当然，JavaScript也可以实现bitmap啦。

```js
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>bitmap</title>
</head>
<body>
	<input type="text" placeholder="input a number" id="number">
	<button id="set">添加</button>
	<button id="isset">验证是否存在</button>
	<button id="reset">删除</button>
	<p id="answer"></p>
</body>
<script>
	function Bitmap(bytes){
		// >> 5 相当于 bytes / 32
		// 10000000 / 32 * 4 / 1024 / 1024 约等于 12.5 MB
		var buffer = new ArrayBuffer(bytes >> 5 + 1)
		this.map = new Uint32Array(buffer)
	}

	Bitmap.prototype.set = function(num){
		let ind = num >> 5;
		let pos = num % 32;
		this.map[ind] |= (1 << pos);
	}
	Bitmap.prototype.isSet = function(num){
		let ind = num >> 5;
		let pos = num % 32;
		let flag = false;
		if (this.map[ind] & (1 << pos)) flag = true;
		return flag;
	}
	Bitmap.prototype.reSet = function(num){
		let ind = num >> 5;
		let pos = num % 32;
		this.map[ind] &= ~(1 << pos)
	}

	var bitmap = new Bitmap(100000000)

	document.getElementById("set").onclick = function(){
		let num = document.getElementById("number").value;
		bitmap.set(num)
	}
	document.getElementById("isset").onclick = function(){
		let num = document.getElementById("number").value;
		document.getElementById("answer").innerText = bitmap.isSet(num)
	}
	document.getElementById("reset").onclick = function(){
		let num = document.getElementById("number").value;
		bitmap.reSet(num)
	}
</script>
</html>
```



## **使用keras-js实现前端预测手写字母**

**注意，以下代码是不完整的，github有全套代码。*

```js
export default {
  name: 'keras-js',
  data () {
    return {
      input: new Float32Array(784),
      output: new Float32Array(10),
      outputClasses: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    }
  }
```

[demo地址](https://link.zhihu.com/?target=https%3A//thomashuai.github.io/KerasDemo.github.io/)

上传一张结果图：

![img](https://pic2.zhimg.com/80/v2-dc3b7092fb6ede4fc0ef2a3537ccf70d_720w.jpg)



## 总结：

Javascript的强类型数组和Arraybuffer一般用于要**调用底层api进行数据处理**的一些操作，意义在于平时使用的Array对象说它是数组，其实是一个从哈希表扩展的结构体。因此它可以提供push、splice等一些列操作。这就意味着他们的效率是很低的。Canvas，WebGL的api又需要直接**访问内存**，这时候强类型数组**（兼容IE10）**出现了，被用于专门处理这一块的数据。