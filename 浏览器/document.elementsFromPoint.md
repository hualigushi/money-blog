## 获取页面上指定位置的元素节点

所谓 "指定位置" 指的是: 以视口左上角为0点, 横向(x轴)和纵向(y轴)所组成的平面坐标位置点. 获取方法为: **document.elementFromPoint()** 和 **document.elementsFromPoint();**

```
document.elementsFromPoint(300,50) instanceof Array;
// true

document.elementFromPoint(300,50);
// <p>…</p>
```

![img](https://img2018.cnblogs.com/blog/1725689/201909/1725689-20190918174052778-1374403664.png)

 

 

注意: 

**1.** document.elementsFromPoint() 返回一个 **数组** 

**2.** document.elementFromPoint() 返回的是当前位置点下最深的那个元素节点;



# 应用：检查页面白屏

```js
/**
 * 检查页面白屏，横向，纵向18个点， > 17/18就认为白屏上报
 */

FEDLOG.blank = function () {
    if (!document.elementsFromPoint) {
        return;
    }
    const wrapperCls = ['body', 'html']
    let nothingCnt = 0
    let totalCnt = 0
    const getSel = (el) => {
        if (!el) return ''
        return (el.classList && el.classList[0]) || el.id || el.localName
    }
    const isWrap = (el) => {
        if (!el) return;
        totalCnt++
        if (wrapperCls.indexOf(getSel(el)) >= 0) {
            nothingCnt++
        }
    }
    let elementsX, elementsY;
    for (let i = 1; i < 10; i++) {
        elementsX = document.elementsFromPoint(window.innerWidth * i / 10, window.innerHeight / 2)
        elementsY = document.elementsFromPoint(window.innerWidth / 2, window.innerHeight * i / 10)
        isWrap(elementsX[0])
        isWrap(elementsY[0])
    }
    if (totalCnt - nothingCnt < 2 && !this._sendBlank) {
        let centerEl = document.elementsFromPoint(window.innerWidth / 2, window.innerHeight / 2)
        this.send({
            t1: 'monitor',
            t2: 'blank',
            d1: getSel(centerEl[0]),
            d2: `${totalCnt}-${nothingCnt}`,
            d3: `${window.screen.width}x${window.screen.height}`,
            d4: `${window.innerWidth}x${window.innerHeight}`
        });
        this._sendBlank = true
    }
};
```

