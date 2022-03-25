setTimeout`和`requestAnimationFrame`两个动画api 性能层面： 

当页面被隐藏或最小化时，定时器 `setTimeout` 仍在后台执行动画任务。 

当页面处于未激活的状态下，该页面的屏幕刷新任 务会被系统暂停，`requestAnimationFrame` 也会停止。  



`requestAnimationFrame`性能更好，使用 `requestAnimationFrame` 执行动画， 最大优势是能保证回调函数在屏幕每一次刷 新间隔中只被执行一次，这样就不会引起丢帧，动画也就不会卡顿。 

`setTimeout` 通过设置一个间隔时间不断改变图像，达到动画效果。该方法在一些低端机 上会出现卡顿、抖动现象。 setTimeout 属于 JS 引擎，存在事件轮询，存在事件队列。 

`requestAnimationFrame` 属于 GUI 引擎，发生在渲 染过程的中重绘重排部分，与电脑分辨率保持一致。
