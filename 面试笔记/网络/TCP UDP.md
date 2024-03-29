# TCP与UDP区别总结：

1. TCP是**面向连接**的全双工协议，在收发数据前，必须和对方建立可靠的连接。 一个TCP连接必须要经过三次“对话”才能建立起来
  
   UDP是**无连接**的，即发送数据之前不需要建立连接,不需要维护连接状态，包括收发状态等， 因此一台服务机可同时向多个客户机传输相同的消息
   
2. TCP提供可靠的服务。也就是说，通过TCP连接传送的数据，无差错，不丢失，不重复，且按序到达;

   数据传输过程中一旦卡住，则必须等前面的数据发送完毕以后，后续数据才能继续传输
   
   UDP尽最大努力交付，即不保证可靠交付
   
3. TCP面向字节流，实际上是TCP把数据看成一连串无结构的字节流;

   UDP是面向报文的，适合一次性传输少量数据的网络应用

   没有拥塞控制，因此网络出现拥塞不会使源主机的发送速率降低（对实时应用很有用，如IP电话，实时视频会议等）

4. 每一条TCP连接只能是点到点的;每台服务器可提供支持的 `TCP` 连接数量是有限的

   UDP支持一对一，一对多，多对一和多对多的交互通信

5. TCP首部开销20字节;

   UDP的首部开销小，只有8个字节

6. TCP的逻辑通信信道是全双工的可靠信道，

   UDP则是不可靠信道



|              | UDP                                        | TCP                                    |
| ------------ | ------------------------------------------ | -------------------------------------- |
| 是否连接     | 无连接                                     | 面向连接                               |
| 是否可靠     | 不可靠传输，不使用流量控制和拥塞控制       | 可靠传输，使用流量控制和拥塞控制       |
| 连接对象个数 | 支持一对一，一对多，多对一和多对多交互通信 | 只能是一对一通信                       |
| 传输方式     | 面向报文                                   | 面向字节流                             |
| 首部开销     | 首部开销小，仅8字节                        | 首部最小20字节，最大60字节             |
| 适用场景     | 适用于实时应用（IP电话、视频会议、直播等） | 适用于要求可靠传输的应用，例如文件传输 |



# http强行使用udp能实现吗

HTTP 不可以基于 UDP 传输

