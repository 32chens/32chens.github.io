---
title: Unity网络开发基础
author: chenlf
tags:
  - Unity
  - 网络
categories:
  - Unity
katex: true
date: 2023-09-30 15:44:30
---

## 学习目标

应对客户端网络模块中的{% label 网络连接 red %}、{% label 网络通信 red %}、{% label 协议统一 red %}等必备需求

{% hideToggle 简单看看 %}

## 网络开发必备理论

#### 网络基本概念

1. 网络：由若干设备和连接这些设备的链路构成，设备间可以相互通信
2. 局域网：指某一个小区域内由多台设备互联成的计算机组
3. 以太网：网络连接的一种规则，定义了连接传输规范
4. 城域网：是在一个城市范围内所建立的网络，几十到一百公里
5.  广域网：是连接不同地区、城市、国家的远程网络，几十到几千公里
6. 互联网（因特网）：是目前国际上最大的互联网，定义了通信规则等
7.  万维网：是基于因特网的网站和网页的统称

#### IP、端口、Mac地址

IP地址（Internet Protocol Address）是指互联网协议地址，又译为网际协议地址

**IP地址是IP协议提供的一种统一的地址格式，IP地址是设备在网络中的具体地址**

端口是不同应用程序在该设备上的门牌号码

 一台设备上不同的应用程序想要进行通信就必须对应一个唯一的端口号

Mac地址（Media Access Control Address） 直译为媒体存取控制地址，也称局域网地址，Mac地址，以太网地址，物理地址

Mac地址是用于在网络中唯一标识一个网卡的，一台设备可以有多个网卡，每个 网卡都会有一个唯一的Mac地址

#### 客户端和服务端

**1. 客户端**

用户在设备上（计算机、手机、平板）运行使用的应用程序就是客户端应用程序（简称客户端）

**2. 服务端**

服务端应用程序运行在远端的一台计算机上，客户端通过网络和服务端进行通讯，服务端为客户端 提供各种服务

\**3. 网络游戏开发中的客户端和服务端**

我们用Unity开发的应用程序就是游戏客户端应用程序 后端程序员可以使用C++、C#、Java、Go等等语言进行服务端程序开发，为游戏客户端提供服务 客户端和服务端之前通过互联网进行信息交换

#### 数据通信模型

我们采用C/S模型来进行前后端开发 在服务端的布局上往往使用的是

分布式的形式进行管理 比如服务端的用户数据使用集中式进行管理 玩家的数据都存储在数据库应用（SQL Server、MySQL）中

服务端应用程序使用分布式进行管理 账号服务器、游戏服务器、聊天服务器、跨服PVP服务器等分布式管理

这些服务端应用程序都使用数据库中的数据分别进行逻辑处理

##　网络协议

#### 概述

如果你想要在网络环境中进行通信，那么网络协议就是你必须遵守的规则

OSI模型是网络通信的基本规则 

TCP/IP协议是基于OSI模型的工业实现

#### OSI模型

OSI模型是人为定义的一个标准（规范） 它制定了设备之间相互连接相互通信的标准（规范） 各公司按照这个标准设计的规则（协议），就可以让不同设备利用互联网进行互联通信

![image-20230930162619311](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202309301626459.png)



#### TCP/IP协议

TCP/IP协议不仅仅指的是TCP 和IP两个协议，而是指一个由FTP、SMTP、TCP、UDP、IP等等协议构成的协议 簇 ，只是因为在TCP/IP协议中TCP协议和IP协议最具代表性，所以被称为TCP/IP协议

TCP/IP协议是一系列规则（协议）的统称，他们定义了消息在网络间进行传输的规则 是供已连接互联网的设备进行通信的通信规则

OSI模型只是一个基本概念，而TCP/IP协议是基于这个概念的具体实现

TCP/IP协议把互联通信的过程抽象的分成了四个层级

![image-20230930163035246](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202309301630319.png)

![image-20230930163154049](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202309301631104.png)

![image-20230930163225985](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202309301632042.png)



#### TCP和UDP（传输层）

![image-20230930163451457](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202309301634499.png)

**TCP三次握手建立连接**

1. 第一次握手（C—>S）TCP连接请求，告诉服务器我要和你建立连接
2. 第二次握手（S—>C）TCP授予连接，告诉客户端准了，来吧
3. 第三次握手（C—>S）TCP确认连接，告诉服务器，来就来

**TCP四次挥手断开连接**

1. 第一次挥手（C—>S）告诉服务器我数据发完了，你如果还有消息就快发完
2. 第二次挥手（S—>C）告诉客户端我知道了，请继续等待我的消息
3. 第三次挥手（S—>C）告诉客户端消息发完了，你可以正式断开连接了
4. 第四次挥手（C—>S）告诉服务器我等一会如果没有收到你回复我就断开了

**总结：**

TCP：

更可靠，保证数据的正确性和有序性（三次握手四次挥手） 适合对信息准确性要求高，效率要求较低的使用场景

比如：游戏开发，文件传输，远程登录等等 

UDP：

更效率，传输更快，资源消耗更少 适合对实时性要求高的使用场景

比如：直播，即时通讯，游戏开发等等

## 网络通信

#### 网络游戏通信方案概述

1. **弱联网和强联网游戏** 

​	弱联网游戏：

​	这种游戏不会频繁的进行数据通信，客户端和服务端之间每次连接只处理一次请求，服务端处理完 客户端的请求后返回数据后就断开连接了（开心消消乐、刀塔传奇、我叫MT等核心玩法都由客户端完成）

​	强联网游戏：

​	这种游戏会频繁的和服务端进行通信，会一直和服务端保持连接状态，不停的和服务器之间交换数据（MMORPG（角色扮演）、MOBA（多人在线竞技游戏）、ACT（动作游戏）等核心逻辑是由服务端进行处理，客户端和服务端之间不停的在同步信息）

2. **长连接和短连接游戏** 

   短连接游戏：需要传输数据时，建立连接，传输数据，获得响应，断开连接

   通信特点：需要通信时再连接，通信完毕断开连接

   通信方式：HTTP超文本传输协议、HTTPS安全的超文本传输协议（他们本质上是TCP协议）

   长连接游戏：不管是否需要传输数据，客户端与服务器一直处于连接状态，除非一端主动断开，或 者出现意外情况（客户端关闭或服务端崩溃等） 

   通信特点：连接一直建立，可以实时的传输数据

   通信方式：TCP传输控制协议 或 UDP用户数据报协议

3. **Socket、HTTP、FTP**

​	Socket：网络套接字，是对网络中不同主机上的应用进程之间进行双向通信的端点的抽象，一个套接字就是网 络上进程通信的一端，提供了应用层进程利用网络协议交换数据的机制 我们之后主要要学习的就是Socket网络套接字当中的各种API来进行网络通信

主要用于制作长连接游戏（强联网游戏）

Http/Https：(安全的)超文本传输协议，是一个简单的请求-响应协议，它通常运行在TCP协议之上，它指定了 客户端可能发送给服务端什么样的信息以及得到什么样的响应。

主要用于制作短连接游戏（弱联网游戏），也可以用来进行资源下载

FTP：文件传输协议，是用于在网络上进行文件传输的一套标准协议，可以利用它来进行网络上资源的下载和 上传。它也是基于TCP的传输，是面向连接的，为文件传输提供了可靠的保证

	#### IP和端口类

```c#
//IP类
IPAddress ip3 = IPAddress.Parse("118.102.111.11");
//IP端口类
IPEndPoint ipPoint2 = new IPEndPoint(IPAddress.Parse("118.102.111.11"), 8080);
```

#### 域名解析

```C#
//1.获取本地系统的主机名
print(Dns.GetHostName());

//2.获取指定域名的IP信息
IPHostEntry entry = Dns.GetHostEntry("www.baidu.com");
for (int i = 0; i < entry.AddressList.Length; i++)
{
    print("IP地址：" + entry.AddressList[i]);
}
for (int i = 0; i < entry.Aliases.Length; i++)
{
    print("主机别名" + entry.Aliases[i]);
}
print("DNS服务器名称" + entry.HostName);
```

*注意：由于获取远程主机信息是需要进行网路通信，所以可能会阻塞主线程*

异步获取

```C#
//异步获取
GetHostEntry();

private async void GetHostEntry()
{
    Task<IPHostEntry> task = Dns.GetHostEntryAsync("www.baidu.com");
    await task;
    for (int i = 0; i < task.Result.AddressList.Length; i++)
    {
        print("IP地址：" + task.Result.AddressList[i]);
    }
    for (int i = 0; i < task.Result.Aliases.Length; i++)
    {
        print("主机别名" + task.Result.Aliases[i]);
    }
    print("DNS服务器名称" + task.Result.HostName);
}
```

调用`async`修饰的方法

{% endhideToggle %}

#### Socket

Socket套接字是支持TCP/IP网络通信的基本操作单位,一个套接字对象包含以下关键信息:

1. 本机的IP地址和端口
2. 对方主机的IP地址和端口
3. 双方通信的协议信息

主要的socket类型和方法：

```c#
//TCP流套接字
Socket socketTcp = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);

//UDP数据报套接字
Socket socketUdp = new Socket(AddressFamily.InterNetwork, SocketType.Dgram, ProtocolType.Udp);

//1.主要用于服务端
//  1-1:绑定IP和端口
IPEndPoint ipPoint = new IPEndPoint(IPAddress.Parse("127.0.0.1"), 8080);
socketTcp.Bind(ipPoint);
//  1-2:设置客户端连接的最大数量
socketTcp.Listen(10);
//  1-3:等待客户端连入
socketTcp.Accept();

//2.主要用于客户端
//  1-1:连接远程服务端
socketTcp.Connect(IPAddress.Parse("118.12.123.11"), 8080);

//3.客户端服务端都会用的
//  1-1:同步发送和接收数据
//  1-2:异步发送和接收数据
//  1-3:释放连接并关闭Socket，先与Close调用
socketTcp.Shutdown(SocketShutdown.Both);
//  1-4:关闭连接，释放所有Socket关联资源
socketTcp.Close();
```

这里需要注意的是`socketTcp.Accept();`他会返回一个新的Socket，用来表示客户端的socket连接，所以服务的是用这个新的socket来与对应的客户端发送和接受消息，当客户端关闭时，也只要将这个新的socket关闭就好了。只有整个服务器要关闭时才需要关闭`socketTcp`

### TCP客户端和服务端基础通信

![image-20231006090729705](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202310060907758.png)

**服务端**

服务端主要使用一个Dictionary类型来保存所有的客户端socket。

使用线程池`ThreadPool.QueueUserWorkItem(AcceptAll)`处理客户端连接，其中`AcceptAll`方法死循环执行`Socket clientSocket = socket.Accept()`监听是否有客户端连接并放入Dictionary中。

使用线程池`ThreadPool.QueueUserWorkItem(ReceiveAll)`处理消息接受，`ReceiveAll`方法死循环遍历Dictionary，执行所有socket的`Receive`方法

**客户端**

客户端比较简单，封装一个通信的单例类，用两个线程池来接受和发送消息，在游戏开始时实例化并连接服务端就好了。

#### 消息区分和分包黏包处理

**消息的区分**：只需要在前后端定义好规则，比如在数据字节数据头部加上消息ID



分包、黏包指在网络通信中由于各种因素（网络环境、API规则等）造成的消息与消息之间出现的两种状态： 

- 分包：一个消息分成了多个消息进行发送
- 黏包：一个消息和另一个消息黏在了一起

![分包黏包示意图](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202310021615459.png)

**分包黏包处理**：和消息的区分一样为所有消息加上头部信息，用于存储其消息长度。根据数据的长度信息和存储的消息长度判断分包黏包情况，修改接受消息处的逻辑进行处理



TCP客户端：

```c#
using System;
using System.Collections;
using System.Collections.Generic;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using UnityEngine;

public class NetMgr : MonoBehaviour
{
    private static NetMgr instance;

    public static NetMgr Instance => instance;

    //客户端Socket
    private Socket socket;
    //用于发送消息的队列 公共容器 主线程往里面放 发送线程从里面取
    private Queue<BaseMsg> sendMsgQueue = new Queue<BaseMsg>();
    //用于接收消息的对象 公共容器 子线程往里面放 主线程从里面取
    private Queue<BaseMsg> receiveQueue = new Queue<BaseMsg>();

    ////用于收消息的水桶（容器）
    //private byte[] receiveBytes = new byte[1024 * 1024];
    ////返回收到的字节数
    //private int receiveNum;

    //用于处理分包时 缓存的 字节数组 和 字节数组长度
    private byte[] cacheBytes = new byte[1024 * 1024];
    private int cacheNum = 0;

    //是否连接
    private bool isConnected = false;

    void Awake()
    {
        instance = this;
        DontDestroyOnLoad(this.gameObject);
    }

    // Update is called once per frame
    void Update()
    {
        if(receiveQueue.Count > 0)
        {
            BaseMsg msg = receiveQueue.Dequeue();
            if(msg is PlayerMsg)
            {
                PlayerMsg playerMsg = (msg as PlayerMsg);
                print(playerMsg.playerID);
                print(playerMsg.playerData.name);
                print(playerMsg.playerData.lev);
                print(playerMsg.playerData.atk);
            }
        }
    }

    //连接服务端
    public void Connect(string ip, int port)
    {
        //如果是连接状态 直接返回
        if (isConnected)
            return;

        if (socket == null)
            socket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
        //连接服务端
        IPEndPoint ipPoint = new IPEndPoint(IPAddress.Parse(ip), port);
        try
        {
            socket.Connect(ipPoint);
            isConnected = true;
            //开启发送线程
            ThreadPool.QueueUserWorkItem(SendMsg);
            //开启接收线程
            ThreadPool.QueueUserWorkItem(ReceiveMsg);
        }
        catch (SocketException e)
        {
            if (e.ErrorCode == 10061)
                print("服务器拒绝连接");
            else
                print("连接失败" + e.ErrorCode + e.Message);
        }
    }

    //发送消息
    public void Send(BaseMsg msg)
    {
        sendMsgQueue.Enqueue(msg);
    }

    private void SendMsg(object obj)
    {
        while (isConnected)
        {
            if (sendMsgQueue.Count > 0)
            {
                socket.Send(sendMsgQueue.Dequeue().Writing());
            }
        }
    }

    //不停的接受消息
    private void ReceiveMsg(object obj)
    {
        while (isConnected)
        {
            if(socket.Available > 0)
            {
                byte[] receiveBytes = new byte[1024 * 1024];
                int receiveNum = socket.Receive(receiveBytes);
                HandleReceiveMsg(receiveBytes, receiveNum);
            }    
        }
    }

    //处理接受消息 分包、黏包问题的方法
    private void HandleReceiveMsg(byte[] receiveBytes, int receiveNum)
    {
        int msgID = 0;
        int msgLength = 0;
        int nowIndex = 0;

        //收到消息时 应该看看 之前有没有缓存的 如果有的话 我们直接拼接到后面
        receiveBytes.CopyTo(cacheBytes, cacheNum);
        cacheNum += receiveNum;

        while (true)
        {
            //每次将长度设置为-1 是避免上一次解析的数据 影响这一次的判断
            msgLength = -1;
            //处理解析一条消息
            if(cacheNum - nowIndex >= 8)
            {
                //解析ID
                msgID = BitConverter.ToInt32(cacheBytes, nowIndex);
                nowIndex += 4;
                //解析长度
                msgLength = BitConverter.ToInt32(cacheBytes, nowIndex);
                nowIndex += 4;
            }

            if(cacheNum - nowIndex >= msgLength && msgLength != -1)
            {
                //解析消息体
                BaseMsg baseMsg = null;
                switch (msgID)
                {
                    case 1001:
                        PlayerMsg msg = new PlayerMsg();
                        msg.Reading(cacheBytes, nowIndex);
                        baseMsg = msg;
                        break;
                }
                if (baseMsg != null)
                    receiveQueue.Enqueue(baseMsg);
                nowIndex += msgLength;
                if (nowIndex == cacheNum)
                {
                    cacheNum = 0;
                    break;
                }
            }
            else
            {
                //如果不满足 证明有分包 
                //那么我们需要把当前收到的内容 记录下来
                //有待下次接受到消息后 再做处理
                //receiveBytes.CopyTo(cacheBytes, 0);
                //cacheNum = receiveNum;
                //如果进行了 id和长度的解析 但是 没有成功解析消息体 那么我们需要减去nowIndex移动的位置
                if (msgLength != -1)
                    nowIndex -= 8;
                //就是把剩余没有解析的字节数组内容 移到前面来 用于缓存下次继续解析
                Array.Copy(cacheBytes, nowIndex, cacheBytes, 0, cacheNum - nowIndex);
                cacheNum = cacheNum - nowIndex;
                break;
            }
        }
        
    }

    public void Close()
    {
        if(socket != null)
        {
            socket.Shutdown(SocketShutdown.Both);
            socket.Close();

            isConnected = false;
        }
    }

    private void OnDestroy()
    {
        Close();
    }
}

```

主要看`HandleReceiveMsg`方法，服务端的处理逻辑和这个方法差不多，主要是有一个处理分包的缓存`cacheBytes`

#### 心跳消息

正常关闭客户端可以在关闭前发送一个退出消息给服务端，非正常关闭我们就需要心跳消息定时发送，服务端自定义超时判断。

#### Socket TCP通信中的异步方法（Begin开头方法）

```C#
Socket socketTcp = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
//服务器相关
//BeginAccept
//EndAccept
socketTcp.BeginAccept(AcceptCallBack, socketTcp);

private void AcceptCallBack(IAsyncResult result)
{
    try
    {
        //获取传入的参数 服务端socket
        Socket s = result.AsyncState as Socket;
        //通过调用EndAccept就可以得到连入的客户端Socket
        Socket clientSocket = s.EndAccept(result);

        s.BeginAccept(AcceptCallBack, s);	//异步连接下一个客户端，不是递归
    }
    catch (SocketException e)
    {
        print(e.SocketErrorCode);
    }
}

//客户端相关
//BeginConnect
//EndConnect
IPEndPoint ipPoint = new IPEndPoint(IPAddress.Parse("127.0.0.1"), 8080);
socketTcp.BeginConnect(ipPoint, (result) =>
        {
            Socket s = result.AsyncState as Socket;
            try
            {
                s.EndConnect(result);
                print("连接成功");
            }
            catch (SocketException e)
            {
                print("连接出错" + e.SocketErrorCode + e.Message);
            }

        }, socketTcp);


//服务器客户端通用
//接收消息
//BeginReceive
//EndReceive
socketTcp.BeginReceive(resultBytes, 0, resultBytes.Length, SocketFlags.None, ReceiveCallBack, socketTcp);

private void ReceiveCallBack(IAsyncResult result)
{
    try
    {
        Socket s = result.AsyncState as Socket;
        //这个返回值是你受到了多少个字节
        int num = s.EndReceive(result);
        //进行消息处理
        Encoding.UTF8.GetString(resultBytes, 0, num);

        //我还要继续接受
        s.BeginReceive(resultBytes, 0, resultBytes.Length, SocketFlags.None, ReceiveCallBack, s);
    }
    catch (SocketException e)
    {
        print("接受消息处问题" + e.SocketErrorCode + e.Message);
    }
}

//发送消息
//BeginSend
//EndSend
byte[] bytes = Encoding.UTF8.GetBytes("1231231231223123123");
socketTcp.BeginSend(bytes, 0, bytes.Length, SocketFlags.None, (result) =>
        {
            try
            {
                socketTcp.EndSend(result);
                print("发送成功");
            }
            catch (SocketException e)
            {
                print("发送错误" + e.SocketErrorCode + e.Message);
            }
        }, socketTcp);
```

#### Socket TCP通信中的异步方法2（Async结尾方法）

```c#
//服务器端
//AcceptAsync
SocketAsyncEventArgs e = new SocketAsyncEventArgs();
e.Completed += (socket, args) =>
{
    //首先判断是否成功
    if (args.SocketError == SocketError.Success)
    {
        //获取连入的客户端socket
        Socket clientSocket = args.AcceptSocket;

        (socket as Socket).AcceptAsync(args);
    }
    else
    {
        print("连入客户端失败" + args.SocketError);
    }
};
socketTcp.AcceptAsync(e);

//客户端
//ConnectAsync
SocketAsyncEventArgs e2 = new SocketAsyncEventArgs();
e2.Completed += (socket, args) =>
{
    if (args.SocketError == SocketError.Success)
    {
        //连接成功
    }
    else
    {
        //连接失败
        print(args.SocketError);
    }
};
socketTcp.ConnectAsync(e2);

//服务端和客户端
//发送消息
//SendAsync
SocketAsyncEventArgs e3 = new SocketAsyncEventArgs();
byte[] bytes2 = Encoding.UTF8.GetBytes("123123的就是拉法基萨克两地分居");
e3.SetBuffer(bytes2, 0, bytes2.Length);
e3.Completed += (socket, args) =>
{
    if (args.SocketError == SocketError.Success)
    {
        print("发送成功");
    }
    else
    {

    }
};
socketTcp.SendAsync(e3);

//接受消息
//ReceiveAsync
SocketAsyncEventArgs e4 = new SocketAsyncEventArgs();
//设置接受数据的容器，偏移位置，容量
e4.SetBuffer(new byte[1024 * 1024], 0, 1024 * 1024);
e4.Completed += (socket, args) =>
{
    if(args.SocketError == SocketError.Success)
    {
        //收取存储在容器当中的字节
        //Buffer是容器
        //BytesTransferred是收取了多少个字节
        Encoding.UTF8.GetString(args.Buffer, 0, args.BytesTransferred);

        args.SetBuffer(0, args.Buffer.Length);
        //接收完消息 再接收下一条
        (socket as Socket).ReceiveAsync(args);
    }
    else
    {

    }
};
socketTcp.ReceiveAsync(e4);
```







### UDP客户端和服务端通信

![image-20231006090658676](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202310060907786.png)

**分包黏包问题**

​	UDP本身作为无连接的不可靠的传输协议（适合频繁发送较小的数据包）, 他不会对数据包进行合并发送, 一端发送什么数据，直接就发出去了，他不会对数据合并, 因此在{% label UDP当中不会出现黏包问题 red %}（除非你手动进行黏包）

​	由于UDP是**不可靠的连接**，消息传递过程中可能出现{% label 无序、丢包 red %}等情况。 所以如果允许UDP进行分包，那后果将会是灾难性的， 比如分包的后半段丢包或者比上半段先发来，我们在处理消息时将会非常困难。 因此为了**避免其分包**，我们建议在发送UDP消息时，控制消息的大小在{% label MTU（最大传输单元） red %}范围内

​	MTU:

1. ​	局域网环境下：1472字节以内（1500减去UDP头部28为1472） 
2. ​	互联网环境下：548字节以内（老的ISP拨号网络的标准值为576减去UDP头部28为548）



#### UDP基础通信

```c#
//实现UDP服务端通信 收发字符串
//1.创建套接字
Socket socket = new Socket(AddressFamily.InterNetwork, SocketType.Dgram, ProtocolType.Udp);
//2.绑定本机地址
IPEndPoint ipPoint = new IPEndPoint(IPAddress.Parse("127.0.0.1"), 8081);
socket.Bind(ipPoint);
Console.WriteLine("服务器开启");
//3.接受消息
byte[] bytes = new byte[512];
//这个变量主要是用来记录 谁发的信息给你 传入函数后 在内部 它会帮助我们进行赋值记录客户端的IP和端口
EndPoint remoteIpPoint2 = new IPEndPoint(IPAddress.Any, 0);
int length = socket.ReceiveFrom(bytes, ref remoteIpPoint2);


//4.发送到指定目标
//由于我们先收 所以 我们已经知道谁发了消息给我 我直接发给它就行了
socket.SendTo(Encoding.UTF8.GetBytes("欢迎发送消息给服务器"), remoteIpPoint2);

//5.释放关闭
socket.Shutdown(SocketShutdown.Both);
socket.Close();
```

### FTP

FTP文件传输协议就是一个在网络中上传下载文件的一套规则

**FTP的工作原理**

{% label FTP的本质是TCP通信 red %}，通过FTP传输文件，双发至少需要建立两个TCP连接，**一个称为控制连接，用于传输FTP命令。 一个称为数据连接，用于传输文件数据**

**FTP的数据连接和控制连接方向一般是相反的**，控制连接方向：客户端主动连接服务器告知其下载命令。数据连接方向：服务端主动连接客户端下发数据



当客户端和FTP服务器建立控制连接后 需要告诉服务器采用那种**传输模式** 

1. **主动模式(Port模式)**：服务器主动连接客户端，然后传输文件
2. **被动模式(Passive模式)**：客户端主动连接服务器，即控制连接和数据连接都由客户端发起

注：一般情况下主动模式会受到客户端防火墙影响，所以被动模式使用较多

使用FTP进行数据传输时，有两种数据**传输方式**

1. **ASCII传输方式**：以ASCII编码方式传输数据，适用于传输 仅包含英文的命令和参数或者英文文本文件
2. **二进制传输方式（建议使用该方式）**：可以指定采用哪种编码传输命令和文件数据 如果传输的文件不是英文文件则应该采用该方式



**我们如何学习FTP**

- C#中的三个类FtpWebRequest、FtpWebResponse、NetworkCredential 
- 学习如何搭建FTP服务器 
- 学习上传文件到FTP服务器 
- 学习从FTP服务器下载文件到本地

#### FtpWebRequest、FtpWebResponse、NetworkCredential 

```c#
 	//NetworkCredential 
//用于在Ftp文件传输时，设置账号密码
NetworkCredential n = new NetworkCredential("MrTang", "MrTang123");

	//FtpWebRequest
//重要方法
//1.Create 创建新的WebRequest，用于进行Ftp相关操作
FtpWebRequest req = FtpWebRequest.Create(new Uri("ftp://127.0.0.1/Test.txt")) as FtpWebRequest;
//2.Abort  如果正在进行文件传输，用此方法可以终止传输
req.Abort();
//3.GetRequestStream  获取用于上传的流
Stream s = req.GetRequestStream();
//4.GetResponse  返回FTP服务器响应
FtpWebResponse res = req.GetResponse() as FtpWebResponse;

//重要成员
//1.Credentials 通信凭证，设置为NetworkCredential对象
req.Credentials = n;
//2.KeepAlive bool值，当完成请求时是否关闭到FTP服务器的控制连接（默认为true，不关闭）
req.KeepAlive = false;

//3.Method  操作命令设置
//  WebRequestMethods.Ftp类中的操作命令属性
//  DeleteFile  删除文件
//  DownloadFile    下载文件    
//  ListDirectory   获取文件简短列表
//  ListDirectoryDetails    获取文件详细列表
//  MakeDirectory   创建目录
//  RemoveDirectory 删除目录
//  UploadFile  上传文件
req.Method = WebRequestMethods.Ftp.DownloadFile;	//  DownloadFile    下载文件 

//4.UseBinary 是否使用2进制传输
req.UseBinary = true;
//5.RenameTo    重命名
req.RenameTo = "myTest.txt";

	//FtpWebResponse
//通过FtpWebRequest来真正的从服务器获取内容
FtpWebResponse res = req.GetResponse() as FtpWebResponse;
//重要方法：
//1.Close:释放所有资源
res.Close();
//2.GetResponseStream：返回从FTP服务器下载数据的流
Stream stream = res.GetResponseStream();

//重要成员：
//1.ContentLength:接受到数据的长度
print(res.ContentLength);
//2.ContentType：接受数据的类型
print(res.ContentType);
//3.StatusCode:FTP服务器下发的最新状态码
print(res.StatusCode);
//4.StatusDescription:FTP服务器下发的状态代码的文本
print(res.StatusDescription);
//5.BannerMessage:登录前建立连接时FTP服务器发送的消息
print(res.BannerMessage);
//6.ExitMessage:FTP会话结束时服务器发送的消息
print(res.ExitMessage);
//7.LastModified:FTP服务器上的文件的上次修改日期和时间
print(res.LastModified);
```



#### FTP上传

主要是从文件流读取，写入到请求的流

```C#
//1.创建一个Ftp连接
FtpWebRequest req = FtpWebRequest.Create(new Uri("ftp://192.168.50.49/pic.png")) as FtpWebRequest;
//2.设置通信凭证(如果不支持匿名 就必须设置这一步)
//将代理相关信息置空 避免 服务器同时有http相关服务 造成冲突
req.Proxy = null;
NetworkCredential n = new NetworkCredential("MrTang", "MrTang123");
req.Credentials = n;
//请求完毕后 是否关闭控制连接，如果想要关闭，可以设置为false
req.KeepAlive = false;
//3.设置操作命令
req.Method = WebRequestMethods.Ftp.UploadFile;//设置命令操作为 上传文件
//4.指定传输类型
req.UseBinary = true;
//5.得到用于上传的流对象
Stream upLoadStream = req.GetRequestStream();

//6.开始上传
using (FileStream file = File.OpenRead(Application.streamingAssetsPath + "/test.png"))
{
    //我们可以一点一点的把这个文件中的字节数组读取出来 然后存入到 上传流中
    byte[] bytes = new byte[1024];

    //返回值 是真正从文件中读了多少个字节
    int contentLength = file.Read(bytes, 0, bytes.Length);
    //不停的去读取文件中的字节 除非读取完毕了 不然一直读 并且写入到上传流中
    while (contentLength != 0)
    {
        //写入上传流中
        upLoadStream.Write(bytes, 0, contentLength);
        //写完了继续读
        contentLength = file.Read(bytes, 0, bytes.Length);
    }
    //除了循环就证明 写完了 
    file.Close();
    upLoadStream.Close();
    //上传完毕
    print("上传结束");
}
}
catch (Exception e)
{
    print("上传出错 失败" + e.Message);
}
```



## 消息处理

