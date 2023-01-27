# 简介
  一份JavaScript代码从Blink交给V8开始到执行，经历了解析，编译，运行，优化以及包括GC这些过程。下面这张图展示了V8在运行中实际测量得出的数据

![](https://img-blog.csdnimg.cn/20190428135857674.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3N6ZW5ndGFs,size_16,color_FFFFFF,t_70)


  可以看到解析Parse和编译Complie所花费的时间占到了整个运行周期总时间的三分之一。所以，这是为什么V8需要做code cache,引擎希望尽可能的减少解析和编译所用的时间。其总体思想就是，既然解析和编译花费的时间占据这么大，那么满足一定条件后，V8会把编译和解析的结果缓存下来，等到下次遇到相同的文件，直接跳过这个过程，把直接缓存好的数据拿来使用。如果你熟悉HTTP，你会发现这个过程和HTTP缓存如出一辙。
  首先，我们先来介绍下，什么是code cache以及它的的实现过程。
  目前在V8中实现了两种code cache方案，分别是isolate caches（隔离缓存），以及Resourse cache（资源缓存）。前者是储存在内存中，后者保存在计算机的硬盘上。下面将分别介绍它们。

# isolate caches in V8
隔离缓存位于内存中，如果你了解过chrome架构中的站点隔离（site isolation），你应该大致想得到这种缓存所面向的适用对象。
该缓存以hashtable的形式存在V8的堆中。它的储存结构如下：

![](https://img-blog.csdnimg.cn/20190428135446720.png)                
  在这个结构中，用源码作为key，编译后生成的数据（字节码)作为对应的值。

  下面来看下简单的运行过程：

> 当V8编译一个脚本文件，V8首先会用脚本源码去检索缓存的hashtable中是否存在相同key的对象，如果存在，直接返回已经存在的字节码。否则，V8正常进行编译，并将编译后生成的字节码储存在缓存的hashtable中（V8分配的堆内存上），由脚本的源代码作为key。

​	根据观察得出的结论，这种缓存技术在real world的网页中能够达到80%的命中率。并且由于这种缓存直接存在于内存中，所以它的速度会比接下来介绍的第二种快很多。 

 但是隔离缓存有一个很严重的问题，是关于tab。如果你有两个标签页，它们都加载了一份相同的脚本文件（指向同一个URL），比如a.js。在第一个标签页已经将a.js缓存到了堆上的hashtable中后，
  第二个标签页开始去加载a.js。由于隔离缓存只适用于同一个V8进程（站点隔离机制），所以这时候第二个标签页无法利用另一个标签页中已经缓存好的脚本文件（的字节码）。它们（这两个标签页）进程独立，无法访问互相的数据。
下面介绍的第二种方案能够解决上述问题。

# Resourse cache
  资源缓存是和文件自身一起储存在硬盘上的，由chrome自己来管理（确切的说，是Blink）。它弥补了隔离缓存的一些缺陷，能够在进程以及其他chrome会话之间共享code caches。它同时与HTTP的缓存策略相结合。
下面是Resourse cache的实现过程：

1. 当一个JavaScript脚本文件第一次被请求，chrome下载后交给V8编译，同时会把该文件缓存到硬盘中，缓存的结构如下：

   ![](https://img-blog.csdnimg.cn/20190428135507794.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3N6ZW5ndGFs,size_16,color_FFFFFF,t_70)           
      Metedata字段所对应的timestamp值是一个时间戳，指出这个文件被编译的时间。这个过程称为cold run。

2. 当第二次chrome遇到这个文件的时候，chrome从位于硬盘的缓存中取出a.js的数据并再次交给V8编译。这时候V8会去检查metedata部分的timestamp值。如果这个时间戳距现在超过72小时，我们会回退到cold run阶段，重新编译和设置timestamp的值。如果没有超过限定时间，V8再次编译这个脚本，并生成编译后代码的序列化形式（即code cache），并将序列化后的数据储存在Metedata部分代替之前的timestamp。这个过程称为warm run。（这个过程当然是建立在http缓存仍然有效的基础上。）
3. 第三次，chrome再次请求这份文件，chrome从缓存文件的Metedata部分读取到code cache，再交给V8，V8收到数据后进行反序列化。这样将跳过解析和编译阶段，直接执行缓存好的数据。这个过程称为hot run
   下面这张图展示了warm run和hot run的过程
   ![](https://img-blog.csdnimg.cn/20190428140050185.png)
      Resourse cache没有隔离缓存速度快。因为它储存在硬盘上，并且还需要经历序列化和反序列化。但是我们上面提到过，这种策略能够让不同标签的页面和chrome会话之间共享一份code cache。

  那为什么在warm run阶段我们才会生成code cache呢？
  因为实际上很多文件我们确实只会遇见一次，如果每一份文件都要执行序列化并缓存，实际上会造成很大的浪费。

  但code cache还有另外一个问题，和V8的编译方式有关。V8在首次编译的时候只会去编译IIFE函数，对于其他函数会被标记为lazy compilation。当运行过程中，遇到被标记为lazy compilation的函数，V8才会对它进行编译。这种方案能偶大幅度减少我们在编译解析阶段所化的时间，从而大幅度提高页面的加载速度。

  但是它又与本文提到的code cache有些许不兼容的地方。因为V8在首次编译解析时，就会把生成的数据作为code cache储存起来。而由于首次编译只会对IIFE进行处理，所以缓存起来的数据只占整个脚本文件的一小部分，当在hot run执行阶段，很可能还是要花费大量时间对之前的lazy compilation函数进行编译处理。

  所以，V8为了针对这种情况，设计了一个新的API，**ScriptCompiler::CreateCodeCache**，在chrome版本66之后，chrome能够使用此API在脚本执行完一遍后请求生成code cache，此时生成的code cache就能够包含那些在执行过程中才被编译的函数。这样，就避免了在hot run执行阶段仍然需要编译函数。
这个过程如下：
   ![](https://img-blog.csdnimg.cn/20190428140120466.png)        

# 其他

##  html里面的JavaScript
  对于内嵌到HTML里面的JavaScript片段，V8目前还不支持缓存这种类型的代码。但在以后，V8将会实现对其的缓存。对于一份HTML里面存在的多个script片段，V8会为其建立一个table来储存(Metedata部分的值是一个table)，同样以script部分的源码作为key值。当然，一旦HTML文档失效，里面的script缓存也会随之失效。

## 为什么以前V8没有code cache。
  Code cache是在V8引入了新的架构后才加入V8的。早期的V8架构与其他浏览器包括Firefox这种有一个很大的不同，就是关于解释器部分。以前V8的架构在生成AST树后会由解释器部分直接生成机器码，中间不存在解释器生成的字节码。
  因此，以前V8所做的优化也是基于机器码进行的，经过优化后的机器码是依赖于具体的执行代码。像下面这样：

```
//js代码
var a = b +c ；
//生成的机器码
 call $UnknowBinaryOpAdd //目的是调用加法操作。
```


  V8执行几次这个代码后，会对该代码进行优化。比如几次运行发现输入的a，b都是字符串，那么这里的机器码就会被优化为：

`call $stringAdd  //生成特例为string的加法操作`

  所以，这种机器码和你执行过程有很强的关联，不是固定不变的，因此缓存是无意义的。
而在新的架构下，V8引入了Ignition，即解释器部分。通过解释器能够生成相应的字节码，而字节码是不会改变的，与源码相绑定。这种情况下缓存固定不变的内容才能起到缓存的作用。
##其他
  序列化后缓存的代码大概比源码体积多80%，但执行速度会快10倍，因此这种trade-off是完全可以接受的。（译注：在现在情况下，很多优化以及架构都会以牺牲最容易牺牲的储存，包括硬盘和内存来换取更多的好处，比如站点隔离以及本文所介绍的）

# 具体实例
  最后，我们通过一个真实访问到的网页来看看code cache是如何运行的。
  以一个搜索引擎的主页为例，来看一下code cache是如何对其中一个脚本起到作用的。
首先用命令

`google-chrome --user-data-dir="$(mktemp -d)"`

启动纯净模式的chrome，这样可以减少其他因素的干扰。为了探测这种底层的实现，需要使用tracing工具，为了简化内容，在Record Categories中只需要勾选V8然后开始第一次访问，在本文的实例中，都以文件

https://ss1.bdstatic.com/5eN1bjq8AAUYm2zgoY3K/r/www/cache/static/protocol/https/home/js/nu_instant_search_b73e920.js

为观察对象。完成记录后，我们需要观察的是v8.compile部分的内容。

第一次

下面是第一次访问所捕获到的信息，

![](https://img-blog.csdnimg.cn/20190429094840294.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3N6ZW5ndGFs,size_16,color_FFFFFF,t_70)

  在第一次，也就是cold run阶段。没有在捕获的信息中看到任何关于code cache的信息。此时，根据上面的介绍，缓存资源的Metedata部分储存的是该文件被编译时的时间戳。

第二次

  接着第二次，现在进入warm run阶段，开始记录后再刷新当前页面，捕获到的信息如下：

![](https://img-blog.csdnimg.cn/2019042909483177.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3N6ZW5ndGFs,size_16,color_FFFFFF,t_70)

  与第一次不同，我们看到同时存在了两个v8.compile内容。第一个就是正常执行脚本时V8所做的编译，第二个就是上面提到的调用ScriptCompiler::CreateCodeCacheAPI在代码执行结束用于生成code cache所做的编译。在这个记录数据中，可以看到多了一个producedCacheSize字段，表示产生了code cache。

第三次

  最后是第三次，也就是hot run阶段。这次V8是使用了缓存中序列化后的字节码，因此多出了两个字段cacheConsumeOptions以及consumedCacheSize，这里面的单位都是字节，代表使用了code cache以及缓存的大小，与第二次中生成的缓存大小一致。

![](https://img-blog.csdnimg.cn/20190429094508199.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3N6ZW5ndGFs,size_16,color_FFFFFF,t_70)

  