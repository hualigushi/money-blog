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

 ```
docker ps -a
查看所有容器
```

 # 7. docker rm 容器id
 删除容器

 # 8. docker start 容器name/id
 启动容器

 # 9. docker stop 容器name/id
 停止容器

 # 10. docker inspect 容器id
 查看容器所有信息，可以让 ai 分析

 # 11. docker create 容器name/id
 只创建容器，不启动

 # 12. docker logs 容器name/id
 查看容器日志

 ```
docker log -f 容器name/id
滚动查看日志
```

# 13. docker exec 容器name/id ps -ef
查看容器里的进程情况

```
docker exec -it 容器id /bin/sh
进入正在运行的容器内部，获得一个交互式的命令行环境
```
# 14. docker build -t name .
在当前目录构建镜像

# 15 umi 项目
---

### 1. 项目构建准备
在项目根目录执行：
```bash
npm run build
```
构建产物会生成在 `dist` 目录下（Umi 4 默认输出路径）

---

### 2. 创建 Nginx 配置文件
在项目根目录创建 `nginx.conf`：
```nginx
server {
    listen       80;
    server_name  localhost;
    
    location / {
        root   /usr/share/nginx/html;
        index  index.html;
        # 单页应用路由支持
        try_files $uri $uri/ /index.html; 
    }

    # 可选：API代理（如需后端接口）
    # location /api {
    #    proxy_pass http://your-backend;
    # }
}
```

---

### 3. 创建 Dockerfile
在项目根目录创建 `Dockerfile`：
```dockerfile
# 阶段1：构建环境
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 阶段2：生产环境
FROM nginx:alpine
# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html
# 复制Nginx配置
COPY nginx.conf /etc/nginx/conf.d/default.conf
# 暴露端口
EXPOSE 80
```

---

### 4. 创建 .dockerignore
在项目根目录创建 `.dockerignore`：
```
node_modules
.git
.DS_Store
dist
```

---

### 5. 构建 Docker 镜像
在项目根目录执行：
```bash
docker build -t umi4-app .
```

---

### 6. 运行 Docker 容器
```bash
docker run -d -p 8080:80 --name umi-container umi4-app
```
- `-p 8080:80`：将容器 80 端口映射到 Mac 的 8080 端口
- `-d`：后台运行
- `--name`：容器名称

---

### 7. 访问应用
打开浏览器访问：  
[http://localhost:8080](http://localhost:8080)

---

### 8. 常用管理命令
```bash
# 停止容器
docker stop umi-container

# 启动容器
docker start umi-container

# 查看运行中的容器
docker ps

# 查看容器日志
docker logs umi-container

# 删除容器
docker rm umi-container

# 删除镜像
docker rmi umi4-app
```

---

### 9. 热更新开发模式（可选）
如需在开发时实时更新，创建 `docker-compose.yml`：
```yaml
version: '3'
services:
  app:
    build: .
    ports:
      - "8080:80"
    volumes:
      - ./src:/app/src  # 挂载源码目录
      - ./public:/app/public
    command: >
      sh -c "npm install && npm run start"  # 开发模式命令
```

启动开发环境：
```bash
docker-compose up
```

---

### 常见问题解决

1. **路由404问题**  
   确保 nginx.conf 中包含 `try_files $uri $uri/ /index.html;`

2. **静态资源加载失败**  
   检查 Umi 配置中 `publicPath` 是否设置为 `./`（`config/config.ts`）：
   ```ts
   export default {
     publicPath: './',
   }
   ```

3. **端口冲突**  
   修改运行命令的端口映射：`-p 3000:80`

4. **Docker 权限问题**  
   在 Docker Desktop 设置中开启文件共享：
   - 打开 Docker Desktop
   - Settings → Resources → File Sharing
   - 添加项目所在目录

---

通过以上步骤，你的 Umi 4 应用已成功部署在 Mac 的 Docker+Nginx 环境中。生产部署时建议使用更轻量的基础镜像（如 `nginx:alpine`）并配置 HTTPS 支持。

# 16. docker compose
```
docker compose up -d
docker compose down
docker compose srart
docker compose stop
```
