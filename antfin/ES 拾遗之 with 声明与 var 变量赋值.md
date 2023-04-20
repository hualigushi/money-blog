```
const win = {a:456};
console.log(win);

(function(){
  with (win) {
    var a = 123;
    var b = 456;
    console.log(win);
  }
})();

console.log(win);
```
