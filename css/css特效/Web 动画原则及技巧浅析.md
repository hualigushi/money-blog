[TOC]

# Web 动画原则及技巧浅析

在 Web 动画方面，有一套非常经典的原则 -- [Twelve basic principles of animation](https://en.wikipedia.org/wiki/Twelve_basic_principles_of_animation)，也就是关于动画的 12 个基本原则（也称之为迪士尼动画原则），网上对它的解读延伸的文章也非常之多：

- [Animation Principles for the Web](https://cssanimation.rocks/principles/)
- [[译文\]网页动画的十二原则](https://cssanimation.rocks/cn/principles/)

其中使用的示例 DEMO 属于比较简单易懂，但是没有很好地体现在实际生产中应该如何灵活运用。今天本文将带大家再次复习复习，并且替换其中的最基本的 DEMO，换成一些到今天非常实用，非常酷炫的动画 DEMO 效果。

## Squash and stretch -- 挤压和拉伸

挤压和拉伸的目的是为绘制的对象赋予重量感和灵活性。它可以应用于简单的物体，如弹跳球，或更复杂的结构，如人脸的肌肉组织。

应用在动画中，这一原则最重要的方面是对象的体积在被挤压或拉伸时不会改变。如果一个球的长度被垂直拉伸，它的宽度（三个维度，还有它的深度）需要相应地水平收缩。

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ae555d6aeed14183a05efdab48dd31af~tplv-k3u1fbpfcp-zoom-1.image)

看看上面这张图，很明显右边这个运动轨迹要比左边的真实很多。

原理动画如下：

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d05516f056f8408c85f3359ec4620582~tplv-k3u1fbpfcp-zoom-1.image)

类似的一些比较有意思的 Web 动画 DEMO：

![Squash and stretch - 1](https://user-images.githubusercontent.com/8554143/120913446-d9383e00-c6c9-11eb-9d04-797a22750bbb.gif)

[CodePen Demo -- CSS Flippy Loader 🍳 By Jhey](https://codepen.io/jh3y/pen/VwLdVoZ)

仔细看上面这个 Loading 动画，每个块在跳起之前都会有一个压缩准备动作，在压缩的过程中高度变低，宽度变宽，这就是挤压和拉伸，让动画看上去更加真实。

OK，再看两个类似的效果，加深下印象：

![Squash and stretch - 2](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b038711d83a84984a063aa785511a97c~tplv-k3u1fbpfcp-zoom-1.image)

[CodePen Demo -- CSS Loading Animation](https://codepen.io/Chokcoco/pen/xxqjzVg)

![Squash and stretch - 3](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c990cc34c1a34d679734eef9e7073d4c~tplv-k3u1fbpfcp-zoom-1.image)

[CodePen Demo -- CSS Animation Loader - Jelly Box](https://codepen.io/Chokcoco/pen/ZEeoRpb)

简单总结一下，挤压和拉伸的核心在于保持对象的体积一致，当拉伸元素时，它的宽度需要变薄，而当挤压元素时，它的宽度需要变宽。

## Anticipation -- 预备动作

准备动作用于为主要的动画动作做好准备，并使动作看起来更逼真。

譬如从地板上跳下来的舞者必须先弯曲膝盖，挥杆的高尔夫球手必须先将球杆向后挥动。

原理动画如下，能够看到滚动之前的一些准备动作：

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a805b8c2c2024396959a82aadfe3583c~tplv-k3u1fbpfcp-zoom-1.image)

看看一些实际应用的chang场景，下面这个动画效果：

![Anticipation 1](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fcb2bd24cc1b4483ad72e74792629fd2~tplv-k3u1fbpfcp-zoom-1.image)

[CodePen Demo -- Never-ending box By Pawel](https://codepen.io/jh3y/pen/VwLdVoZ)

小球向上滚动，但是仔细看的话，每次向上滚动的时候都会先向后摆一下，可以理解为是一个蓄力动作，也就是我们说的准备动作。

类似的，看看这个购物车动画，运用了非常多的小技巧，其中之一就是，车在向前冲之前会后退一点点进行一个蓄力动作，整个动画的感觉明显就不一样，它让动画看起来更加的自然：

![Anticipation](https://user-images.githubusercontent.com/8554143/121324679-879ae800-c943-11eb-9e05-68a825768f7f.gif)

## Staging -- 演出布局

Staging 意为演出布局，它的目的是引导观众的注意力，并明确一个场景中什么是最重要的。

可以通过多种方式来完成，例如在画面中放置角色、使用光影，或相机的角度和位置。该原则的本质是关注核心内容，避免其他不必要的细节吸引走用户的注意力。

原理动画如下：

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1c9a79f2a70a4ed2bf0f00a4ba84c7c2~tplv-k3u1fbpfcp-zoom-1.image)

上述 Gif 原理图效果不太明显，看看示例效果：

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/078f687b66ca4a8493b14365a554572f~tplv-k3u1fbpfcp-zoom-1.image)

[CodePen Demo -- CSS Loading Animation](https://codepen.io/Chokcoco/pen/wvJjExj)

该技巧的核心就是在动画的过程中把主体凸显，把非主体元素通过模糊、变淡等方式弱化其效果，降低用户在其之上的注意力。

## Straight-Ahead Action and Pose-to-Pose -- 连续运动和姿态对应

其实表示的就是逐帧动画和补间动画：

- **FrameAnimation（逐帧动画）**：将多张图片组合起来进行播放，可以利用 CSS Aniation 的 Steps，画面由一帧一帧构成，类似于漫画书
- **TweenAnimation（补间动画）**：补间动画是在时间帧上进行关键帧绘制，不同于逐帧动画的每一帧都是关键帧，补间动画可以在一个关键帧上绘制一个基础形状，然后在时间帧上对另一个关键帧进行形状转变或绘制另一个形状等，然后中间的动画过程是由计算机自动生成。

这个应该是属于最基础的了，在不同场景下有不同的妙用。我们在用 CSS 实现动画的过程中，使用的比较多的应该是补间动画，逐帧动画也很有意思，譬如设计师设计好的复杂动画，利用多张图片拼接成逐帧动画也非常不错。

逐帧动画和补间动画适用在不同的场合，没有谁更好，只有谁更合适，比较下面两个时钟动画，其中一个的秒针运用的是逐帧动画，另外一个则是补间动画：

- 时钟秒针运用的是逐帧动画：

![Straight-Ahead Action and Pose-to-Pose - CSS3 Working Clock](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/75785e55fdbe4f8daae85a965ec9f59d~tplv-k3u1fbpfcp-zoom-1.image)

[CodePen Demo -- CSS3 Working Clock By Ilia](https://codepen.io/iliadraznin/pen/JcqbE)

- 时钟秒针运用的是补间动画：

![Straight-Ahead Action and Pose-to-Pose - CSS Rotary Clock](https://user-images.githubusercontent.com/8554143/121325661-5e2e8c00-c944-11eb-8f4c-919d5a8603bb.gif)

[CodePen Demo -- CSS Rotary Clock By Jake Albaugh](https://codepen.io/jakealbaugh/pen/ZYdYRO)

有的时候一些复杂动画无法使用 CSS 直接实现的，也会利用逐帧的效果近似实现一个补间动画，像是苹果这个耳机动画，就是实际逐帧动画，但是看起来是连续的：

![steps 1](https://user-images.githubusercontent.com/8554143/120919190-e6195980-c6ea-11eb-85d2-24861d0f0477.gif)

[CodePen Demo -- Apple AirPods Pro Animation (final demo) By Blake Bowen](https://codepen.io/osublake/pen/2152a28cffe2c2c0cca8a3e47f7b21c6)

这里其实是多张图片的快速轮播，每张图片表示一个关键帧。

## Follow through and overlapping action 跟随和重叠动作

跟随和重叠动作是两种密切相关的技术的总称，它们有助于更真实地渲染运动，并有助于给人一种印象，即运动的元素遵循物理定律，包括惯性原理。

- **跟随**意味着在角色停止后，身体松散连接的部分应该继续移动，并且这些部分应该继续移动到角色停止的点之外，然后才被拉回到重心或表现出不同的程度的振荡阻尼；
- **重叠动作**是元素各部分以不同速率移动的趋势（手臂将在头部的不同时间移动等等）；
- 第三种相关技术是**拖动**，元素开始移动，其中一部分需要几帧才能追上。

要创造一个重叠动作的感觉，我们可以让元件以稍微不同的速度移动到每处。这是一种在 iOS 系统的视窗过渡中被运用得很好的方法。一些按钮和元件以不同速率运动，整体效果会比全部东西以相同速率运动要更逼真，并留出时间让访客去适当理解变化。

原理示意图：

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/03ddc23eb0c141a58713edb40500eba7~tplv-k3u1fbpfcp-zoom-1.image)

看看下面这个购物车动画，仔细看购物车，在移动到停止的过程中，有个很明显的刹车再拉回的感觉，这里运用到了跟随的效果，让动画更加生动真实：

![Follow through and overlapping action](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/20412b6bf8994dda89141e70dbe5770b~tplv-k3u1fbpfcp-zoom-1.image)

## Slow In and Slow Out -- 缓入缓出

现实世界中物体的运动，如人体、动物、车辆等，需要时间来加速和减速。

真实的运动效果，它的缓动函数一定不是 Linear。出于这个原因，运动往往是逐步加速并在停止前变慢，实现一个慢进和慢出的效果，以贴近更逼真的动作。

示意图：

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/40a3705f0f8b4a2ba8a66e31559c236b~tplv-k3u1fbpfcp-zoom-1.image)

这个还是很好理解的。真实世界中，很少有缓动函数是 Linear 的运动。

## Arc -- 弧线运动

大多数自然动作倾向于遵循一个拱形轨迹，动画应该遵循这个原则，遵循隐含的**弧形**以获得更大的真实感。

原理示意图：

![img](https://user-images.githubusercontent.com/8554143/121349160-c6d53300-c95b-11eb-82e9-1a4bb6d75eaa.gif)

嗯哼，在很多动画中，使用弧线代替直线，能够让动画效果更佳的逼真。看看下面这个烟花粒子动画：

![arc1](https://user-images.githubusercontent.com/8554143/121842582-390a9680-cd13-11eb-91d8-ba4f95129dce.gif)

[CodePen Demo -- Particles, humankind's only weakness By Rik Schennink](https://codepen.io/rikschennink/pen/kAcxu)

整个烟花粒子动画看上去非常的自然，因为每个粒子的下落都遵循了自由落体的规律，它们的运动轨迹都是弧线而不是直线。

## Secondary Action -- 次要动作

将次要动作添加到主要动作可以使场景更加生动，并有助于支持主要动作。走路的人可以同时摆动手臂或将手臂放在口袋里，说话或吹口哨，或者通过面部表情来表达情绪。

原理示意图：

![img](https://user-images.githubusercontent.com/8554143/121349244-dbb1c680-c95b-11eb-948c-005eaf67f5ff.gif)

简单的一个应用实例，看看下面这个动画：

![Secondary Action - Submarine Animation (Pure CSS)](https://user-images.githubusercontent.com/8554143/121134665-3f59c800-c866-11eb-8ec6-b3e50a0805e8.gif)

[CodePen Demo -- Submarine Animation (Pure CSS) By Akhil Sai Ram](https://codepen.io/akhil_001/pen/gQwJPJ)

这里实现了一个潜艇向前游动的画面，动画本身还有很多可以优化的地方。但也有一些值得学习肯定的地方，动画使用了尾浆转动和气泡和海底景物移动。

同时，值得注意的是，窗口的反光也是一个很小的细节，表示船体在移动，这个就属于一个次要动作，衬托出主体的移动。

再看看下面这打印动画，键盘上按键的上上下下模拟了点击效果，其实也是个次要动作，衬托主体动画效果：

![Secondary Action - CodePen Home CSS Typewriter](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/caba8cab25294c278f0e90cd4d640845~tplv-k3u1fbpfcp-zoom-1.image)

[CodePen Demo -- CSS Typewriter By Aaron Iker](https://codepen.io/aaroniker/pen/XWWPbep)

## Timing -- 时间节奏

时间是指给定动作的绘图或帧数，它转化为动画动作的速度。

在纯粹的物理层面上，正确的计时会使物体看起来遵守物理定律。例如，物体的重量决定了它对推动力的反应，因为重量轻的物体会比重量大的物体反应更快。

同一个动画，使用不同的速率展示，其效果往往相差很多。对于 Web 动画而言，可能只需要调整 `animation-duration` 或 `transition-duration` 的值。

原理示意图：

![img](https://user-images.githubusercontent.com/8554143/121349380-03a12a00-c95c-11eb-8cba-2b3c3ecf264b.gif)

可以看出，同个动画，不同的缓动函数，或者赋予不同的时间，就能产生很不一样的效果。

当然，时间节奏可以运用在很多地方，譬如在一些 Loading 动画中：

![Timing - Only Css 3D Cube](https://user-images.githubusercontent.com/8554143/121120343-f26af700-c84f-11eb-92fb-4f85a36c80d6.gif)

[CodePen Demo -- Only Css 3D Cube By Hisami Kurita](https://codepen.io/hisamikurita/pen/LYEWXEW)

又或者是这样，同个动画，不同的速率：

![Timing - Rotating Circles Preloader](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8dc362a387a043ac8f2d115b1daa369d~tplv-k3u1fbpfcp-zoom-1.image)

[CodePen Demo -- Rotating Circles Preloader](https://codepen.io/Chokcoco/pen/mdWKvJB)

也可以是同样的延迟、同样的速率，但是不同的方向：

![Timing -  2020 SVG Animation | Using pathLength=1 with stroke-dashoffset Tutorial | @keyframers 2.29.0](https://user-images.githubusercontent.com/8554143/121120653-92288500-c850-11eb-9f86-19c891a45e8b.gif)

[CodePen Demo -- 2020 SVG Animation By @keyframers](https://codepen.io/team/keyframers/pen/BayJqMX)

## Exaggeration -- 夸张手法

夸张是一种对动画特别有用的效果，因为力求完美模仿现实的动画动作可能看起来是静态和沉闷的。

使用夸张时，一定程度的克制很重要。如果一个场景包含多个元素，则应平衡这些元素之间的关系，以避免混淆或吓倒观众。

原理示意图：

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b53abe979d0f4833a37d95634943378a~tplv-k3u1fbpfcp-zoom-1.image)

OK，不同程度的展现对效果的感官是不一样的，对比下面两个故障艺术动画：

轻微晃动故障：

![Exaggeration 1](https://user-images.githubusercontent.com/8554143/121841811-ac130d80-cd11-11eb-8b27-a2c05a517ad2.gif)

严重晃动故障：

![Exaggeration 2](https://user-images.githubusercontent.com/8554143/121841820-b1705800-cd11-11eb-9d2c-fced52056597.gif)

[CodePen Demo -- Glitch Animation](https://codepen.io/Chokcoco/pen/gOmdRzE)

可以看出，第二个动画明显能感受到比第一个更严重的故障。

过多的现实主义会毁掉动画，或者说让它缺乏吸引力，使其显得静态和乏味。相反，为元素对象添加一些夸张，使它们更具活力，能够让它们更吸引眼球。

## Solid drawing -- 扎实的描绘

这个原则表示我们的动画需要尊重真实性，譬如一个 3D 立体绘图，就需要考虑元素在三维空间中的形式。

了解掌握三维形状、解剖学、重量、平衡、光影等的基础知识。有助于我们绘制出更为逼真的动画效果。

原理示意图：

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/24cb4889ce6b4bd598eab47e3e8837fa~tplv-k3u1fbpfcp-zoom-1.image)

再再看看下面这个动画，名为 Close the blinds -- 关上百叶窗：

![Solid drawing - Close the blinds](https://user-images.githubusercontent.com/8554143/121016361-a166ee80-c7ce-11eb-9a98-28036a8488fe.gif)

[CodePen Demo -- Close the blinds By Chance Squires](https://codepen.io/chancesq/pen/mdejYeQ)

hover 的时候有一个关上动画，使用多块 div 模拟了百叶窗的落下，同时配合了背景色从明亮到黑暗的过程，很好的利用了色彩光影辅助动画的展示。

再看看这个摆锤小动画，也是非常好的使用了光影、视角元素：

![Solid drawing - The Three-Body Problem](https://user-images.githubusercontent.com/8554143/121017134-821c9100-c7cf-11eb-8be2-fa161c0a3dc1.gif)

[CodePen Demo -- The Three-Body Problem By Vian Esterhuizen](https://codepen.io/heyvian/pen/KKwoZNX)

最后这个 Demo，虽然是使用 CSS 实现的，但是也尽可能的还原模拟了现实中纸张飞舞的形态，并且对纸张下方阴影的变化也做了一定的变化：

![Solid drawing - 3D CSS-only flying page animation tutorial](https://user-images.githubusercontent.com/8554143/121017821-4b934600-c7d0-11eb-898d-21e92a7ce161.gif)

[CodePen Demo -- D CSS-only flying page animation tutorial By @keyframers](https://codepen.io/team/keyframers/pen/YzKjoev)

好的动画，细节是经得起推敲的。

## Appeal -- 吸引力

一反往常，精美的细节往往能非常好的吸引用户的注意力。

吸引力是艺术作品的特质，而如何实现有吸引力的作品则需要不断的尝试。

原理示意图：

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a8bf7fbd01b54e7b9a52c38df12732c0~tplv-k3u1fbpfcp-zoom-1.image)

我觉得这一点可能是 Web 动画的核心，一个能够吸引人的动画，它肯定是有某些特质的，让我们一起来欣赏下。

![Appeal - 1](https://user-images.githubusercontent.com/8554143/121014822-fdc90e80-c7cc-11eb-93c1-e9940d6f8a4e.gif)

[CodePen Demo -- Download interaction By Milan Raring](https://codepen.io/milanraring/pen/jOEOmbv)

通过一连串的动作，动画展开、箭头移动、进度条填满、数字变化，把一个下载动画展示的非常 Nice，让人在等待的过程并不觉得枯燥。

再来看看这个视频播放的效果：

![Appeal - 2](https://user-images.githubusercontent.com/8554143/121015442-9495cb00-c7cd-11eb-8387-3303975b13b0.gif)

[CodePen Demo -- Video button animation - Only CSS](https://codepen.io/milanraring/pen/QWwyLdp)

通过一个遮罩 hover 放大，再到点击全屏的变化，一下子就将用户的注意力给吸引了过来。

# Web 动画的一些常见误区

当然，上述的一些技巧源自于**迪士尼动画原则**，我们可以将其中的一些思想贯穿于我们的 Web 动画的设计之中。

但是，必须指出的是，Web 动画本身在使用的时候，也有一些原则是我们需要注意的。主要有下面几点：

- 增强动画与页面元素之间的关联性
- 不要为了动画而动画，要有目的性
- 动画不要过于缓慢，否则会阻碍交互

### 增强动画与页面元素之间的关联性

这个是一个常见的问题，经常会看到一些动画与主体之间没有关联性。关联性背后的逻辑，能帮助用户在界面布局中理解刚发生的变化，是什么导致了变化。

好的动画可以做到将页面的多个环节或者场景有效串联。

比较下面两个动画，第二个就比第一个更有关联性：

没有强关联性的：

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/978f5409ea82485a8289aacc44aab0df~tplv-k3u1fbpfcp-zoom-1.image)

有关联性的：

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e4bffe83996a46a8ae777c53a98f1233~tplv-k3u1fbpfcp-zoom-1.image)

很明显，第二个动画比第一个动画更能让用户了解页面发生的变化。

### 不要为了动画而动画，要有目的性

这一点也很重要，不要为了动画而动画，要有目的性，很多时候很多页面的动画非常莫名其妙。

emm，简单一点来说就是单纯的为了炫技而存在的动画。这种动画可以存在于你的 Demo，你的个人网站中，但不太适合用于线上业务页面中。

使用动画应该有明确的目的性，譬如 Loading 动画能够让用户感知到页面正在发生变化，正在加载内容。

![img](https://user-images.githubusercontent.com/8554143/108797222-a60fea00-75c5-11eb-852a-442d79263b09.gif)

在我们的交互过程中，适当的增加过渡与动画，能够很好的让用户感知到页面的变化。类似的还有一些滚动动画。丝滑的滚动切换比突兀的内容明显是更好的体验。

### 动画不要过于缓慢，否则会阻碍交互

缓慢的动画，它产生了不必要的停顿。

一些用户会频繁看到它们的过渡动画，尽可能的保持简短。让动画持续时间保持在 300ms 或更短。

比较下面两个动画，第一次可能会让用户耳目一新，但是如果用户在浏览过程中频繁出现通过操作，过长的转场动画会消耗用户大量不必要的时间：

过长的转场动画：

![img](https://user-images.githubusercontent.com/8554143/122877740-81f0c980-d369-11eb-8a28-cd3bb87258f2.gif)

缩短转场动画时间，保持恰当的时长：

![img](https://user-images.githubusercontent.com/8554143/122877744-83ba8d00-d369-11eb-99fc-f744ef1c4d4a.gif)

## 结合产品及业务的创意交互动画

这一点是比较有意思的。我个人认为，Web 动画做得好用的妙，是能非常好的提升用户体验，提升品牌价值的。

结合产品及业务的创意动画，是需要挖掘，不断打磨的不断迭代的。譬如大家津津乐道的 BiliBili 官网，它的顶部 Banner，配合一些节日、活动，经常就会有出现一些有意思的创意交互动画。简单看两个：

![img](https://user-images.githubusercontent.com/8554143/122881774-18bf8500-d36e-11eb-811f-938cf40bff8d.gif)

以及这个：

![img](https://user-images.githubusercontent.com/8554143/122882358-ad29e780-d36e-11eb-8266-e6e429f4975f.gif)

我非常多次在不同地方看到有人讨论 Bilibili 的顶部 banner 动画，可见它这块的动画是成功的。很好的结合了一些节日、实事、热点，当成了一种比较固定的产品去不断推陈出新，在不同时候给与用户不同的体验。

## 考虑动画的性价比

最后一条，就是动画虽好，但是打磨一个精品动画是非常耗时的，尤其是在现在非常多的产品业务都是处于一种敏捷开发迭代之下。

一个好的 Web 动画从构思到落地，绝非前端一个人的工作，需要产品、设计、前端等等相关人员公共努力， 不断修改才能最终呈现比较好的效果。所以在项目初期，一定需要考虑好性价比，是否真的值得为了一个 Web 动画花费几天时间呢？当然这是一个非常见仁见智的问题。

