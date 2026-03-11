> 你以为只是解析个字符串？其实黑客已经在你服务器上跑脚本了！

在前端和 Node.js开 发中，`JSON.parse()` 几乎无处不在：

```text
const data = JSON.parse(localStorage.getItem('user'));
const config = JSON.parse(req.body.payload);
const settings = JSON.parse(fs.readFileSync('config.json'));
```

简洁、直接、好用——但**极其危险**。

如果你没有对输入做任何校验就调用 `JSON.parse()`，你正在为应用打开一扇“任意代码执行”的后门。

今天，我们就来揭开`JSON.parse()`背后的安全雷区，并告诉你如何用更安全、更现代的方式处理 JSON 数据。

## 危险场景一：[原型污染](https://zhida.zhihu.com/search?content_id=271060387&content_type=Article&match_order=1&q=%E5%8E%9F%E5%9E%8B%E6%B1%A1%E6%9F%93&zhida_source=entity)（Prototype Pollution）

这是 `JSON.parse()` 最臭名昭著的安全漏洞之一。

虽然原生 `JSON.parse()` **本身不会执行代码**，但它会忠实地还原对象结构——包括 `__proto__` 和 `constructor.prototype` 这类特殊属性。

来看一个真实攻击载荷：

```text
const userInput = '{"__proto__":{"isAdmin":true}}';
const obj = {};
JSON.parse(userInput, (key, value) => {
  obj[key] = value;
  return value;
});
console.log({}.isAdmin); // true！全局对象被污染！
```

如果这段代码出现在你的登录逻辑、权限校验或配置合并中，攻击者就能：

+   绕过身份验证（`isAdmin: true`）；
+   注入恶意属性（如 `exec: 'rm -rf /'`）；
+   篡改全局行为，导致服务崩溃或数据泄露。

> 尤其在使用 Lodash、merge、assign 等工具库时，风险更高！

## 危险场景二：拒绝服务（[DoS](https://zhida.zhihu.com/search?content_id=271060387&content_type=Article&match_order=1&q=DoS&zhida_source=entity)）

恶意构造的 JSON 字符串可导致**内存爆炸**或**CPU 耗尽**：

```text
// 深度嵌套攻击
const evil = '{"a":{"a":{"a":{"a":{"a":{"a": ... }}}}}}';

// 或超大数组
const evil2 = '[1,1,1,...,1]' // 1000 万个元素
```

调用 `JSON.parse(evil)` 可能：

+   占用数 GB 内存；
+   阻塞事件循环数秒；
+   直接触发 OOM（Out of Memory）崩溃。

在 API 接口或 Webhook 处理中，这等于把“关机按钮”交给了攻击者。

## 正确姿势：安全解析 JSON 的三重防护

### 第一步：限制输入大小

在解析前先检查字符串长度：

```text
function safeParse(str, maxSize = 1024 * 100) { // 100KB
  if (typeof str !== 'string' || str.length > maxSize) {
    throw new Error('Input too large');
  }
  return JSON.parse(str);
}
```

### 第二步：禁用危险键（如 `__proto__`）

使用 `reviver` 函数过滤敏感属性：

```text
function secureJSONParse(str) {
  return JSON.parse(str, (key, value) => {
    if (key === '__proto__' || key === 'constructor') {
      throw new Error('Disallowed key in JSON');
    }
    return value;
  });
}
```

### 第三步（推荐）：用 [Zod](https://zhida.zhihu.com/search?content_id=271060387&content_type=Article&match_order=1&q=Zod&zhida_source=entity) / [Joi](https://zhida.zhihu.com/search?content_id=271060387&content_type=Article&match_order=1&q=Joi&zhida_source=entity) 做运行时校验

这才是现代 JS 工程的最佳实践！

```text
import { z } from 'zod';

const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  isAdmin: z.boolean().optional(),
});

function parseUser(jsonStr: string) {
  const raw = secureJSONParse(jsonStr);
  return UserSchema.parse(raw); // 自动校验 + 类型推导
}
```

优势：

+   **类型安全**（配合 TypeScript 完美）；
+   **自动过滤多余字段**；
+   **明确拒绝非法结构**；
+   **防止原型污染、字段注入等攻击**。

## 特别提醒：Node.js 中的额外风险

在服务端，如果你从以下来源解析 JSON，风险更高：

+   HTTP 请求体（`req.body`）
+   文件读取（用户上传的 JSON 配置）
+   Redis / 数据库存储的序列化数据
+   第三方 Webhook 回调

务必在解析前做**来源校验 + 结构校验 + 大小限制**三重保险！

## 结语

`JSON.parse()` 不是“坏 API”，但它是**一把没有保险的枪**。  
在现代 Web 开发中，**信任任何用户输入 = 自毁程序**。

下次当你写下 `JSON.parse(someString)` 时，请自问：

> “我确定这个字符串来自可信源吗？它的结构真的安全吗？”

如果答案不确定，请立即切换到 **Zod / Joi + 安全解析函数** 的组合。
