# init函数
1. 每一个源文件都可以包含一个init函数，该函数会在main函数执行前被调用，通常在init函数中完成初始化工作
2. 如果一个文件同时包含全局变量定义，init函数和main函数，则执行流程是变量定义->init->main.如果有引入其他包的话，先执行被引入包中的init函数
```
package utils
import "fmt"
var Age int
var Name string

//Age 和 Name 全局变量，我们需要在main.go 使用
//但是我们需要初始化Age 和 Name

//init 函数完成初始化工作
func init() {
	fmt.Println("utils 包的  init()...")
	Age = 100
	Name = "tom~"
}
```

```
package main
import (
	"fmt"
	//引入包
	"go_code/chapter06/funcinit/utils"
)

var age = test()

//为了看到全局变量是先被初始化的，我们这里先写函数
func test() int {
	fmt.Println("test()") //1
	return 90
}

//init函数,通常可以在init函数中完成初始化工作
func init() {
	fmt.Println("init()...") //2
}

func main() {
	fmt.Println("main()...age=", age) //3
	fmt.Println("Age=", utils.Age, "Name=", utils.Name)

}
```

# 闭包
闭包就是一个函数和与其相关的引用环境组合的一个整体
```
//累加器
func AddUpper() func (int) int {
	var n int = 10 
	var str = "hello"
	return func (x int) int {
		n = n + x
		str += string(36) // => 36 = '$'   
		fmt.Println("str=", str) // 1. str="hello$" 2. str="hello$$" 3. str="hello$$$"
		return n
	}
}

unc main() {
	
	//使用前面的代码
	f := AddUpper()
	fmt.Println(f(1))// 11 
	fmt.Println(f(2))// 13
	fmt.Println(f(3))// 16
 }
 ```
