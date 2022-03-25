![1.png](https://user-gold-cdn.xitu.io/2019/8/19/16ca75871ec53fba?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)



（1）View 层

View 是视图层，也就是用户界面。前端主要由 HTML 和 CSS 来构建 。

（2）Model 层

Model 是指数据模型，泛指后端进行的各种业务逻辑处理和数据操控，对于前端来说就是后端提供的 api 接口。

（3）ViewModel 层

ViewModel 是由前端开发人员组织生成和维护的视图数据层。在这一层，前端开发者对从后端获取的 Model 数据进行转换处理，做二次封装，以生成符合 View 层使用预期的视图数据模型。需要注意的是 ViewModel 所封装出来的数据模型包括视图的状态和行为两部分，而 Model 层的数据模型是只包含状态的，比如页面的这一块展示什么，而页面加载进来时发生什么，点击这一块发生什么，这一块滚动时发生什么这些都属于视图行为（交互），视图状态和行为都封装在了 ViewModel 里。这样的封装使得 ViewModel 可以完整地去描述 View 层。

MVVM 框架实现了双向绑定，这样 ViewModel 的内容会实时展现在 View 层，前端开发者再也不必低效又麻烦地通过操纵 DOM 去更新视图，MVVM 框架已经把最脏最累的一块做好了，我们开发者只需要处理和维护 ViewModel，更新数据视图就会自动得到相应更新。这样 View 层展现的不是 Model 层的数据，而是 ViewModel 的数据，由 ViewModel 负责与 Model 层交互，这就完全解耦了 View 层和 Model 层，这个解耦是至关重要的，它是前后端分离方案实施的重要一环。

![2019-07-16-21-47-05](https://user-gold-cdn.xitu.io/2019/8/1/16c498ca0de66530?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)



### MVVM的优缺点?

优点:

1. 分离视图（View）和模型（Model）,降低代码耦合，提高视图或者逻辑的重用性: 比如视图（View）可以独立于Model变化和修改，一个ViewModel可以绑定不同的"View"上，当View变化的时候Model不可以不变，当Model变化的时候View也可以不变。你可以把一些视图逻辑放在一个ViewModel里面，让很多view重用这段视图逻辑
2. 提高可测试性: ViewModel的存在可以帮助开发者更好地编写测试代码
3. 自动更新dom: 利用双向绑定,数据更新后视图自动更新,让开发者从繁琐的手动dom中解放

缺点:

1. Bug很难被调试: 因为使用双向绑定的模式，当你看到界面异常了，有可能是你View的代码有Bug，也可能是Model的代码有问题。数据绑定使得一个位置的Bug被快速传递到别的位置，要定位原始出问题的地方就变得不那么容易了。另外，数据绑定的声明是指令式地写在View的模版当中的，这些内容是没办法去打断点debug的
2. 一个大的模块中model也会很大，虽然使用方便了也很容易保证了数据的一致性，当时长期持有，不释放内存就造成了花费更多的内存
3. 对于大型的图形应用程序，视图状态较多，ViewModel的构建和维护的成本都会比较高

 



MVC:Model-View- Controller的简写。即模型-视图-控制器。 M和V指的意思和MVVM中的M和V意思一样。C即Controller指的是页面业务逻辑。 使用MVC的目的就是将M和V的代码分离。MVC是单向通信。 也就是View跟Model，必须通过Controller来承上启下。 MVC和MVVM的区别并不是VM完全取代了C，只是在MVC的基础上增加了一层VM， 只不过是弱化了C的概念，ViewModel存在目的在于抽离Controller中展示的业务逻辑，而不是替代Controller， 其它视图操作业务等还是应该放在Controller中实现。也就是说MVVM实现的是业务逻辑组件的重用， 使开发更高效，结构更清晰，增加代码的复用性。

 

MVVM:Model-View-ViewModel的简写。即模型-视图-视图模型 模型（Model）指的是后端传递的数据。视图(View)指的是所看到的页面。 视图模型(ViewModel)是mvvm模式的核心，它是连接view和model的桥梁。 它有两个方向：一是将模型（Model）转化成视图(View)，即将后端传递的数据转化成所看到的页面。 实现的方式是：数据绑定。二是将视图(View)转化成模型(Model)，即将所看到的页面转化成后端的数据。 实现的方式是：DOM 事件监听。这两个方向都实现的，我们称之为数据的双向绑定。

