## 多人在线聊天室

1.获取redis第三方库：go get gitub.com/garyburd/redigo/redis

2.开启redis服务器：D:/redis:redis-server.exe redis.windows.conf

3.编译程序：

F:\Go\src> go build -o server.exe go_code/chatroom/server/main

F:\Go\src> go build -o client.exe go_code/chatroom/client/main
           
4.运行：

./server

./client
       
  
![chatroom](https://github.com/hualigushi/money-blog/blob/master/go%E7%AC%94%E8%AE%B0/chatroom/chatroom.JPG)
