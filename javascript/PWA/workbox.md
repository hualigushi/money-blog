# Service Worker开发工具 —— Workbox



## webpack

![](F:\money-blog\javascript\PWA\workbox1.JPG)





![workbox2](F:\money-blog\javascript\PWA\workbox2.JPG)





![workbox3](F:\money-blog\javascript\PWA\workbox3.JPG)





![workbox4](F:\money-blog\javascript\PWA\workbox4.JPG)

![workbox5](F:\money-blog\javascript\PWA\workbox5.JPG)



```js
const WorkboxWebpackPlugin = require('workbox-webpack-plugin');

plugins: [
    new WorkboxWebpackPlugin.InjectManifest({
        swSrc: path.resolve(__dirname, 'src/service-worker.js'),
        swDest: 'service-worker.js',
        exclude: [/\.png$/],
        importWorkboxFrom: 'local'
    })
]
```







## serviceworker

![workbox6](F:\money-blog\javascript\PWA\workbox6.JPG)

![workbox7](F:\money-blog\javascript\PWA\workbox7.JPG)

![workbox8](F:\money-blog\javascript\PWA\workbox8.JPG)

![workbox9](F:\money-blog\javascript\PWA\workbox9.JPG)



service-worker.js

```js
workbox.core.setCacheNameDetails({
    prefix: 'sw-tools',
    suffix: 'v1',
    precache: 'precache',
    runtime: 'runtime-cache'
});

workbox.skipWaiting();
workbox.clientsClaim();

workbox.precaching.precacheAndRoute(self.__precacheManifest);

workbox.routing.registerRoute(
    /.*\.(?:png|jpg|jpeg|svg|gif)/g,
    workbox.strategies.cacheFirst({
        cacheName: 'my-image-cache',
    })
);
```

