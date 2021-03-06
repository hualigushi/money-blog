在ES5中定义一个类

```
function Person(name) {
    this.name = name;
}
 
Person.prototype.sayHello = function(){
    return 'Hi, I am ' + this.name;
}
```

用ES6的写法重写一下，检测类型发现Person本质上仍然是函数

```
class Person {
    constructor(name){
        this.name = name;
    }
    sayHello(){
        return 'Hi, I am ' + this.name;
    }
}
typeof Person; //'function'
```

调用的方式都是一致的 `var p1 = new Person('zhangsan');`

用ES6定义class中的方法，定义在原型对象上的。与ES5不同的是，这些定义在**原型对象的方法是不可枚举**的。

ES6类和模块是严格模式下的；**不存在变量提升**，保证子类父类的顺序；类的继承也有新的写法：

```
class Female extends Person {
    constructor(name){
        super(name); //调用父类的，调用之后，子类才有this
        this.sex = 'boy';
    }
    sayHello(){
        return super.sayHello() + ', I am ' + this.sex;
    }
}
```

注意点，子类必须在父类的构造函数中调用super()，这样才有this对象，因为this对象是从父类继承下来的。而要在子类中调用父类的方法，用super关键词可指代父类。

ES5中类继承的关系是相反的，**先有子类的this，然后用父类的方法应用在this上**。

ES6类继承子类的this是从父类继承下来的这个特性，使得在ES6中可以构造原生数据结构的子类，这是ES5无法做到的。

ES6也可以定义类的静态方法和静态属性，静态的意思是这些不会被实例继承，不需要实例化类，就可以直接拿来用。

ES6中class内部只能定义方法，不能定义属性。在方法名前加上static就表示这个方式是静态方法，而属性还是按照ES5的方式来实现。

```
// ES5写法
Person.total = 0; //静态属性
Person.counter = function(){  //静态方法
    return this.total ++ ;
}
 
// ES6写法
class Person {
    ...
    static counter(){
        return this.total ++ ;
    }
}
Person.total = 0;
```
ES6中当函数用new关键词的时候，增加了`new.target`属性来判断当前调用的构造函数。

可以限制函数的调用，比如一定要用new命令来调用，或者不能直接被实例化需要调用它的子类。

```
function Person(name){
    if(new.target === Person){
        this.name = name;
    }
    else{
        throw new Error('必须用new生成实例');
    }
}
```
