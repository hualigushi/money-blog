# dpr 的值会影响 rem 吗？该如何处理呢？

```js
/**
 * 给跟标签加上 data-dpr 属性
 */
function setDpr() {
    dpr = window.devicePixelRatio || 1;
	var docEl = document.documentElement;
	docEl.setAttribute('data-dpr', dpr);
}

```

```js
$design-doc-dpr:2; //视觉稿采用的基准dpr
@mixin px2px($name, $px:0px) {
    #{$name}: round($px / $design-doc-dpr);
    [data-dpr="2"] & {
        #{$name}: round($px * 2 / $design-doc-dpr);
    }
    // for mx3
    [data-dpr="2.5"] & {
        #{$name}: round($px * 2.5 / $design-doc-dpr);
    }
    // for 小米note
    [data-dpr="2.75"] & {
        #{$name}: round($px * 2.75 / $design-doc-dpr);
    }
    [data-dpr="3"] & {
        #{$name}: round($px * 3 / $design-doc-dpr);
    }
    // for 三星note4
    [data-dpr="4"] & {
        #{$name}: $px * 4 / $design-doc-dpr;
    }
}
 
@mixin fontSize($px:0px) {
    @include px2px("font-size", $px);
}
```

这样，就可以实现在不同 dpr 设备字体的一致了，请注意，最后得到文字的 font-size 是不一样的。

针对页面布局会被缩放问题，只要设置宽度时转为 使用百分比（100vw、100vh）或者 使用 px2rem 函数即可；

针对 媒体查询（@media）无法确定 问题，由于页面缩放后，原来媒体查询限定的max-width、min-width 也会跟着被缩放，所以 @media 的媒体参数是不能写死的，但是可以根据处理字体缩放的问题的思路，针对不同的dpr设备，通过属性选择器为其加载不同的 css 即可：

```
@mixin mediaQuery($minWidth, $maxWidth) {
    @each $dpr in (1, 2, 2.5, 2.75, 3, 4) {
        @media screen #{if($minWidth,"and (min-width:" + ($minWidth * $dpr) ")","") +             
            if($maxWidth,"and (max-width:" + ($maxWidth * $dpr) + ")","")} {
              [data-dpr="#{$dpr}"] & {
                @content;
            }
        }
    }
}
```

需要时这样使用：

```
@include mediaQuery(512px, null) {
        .image {
            float: left;
            width: 50vw;
        }
        .content {
            margin-left: 50vw;
        }
   }
```

