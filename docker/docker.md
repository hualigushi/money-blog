# 1. docker pull
拉取镜像
```
docker pull docker.io/library/nginx:lastest

docker.io registry:仓库地址，Docker Hub 官方仓库，可省略
library   namaspace:命名空间（作者名），Docker 官方仓库的命名空间，可省略
lastest   tag:标签（版本号）

// 简化命令
docker pull nginx // 从 Docker 官方仓库的官方命名空间里下载最新的 Nginx Docker 镜像
```

# 2. docker 镜像源 
`https://docker.xuanyuan.me/`

# 3. docker images
列出所有下载过的 Docker 镜像

# 4. docker rmi 镜像name/id
删除镜像

# 5. docker run 容器name
使用镜像创建并运行容器，当前终端被占用，并有日志输出
```
docker run -d 容器name
让容器在后台执行，不会阻塞当前窗口
```

```
docker run -p 80:80
```
<img width="1770" height="858" alt="image" src="https://github.com/user-attachments/assets/d7113c56-546d-42b3-af04-29985f0b970c" />

```
docker run -v  宿主机目录：容器内目录
```
<img width="1618" height="1058" alt="image" src="https://github.com/user-attachments/assets/aa8e4346-9b21-4948-aed8-ea23cf9534dd" />

```
docker run -e 环境参数
```
<img width="1168" height="292" alt="image" src="https://github.com/user-attachments/assets/6eb8909c-2639-4f93-8dd6-75928a8be286" />

```
docker run -d --name my_name
自定义容器名称 
```

```
docker run -d --restart alaways 容器name
只要容器停止了就自动重启
```

```
 docker run -d --restart unless-stopped 容器name
只要容器因为意外原因停止了就自动重启, 但是手动停止的话就不会停止
```

# 6. docker ps 
 查看正在运行的容器

 # 7. docker rm 容器id
 删除容器

 # 8. docker start 容器name/id
 启动容器

 # 9. docker stop 容器name/id
 停止容器
