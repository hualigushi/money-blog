ts 泛型？ 使用方式  场景

内置类型？



# 交叉类型

将多个类型合并为一个类型，新的类型将具有所有类型的特性，所以交叉类型特别适合对象过多的场景。**交叉类型实际上是取所有类型的并集**

```typescript
interface DogInterface {
  run(): void;
}

interface CatInterface {
  jump(): void;
}

// pet变量将具有两个接口类型的所有方法
/*
不能将类型“{}”分配给类型“DogInterface & CatInterface”。
  类型 "{}" 中缺少属性 "run"，但类型 "DogInterface" 中需要该属性。ts(2322)
*/
let pet: DogInterface & CatInterface = {};

interface DogInterface {
  run(): void;
}

interface CatInterface {
  jump(): void;
}

// pet变量将具有两个接口类型的所有方法
let pet: DogInterface & CatInterface = {
  run() {},
  jump() {},
};
```



## 联合类型

声明的类型并不确定，可以为多个类型中的一个

```typescript
let a: number | string = "a";
let b: number | string = 1;
```

------

有时候不仅要限制变量的类型，还需要限定变量的取值在某个特定的范围内





