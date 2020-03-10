在开发环境下，尽量不用间歇调用，原因是后一个间歇调用可能会在前一个间歇调用结束之前启动。

尽量使用超时调用来模拟间歇调用。

```
<!DOCTYPE html>
<html lang="zh">

    <head>
        <meta charset="UTF-8" />
        <title>超时调用来模拟间歇调用</title>
    </head>

    <body>
        <!--注意src路径要对-->
        <script src="js/jquery-1.12.4.min.js" type="text/javascript" charset="utf-8"></script>
        <script type="text/javascript">
            var num = 0;
            var max = 10;

            function incrementNumber() {
                num++;
                // 如果执行次数未达到 max设定的值，则设置另一次超时调用
                if(num < max) {
                    setTimeout(incrementNumber, 500);
                } else {
                    alert("Done");
                }
            }
            setTimeout(incrementNumber, 500);
        </script>
    </body>

</html>
```