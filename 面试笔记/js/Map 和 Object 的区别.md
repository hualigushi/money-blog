1. 在 Object 中， key 必须是简单数据类型（整数，字符串或者是 symbol），而在 Map 中则可以是 JavaScript 支持的所有数据类型，也就是说可以用一个 Object 来当做一个Map元素的 key。

2. Map 元素的顺序遵循插入的顺序，而 Object 的则没有这一特性。

3. JSON 直接支持 Object，但不支持 Map

4. Map 是纯粹的 hash， 而 Object 还存在一些其他内在逻辑，所以在执行 delete 的时候会有性能问题。所以写入删除密集的情况应该使用 Map。

5. Map 在存储大量元素的时候性能表现更好，特别是在代码执行时不能确定 key 的类型的情况。