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
   http.HandleFunc("/file/meta"， handler.GetFileMetaHandler)
    http.HandleFunc("/file/download"， handler.DownloadHandler)
    http.HandleFunc("/file/update"， handler.FileMetaUpdateHandler)
    http.HandleFunc("/file/delete"， handler.FileDeleteHandler)
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
"time"
"encoding/json"
"filestore-server/filemeta"
"filestore-server/util"
)
// 处理文件上传
//文件上传步骤
//1. 获取上传页面
//2. 选取本地文件，form形式上传文件
//3. 云端接受文件流，写入本地存储
//4. 云端更新文件元信息集合
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
    
    fileMeta := meta.FileMeta{
      FileName: head.Filename,
      Location: "/tmp/" + head.Filename,
      UploadAt: time.Now().Format("2016-01-02 15:04:05")
    }
    newFile, err := os.Create(fileMeta.Location) // 创建新文件
     if err != nil {
      fmt.Printf("Fialed to create file, err:%s"\n, err.Error())
      return
    }
    newFile.Seek(0, 0)
    fileMeta.FileSha1 = util.FileSha1(newFile)
    meta.UpdateFileMeta(fileMeta)
    
    defer newFile.Close()
    
    fileMeta.FileSize, err := io.Copy(newFile, file) //拷贝文件
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

// 根据文件哈希，获取文件元信息
func GetFileMetaHandler(w http.ReponseWriter, r *http.Request) {
  r.parseForm()
  
  filehash := r.Form["filehash"][0]
  fMeta := meta.GetFileMeta(filehash)
  data, err := json.Marshal(fMeta)
  if err != nil {
    w.WriterHeader(http.StatusInternalServerError)
    return
  }
  w.Write(data)
}

func FileQueryHandler(w http.ReponseWriter, r *http.Request) {
  r.ParseForm()
  
  limitCnt,_ := strconv.Atoi(r.Form.Get("limit"))
  fileMetas := meta.GetLastFileMetas(limitCnt)
   data, err := json.Marshal(fileMetas)
  if err != nil {
    w.WriterHeader(http.StatusInternalServerError)
    return
  }
  w.Write(data)
}
//文件下载
func DownloadHandler(w http.ReponseWriter, r *http.Request) {
  r.parseForm()
  
  fsha1 := r.Form.Get("filehash")
  fm := meta.GetFileMeta(fsha1)
  f, err: = os.Open(fm.Location)
  if err != nil {
    w.WriteHeader(http.StatusINternalServerError)
    return
  }
  defer f.Close()
  
  data, err := ioutil.ReadAll(f)//读取文件的全部内容
  if err!= nil {
    w.WriteHeader(http.StatusInternalServerError)
    return
  }
  w.Header().Set("Content-Type", "application/octect-stream")
  w.Header().Set("Content-Description", "attachment;filename=\"" + fm.FileName + "\"")
  w.Write(data)
  
}

//更新文件元信息
func FileMetaUpdateHandler (w http.ReponseWriter, r *http.Request) {
  r.ParseForm()
  opType ;= r.Form.Get("op")
  fileSha1 := f.Form.Get("filehash")
  newFileName := r.Form.Get("filename")
  
  if opType != "0" {
    w.WriteHeader(http.StatusForBidden)
    return
  }
  
  if r.Method != "POST" {
    w.WriterHeader(http.StatusMethodNotAllowed)
    return
  }
  
  curFileMeta := meta.GetFileMeta(fileSha1)
  curFileMeta.FileName = newFileName
  meta.UpdateFileMeta(curFileMeta)
 
 data, err := json.Marshal(curFileMeta)
  if err != nil {
    w.WriteHeader(http.StatusIntervalServerError)
  }
   w.WriteHeader(http.StatusOK)
}


// 文件删除
func FileDeleteHandler (w http.ReponseWriter, r *http.Request) {
  r.ParseForm()
  
  fileSha1 := r.Form.Get("filehash")
  
  fMeta := meta.GetFileMeta(fileSha1)
  os.Remove(fMeta.Location)
  
  meta.RemoveFileMeta(fileSha1)
  
  w.WriteHeader(http.StatusOK)
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
 "sort"
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

// 获取批量的文件元信息列表
func GetLastFileMetas(count int) []FileMeta {
  fMetaArray := make([]FileMeta, len(fileMetas))
  for _, v := range {
    fMetaArray = append(fMetaArray, v)
  }
  
  sort.Sort(ByUploadTime(fMetaArray))
  return fMetaArray[0, count]
}

// 简单地删除文件
func RemoveFileMeta(fileSha1 string) {
  delete(filesMetas, fileSha1)
}

meta sort.go

```

