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

func main() {
	
	//使用前面的代码
	f := AddUpper()
	fmt.Println(f(1))// 11 
	fmt.Println(f(2))// 13
	fmt.Println(f(3))// 16
 }
 ```
 
 # defer
 1. 在函数执行完毕后，及时释放资源
 2. 在defer将语句放入栈时，也会将相关的值拷贝同时入栈
 
 ```
 package main
import (
	"fmt"
)

func sum(n1 int, n2 int) int {
	
	//当执行到defer时，暂时不执行，会将defer后面的语句压入到独立的栈(defer栈)
	//当函数执行完毕后，再从defer栈，按照先入后出的方式出栈，执行
	defer fmt.Println("ok1 n1=", n1) //defer 3. ok1 n1 = 10
	defer fmt.Println("ok2 n2=", n2) //defer 2. ok2 n2= 20
	//增加一句话
	n1++ // n1 = 11
	n2++ // n2 = 21
	res := n1 + n2 // res = 32
	fmt.Println("ok3 res=", res) // 1. ok3 res= 32
	return res

}

func main() {
	res := sum(10, 20)
	fmt.Println("res=", res)  // 4. res= 32
}
```

# 字符串常用的系统函数

```
package main
import (
	"fmt"
	"strconv"
	"strings"
)

func main(){

	//1)统计字符串的长度，按字节 len(str)
	////golang的编码统一为utf-8 (ascii的字符(字母和数字) 占一个字节，汉字占用3个字节)
	str := "hello北" 
	fmt.Println("str len=", len(str)) // 8


	str2 := "hello北京"
	//2)字符串遍历，同时处理有中文的问题 r := []rune(str)
	r := []rune(str2)
	for i := 0; i < len(r); i++ {
		fmt.Printf("字符=%c\n", r[i])
	}


	//3)字符串转整数:	 n, err := strconv.Atoi("12")
	n, err := strconv.Atoi("123")
	if err != nil {
		fmt.Println("转换错误", err)
	}else {
		fmt.Println("转成的结果是", n)
	}

	//4)整数转字符串  str = strconv.Itoa(12345)
	str = strconv.Itoa(12345)
	fmt.Printf("str=%v, str=%T\n", str, str)

	//5)字符串 转 []byte:  var bytes = []byte("hello go")
	var bytes = []byte("hello go")
	fmt.Printf("bytes=%v\n", bytes)

	//6)[]byte 转 字符串: str = string([]byte{97, 98, 99})
	str = string([]byte{97, 98, 99}) 
	fmt.Printf("str=%v\n", str)

	//7)10进制转 2, 8, 16进制:  str = strconv.FormatInt(123, 2),返回对应的字符串
	str = strconv.FormatInt(123, 2)
	fmt.Printf("123对应的二进制是=%v\n", str)
	str = strconv.FormatInt(123, 16)
	fmt.Printf("123对应的16进制是=%v\n", str)

	//8)查找子串是否在指定的字符串中: strings.Contains("seafood", "foo") //true
	b := strings.Contains("seafood", "mary")
	fmt.Printf("b=%v\n", b) 

	//9)统计一个字符串有几个指定的子串 ： strings.Count("ceheese", "e") //4
	num := strings.Count("ceheese", "e")
	fmt.Printf("num=%v\n", num)

	//10)不区分大小写的字符串比较(==是区分字母大小写的): fmt.Println(strings.EqualFold("abc", "Abc")) // true

	b = strings.EqualFold("abc", "Abc")
	fmt.Printf("b=%v\n", b) //true

	fmt.Println("结果","abc" == "Abc") // false //区分字母大小写

	//11)返回子串在字符串第一次出现的index值，如果没有返回-1 : 
	//strings.Index("NLT_abc", "abc") // 4

	index := strings.Index("NLT_abcabcabc", "abc") // 4
	fmt.Printf("index=%v\n",index)

	//12)返回子串在字符串最后一次出现的index，
	//如没有返回-1 : strings.LastIndex("go golang", "go")

	index = strings.LastIndex("go golang", "go") //3
	fmt.Printf("index=%v\n",index)

	//13)将指定的子串替换成 另外一个子串: strings.Replace("go go hello", "go", "go语言", n) 
	//n可以指定你希望替换几个，如果n=-1表示全部替换

	str2 = "go go hello"
	str = strings.Replace(str2, "go", "北京", -1)
	fmt.Printf("str=%v str2=%v\n", str, str2)

	//14)按照指定的某个字符，为分割标识，将一个字符串拆分成字符串数组： 
	//strings.Split("hello,wrold,ok", ",")
	strArr := strings.Split("hello,wrold,ok", ",")
	for i := 0; i < len(strArr); i++ {
		fmt.Printf("str[%v]=%v\n", i, strArr[i])
	} 
	fmt.Printf("strArr=%v\n", strArr)

	//15)将字符串的字母进行大小写的转换: 
	//strings.ToLower("Go") // go strings.ToUpper("Go") // GO

	str = "goLang Hello"
	str = strings.ToLower(str) 
	str = strings.ToUpper(str) 
	fmt.Printf("str=%v\n", str) //golang hello

	//16)将字符串左右两边的空格去掉： strings.TrimSpace(" tn a lone gopher ntrn   ")
	str = strings.TrimSpace(" tn a lone gopher ntrn   ")
	fmt.Printf("str=%q\n", str)

	//17)将字符串左右两边指定的字符去掉 ： 
	//strings.Trim("! hello! ", " !")  // ["hello"] //将左右两边 ! 和 " "去掉
	str = strings.Trim("! he!llo! ", " !")
	fmt.Printf("str=%q\n", str)

	//20)判断字符串是否以指定的字符串开头: 
	//strings.HasPrefix("ftp://192.168.10.1", "ftp") // true

	b = strings.HasPrefix("ftp://192.168.10.1", "hsp") //true
	fmt.Printf("b=%v\n", b)
}
```

# 错误处理
1. defer+recover处理错误
```
func test() {
	//使用defer + recover 来捕获和处理异常
	defer func() {
		err := recover()  // recover()内置函数，可以捕获到异常
		if err != nil {  // 说明捕获到错误
			fmt.Println("err=", err)
			//这里就可以将错误信息发送给管理员....
			fmt.Println("发送邮件给admin@sohu.com~")
		}
	}()
	num1 := 10
	num2 := 0
	res := num1 / num2
	fmt.Println("res=", res)
}
```

2. 自定义错误
```
//如果文件名传入不正确，我们就返回一个自定义的错误
func readConf(name string) (err error) {
	if name == "config.ini" {
		//读取...
		return nil
	} else {
		//返回一个自定义错误
		return errors.New("读取文件错误..")
	}
}
```
