[TOC]



# hash

#### 所有文件哈希值相同，只要改变内容跟之前的不一致，所有哈希值都改变，没有做到缓存意义

hash是跟整个项目的构建相关，构建生成的文件hash值都是一样的，所以hash计算是跟整个项目的构建相关，同一次构建过程中生成的hash都是一样的，只要项目里有文件更改，整个项目构建的hash值都会更改。

如果出口是hash，那么一旦针对项目中任何一个文件的修改，都会构建整个项目，重新获取hash值，缓存的目的将失效。

![img](https://img4.sycdn.imooc.com/5b8e4ac400013c9410640580.jpg)

可以从上图清晰的看见每个压缩后的文件的hash值是一样的，所以对于没有改变的模块而言，这样做显然不恰当，因为缓存失效了嘛。此时，chunkhash的用途随之而来。



# chunkhash

#### 同一个模块，就算将js和css分离，其哈希值也是相同的，修改一处，js和css哈希值都会变，同hash，没有做到缓存意义



它根据不同的入口文件(Entry)进行依赖文件解析、构建对应的chunk，生成对应的hash值。

我们在生产环境里把一些公共库和程序入口文件区分开，单独打包构建，接着我们采用chunkhash的方式生成hash值，那么只要我们不改动公共库的代码，就可以保证其hash值不会受影响。

由于采用`chunkhash`，所以项目主入口文件`main.js`及其对应的依赖文件`main.css`由于被打包在同一个模块，所以共用相同的`chunkhash`。
 这样就会有个问题，只要对应css或则js改变，与其关联的文件hash值也会改变，但其内容并没有改变，所以没有达到缓存意义。

![img](https://img1.sycdn.imooc.com/5b8e4ac400014b1011990453.jpg)

我们将各个模块的hash值 (除主干文件) 改为chunkhash，然后重新build一下，可得下图：

![img](https://img1.sycdn.imooc.com/5b8e4ac40001b2bf10700575.jpg)

我们可以清晰地看见每个chunk模块的hash是不一样的了。

但是这样又有一个问题，因为我们是将样式作为模块import到JavaScript文件中的，所以它们的`chunkhash`是一致的，如test1.js和test1.css：

![img](https://img1.sycdn.imooc.com/5b8e4ac5000126a207120472.jpg)

这样就会有个问题，只要对应css或则js改变，与其关联的文件hash值也会改变，但其内容并没有改变呢，所以没有达到缓存意义。



# contenthash

#### 只要文件内容不一样，产生的哈希值就不一样

`contenthash`表示由文件内容产生的hash值，内容不同产生的`contenthash`值也不一样。

在项目中，通常做法是把项目中css都抽离出对应的css文件来加以引用。

![img](https://img1.sycdn.imooc.com/5b8e4ac5000167de10240572.jpg)

 

