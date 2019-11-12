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