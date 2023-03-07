### ,JSONP原理


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