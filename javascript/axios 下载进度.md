axios 下载进度

```js
axios.create({
    baseURL: '',
    method: 'get',
    responseType: 'blob',
    timeout: 180 * 1000,
    onDownloadProgress: progressEvent => {
      if (onProgress) onProgress(progressEvent)
    }
  })

  progressEvent => {
    const progress = Math.floor(progressEvent.loaded / progressEvent.total * 100) + '%'
}
```
