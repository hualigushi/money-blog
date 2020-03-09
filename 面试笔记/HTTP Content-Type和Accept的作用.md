Accept：发送端（客户端）希望接受的数据类型。是请求头中的一个字段

Content-Type：发送端（客户端|服务器）发送的实体数据的数据类型。响应头中的一个字段

在一般情况下，服务器会根据Accept的值，来决定返回的数据的类型，并设置Content-Type，通常Content-Type的值和Accept的第一个值相等。
