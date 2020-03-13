1. 连接redis   redis-cli -h 127.0.0.1 -p 6379 -a "mypass"

2. FLUSHDB  # 删除当前数据库所有 key
   DBSIZE  # 返回当前数据库的 key 的数量

3. 设置密码
   AUTH PASSWORD # (error) ERR Client sent AUTH, but no password is set
   CONFIG SET requirepass "mypass"
   AUTH mypass # Ok

4. PING # PONG 客户端和服务器连接正常

5. QUIT # 关闭当前连接

6. SELECT index # 切换到指定的数据库，数据库索引号 index 用数字值指定，以 0 作为起始索引值
