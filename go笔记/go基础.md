# 语法点
1. go函数没有默认参数，可选参数，函数重载，只有可变参数列表
2. go指针不能进行运算
3.数组是值类型，调用func f(arr [10]int)会拷贝数组，一般使用切片

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
# 结构体
1.结构体创建
```
package main
import (
	"fmt"
)

type Person struct{
	Name string
	Age int
}
func main() {
	//方式1

	//方式2
	p2 := Person{"mary", 20}
	// p2.Name = "tom"
	// p2.Age = 18
	 

	//方式3-&
	var p3 *Person= new(Person)
	//因为p3是一个指针，因此标准的给字段赋值方式
	//(*p3).Name = "smith" 也可以这样写 p3.Name = "smith"

	//原因: go的设计者 为了程序员使用方便，底层会对 p3.Name = "smith" 进行处理
	//会给 p3 加上 取值运算 (*p3).Name = "smith"
	(*p3).Name = "smith" 
	p3.Name = "john" //

	(*p3).Age = 30
	p3.Age = 100

	//方式4-{}
	//下面的语句，也可以直接给字符赋值
	//var person *Person = &Person{"mary", 60} 
	var person *Person = &Person{}

	//因为person 是一个指针，因此标准的访问字段的方法
	// (*person).Name = "scott"
	// go的设计者为了程序员使用方便，也可以 person.Name = "scott"
	// 原因和上面一样，底层会对 person.Name = "scott" 进行处理， 会加上 (*person)
	(*person).Name = "scott"
	person.Name = "scott~~"

	(*person).Age = 88
	person.Age = 10

}
```

结构体的所有字段在内存中是连续的

2. 结构体方法
```
package main

import (
	"fmt"	
)

type Person struct {
	Name string
} 

//函数
//对于普通函数，接收者为值类型时，不能将指针类型的数据直接传递，反之亦然

func test01(p Person) {
	fmt.Println(p.Name)
}

func test02(p *Person) {
	fmt.Println(p.Name)
}

//对于方法（如struct的方法），
//接收者为值类型时，可以直接用指针类型的变量调用方法，反过来同样也可以

func (p Person) test03() {
	p.Name = "jack"
	fmt.Println("test03() =", p.Name) // jack
}

func (p *Person) test04() {
	p.Name = "mary"
	fmt.Println("test03() =", p.Name) // mary
}

func main() {
	p := Person{"tom"}
	test01(p)
	test02(&p)

	p.test03()
	fmt.Println("main() p.name=", p.Name) // tom
	
	(&p).test03() // 从形式上是传入地址，但是本质仍然是值拷贝

	fmt.Println("main() p.name=", p.Name) // tom

	(&p).test04()
	fmt.Println("main() p.name=", p.Name) // mary
	p.test04() // 等价 (&p).test04 , 从形式上是传入值类型，但是本质仍然是地址拷贝
}
```

3.工厂模式
```
package model

//定义一个结构体
type student struct{
	Name string
	score float64
}

//因为student结构体首字母是小写，因此是只能在model使用
//我们通过工厂模式来解决

func NewStudent(n string, s float64) *student {
	return &student{
		Name : n,
		score : s,
	}
}

//如果score字段首字母小写，则，在其它包不可以直接方法，我们可以提供一个方法
func (s *student) GetScore() float64{
	return s.score //ok
}


package main
import (
	"fmt"
	"go_code/chapter10/factory/model"
)

func main() {
	//创建要给Student实例
	// var stu = model.Student{
	// 	Name :"tom",
	// 	Score : 78.9,
	// }

	//定student结构体是首字母小写，我们可以通过工厂模式来解决
	var stu = model.NewStudent("tom~", 98.8)

	fmt.Println(*stu) //&{....}
	fmt.Println("name=", stu.Name, " score=", stu.GetScore())
}
```

# 面向对象继承

```
package main

import (
	"fmt"
)


//编写一个学生考试系统

type Student struct {
	Name string
	Age int
	Score int
}

//将Pupil 和 Graduate 共有的方法也绑定到 *Student
func (stu *Student) ShowInfo() {
	fmt.Printf("学生名=%v 年龄=%v 成绩=%v\n", stu.Name, stu.Age, stu.Score)
}
func (stu *Student) SetScore(score int) {
	//业务判断
	stu.Score = score
}

//给 *Student 增加一个方法，那么 Pupil 和 Graduate都可以使用该方法
func (stu *Student) GetSum(n1 int, n2 int) int {
	return n1 + n2
}

//小学生
type Pupil struct { 
	Student //嵌入了Student匿名结构体
}

//显示他的成绩

//这时Pupil结构体特有的方法，保留
func (p *Pupil) testing() {
	fmt.Println("小学生正在考试中.....")
}

//大学生, 研究生。。


//大学生
type Graduate struct {
	Student //嵌入了Student匿名结构体
}

//显示他的成绩
//这时Graduate结构体特有的方法，保留
func (p *Graduate) testing() {
	fmt.Println("大学生正在考试中.....")
}

//代码冗余.. 高中生....

func main() {

	//当我们对结构体嵌入了匿名结构体使用方法会发生变化
	pupil := &Pupil{}
	pupil.Student.Name = "tom~"
	pupil.Student.Age = 8
	pupil.testing() 
	pupil.Student.SetScore(70)
	pupil.Student.ShowInfo()
	fmt.Println("res=", pupil.Student.GetSum(1, 2))


	graduate := &Graduate{}
	graduate.Student.Name = "mary~"
	graduate.Student.Age = 28
	graduate.testing() 
	graduate.Student.SetScore(90)
	graduate.Student.ShowInfo()
	fmt.Println("res=", graduate.Student.GetSum(10, 20))
}
```

```
package main

import (
	"fmt"
)

type A struct {
	Name string
	age int
}

func (a *A) SayOk() {
	fmt.Println("A SayOk", a.Name)
}

func (a *A) hello() {
	fmt.Println("A hello", a.Name)
}

type B struct {
	A
	Name string 
}

func (b *B) SayOk() {
	fmt.Println("B SayOk", b.Name)
}

func main() {

	// var b B
	// b.A.Name = "tom"
	// b.A.age = 19
	// b.A.SayOk()
	// b.A.hello()

	// //上面的写法可以简化

	// b.Name = "smith"
	// b.age = 20
	// b.SayOk()
	// b.hello()

	var b B
	b.Name = "jack" // ok
	b.A.Name = "scott"
	b.age = 100  //ok
	b.SayOk()  // B SayOk  jack
	b.A.SayOk() //  A SayOk scott
	b.hello() //  A hello ? "jack" 还是 "scott"

}
```

```
package main
import (
	"fmt"
)

type A struct {
	Name string
	age int
}
type B struct {
	Name string
	Score float64
}
type C struct {
	A
	B
	//Name string
}

type D struct {
	a A //有名结构体
}


type Goods struct {
	Name string
	Price float64
}

type Brand struct {
	Name string
	Address string
}

type TV struct {
	Goods
	Brand	
}

type TV2 struct {
	*Goods
	*Brand	
}

type Monster struct  {
	Name string
	Age int
}

type E struct {
	Monster
	int
	n int
}

func main() {
	var c C
	//如果c 没有Name字段，而A 和 B有Name, 这时就必须通过指定匿名结构体名字来区分
	//所以 c.Name 就会包编译错误， 这个规则对方法也是一样的！
	c.A.Name = "tom" // error
	fmt.Println("c")

	//如果D 中是一个有名结构体，则访问有名结构体的字段时，就必须带上有名结构体的名字
	//比如 d.a.Name 
	var d D 
	d.a.Name = "jack"


	//嵌套匿名结构体后，也可以在创建结构体变量(实例)时，直接指定各个匿名结构体字段的值
	tv := TV{ Goods{"电视机001", 5000.99},  Brand{"海尔", "山东"}, }

	//演示访问Goods的Name
	fmt.Println(tv.Goods.Name)
	fmt.Println(tv.Price) 

	tv2 := TV{ 
		Goods{
			Price : 5000.99,
			Name : "电视机002", 
		},  
		Brand{
			Name : "夏普", 
			Address :"北京",
		}, 
	}

	fmt.Println("tv", tv)
	fmt.Println("tv2", tv2)

	tv3 := TV2{ &Goods{"电视机003", 7000.99},  &Brand{"创维", "河南"}, }

	tv4 := TV2{ 
			&Goods{
				Name : "电视机004", 
				Price : 9000.99,
			},  
			&Brand{
				Name : "长虹", 
				Address : "四川",
			}, 
		}

	fmt.Println("tv3", *tv3.Goods, *tv3.Brand)
	fmt.Println("tv4", *tv4.Goods, *tv4.Brand)


	//演示一下匿名字段时基本数据类型的使用
	var e E
	e.Name = "狐狸精"
	e.Age = 300
	e.int = 20
	e.n = 40
	fmt.Println("e=", e)

}
```

# 接口
1. 基本语法

type 接口名 interface {
    method1(参数列表) 返回值列表
    method2(参数列表) 返回值列表
    .......
}

实现接口所有方法

func (t 自定义类型) method1(参数列表) 返回值列表 {
    // 方法实现
}
func (t 自定义类型) method2(参数列表) 返回值列表 {
    // 方法实现
}
// ......

2. 说明
	  1)接口中的所有方法都没有方法提，即接口的方法都是没有实现的方法

	  2)接口不需要显示的实现。只要一个变量，含有接口类型中的所有方法，那么这个变量就实现了这个接口.go中没有implement关键字

	  3)接口本身不能创建实例，但是可以指向一个实现额该接口的自定义变量类型的变量

	  4)在go中，一个自定义类型需要将某个接口的所有方法都实现，才说这个自定义类型实现了该接口

	  5)一个自定义类型只有实现了某个接口，才能将该自定义类型的实例（变量）赋给接口类型

	  6)只要是自定义数据类型，就可以实现接口，不仅仅是结构体类型

	  7)一个自定义类型可以实现多个接口

	  8)接口中不能有任何变量

	  9)一个接口（比如A接口）可以继承多个别的接口（比如B，C接口），这是如果要实现A接口，也必须将B，C接口的方法也全部实现

	  10)interface类型默认是一个指针（引用类型），如果没有对interface初始化就使用，那么会输出nil

	  11)空接口interface{}没有任何方法，所以所有类型都实现了空接口，即可以把任何一个变量赋给空接口

```
package main
import (
	"fmt"
)

//声明/定义一个接口
type Usb interface {
	//声明了两个没有实现的方法
	Start() 
	Stop()
}


//声明/定义一个接口
type Usb2 interface {
	//声明了两个没有实现的方法
	Start() 
	Stop()
	Test()
}



type Phone struct {

}  

//让Phone 实现 Usb接口的方法
func (p Phone) Start() {
	fmt.Println("手机开始工作。。。")
}
func (p Phone) Stop() {
	fmt.Println("手机停止工作。。。")
}

type Camera struct {

}
//让Camera 实现   Usb接口的方法
func (c Camera) Start() {
	fmt.Println("相机开始工作~~~。。。")
}
func (c Camera) Stop() {
	fmt.Println("相机停止工作。。。")
}


//计算机
type Computer struct {

}

//编写一个方法Working 方法，接收一个Usb接口类型变量
//只要是实现了 Usb接口 （所谓实现Usb接口，就是指实现了 Usb接口声明所有方法）
func (c Computer) Working(usb Usb) {

	//通过usb接口变量来调用Start和Stop方法
	usb.Start()
	usb.Stop()
}

func main() {

	//测试
	//先创建结构体变量
	computer := Computer{}
	phone := Phone{}
	camera := Camera{}

	//关键点
	computer.Working(phone)
	computer.Working(camera) //
}
```

```
package main
import (
	"fmt"
)

type Stu struct {
	Name string
}

func (stu Stu) Say() {
	fmt.Println("Stu Say()")
}

type integer int

func (i integer) Say() {
	fmt.Println("integer Say i =" ,i )
}


type AInterface interface {
	Say()
}

type BInterface interface {
	Hello()
}
type Monster struct {

}
func (m Monster) Hello() {
	fmt.Println("Monster Hello()~~")
}

func (m Monster) Say() {
	fmt.Println("Monster Say()~~")
}

func main() {
	var stu Stu //结构体变量，实现了 Say() 实现了 AInterface
 	var a AInterface = stu
	a.Say()


	var i integer = 10
	var b AInterface = i
	b.Say() // integer Say i = 10


	//Monster实现了AInterface 和 BInterface
	var monster Monster
	var a2 AInterface = monster
	var b2 BInterface = monster
	a2.Say()
	b2.Hello()
}
```

```
package main
import "fmt"
type Usb interface {
	Say()
}
type Stu struct {
}
func (this *Stu) Say() {
	fmt.Println("Say()")
}
func main() {
	var stu Stu = Stu{}
	// 错误！ 会报 Stu类型没有实现Usb接口 , 
	// 如果希望通过编译,  var u Usb = &stu
	var u Usb = stu  
	u.Say()
	fmt.Println("here", u)
}
```

# 类型断言

```
package main
import (
	"fmt"
)
type Point struct {
	x int
	y int
}
func main() {
	var a interface{}
	var point Point = Point{1, 2}
	a = point  //oK
	// 如何将 a 赋给一个Point变量?
	var b Point
	// b = a 不可以
	// b = a.(Point) // 可以
	b = a.(Point) 
	fmt.Println(b) // 


	//类型断言的其它案例
	// var x interface{}
	// var b2 float32 = 1.1
	// x = b2  //空接口，可以接收任意类型
	// // x=>float32 [使用类型断言]
	// y := x.(float32)
	// fmt.Printf("y 的类型是 %T 值是=%v", y, y)


	//类型断言(带检测的)
	var x interface{}
	var b2 float32 = 2.1
	x = b2  //空接口，可以接收任意类型
	// x=>float32 [使用类型断言]

	//类型断言(带检测的)
	//在类型断言时，如果类型不匹配，就会报panic，因此进行类型断言时，要确保原来的空接口指向的就是断言的类型
	//在进行类型断言时，带上检测机制，如果成功就ok，否则也不要报panic
	if y, ok := x.(float32); ok {
		fmt.Println("convert success")
		fmt.Printf("y 的类型是 %T 值是=%v", y, y)
	} else {
		fmt.Println("convert fail")
	}
	fmt.Println("继续执行...")

}
```

```
package main
import (
	"fmt"
)


//定义Student类型
type Student struct {

}

//编写一个函数，可以判断输入的参数是什么类型
func TypeJudge(items... interface{}) {
	for index, x := range items {
		switch x.(type) {
			case bool :
				fmt.Printf("第%v个参数是 bool 类型，值是%v\n", index, x)
			case float32 :
				fmt.Printf("第%v个参数是 float32 类型，值是%v\n", index, x)
			case float64 :
				fmt.Printf("第%v个参数是 float64 类型，值是%v\n", index, x)
			case int, int32, int64 :
				fmt.Printf("第%v个参数是 整数 类型，值是%v\n", index, x)
			case string :
				fmt.Printf("第%v个参数是 string 类型，值是%v\n", index, x)
			case Student :
				fmt.Printf("第%v个参数是 Student 类型，值是%v\n", index, x)
			case *Student :
				fmt.Printf("第%v个参数是 *Student 类型，值是%v\n", index, x)
			default :
				fmt.Printf("第%v个参数是  类型 不确定，值是%v\n", index, x)
		}
	}
}




func main() {

	var n1 float32 = 1.1
	var n2 float64 = 2.3
	var n3 int32 = 30
	var name string = "tom"
	address := "北京"
	n4 := 300

	stu1 := Student{}
	stu2 := &Student{}

	TypeJudge(n1, n2, n3, name, address, n4, stu1, stu2)
}
```
	
# 文件

1. 读文件

```
package main
import (
	"fmt"
	"os"
	"bufio"
	"io" 
)
func main() {
	//打开文件
	//概念说明: file 的叫法
	//1. file 叫 file对象
	//2. file 叫 file指针
	//3. file 叫 file 文件句柄
	file , err := os.Open("d:/test.txt")
	if err != nil {
		fmt.Println("open file err=", err)
	}

	//当函数退出时，要及时的关闭file
	defer file.Close() //要及时关闭file句柄，否则会有内存泄漏.

	// 创建一个 *Reader  ，是带缓冲的
	/*
	const (
	defaultBufSize = 4096 //默认的缓冲区为4096
	)
	*/
	reader := bufio.NewReader(file)
	//循环的读取文件的内容
	for {
		str, err := reader.ReadString('\n') // 读到一个换行就结束
		if err == io.EOF { // io.EOF表示文件的末尾
			break
		}
		//输出内容
		fmt.Printf(str)
	}

	fmt.Println("文件读取结束...")
}
```

```
package main
import (
	"fmt"
	"io/ioutil" 
)
func main() {

	//使用ioutil.ReadFile一次性将文件读取到位,使用于文件不大的情况
	file := "d:/test.txt"
	content, err := ioutil.ReadFile(file)
	if err != nil {
		fmt.Printf("read file err=%v", err)
	}
	//把读取到的内容显示到终端
	//fmt.Printf("%v", content) // []byte
	fmt.Printf("%v", string(content)) // []byte
	
	//我们没有显式的Open文件，因此也不需要显式的Close文件
	//因为，文件的Open和Close被封装到 ReadFile 函数内部
}
```

2. 写文件

```
package main
import (
	"fmt"
	"bufio"
	"os" 
)
func main() {
	//创建一个新文件，写入内容 5句 "hello, Gardon"
	//1 .打开文件 d:/abc.txt
	filePath := "d:/abc.txt"
	file, err := os.OpenFile(filePath, os.O_WRONLY | os.O_CREATE, 0666)
	if err != nil {
		fmt.Printf("open file err=%v\n", err)
		return 
	}
	//及时关闭file句柄
	defer file.Close()
	//准备写入5句 "hello, Gardon"
	str := "hello,Gardon\r\n" // \r\n 表示换行
	//写入时，使用带缓存的 *Writer
	writer := bufio.NewWriter(file)
	for i := 0; i < 5; i++ {
		writer.WriteString(str)
	}
	//因为writer是带缓存，因此在调用WriterString方法时，其实
	//内容是先写入到缓存的,所以需要调用Flush方法，将缓冲的数据
	//真正写入到文件中， 否则文件中会没有数据!!!
	writer.Flush()
}
```

```
package main
import (
	"fmt"
	"io/ioutil" 
)
func main() {
	//将d:/abc.txt 文件内容导入到  e:/kkk.txt
	//1. 首先将  d:/abc.txt 内容读取到内存
	//2. 将读取到的内容写入 e:/kkk.txt
	file1Path := "d:/abc.txt" 
	file2Path := "e:/kkk.txt" 
	data, err := ioutil.ReadFile(file1Path)
	if err != nil {
		//说明读取文件有错误
		fmt.Printf("read file err=%v\n", err)
		return
	}
	err = ioutil.WriteFile(file2Path, data, 0666)
	if err != nil {
		fmt.Printf("write file error=%v\n", err)
	}
}
```

```
package main
import (
	"fmt"
	"os"
	"io"
	"bufio" 
)

//自己编写一个函数，接收两个文件路径 srcFileName dstFileName
func CopyFile(dstFileName string, srcFileName string) (written int64, err error) {

	srcFile, err := os.Open(srcFileName)
	if err != nil {
		fmt.Printf("open file err=%v\n", err)
	}
	defer srcFile.Close()
	//通过srcfile ,获取到 Reader
	reader := bufio.NewReader(srcFile)

	//打开dstFileName
	dstFile, err := os.OpenFile(dstFileName, os.O_WRONLY | os.O_CREATE, 0666)
	if err != nil {
		fmt.Printf("open file err=%v\n", err)
		return 
	}

	//通过dstFile, 获取到 Writer
	writer := bufio.NewWriter(dstFile)
	defer dstFile.Close()

	return io.Copy(writer, reader)

}

func main() {

	//将d:/flower.jpg 文件拷贝到 e:/abc.jpg

	//调用CopyFile 完成文件拷贝
	srcFile := "d:/flower.jpg"
	dstFile := "e:/abc.jpg"
	_, err := CopyFile(dstFile, srcFile)
	if err == nil {
		fmt.Printf("拷贝完成\n")
	} else {
		fmt.Printf("拷贝错误 err=%v\n", err)
	}
	
}
```

# 命令行参数

```
package main
import (
	"fmt"
	"flag"
)

func main() {

	//定义几个变量，用于接收命令行的参数值
	var user string
	var pwd string
	var host string
	var port int

	//&user 就是接收用户命令行中输入的 -u 后面的参数值
	//"u" ,就是 -u 指定参数
	//"" , 默认值
	//"用户名,默认为空" 说明
	flag.StringVar(&user, "u", "", "用户名,默认为空")
	flag.StringVar(&pwd, "pwd", "", "密码,默认为空")
	flag.StringVar(&host, "h", "localhost", "主机名,默认为localhost")
	flag.IntVar(&port, "port", 3306, "端口号，默认为3306")
	//这里有一个非常重要的操作,转换， 必须调用该方法
	flag.Parse()

	//输出结果
	fmt.Printf("user=%v pwd=%v host=%v port=%v", 
		user, pwd, host, port)

}
```

# goroutine 和 channel

1. channel的数据放满后，就不能再放入了
2. 在没有使用协程的情况下，如果channel数据取完了，再取，就会报dead lock
3. 使用内置函数close可以关闭channel，当channel关闭后，就不能再向channel写数据了，但是仍然可以从该channel读取数据
4. channel支持for-range的方式进行遍历，在遍历是，如果channel没有关闭，则会出现dead lock错误

![goroutine1](https://github.com/hualigushi/money-blog/blob/master/go%E7%AC%94%E8%AE%B0/goroutine1.JPG)

![goroutine2](https://github.com/hualigushi/money-blog/blob/master/go%E7%AC%94%E8%AE%B0/goroutine2.JPG)

```
package main
import (
	"fmt"
	"time"
)


//write Data
func writeData(intChan chan int) {
	for i := 1; i <= 50; i++ {
		//放入数据
		intChan<- i //
		fmt.Println("writeData ", i)
		//time.Sleep(time.Second)
	}
	close(intChan) //关闭
}

//read data
func readData(intChan chan int, exitChan chan bool) {

	for {
		v, ok := <-intChan
		if !ok {
			break
		}
		time.Sleep(time.Second)
		fmt.Printf("readData 读到数据=%v\n", v) 
	}
	//readData 读取完数据后，即任务完成
	exitChan<- true
	close(exitChan)

}

func main() {

	//创建两个管道
	intChan := make(chan int, 10)
	exitChan := make(chan bool, 1)
	
	go writeData(intChan)
	go readData(intChan, exitChan)

	//time.Sleep(time.Second * 10)
	for {
		_, ok := <-exitChan
		if !ok {
			break
		}
	}

}
```


```
package main
import (
	"fmt"
)

type Cat struct {
	Name string
	Age int
}

func main() {

	//定义一个存放任意数据类型的管道 3个数据
	//var allChan chan interface{}
	allChan := make(chan interface{}, 3)

	allChan<- 10
	allChan<- "tom jack"
	cat := Cat{"小花猫", 4}
	allChan<- cat

	//我们希望获得到管道中的第三个元素，则先将前2个推出
	<-allChan
	<-allChan

	newCat := <-allChan //从管道中取出的Cat是什么?

	fmt.Printf("newCat=%T , newCat=%v\n", newCat, newCat)
	//下面的写法是错误的!编译不通过
	//fmt.Printf("newCat.Name=%v", newCat.Name)
	//使用类型断言
	a := newCat.(Cat) 
	fmt.Printf("newCat.Name=%v", a.Name)
	

}
```

![goroutine3](https://github.com/hualigushi/money-blog/blob/master/go%E7%AC%94%E8%AE%B0/goroutine3.JPG)

```
package main
import (
	"fmt"
	"time"
)



//向 intChan放入 1-8000个数
func putNum(intChan chan int) {

	for i := 1; i <= 80000; i++ {    
		intChan<- i
	}

	//关闭intChan
	close(intChan)
}

// 从 intChan取出数据，并判断是否为素数,如果是，就
// 	//放入到primeChan
func primeNum(intChan chan int, primeChan chan int, exitChan chan bool) {

	//使用for 循环
	// var num int
	var flag bool // 
	for {
		//time.Sleep(time.Millisecond * 10)
		num, ok := <-intChan //intChan 取不到..
		
		if !ok { 
			break
		}
		flag = true //假设是素数
		//判断num是不是素数
		for i := 2; i < num; i++ {
			if num % i == 0 {//说明该num不是素数
				flag = false
				break
			}
		}

		if flag {
			//将这个数就放入到primeChan
			primeChan<- num
		}
	}

	fmt.Println("有一个primeNum 协程因为取不到数据，退出")
	//这里我们还不能关闭 primeChan
	//向 exitChan 写入true
	exitChan<- true	

}

func main() {

	intChan := make(chan int , 1000)
	primeChan := make(chan int, 20000)//放入结果
	//标识退出的管道
	exitChan := make(chan bool, 8) // 4个

	start := time.Now().Unix()
	
	//开启一个协程，向 intChan放入 1-8000个数
	go putNum(intChan)
	//开启4个协程，从 intChan取出数据，并判断是否为素数,如果是，就
	//放入到primeChan
	for i := 0; i < 8; i++ {
		go primeNum(intChan, primeChan, exitChan)
	}

	//这里我们主线程，进行处理
	//直接
	go func(){
		for i := 0; i < 8; i++ {
			<-exitChan
		}

		end := time.Now().Unix()
		fmt.Println("使用协程耗时=", end - start)

		//当我们从exitChan 取出了4个结果，就可以放心的关闭 prprimeChan
		close(primeChan)
	}()


	//遍历我们的 primeChan ,把结果取出
	for {
		res, ok := <-primeChan
		if !ok{
			break
		}
		//将结果输出
		fmt.Printf("素数=%d\n", res)
	}

	fmt.Println("main线程退出")
	
}
```

```package main
import (
	"fmt"
	"time"
)

func main() {

	//使用select可以解决从管道取数据的阻塞问题

	//1.定义一个管道 10个数据int
	intChan := make(chan int, 10)
	for i := 0; i < 10; i++ {
		intChan<- i
	}
	//2.定义一个管道 5个数据string
	stringChan := make(chan string, 5)
	for i := 0; i < 5; i++ {
		stringChan <- "hello" + fmt.Sprintf("%d", i)
	}

	//传统的方法在遍历管道时，如果不关闭会阻塞而导致 deadlock

	//问题，在实际开发中，可能我们不好确定什么关闭该管道.
	//可以使用select 方式可以解决
	//label:
	for {
		select {
			//注意: 这里，如果intChan一直没有关闭，不会一直阻塞而deadlock
			//，会自动到下一个case匹配
			case v := <-intChan : 
				fmt.Printf("从intChan读取的数据%d\n", v)
				time.Sleep(time.Second)
			case v := <-stringChan :
				fmt.Printf("从stringChan读取的数据%s\n", v)
				time.Sleep(time.Second)
			default :
				fmt.Printf("都取不到了，不玩了, 程序员可以加入逻辑\n")
				time.Sleep(time.Second)
				return 
				//break label
		}
	}
}
```

```package main
import (
	"fmt"
	"time"
)

//函数
func sayHello() {
	for i := 0; i < 10; i++ {
		time.Sleep(time.Second)
		fmt.Println("hello,world")
	}
}
//函数
func test() {
	//这里我们可以使用defer + recover
	defer func() {
		//捕获test抛出的panic
		if err := recover(); err != nil {
			fmt.Println("test() 发生错误", err)
		}
	}()
	//定义了一个map
	var myMap map[int]string
	myMap[0] = "golang" //error
}

func main() {

	go sayHello()
	go test()


	for i := 0; i < 10; i++ {
		fmt.Println("main() ok=", i)
		time.Sleep(time.Second)
	}

}
```

# 反射

```
package main
import (
	"reflect"
	"fmt"
)


//专门演示反射
func reflectTest01(b interface{}) {

	//通过反射获取的传入的变量的 type , kind, 值
	//1. 先获取到 reflect.Type
	rTyp := reflect.TypeOf(b)
	fmt.Println("rType=", rTyp)

	//2. 获取到 reflect.Value
	rVal := reflect.ValueOf(b)
	
	n2 := 2 + rVal.Int()
	//n3 := rVal.Float()
	fmt.Println("n2=", n2)
	//fmt.Println("n3=", n3)
	
	fmt.Printf("rVal=%v rVal type=%T\n", rVal, rVal)

	//下面我们将 rVal 转成 interface{}
	iV := rVal.Interface()
	//将 interface{} 通过断言转成需要的类型
	num2 := iV.(int)
	fmt.Println("num2=", num2)


}

//专门演示反射[对结构体的反射]
func reflectTest02(b interface{}) {

	//通过反射获取的传入的变量的 type , kind, 值
	//1. 先获取到 reflect.Type
	rTyp := reflect.TypeOf(b)
	fmt.Println("rType=", rTyp)

	//2. 获取到 reflect.Value
	rVal := reflect.ValueOf(b)

	//3. 获取 变量对应的Kind
	//(1) rVal.Kind() ==> 
	kind1 := rVal.Kind()
	//(2) rTyp.Kind() ==>
	kind2 := rTyp.Kind()
	fmt.Printf("kind =%v kind=%v\n", kind1, kind2)
	


	//下面我们将 rVal 转成 interface{}
	iV := rVal.Interface()
	fmt.Printf("iv=%v iv type=%T \n", iV, iV)
	//将 interface{} 通过断言转成需要的类型
	//这里，我们就简单使用了一带检测的类型断言.
	//同学们可以使用 swtich 的断言形式来做的更加的灵活
	stu, ok := iV.(Student)
	if ok {
		fmt.Printf("stu.Name=%v\n", stu.Name)
	}

}

type Student struct {
	Name string
	Age int
}

type Monster struct {
	Name string
	Age int
}

func main() {

	//请编写一个案例，
	//演示对(基本数据类型、interface{}、reflect.Value)进行反射的基本操作

	//1. 先定义一个int
	var num int = 100
	reflectTest01(num)

	//2. 定义一个Student的实例
	stu := Student{
		Name : "tom",
		Age : 20,
	}
	reflectTest02(stu)


}
```

```

package main
import (
	"reflect"
	"fmt"
)

//通过反射，修改,
// num int 的值
// 修改 student的值

func reflect01(b interface{}) {
	//2. 获取到 reflect.Value
	rVal := reflect.ValueOf(b)
	// 看看 rVal的Kind是 
	fmt.Printf("rVal kind=%v\n", rVal.Kind())
	//3. rVal
	//Elem返回v持有的接口保管的值的Value封装，或者v持有的指针指向的值的Value封装
	rVal.Elem().SetInt(20)
}

func main() {

	var num int = 10
	reflect01(&num)
	fmt.Println("num=", num) // 20


	//你可以这样理解rVal.Elem()
	// num := 9
	// ptr *int = &num
	// num2 := *ptr  //=== 类似 rVal.Elem()
}
```

```
package main
import (
	"fmt"
	"reflect"
)
//定义了一个Monster结构体
type Monster struct {
	Name  string `json:"name"`
	Age   int `json:"monster_age"`
	Score float32 `json:"成绩"`
	Sex   string
	
}

//方法，返回两个数的和
func (s Monster) GetSum(n1, n2 int) int {
	return n1 + n2
}
//方法， 接收四个值，给s赋值
func (s Monster) Set(name string, age int, score float32, sex string) {
	s.Name = name
	s.Age = age
	s.Score = score
	s.Sex = sex
}

//方法，显示s的值
func (s Monster) Print() {
	fmt.Println("---start~----")
	fmt.Println(s)
	fmt.Println("---end~----")
}
func TestStruct(a interface{}) {
	//获取reflect.Type 类型
	typ := reflect.TypeOf(a)
	//获取reflect.Value 类型
	val := reflect.ValueOf(a)
	//获取到a对应的类别
	kd := val.Kind()
	//如果传入的不是struct，就退出
	if kd !=  reflect.Struct {
		fmt.Println("expect struct")
		return
	}

	//获取到该结构体有几个字段
	num := val.NumField()

	fmt.Printf("struct has %d fields\n", num) //4
	//变量结构体的所有字段
	for i := 0; i < num; i++ {
		fmt.Printf("Field %d: 值为=%v\n", i, val.Field(i))
		//获取到struct标签, 注意需要通过reflect.Type来获取tag标签的值
		tagVal := typ.Field(i).Tag.Get("json")
		//如果该字段于tag标签就显示，否则就不显示
		if tagVal != "" {
			fmt.Printf("Field %d: tag为=%v\n", i, tagVal)
		}
	}
	
	//获取到该结构体有多少个方法
	numOfMethod := val.NumMethod()
	fmt.Printf("struct has %d methods\n", numOfMethod)
	
	//var params []reflect.Value
	//方法的排序默认是按照 函数名的排序（ASCII码）
	val.Method(1).Call(nil) //获取到第二个方法。调用它

	
	//调用结构体的第1个方法Method(0)
	var params []reflect.Value  //声明了 []reflect.Value
	params = append(params, reflect.ValueOf(10))
	params = append(params, reflect.ValueOf(40))
	res := val.Method(0).Call(params) //传入的参数是 []reflect.Value, 返回[]reflect.Value
	fmt.Println("res=", res[0].Int()) //返回结果, 返回的结果是 []reflect.Value*/

}
func main() {
	//创建了一个Monster实例
	var a Monster = Monster{
		Name:  "黄鼠狼精",
		Age:   400,
		Score: 30.8,
	}
	//将Monster实例传递给TestStruct函数
	TestStruct(a)	
}
```

# 网络编程
```
server.go
package main
import (
	"fmt"
	"net" //做网络socket开发时,net包含有我们需要所有的方法和函数
	_"io"
)

func process(conn net.Conn) {

	//这里我们循环的接收客户端发送的数据
	defer conn.Close() //关闭conn

	for {
		//创建一个新的切片
		buf := make([]byte, 1024)
		//conn.Read(buf)
		//1. 等待客户端通过conn发送信息
		//2. 如果客户端没有wrtie[发送]，那么协程就阻塞在这里
		//fmt.Printf("服务器在等待客户端%s 发送信息\n", conn.RemoteAddr().String())
		n , err := conn.Read(buf) //从conn读取
		if err != nil {
			
			fmt.Printf("客户端退出 err=%v", err)
			return //!!!
		}
		//3. 显示客户端发送的内容到服务器的终端
		fmt.Print(string(buf[:n])) 
	}

}

func main() {

	fmt.Println("服务器开始监听....")
	//net.Listen("tcp", "0.0.0.0:8888")
	//1. tcp 表示使用网络协议是tcp
	//2. 0.0.0.0:8888 表示在本地监听 8888端口
	listen, err := net.Listen("tcp", "0.0.0.0:8888")
	if err != nil {
		fmt.Println("listen err=", err)
		return 
	}
	defer listen.Close() //延时关闭listen

	//循环等待客户端来链接我
	for {
		//等待客户端链接
		fmt.Println("等待客户端来链接....")
		conn, err := listen.Accept()
		if err != nil {
			fmt.Println("Accept() err=", err)
			
		} else {
			fmt.Printf("Accept() suc con=%v 客户端ip=%v\n", conn, conn.RemoteAddr().String())
		}
		//这里准备其一个协程，为客户端服务
		go process(conn)
	}
	
	//fmt.Printf("listen suc=%v\n", listen)
}

client.go
package main
import (
	"fmt"
	"net"
	"bufio"
	"os"
	"strings"
)

func main() {

	conn, err := net.Dial("tcp", "127.0.0.1:8888")
	if err != nil {
		fmt.Println("client dial err=", err)
		return 
	}
	//功能一：客户端可以发送单行数据，然后就退出
	reader := bufio.NewReader(os.Stdin) //os.Stdin 代表标准输入[终端]

	for {

		//从终端读取一行用户输入，并准备发送给服务器
		line, err := reader.ReadString('\n')
		if err != nil {
			fmt.Println("readString err=", err)
		}
		//如果用户输入的是 exit就退出
		line = strings.Trim(line, " \r\n")
		if line == "exit" {
			fmt.Println("客户端退出..")
			break
		}

		//再将line 发送给 服务器
		_, err = conn.Write([]byte(line + "\n"))
		if err != nil {
			fmt.Println("conn.Write err=", err)	
		}
	}
	

}
```

# go 操作 redis

安装第三方Redis库，在GOPATH路径下执行安装指令： go get github.com/garyburd/redigo/redis

```
package main
import (
	"fmt"
	"github.com/garyburd/redigo/redis" //引入redis包
)

func main() {
	//通过go 向redis 写入数据和读取数据
	//1. 链接到redis
	conn, err := redis.Dial("tcp", "127.0.0.1:6379")
	if err != nil {
		fmt.Println("redis.Dial err=", err)
		return 
	}
	defer conn.Close() //关闭..

	//2. 通过go 向redis写入数据 string [key-val]
	_, err = conn.Do("Set", "name", "tomjerry猫猫")
	if err != nil {
		fmt.Println("set  err=", err)
		return 
	}

	//3. 通过go 向redis读取数据 string [key-val]

	r, err := redis.String(conn.Do("Get", "name"))
	if err != nil {
		fmt.Println("set  err=", err)
		return 
	}

	//因为返回 r是 interface{}
	//因为 name 对应的值是string ,因此我们需要转换
	//nameString := r.(string)

	fmt.Println("操作ok ", r)
}
```

Redis 连接池

1) 实现初始化一定数量的链接，放入链接池

2) 当go需要操作Redis时，直接从Redis链接池取出即可

3) 这样可以节省临时获取Redis链接的时间，从而提高效率

```
package main
import (
	"fmt"
	"github.com/garyburd/redigo/redis"
)

//定义一个全局的pool
var pool *redis.Pool

//当启动程序时，就初始化连接池
func init() {

	pool = &redis.Pool{
		MaxIdle: 8, //最大空闲链接数
		MaxActive: 0, // 表示和数据库的最大链接数， 0 表示没有限制
		IdleTimeout: 100, // 最大空闲时间
		Dial: func() (redis.Conn, error) { // 初始化链接的代码， 链接哪个ip的redis
		return redis.Dial("tcp", "localhost:6379")
		},
	}	

}

func main() {
	//先从pool 取出一个链接
	conn := pool.Get()
	defer conn.Close()

	_, err := conn.Do("Set", "name", "汤姆猫~~")
	if err != nil {
		fmt.Println("conn.Do err=", err)
		return
	}

	//取出
	r, err := redis.String(conn.Do("Get", "name"))
	if err != nil {
		fmt.Println("conn.Do err=", err)
		return
	}

	fmt.Println("r=", r)

	//如果我们要从pool 取出链接，一定保证链接池是没有关闭
	//pool.Close()
	conn2 := pool.Get()

	_, err = conn2.Do("Set", "name2", "汤姆猫~~2")
	if err != nil {
		fmt.Println("conn.Do err~~~~=", err)
		return
	}

	//取出
	r2, err := redis.String(conn2.Do("Get", "name2"))
	if err != nil {
		fmt.Println("conn.Do err=", err)
		return
	}

	fmt.Println("r=", r2)

	//fmt.Println("conn2=", conn2)


}
```
