- tcp 是面向连接的、可靠的、传输层通信协议

可靠体现在：有状态、可控制

- 有状态是指 TCP 会确认发送了哪些报文，接收方受到了哪些报文，哪些没有收到，保证数据包按序到达，不允许有差错
- 可控制的是指，如果出现丢包或者网络状况不佳，则会跳转自己的行为，减少发送的速度或者重发

所以上面能保证数据包的有效传输。

### 拥塞控制原理

原因是有可能整个网络环境特别差，容易丢包，那么发送端就应该注意了。

主要用三种方法：

- 慢启动阈值 + 拥塞避免
- 快速重传
- 快速回复

### 慢启动阈值 + 拥塞避免

对于拥塞控制来说，TCP 主要维护两个核心状态：

- 拥塞窗口（cwnd）
- 慢启动阈值（ssthresh）

> 在发送端使用拥塞窗口来控制发送窗口的大小。

然后采用一种比较保守的慢启动算法来慢慢适应这个网络，在开始传输的一段时间，发送端和接收端会首先通过三次握手建立连接，确定各自接收窗口大小，然后初始化双方的拥塞窗口，接着每经过一轮 RTT（收发时延），拥塞窗口大小翻倍，直到达到慢启动阈值。

然后开始进行拥塞避免，拥塞避免具体的做法就是之前每一轮 RTT，拥塞窗口翻倍，现在每一轮就加一个。

### 快速重传

在 TCP 传输过程中，如果发生了丢包，接收端就会发送之前重复 ACK，比如 第 5 个包丢了，6、7 达到，然后接收端会为 5，6，7 都发送第四个包的 ACK，这个时候发送端受到了 3 个重复的 ACK，意识到丢包了，就会马上进行重传，而不用等到 RTO （超时重传的时间）

选择性重传：报文首部可选性中加入 SACK 属性，通过 left edge 和 right edge 标志那些包到了，然后重传没到的包

### 快速恢复

如果发送端收到了 3 个重复的 ACK，发现了丢包，觉得现在的网络状况已经进入拥塞状态了，那么就会进入快速恢复阶段：

- 会将拥塞阈值降低为 拥塞窗口的一半
- 然后拥塞窗口大小变为拥塞阈值
- 接着 拥塞窗口再进行线性增加，以适应网络状况