## 概念
Intersection Observer API 允许你配置一个回调函数，每当目标(target)元素与设备视窗或者其他指定元素发生交集的时候执行。

设备视窗或者其他元素我们称它为根元素或根(root)。

通常，您需要关注文档最接近的可滚动祖先元素的交集更改，如果元素不是可滚动元素的后代，则默认为设备视窗。

如果要观察相对于根(root)元素的交集，请指定根(root)元素为null。

## 用法
创建一个 IntersectionObserver对象，并传入相应参数和回调用函数，该回调函数将会在目标(target)元素和根(root)元素的交集大小超过阈值(threshold)规定的大小时候被执行。

阈值为1.0意味着目标元素完全出现在root选项指定的元素中可见时，回调函数将会被执行。

```
var options = {
    root: document.querySelector('#scrollArea'), 
    rootMargin: '0px', 
    threshold: 1.0
}

var observer = new IntersectionObserver(callback, options);
```
IntersectionObserver实例是一个异步的实例，它只有在浏览器空闲的状态下才会触发，如果浏览器当前的事件队列中，有一系列的回调函数正在等待处理，该方法是不会被执行到的，只有当浏览器的事件队列为空，浏览器在空闲的时候，才会执行该方法

传递到IntersectionObserver()构造函数的 options 对象，允许您控制调用观察者的回调的环境。它有以下字段：

1. **root**

指定根(root)元素，用于检查目标的可见性。必须是目标元素的父级元素。如果未指定或者为null，则默认为浏览器视窗。

2. **rootMargin**

root元素的外边距。类似于css中的 margin 属性，比如 "10px 20px 30px 40px" (top, right, bottom, left)。

如果有指定root参数，则rootMargin也可以使用百分比来取值。

该属性值是用作root元素和target发生交集时候的计算交集的区域范围，使用该属性可以控制root元素每一边的收缩或者扩张。

默认值为0。

3. **threshold**

可以是单一的number也可以是number数组，target元素和root元素相交程度达到该值的时候IntersectionObserver注册的回调函数将会被执行。

如果你只是想要探测当target元素的在root元素中的可见性超过50%的时候，你可以指定该属性值为0.5。

如果你想要target元素在root元素的可见程度每多25%就执行一次回调，那么你可以指定一个数组[0, 0.25, 0.5, 0.75, 1]。

默认值是0(意味着只要有一个target像素出现在root元素中，回调函数将会被执行)。

该值为1.0含义是当target完全出现在root元素中时候 回调才会被执行。

4. **trackVisibility**
 一个布尔值，指示当前观察器是否将跟踪目标可见性的更改，默认为 false ，注意，此处的可见性并非指目标元素和根元素是否相交，而是指视图上是否可见，
 
 如果此值设置为 false 或不设置，那么回调函数参数中 IntersectionObserverEntry 的 isVisible 属性将永远返回 false 。


5. **delay**
 一个数字，也就是回调函数执行的延迟时间（毫秒）。如果 trackVisibility 设置为 true，则此值必须至少设置为 100 ，否则会报错


为每个观察者配置一个目标
```
var target = document.querySelector('#listItem');
observer.observe(target);
```

回调接收 IntersectionObserverEntry对象和观察者的列表
```
var callback = function(entries, observer) { 
  entries.forEach(entry => {
    // Each entry describes an intersection change for one observed
    // target element:
    //   entry.boundingClientRect // 目标元素的矩形区域的信息
    //   entry.intersectionRatio
    //   entry.intersectionRect  // 目标元素与视口（或根元素）的交叉区域的信息
    //   entry.isIntersecting
    //   entry.rootBounds // 根元素的矩形区域的信息，可以用getBoundingClientRect()方法得到，如果没                       有根元素（即直接相对于视口滚动），则返回null
    //   entry.target // 被观察的目标元素，是一个 DOM 节点对象
    //   entry.time  // 监听器元素的持续时间
  });
};
```
注册的回调函数将会在主线程中被执行。所以该函数执行速度要尽可能的快。如果有一些耗时的操作需要执行，建议使用 Window.requestIdleCallback() 方法。

## 方法
1. observe(element)：监听某个元素，传入要监听的元素作为参数

2. unobserve(element)：停止监听某个元素，传入停止监听的元素作为参数

3. disconnect()：使监听器停止工作

4. takeRecords()：返回所有正在监听的元素的IntersectionObserverEntry对象数组

## 例子
### 1 惰性加载（lazy load）
有时，我们希望某些静态资源（比如图片），只有用户向下滚动，它们进入视口时才加载，这样可以节省带宽，提高网页性能。这就叫做"惰性加载"。
```
function query(selector) {
  return Array.from(document.querySelectorAll(selector));
}

var observer = new IntersectionObserver(
  function(changes) {
    changes.forEach(function(change) {
      var container = change.target;
      var content = container.querySelector('template').content;
      container.appendChild(content);
      observer.unobserve(container);
    });
  }
);

query('.lazy-loaded').forEach(function (item) {
  observer.observe(item);
});
```
上面代码中，只有目标区域可见时，才会将模板内容插入真实 DOM，从而引发静态资源的加载。


### 2 无限滚动
```
var intersectionObserver = new IntersectionObserver(
  function (entries) {
    // 如果不可见，就返回
    if (entries[0].intersectionRatio <= 0) return;
    loadItems(10);
    console.log('Loaded new items');
  });

// 开始观察
intersectionObserver.observe(
  document.querySelector('.scrollerFooter')
);
```
无限滚动时，最好在页面底部有一个页尾栏（又称sentinels）。一旦页尾栏可见，就表示用户到达了页面底部，从而加载新的条目放在页尾栏前面。这样做的好处是，不需要再一次调用observe()方法，现有的IntersectionObserver可以保持使用。

### 3 IntersectionObserver吸顶（vue单文件组件简版）
```
<template>
  <div>
    <p class="fixed-top-helper"></p>
    <p class="fixed-top-reference"></p>
    <header>头部</header>
    <main>
      <img v-for="(image, i) in images" :key="i" :src="image" />
    </main>
  </div>
</template>

<script>
export default {
  data() {
    return {
      images: [
        'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1574247890587&di=88d4066be3d57ac962a6bec37e265d37&imgtype=0&src=http%3A%2F%2F01.imgmini.eastday.com%2Fmobile%2F20170810%2F20170810151144_d41d8cd98f00b204e9800998ecf8427e_3.jpeg',
        'https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=4054762707,1853885380&fm=26&gp=0.jpg',
        'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1574247912077&di=508a949e5e291875debf6ca844292cd4&imgtype=0&src=http%3A%2F%2F03imgmini.eastday.com%2Fmobile%2F20180827%2F20180827095359_6759372e9bd28026ee6f53b500fb4291_2.jpeg',
      ],
    };
  },
  mounted() {
    const header = document.querySelector('header');
    const fixedTopReference = document.querySelector('.fixed-top-reference');
    fixedTopReference.style.top = `${header.offsetTop}px`;

    const observerFixedTop = new IntersectionObserver((entries) => {
      entries.forEach((item) => {
        if (item.boundingClientRect.top < 0) {
          header.classList.add('fixed');
        } else {
          header.classList.remove('fixed');
        }
      });
    });
    observerFixedTop.observe(fixedTopReference);
  },
};
</script>

<style lang="scss" scoped>
.fixed-top-helper {
  height: 1px;
  background: #ccc;
}
header {
  background: #ccc;
  &.fixed {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
  }
}
main {
  img {
    display: block;
    height: 500px;
    margin: 30px;
  }
}
</style>
```
注意事项：

  - fixedTopReference是为了避免缓慢移动时add remove .fixed死循环，死循环的结果是抖动
  - fixedTopHelper是为了避免被吸顶元素没有上一个sibling元素（也就是说被吸顶元素是最上层元素）时，避免缓缓移动时add remove .fixed死循环抖动，特殊引入的标签，需要设置1个px的height
  - fixedTopHelper需要与被吸顶元素保持样式一致，以确保好的用户体验。

### 4 IntersectionObserver触底（vue单文件组件简版）
```
<template>
  <div>
    <main>
      <img v-for="(image, i) in images" :key="i" src="image" />
    </main>
    <footer>底部</footer>
  </div>
</template>

<script>
export default {
  data() {
    return {
      images: [
        'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1574247890587&di=88d4066be3d57ac962a6bec37e265d37&imgtype=0&src=http%3A%2F%2F01.imgmini.eastday.com%2Fmobile%2F20170810%2F20170810151144_d41d8cd98f00b204e9800998ecf8427e_3.jpeg',
        'https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=4054762707,1853885380&fm=26&gp=0.jpg',
        'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1574247912077&di=508a949e5e291875debf6ca844292cd4&imgtype=0&src=http%3A%2F%2F03imgmini.eastday.com%2Fmobile%2F20180827%2F20180827095359_6759372e9bd28026ee6f53b500fb4291_2.jpeg',
      ],
    };
  },
  mounted() {
    const footer = document.querySelector('footer');

    const observerTouchBottom = new IntersectionObserver((entries) => {
      entries.forEach((item) => {
        if (item.isIntersecting) {
          setTimeout(() => {
            console.log('滚动到了底部，可以发request请求数据了');
          }, 2000);
        }
      });
    });

    observerTouchBottom.observe(footer);
  },
};
</script>

<style lang="scss" scoped>
main {
  img {
    display: block;
    height: 500px;
    margin: 30px;
  }
}
footer {
  background: #ccc;
}
</style>
```

### 5 IntersectionObserver懒加载、吸顶、触底综合（vue单文件组件实战版）
- 对象拆分，下面拆分出lazyLoad，touchFooter，stickHeader三个对象并新建target和observer来分别标识被监听者和监听者
- 方法拆分，摒弃全部在mounted方法中变量的定义和赋值操作，很清晰的拆分出createLazyLoadObserver，createTouchFooterObserver，createStickHeaderObserver三个方法
- 取消监听，新建unobserveAllIntersectionObservers方法，在beforeDestory生命周期内，调用IntersectionObserver的disconnect(),unbserve(target)取消监听目标对象
```
<template>
  <div>
    <p class="fixed-top-helper"></p>
    <p class="fixed-top-reference"></p>

    <header>头部</header>
    <main>
      <img v-for="(image, i) in images" :key="i" src :data-img-url="image" />
    </main>
    <footer>底部</footer>
  </div>
</template>

<script>
const images = [
  'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1574247890587&di=88d4066be3d57ac962a6bec37e265d37&imgtype=0&src=http%3A%2F%2F01.imgmini.eastday.com%2Fmobile%2F20170810%2F20170810151144_d41d8cd98f00b204e9800998ecf8427e_3.jpeg',
  'https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=4054762707,1853885380&fm=26&gp=0.jpg',
  'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1574247912077&di=508a949e5e291875debf6ca844292cd4&imgtype=0&src=http%3A%2F%2F03imgmini.eastday.com%2Fmobile%2F20180827%2F20180827095359_6759372e9bd28026ee6f53b500fb4291_2.jpeg',
];
export default {
  data() {
    return {
      images,
      lazyLoad: {
        target: null,
        observer: null,
      },
      touchFooter: {
        target: null,
        observer: null,
      },
      stickHeader: {
        target: null,
        reference: null,
        observer: null,
      },
    };
  },
  mounted() {
    this.createLazyLoadObserver();
    this.createTouchFooterObserver();
    this.createStickHeaderObserver();
  },
  beforeDestroy() {
    this.unobserveAllIntersectionObservers();
  },
  methods: {
    /*
    * 创建懒加载observer并遍历监听所有img
    */
    createLazyLoadObserver() {
      this.lazyLoad.target = document.querySelectorAll('img');

      this.lazyLoad.observer = new IntersectionObserver((entries) => {
        entries.forEach((item) => {
          if (item.isIntersecting) {
            item.target.src = item.target.dataset.imgUrl;
          }
        });
      });

      this.lazyLoad.target.forEach((image) => {
        this.lazyLoad.observer.observe(image);
      });
    },
    /*
    * 创建触底observer并监听footer
    */
    createTouchFooterObserver() {
      this.touchFooter.target = document.querySelector('footer');

      this.touchFooter.observer = new IntersectionObserver((entries) => {
        entries.forEach((item) => {
          if (item.isIntersecting) {
            setTimeout(() => {
              console.log('滚动到了底部，可以发request请求数据了');
            }, 2000);
          }
        });
      });

      this.touchFooter.observer.observe(this.touchFooter.target);
    },
    /*
    * 创建吸顶observer并监听header
    * 创建reference首次防抖，.fixed-top-helper二次防抖
    */
    createStickHeaderObserver() {
      this.stickHeader.target = document.querySelector('header');
      this.stickHeader.reference = document.querySelector('.fixed-top-reference');
      this.stickHeader.reference.style.top = `${this.stickHeader.target.offsetTop}px`;

      this.stickHeader.observer = new IntersectionObserver((entries) => {
        entries.forEach((item) => {
          if (item.boundingClientRect.top < 0) {
            this.stickHeader.target.classList.add('fixed');
          } else {
            this.stickHeader.target.classList.remove('fixed');
          }
        });
      });

      this.stickHeader.observer.observe(this.stickHeader.reference);
    },
    /*
     * 取消observe所有监听目标
     */
    unobserveAllIntersectionObservers() {
      /* 
      * disconncet()可以取消所有observed目标
      * 如果调用unobserve取消监听，稍显冗余的代码如下:
        this.lazyLoad.target.forEach((image) => {
          this.lazyLoad.observer.unobserve(image);
        });
      */
      this.lazyLoad.observer.disconnect();
      /*
       * 由于touchFooter和stickHeader只observe了一个目标，因此单独unobserve即可
       * 当然disconnect()也是ok的
       */
      this.touchFooter.observer.unobserve(this.touchFooter.target);
      this.stickHeader.observer.unobserve(this.stickHeader.reference);
    },
  },
};
</script>

<style lang="scss" scoped>
.fixed-top-helper {
  height: 1px;
  background: #ccc;
}
header {
  background: #ccc;
  &.fixed {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
  }
}
main {
  img {
    display: block;
    height: 500px;
    margin: 30px;
  }
}
footer {
  background: #ccc;
}
</style>
```
### 6
```

<!DOCTYPE html>
<html>
<head>
	<title></title>
</head>
<style type="text/css">
	.list {
		width: 500px;
		height: 300px;
		margin: 20px;
	}
	.img {
		width: 100%;
		height: 300px;
	}
</style>
<body>
	<div>图片来源于http://www.acgjc.com</div>
	<div class="list">
		<img data-src="http://img.acgjc.com/wp-content/uploads/2019/07/183dc2537018c3e8934c819251c72136-1024x576.jpg" class="img">
	</div>
	<div class="list">
		<img data-src="http://img.acgjc.com/wp-content/uploads/2019/07/90cfb81aebc76a0fad7d311800fdbff2-1024x576.jpg" class="img">
	</div>
	<div class="list">
		<img data-src="http://img.acgjc.com/wp-content/uploads/2019/07/3685ffdd022374d80d5a5b0a1830146c-1024x553.jpg" class="img">
	</div>
	<div class="list">
		<img data-src="http://img.acgjc.com/wp-content/uploads/2019/07/e62c330f09a9c86a6b3471850b22957b-1024x512.jpg" class="img">
	</div>
	<div class="list">
		<img data-src="http://img.acgjc.com/wp-content/uploads/2019/07/c374b5e14e5f36fc76ff6485782fd6d8-1-1024x473.jpg" class="img">
	</div>
	<div class="list">
		<img data-src="http://img.acgjc.com/wp-content/uploads/2018/07/7255d9b1da818860b351d67762b59029-1024x576.png" class="img">
	</div>
	<div class="list">
		<img data-src="http://img.acgjc.com/wp-content/uploads/2018/07/9d94d1b3710caafc47d956c9b78cb636-1024x768.jpg" class="img">
	</div>
	<div class="list">
		<img data-src="http://img.acgjc.com/wp-content/uploads/2018/07/04f614a8a2c31c009dacfa04965474b4-1024x769.jpg" class="img">
	</div>
 
	<script type="text/javascript">
		let imgList = document.querySelectorAll('.img')
 
		let observer = new IntersectionObserver(entries => {
			entries.forEach(entry => {
				if (entry.intersectionRatio > 0 && entry.intersectionRatio <= 1) {
					entry.target.src = entry.target.dataset.src
					observer.unobserve(entry.target)
				}
			})
		})
		imgList.forEach(img => {
			observer.observe(img)
		})
	</script>
</body>
</html>
```
