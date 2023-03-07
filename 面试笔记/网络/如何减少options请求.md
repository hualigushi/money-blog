# 如何减少options请求？

`Access-Control-Max-Age:1800`

首部字段 Access-Control-Max-Age 表明该响应的有效时间，单位是【秒】，浏览器自身维护了一个最大有效时间，如果该首部字段的值超过了最大有效时间，将不会生效。

不同浏览器有不同的上限。在Firefox中，上限是24h（即86400秒），而在Chromium 中则是10min（即600秒）。Chromium 同时规定了一个默认值 5 秒。

Access-Control-Max-Age方法对完全一样的url的缓存设置生效，多一个参数也视为不同url。也就是说，如果设置了10分钟的缓存，在10分钟内，所有请求第一次会产生options请求，第二次以及第二次以后就只发送真正的请求了。

Access-Control-Max-Age:-1时，将禁用options请求，需要对所有呼叫进行预检选项检查。