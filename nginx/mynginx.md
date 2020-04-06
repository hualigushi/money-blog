1. nginx遍历文件目录

```
server {
        listen 8081;
        server_name localhost;
        location / {
            root F:/vue/vue-ebook/resource;
            autoindex  on;
            autoindex_exact_size off;
            autoindex_localtime on;
            charset utf-8;
            add_header Access-Control-Allow-Origin *;
        }
        add_header Cache-Control "no-cache, must-revalidate";
    }
```

2. nginx 配置 https

https 默认采用 SHA-1 算法，非常脆弱。我们可以使用迪菲-赫尔曼密钥交换。

我们在 `/conf/ssl` 目录下生成 `dhparam.pem` 文件

`openssl dhparam -out dhparam.pem 2048`

```
server {
    listen                  80;
    listen                  [::]:80;  # http2 配置:[::]: 表示 ipv6 的配置，不需要可以不加那一行
    listen                  443 ssl http2; # http2 配置:后面增加 http2
    listen                  [::]:443 ssl http2;
    server_name             wangsijie.top www.wangsijie.top;

    ssl_certificate         ssl/fullchain.cer;
    ssl_certificate_key     ssl/wangsijie.top.key;

    # 服务器优化:配置共享会话缓存大小
    ssl_session_cache       shared:SSL:10m;
    # 服务器优化:配置会话超时时间
    ssl_session_timeout     10m;

    # 加密套件:优先采取服务器算法
    ssl_prefer_server_ciphers on;
    # 加密套件:使用 DH 文件
    ssl_dhparam 			ssl/dhparam.pem;
    # 加密套件:协议版本
    ssl_protocols           TLSv1 TLSv1.1 TLSv1.2;
    # 加密套件:定义算法
    ssl_ciphers     EECDH+CHACHA20:EECDH+AES128:RSA+AES128:EECDH+AES256:RSA+AES256:EECDH+3DES:RSA+3DES:!MD5;

    # 安全的响应头:启用 HSTS 。允许 https 网站要求浏览器总是通过 https 来访问
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    # 安全的响应头:减少点击劫持
    add_header X-Frame-Options DENY;
    # 安全的响应头:禁止服务器自动解析资源类型
    add_header X-Content-Type-Options nosniff;
    # 安全的响应头:防XSS攻擊
    add_header X-Xss-Protection 1;

    location / {
        root /var/www/main;
        index index.html;
    }
}
```

配置文件优化

为了让更多的二级域名支持上面的功能，每个 server 都这么写太过于繁琐。
可以将 listen 443 、ssl、add_header 相关的单独写在一个文件上，然后使用 inculde 指令。
如下：其他的配置都放在了`conf.d/https-base.conf`中
```
server {
    listen                  8099;
    listen                  [::]:8099;
    server_name             test.wangsijie.top;

    include                 conf.d/https-base.conf;

    location / {
        root /var/www/test;
        index index.html;
    }
}
```