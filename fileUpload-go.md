# 基于Golang实现分布式文件上传服务

重点结合开源存储(Ceph)及公有云(阿里OSS)，支持断点续传及妙传功能

微服务化及容器化部署

```
filestore-server

main.go
import (
  "net/http"
  "fmt"
)
func main () {
   http.HandleFunc("/file/upload"， handler.UploadHandler)
   http.HandleFunc("/file/upload/suc"， handler.UploadSucHandler)
   err := http.ListenAdServe(":8080", nil)
   if err != nil {
   fmt.Printf("Failed to start server, err: %s\n", err.Error())
   return
   }
}

handler  handler.go

package handler

import (
"net/http"
"io/ioutil"
"ioutil"
"io"
"fmt"
"os"
)
// 处理文件上传
func UploadHandler(w http.ResponseWriter, r *http.Request) {
  if r.Method == "GET" {
  // 返回上传html页面
  data, err := ioutil.ReadFile("./static/view/inde.html")
  if err != nil {
    io.WriteString(w, "internal server error")
  }
  io.WriteString(w, string(data))
  } else if r.Method == "POST" {
    // 接受文件流及存储到本地目录
    file, head, err := r.FormFile("file") // 读取上传的文件
    if err != nil {
      fmt.Printf("Fialed to get get data, err:%s"\n, err.Error())
      return
    }
    defer file.Close()
    
    newFile, err := os.Create("/tmp/"+head.Filename) // 创建新文件
     if err != nil {
      fmt.Printf("Fialed to create file, err:%s"\n, err.Error())
      return
    }
    defer newFile.Close()
    
    _, err := io.Copy(newFile, file) //拷贝文件
    if err != nil {
      fmt.Printf("Fialed to save data info file, err:%s"\n, err.Error())
      return
    }
    http.Redirect(w, r, "/file/uploadsuc", http.StatusFound)
    
  }
}
// 上传已完成
func UploadSucHandler(w http.ReponseWriter, r * http.Request) {
  io.WriteString(w, "Upload finished!")
}

static view index.html

util util.go

package util

import (
  "crypto/md5"
  "crypto/sha1"
  "hash"
  "io"
  "os"
  "path/filepath"
)

type Sha1Stream struct {
  _sha1 hash.Hash
}

func (obj *Sha1Stream) Update (data []byte) {
 if obj._sha1 == nil {
  obj._sha1 = sha1.New()
 }
 obj._sha1.Write(data)
}

func (obj *Sha1Stream) Sum() string {
  return hex.EncodeToString(obj._sha1.Sum([]byte("")))
}

func Sha1(data []byte) string {
  _sha1 := sha1.New()
  _sha1.Write(data)
  return hex.EncodeToString(_sha1.Sum([]byte("")))
}

func FileSha1(file *os.File) string {
  _sha1 := sha1.New()
  io.Copy(_sha1, file)
  return hex.EncodeToString(_sha1.Sum(nil))
}

func MD5(data []byte) string {
  _md5 := md5.New()
  _md5.Write(data)
  return hex.EncodeToString(_md5.Sum([]byte("")))
}

func FileMD5(file *os.File) string {
  _md5 := md5.New()
  io.Copy(_md5, file)
  return hex.EncodeToString(_md5.Sum(nil))
}

func PathExists(path string)(bool, error) {
_, err := os.Stat(path)
if err == nil {
  return true, nil
}
if os.IsNOtExist(err){
 return false, nil
}
return false,nil
}

func getFileSize(filename string) int64 {
  var result int64
  filepath.Walk(filename, func(path string,f os.FileInfo, er error) error {
    result = f.size()
    return nil
  })
  return result
}


meta filemata.go
package meta

import (
)
// 文件元信息结构
type FileMata strut {
 FileSha1 string
 Filename string
 FileSize int64
 Location string
 UploadAt string
}

var fileMetas map[string]FileMeta

func init() {
  fileMetas = make(map[string]FileMeta)
}
// 新增/更新文件元信息
func UpdateFileMeta (fmeta FileMeta) {
  fileMetas[fmeta.FileSha1] = fmeta
}

// 根据哈希获取文件元信息
function GetFileMeta(fileSha1 string) FileMeta {
  return fileMetas[fileSha1]
}
```

