## JS缺点

1. javascript这门语言诞生之初本身就不是为了写大型应用，所以编写大型应用时难免存在一些缺陷，比如没有类型系统，在js代码运行后出现大量空指针等低级错误。
2. 而TypeScript作为javascript的超集，为javascript在编写阶段提供了类型，在大型项目中有效避免了一些低级错误，把一些bug消灭在书写阶段，类型注释也提供了项目代码的可读性，提高大型项目可维护性。

3. 在项目的几十万行的代码中，任意属性与方法，只要在作用域内我们就能进行任意更改，改完后很容易出现空指针错误，并且出现Bug后在维护过程中定位也很难，开发效率日益减低。



## TS为我们提供了什么？

### 1. 类型推断



```
interface HelloProps { 
	age: number; 
}
const props: HelloProps = { a: 111 }
props.age.indexOf(1)
props.name.toString()
const cat = new Cat()
cat.userId
// Property 'indexOf' does not exist on type 'number'
// Property 'name' does not exist on type 'HelloProps'
// Property 'userId' does not exist on type 'Cat'
```

  tsc后报出错误，indexOf不存在number类型中，name、userId不存在

  这种低级错误在整体代码只有几百行的时候几乎不太可能出现，但是一旦项目很大，多人协作一个项目，定义的实例越来越多，实例又无可避免的会被多次修改，对象属性在维护过程可能需要替换与删除，就很容易出现Bug，并且排斥Bug的代价非常高。这种情况在TS出现前，只能通过不动这个属性，去扩展来避免bug，这个属性不需要了，我们也不敢删除，导致我们的代码越维护，冗余量越多，代码维护性越差。

### 2. 函数

```
function sum(a: number, b: number): number {    
	return 'string'
}

function cat(a: number, b: string): string {    
	return a + b
}

cat(1)
cat(1, '2').toFixed(2)

// Type '"string"' is not assignable to type 'number'
// Expected 2 arguments, but got 1
// Property 'toFixed' does not exist on type 'string'.
```

  定义一个具有多个参数函数，在使用它们的时候可能经常忘记或漏写参数，导致出现bug，TS可以对函数的参数进行强制定义，并且可以定义函数输出类型，让我们实现函数功能和调用函数的过程都能避免一些bug。在维护上，我们使用函数如果没有详细的文档，我们可能需要看完函数体内的代码才知道这个函数上用来干什么的，会返回什么的，而TS中我们通过看输出类型就可以。

### 3. 面向对象

```
class Animal {    
	public name: string;
    public constructor(theName: string) {        
    	this.name = theName;    
    }
    public move(distanceInMeters: number): void {        
    	console.log(`${this.name} 
    	moved ${distanceInMeters}m.`);    
    }
    private initList(): string {        
    	return 'initList'    
    }
}
const animal = new Animal('lin')
animal.move(1)
animal.initList()
// Property 'initList' is private and only accessible within class 'Animal'
```

  在TS之前，我们并没正在有私有属性，只能通过闭包、程序员之间的约定等曲线救国的方法来实习，也不能对属性进行声明，在js里我们可以在任意方法、任意时候添加属性修改属性，项目变大的时候我们完全不知道这个属性上什么时候声明的，用来干嘛，可维护性极差。

  TS可以强制定义公共、私有与受保护的属性与方法。杜绝不该调用的属性或方法被调用所带来的bug。对象属性必须通过显示的声明，我们很容易知道该对象的全部属性与方法，并且不能随意更改赋值。

```
abstract class Department {    
	abstract printMeeting(): void; // 必须在派生类中实现
}
class Animal extends Department {   
	public name: string = 'hello'
}
const animal = new Animal()animal.name
// Non-abstract class 'Animal' does not implement inherited abstract 
// member 'printMeeting' from class 'Department'.
```

  通过abstract定义一个抽象类，强制定义子类所要实现的方法，更加规范类的实现，避免在实现类的过程中过多或过少的实现方法，导致Bug。同时方便阅读，提供代码可维护性。

### 4. 泛型

```
function identity<T>(arg: T): T {    
	return arg;
}
identity<number>(1)
identity<number>('1')
identity<string>('1')
// Argument of type '"1"' is not assignable to parameter of type  
// 'number'.
```

  有些方法需要传入多种类型的参数，可以使用泛型，动态传入参数类型， 在保证方法灵活性的同时，也不会想any一样失去类型检查。

