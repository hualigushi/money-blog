//指定安装依赖的版本号:
* '2.1.1'   表示安装指定的版本号，也就是安装2.1.1版本。
* '~2.1.1' 表示安装2.1.x的最新版本，安装时不改变大版本号和次要版本号。
* '^2.1.1'  表示安装2.x.x的最新版本，安装时不改变大版本号。

package-lock.json作用

- 安装之后锁定包的版本，手动更改package.json文件安装将不会更新包，想要更新只能使用 npm install xxx@1.0.0 --save 这种方式来进行版本更新package-lock.json 文件才可以
- 加快了npm install 的速度，因为 package-lock.json 文件中已经记录了整个 node_modules 文件夹的树状结构，甚至连模块的下载地址都记录了，再重新安装的时候只需要直接下载文件即可
