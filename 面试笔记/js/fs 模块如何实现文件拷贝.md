小文件拷贝
```
// 文件拷贝 将data.txt文件中的内容拷贝到copyData.txt
// 读取文件
const fileName1 = path.resolve(__dirname, 'data.txt')
fs.readFile(fileName1, function (err, data) {    
    if (err) {        
        // 出错        
        console.log(err.message)        
        return    
    }    
    // 得到文件内容    
    var dataStr = data.toString()    
    // 写入文件    
    const fileName2 = path.resolve(__dirname, 'copyData.txt')    
    fs.writeFile(fileName2, dataStr, function (err) {        
        if (err) {            
            // 出错            
            console.log(err.message)            
            return        
        }        
        console.log('拷贝成功')    
    })
})
```

大文件拷贝
```
// copy 方法
function copy(src, dest, size = 16 * 1024, callback) {  
    // 打开源文件  
    fs.open(src, 'r', (err, readFd) => {    
        // 打开目标文件    
        fs.open(dest, 'w', (err, writeFd) => {      
            let buf = Buffer.alloc(size);      
            let readed = 0; // 下次读取文件的位置      
            let writed = 0; // 下次写入文件的位置      
            (function next() {        
                // 读取        
                fs.read(readFd, buf, 0, size, readed, (err, bytesRead) => {          
                    readed += bytesRead;          
                    // 如果都不到内容关闭文件          
                    if (!bytesRead) 
                      fs.close(readFd, err => console.log('关闭源文件'));          
                      // 写入          
                      fs.write(writeFd, buf, 0, bytesRead, writed, (err, bytesWritten) => {            
                          // 如果没有内容了同步缓存，并关闭文件后执行回调            
                          if (!bytesWritten) {              
                              fs.fsync(writeFd, err => {                
                                  fs.close(writeFd, err => return !err && callback());              
                              });            
                          }            
                          writed += bytesWritten;            
                          // 继续读取、写入            
                          next();          
                    });       
                });      
            })();    
        });  
    });
}
```