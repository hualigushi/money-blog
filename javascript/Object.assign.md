# 浅拷贝 Object.assign
浅拷贝就是拷贝第一层的基本类型值，以及第一层的引用类型地址
```
// 第一步
let a = {
    name: "advanced",
    age: 18
}
let b = {
    name: "muyiy",
    book: {
        title: "You Don't Know JS",
        price: "45"
    }
}
let c = Object.assign(a, b);
console.log(c);
// {
//     name: "muyiy",
//  age: 18,
//     book: {title: "You Don't Know JS", price: "45"}
// } 
console.log(a === c);
// true

// 第二步
b.name = "change";
b.book.price = "55";
console.log(b);
// {
//     name: "change",
//     book: {title: "You Don't Know JS", price: "55"}
// } 

// 第三步
console.log(a);
// {
//     name: "muyiy",
//  age: 18,
//     book: {title: "You Don't Know JS", price: "55"}
// } 
```

String 类型和 Symbol 类型的属性都会被拷贝，而且不会跳过那些值为 null 或 undefined 的源对象。
```
// 第一步
let a = {
    name: "muyiy",
    age: 18
}
let b = {
    b1: Symbol("muyiy"),
    b2: null,
    b3: undefined
}
let c = Object.assign(a, b);
console.log(c);
// {
//     name: "muyiy",
//  age: 18,
//     b1: Symbol(muyiy),
//     b2: null,
//     b3: undefined
// } 
console.log(a === c);
// true
```
