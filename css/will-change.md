[TOC]

不知道你有没有注意到，在基于Webkit的浏览器上执行某些CSS操作时页面会出现不流畅或者闪一下的情况，尤其是执行CSS动画的时候，那你之前可能已经听过“硬件加速(hardware acceleration)”这个专业术语了。

### CPU&GPU&硬件加速(Hardware Acceleration)

简单来说硬件加速意味着浏览器会帮你把一部分对渲染页面来说较繁重的任务交给GPU(**Graphics Processing Unit**)，而不是一股脑都交给CPU(**Central Processing Unit** )去处理，当这部分CSS操作得到硬件加速时，可以使页面渲染速度更快。

CPU在电脑主板上，就像是计算机的”大脑“,CPU几乎会做所有事，GPU位于计算机的显卡上，主要用做图形渲染，此外，GPU是专为执行图形渲染所需的复杂数学和几何计算而设计的，所以将一些操作移到GPU上去处理可以带来巨大的性能提升并且减轻了CPU的压力，在移动端尤为明显。

硬件加速(又名GPU加速)依赖于浏览器在渲染页面时使用的分层模型，当对页面上的元素执行某些操作(例如3D变换)，对应元素会被提升到到自己的图层，独立于页面的其余部分的呈现并在后期合成（绘制到屏幕上），这样单独把元素隔离，可以使得当页面上只有这个元素发生变换(transform)的时候其余元素不需要重新渲染，从而带来速度提升的优点，值得一提的是，只有3D变换才有资格拥有自己的图层，2D变换则没有。

CSS animation，transform，transition这些属性并不会自动被硬件加速，而是由浏览器的渲染引擎去执行的，但是一些浏览器通过某些属性提供硬件加速，从而提升页面的渲染性能。例如CSS中的opacity属性是少数几个可以被浏览器认定为可被硬件加速的属性之一，因为GPU可以很容易的实现。一般来说，任何想要通过CSS transition或动画淡化不透明度的图层的行为，浏览器会把它丢给GPU去处理从而提高处理速度。所有的CSS属性中`opacity`是性能最好属性的之一，其他常见的硬件加速操作是CSS 3D变换

**Hack方法来硬件加速**：translateZ() 或者 translate3d()

使用`translateZ()`(或`translate3d()`)这种hack方式（有时也称为null变换hack）来让浏览器对`animation`或`transform`行为使用硬件加速，通过向一个不会在三维空间中转换的元素添加简单的3D变换来实现硬件加速。例如通过给一个二维空间中动画添加简单的规则来硬件加速。

```css
transform:translate3d(0,0,0)
```

硬件加速操作会创建所谓的合成层，合成层会被上传到GPU并由GPU合成，但是这种hack的方法去创建图层并不是万能的，图层创建可以加快页面加载速度，但会带来其他的成本：它会占用系统RAM和GPU上的内存（限于移动设备），并且很多时候都会带来不良影响（特别是在移动设备上），所以这种方法要合理的去使用，你必须要清楚的知道使用这种方式是不是真的可以提高页面性能，不能使这个操作反而成了影响页面性能的瓶颈。

除了这种创建图层的方法，CSS引入了一个新的属性，它允许我们提前告知浏览器可能会对元素进行哪些操作，让浏览器去优化并提前处理那些潜在的比较消耗性能的操作比如在动画开始之前，提前处理元素的动画行为。这个属性就是`will-change`

### 新属性`will-change`的荣光

`will-change`属性允许你提前通知浏览器你可能会对某个元素做什么类型的操作，以便于浏览器在需要的时候采取适当的优化方案。因此，避免了可能对页面的响应性产生负面影响的非必要成本，使元素可以更快地呈现。渲染并快速更新，从而获得更流畅的体验。

举个例子，当对元素使用CSS transform时，元素及其内容可能会提升为图层，如之前所言，之后会将他们合成(composited)（绘制在屏幕上）,但是将一个元素提升到一个新图层是很消耗性能的，这可能会使transform动画的开始延迟明显的几分之一秒，从而引起明显的“闪烁”。

为了避免这种情况发生，我们可以提前告知浏览器，让浏览器可以提前做准备，那么当同样的操作发生时，因为元素的图层已准备就绪，然后就可以立刻执行转换动画，从而渲染元素并快速更新页面。

使用`will-change`可以提示浏览器将会发生的转化，语法非常简单

```css
will-change:transform
```

也可以添加多个你期望改变的确切属性的值。如：

```css
will-change:transform,opacity
```

确切指定你想改变属性可以让浏览器更好的决策如何以更优的办法处理这些变动，这明显是比使用hack手法让浏览器被迫创建可能无用的图层的更好且更有效的一种方法了

### will-change 是否会给当前元素带来其他副作用

**是，也不是**，这取决于你给定的属性。如果该属性的任何非初始值将在元素上创建堆栈上下文，则在`will-change`中指定该属性将在元素上创建堆栈上下文。举个例子：将`clip-path`属性和`opecity`属性用于初始值以外的值时，都会在它们所应用的元素上创建堆栈上下文。因此，使用这些属性中的一个（或两个）作为`will-change`的值，即使在更改实际发生之前，也会在元素上创建堆叠上下文，这同样适用于将在元素上创建堆栈上下文的其他属性

同样，某些属性可能导致为固定位置的元素创建一个包含块。例如，一个转换后的元素为其所有定位子孙元素创建一个包含块，即使那些已被设置为`position：fixed`的元素。因此，如果某个属性会导致创建一个包含块，那么将其指定为`will-change`的值也将导致为固定位置元素生成包含块，所以如前所述，某些`will-change`属性的变化的导致创建新的合成层，但是，GPU不支持大多数浏览器中CPU所支持的亚像素抗锯齿功能，所以有时会导致内容模糊（尤其是文本）

另外`will-change`属性不会直接影响对应元素，它只是给浏览器打个预防针，让浏览器以更高效的渲染方式去呈现元素内容，除了在之前提到的一些情况下创建堆栈上下文和包含块外，它对对应元素没有直接影响。

### 使用`will-change`的注意事项

不要使用`will-change`去尝试优化一切操作，有时候相反会带来反作用，要更加聪明且合理的使用它，`will-change`也有一些无法直接检测到的副作用，毕竟这也只是一种和浏览器后台通话的方式而已，不能指望它为你做所有事情，因为使用此属性时，请牢记以下几点，以确保在最大程度上利用该属性，同时避免因滥用该属性而带来的危害。

- #### 不要使用`will-change`声明对太多属性或元素的更改

  如同之前所提到的 直接让浏览器针对所有元素上的所有属性可能发生的更改进行优化的想法是很诱人的，所以可能会写出如下代码

  ```css
  *,
  *::before,
  *::after {
      will-change: all;
  }
  ```

  看上去好像很完美，但其实是有很大的问题的，首先`all`不是合法的`will-change`的值，其次这样笼统的规则根本就没什么用，这就好像在告诉浏览器这些所有的属性都可能变化且都需要要优化，那浏览器完全和没优化的版本处理没什么区别，因为没什么优先级也没有任何有用信息。并且如我们之前提到的hack方法，浏览器已经在自己做优化了，所以这样写没有任何意义，而且不可忽视的是因为浏览器要处理`will-change`相关的属性也会占用大量计算机资源，过度使用反而使得页面卡顿甚至崩溃

- #### 给浏览器足够的时间来工作

  `will-change`属性顾名思义：只告知浏览器即发生的变化，所以这个阶段什么改变也没发生，我们使用`will-change`是以便于浏览器对我们声明的更改进行某些优化，浏览器需要时间去处理优化这些更改，为了在这些变化在真正发生时可以立即生效，所以在元素更改之前立即设置`will-change`几乎没有任何效果，并且可能比不设置更糟糕，举个例子：

  ```css
  .element:hover {
      will-change: transform;
      transition: transform 2s;
      transform: rotate(30deg) scale(1.5);
  }
  ```

  这相当告诉浏览器对已经发生的变化进行优化，这完全没有作用，而且也不符合`will-change`的定义，你应该找到一种方法，至少可以提前一点时间预测某种改变会发生，然后设置`will-change`的值，举个例子，当点击一个元素时发生变化，然后在该元素悬停时设置`will-change`属性，这样将为浏览器提供足够的时间来优化该更改，从悬停元素到用户实际单击元素之间的时间足以使浏览器进行优化了。

```css
.element {
    /* style rules */
    transition: transform 1s ease-out;
}
.element:hover {
    will-change: transform;
}
.element:active {
    transform: rotateY(180deg);
}
```

但是如果我们期望的是在鼠标悬停时变化要怎么做呢？正如我们所提到的，上面的代码也是无用的。在这种情况下，通常仍然可以找到某种方法来在动作发生之前对其进行预测，例如悬停在目标元素的祖先元素上可以提供浏览器足够的反应执行时间，因为将鼠标悬停在其祖先元素上并不一定总是表明该元素将与之交互，因此这个阶段，可以执行诸如设置`will-change`属性之类的操作

```css
.element {
    transition: opacity .3s linear;
}
/* declare changes on the element when the mouse enters / hovers its ancestor */
.ancestor:hover .element {
    will-change: opacity;
}
/* apply change when element is hovered */
.element:hover {
    opacity: .5;
}
```

- #### 变更生效后移除掉`will-change`

  浏览器对即将发生的更改进行的优化通常成本很高，而且正如我们前面提到的，它会占用计算机的大部分资源，浏览器进行优化的通常行为是删除这些优化并尽快恢复到正常行为。但是，`will-change`会覆盖此行为，从而使优化保持的时间比浏览器原本的时间要长得多，正因为如此在使用完后要记得移除`will-change`来释放资源

  如果在样式中直接写死`will-change`，声明则无法直接移除，所以基本推荐使用JS来处理，通过脚本，可以在浏览器中声明你的更改，然后在更改完成后通过侦听更改完成的时间来移除`will-change`，举个例子：如我们之前提到的可以通过监听是否悬停在对应元素（或其祖先元素）上的mouseEnter事件中来设置`will-change`,如果你要对元素进行动画处理，则可以使用DOM事件animationEnd来侦听动画何时结束，然后在animationEnd触发后移除`will-change`。

  ```javascript
  // Rough generic example
  // Get the element that is going to be animated on click, for example
  var el = document.getElementById('element');
  
  // Set will-change when the element is hovered
  el.addEventListener('mouseenter', hintBrowser);
  el.addEventListener('animationEnd', removeHint);
  
  function hintBrowser() {
      // The optimizable properties that are going to change
      // in the animation's keyframes block
      this.style.willChange = 'transform, opacity';
  }
  
  function removeHint() {
      this.style.willChange = 'auto';
  }
  ```

- #### 有选择性的在CSS中直接使用`will-change`

  如之前提到的`will-change`被用来向浏览器提示一个元素将在几毫秒内发生的更改，这是允许`will-change`直接写在css中的用例之一，尽管我们建议使用JavaScript来设置和取消`will-change`，但是在某些情况下，在css中进行设置（并保留）是更好的选择。

  一个例子：在少数可能被用户反复交互且应该以快速的方式响应用户的互动的元素上设置`will-change`，因为元素数量有限，这就意味着浏览器进行的优化不会被过度使用，因此不会造成太大的伤害，例如：通过在用户请求时将其滑出来转换边栏。如下规则就很合适：

  ```css
  .sidebar {
      will-change: transform;
  }
  ```

  另一个例子是在几乎不断变化的元素上使用`will-change` 比如一个元素响应用户的鼠标移动，并随着鼠标移动在屏幕上移动，这种情况下直接在css中声明`will-change`的值就可以。因为它准确地描述了元素将有规律/不断地变化，因此应保持优化状态

  ```css
  .annoying-element-stuck-to-the-mouse-cursor {
      will-change: left, top;
  }
  ```

- #### `will-change`合法值

  `will-change`属性可取四种可能的值：`auto, scroll-position,contents,<custom-ident>`

  `<custom-ident>`值用于指定你希望更改的一个或多个属性的名称,多个属性值之间用逗号分隔，如下是合法的`will-change`属性名称的声明

  ```css
  will-change: transform;
  will-change: opacity;
  will-change: top, left, bottom, right;
  ```

  `<custom-ident>`值不包括`will-change, none, all, auto,scroll-position, contents`,所以如同文章之前提到的`will-change:all`不是合法的属性值会被浏览器忽略，

  `auto`则表示没有特定的意图，意味着浏览器不会做任何特殊处理

  `scoll-position` 顾名思义，表示你期望将来随时可以更改元素的滚动位置，这个值很有用，因为在使用时，浏览器将准备并呈现超出可滚动元素的滚动窗口中可见内容的内容。浏览器通常仅在滚动窗口中渲染内容，而某些内容超过该窗口，平衡了因跳过渲染而节省的内存和时间，从而使滚动看起来顺滑，使用`will-change:scroll-position`，它可以进行进一步的渲染优化，以便可以平滑地完成更长和或更快的内容滚动。

`contents`表示元素的内容可能会发生变化，浏览器通常会对元素做缓存，因为大部分情况下元素不会经常性发生变化，有时候仅仅只是位置的更改。这个值用来作为告诉浏览器减少或者避免对指定元素进行缓存的信号。因为如果元素的内容不断的变化，那么保留内容的缓存将毫无用处并且浪费时间，因为只要元素的内容发生更改，浏览器就会停止缓存并继续从头开始渲染该元素。
如同我们之前提到的。如果在`will-change`中指定某些属性，这些属性将无效，因为浏览器不会对大多数属性的更改进行任何特殊的优化。

