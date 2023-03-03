### ,JSONP原理

jsonp是一种前后端约定的解决方案。

很多人都知道浏览器的同源策略，就是发送请求的页面地址和被请求的接口地址的域名，协议，端口三者必须一致，否则浏览器就会拦截这种请求。

浏览器拦截的意思不是说请求发布出去，请求还是可以正常触达服务器的，如果服务器正常返回了浏览器也会接收的到，只是不会交给我们所在的页面。这一点查看network是可以看到的。

jsonp一般是利用script标签的src属性，对于服务器来说只有请求和响应两种操作，请求来了就会响应，无论响应的是什么。请求的类型实在太多了。

浏览器输入一个url是一个请求，ajax调用一个接口也是一个请求，img和script的src也是请求。这些地址都会触达服务器。那为什么jsonp一般会选用script标签呢，首先大家都知道script加载的js是没有跨域限制的，因为加载的是一个脚本，不是一个ajax请求。 你可以理解为浏览器限制的是XMLHttpRequest这个对象，而script是不使用这个对象的。

仅仅没有限制还不够，还有一个更重要的点因为script是执行js脚本的标签，他所请求到的内容会直接当做js来执行。

这也可以看出，jsonp和ajax对返回参数的要求是不同的，jsonp需要服务返回一段js脚本，ajax需要返回的是数据。

因此这就要求服务器单独来处理jsonp这中请求，一般服务器接口会把响应的数据通过函数调用的方式返回，比如说返回的内容是'yd'，那就要返回成cb('yd')

```js
cb('yd')
```

这是一段函数调用的脚本，通过script标签加载之后会立即执行的，如果我们在全局定义一个cb函数。那么这段脚本执行的时候就会调用到我们定义的那个函数，函数中的参数就是服务返回的值了。前端也就可以在这个函数中获取到了。

```js
function cb (data) {
    console.log(data);
}
```

所以说jsonp是前后端共同约定的一种结果。






jsonp的本质是利用script标签的src属性进行跨域请求，只能用于get请求

1. 首先在客户端注册一个callback, 然后把callback的名字传给服务器。
2. 此时，服务器先生成 json 数据。
3. 然后以 javascript 语法的方式，生成一个function , function 名字就是传递上来的callback参数值 .
4. 最后将 json 数据直接以入参的方式，放置到 function 中，这样就生成了一段 js 语法的文档，返回给客户端。
5. 客户端浏览器，解析script标签，并执行返回的 javascript 文档，此时数据作为参数，传入到了客户端预先定义好的 callback 函数里.



### JSONP的2种实现方式

1. jsonp 在原生js中的实现:

​      http://api.douban.com/v2/movie/in_theaters?callback=local_func ，返回的数据是：;local_func({xxx})。

​     注意点：callback指定的回调函数，是客户端注册的，必须是定义在window下的全局函数。

2. jsonp 在jquery ajax中的实现, 只支持GET

```js
$.ajax({
     url:'//www.bejson.com/test/userinfop.php',
     type:"GET",
            dataType:"jsonp",
            jsonp: false, 
            jsonpCallback: "showjson", //这里的值需要和回调函数名一样
            success:function(data){
                console.log("Script loaded and executed.");
            },
            error:function (textStatus) { //请求失败后调用的函数
                console.log(JSON.stringify(textStatus));
            }
});			

```


```html
<!DOCTYPE html>
<html>
<head>
    <title>GoJSONP</title>
    <meta http-equiv="Content-Type" content="text/html;charset=utf-8"/>
</head>
<body>
<script type="text/javascript">
    function jsonhandle(data){
        alert("age：" + data.age + "  name：" + data.name + "  sex："+data.sex);
    }
</script>
<script type="text/javascript" src="http://code.jquery.com/jquery-latest.js"></script>
<script type="text/javascript">
</script>
<script type="text/javascript" src="http://local.sns.jutouit.com/remote.js"></script>
</body>
</html>
```

```
remote.js

jsonhandle({
    "age" : 25,
    "name": "Yibin",
    "sex": "男"
})
```





### JSONP跨域时如何解决xss漏洞

(1) 前后端约定jsonp请求的js的回调函数名

(2) 服务器端指定返回的数据格式为json

(3) 进行referrer验证 （$_SERVER['HTTP_REFERER'] 中的 host，是否在白名单内）