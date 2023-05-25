---
title: synchronized详解
abbrlink: f0baa025
date: 2023-05-23 21:47:50
tags: "Java并发"
---

### 前置知识

##### 对象头

众所周知，synchronized最常见的使用方式如下，其中obj就代表了锁对象

```java
Object obj = new Object();
synchronized(obj){
    ...
}
```

那么为什么synchronized需要使用一个对象作为锁呢?

首先,新建一个对象,他由两部分组成, 一部分是对象头, 另一部分才是对象的属性等内容. 而对象头的markword字段可以用来表示线程的状态

一般而言, 对象头有MarkWord 和 KlassWord(对象类型) 两部分组成,其中MarkWord组成结构（32为系统和64位系统）:

![](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202305241035154.jpg [对象头])

![image-20220722103510809](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202305241035172.png)

![image-20220722170730689](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202305241041663.png)

- 其中Normal表示无锁状态, (一般新建对象的状态)
- Biased 表示偏向锁状态,其中mardword前23位记录当前持有锁的线程id.
- Lightweight Locked 表示轻量级锁, mark word前30位记录当前持有锁的线程的栈帧中锁记录结构地址. 
- heavyweight Locked 表示重量级锁, mark word前30位记录Monitor对象地址

#### Monitor对象

monitor对象是操作系统生成的一个对象, 每一个Java对象都可以关联一个Monitor对象, 当synchronized加上重量级锁, 就是通过锁对象关联一个monitor对象, 即修改锁对象的mark word指向这个monitor对象的地址相关联.

其中Monitor对象的结构如下:

![image-20220722105300062](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202305241035181.png)

- Owner: 记录当前持有锁的线程id
- EntryList: 记录因竞争锁失败而阻塞的线程
- WaitSet: 记录调用了wait() 方法需要等待的线程
- _count：约为_WaitSet 和 _EntryList 的节点数之和
- _cxq: 多个线程争抢锁，会先存入这个单向链表
- _recursions: 记录重入次数

WaitSet和EntryList的线程都处于阻塞状态，不占用CPU时间片

synchronized加上重量级锁, 除了修改锁对象的markword指向Monitor对象(Monitor对象地址+状态10), 需要将获得锁的线程id赋值给Monitor对象的Owner

### 未优化的synchronized实现

在Java1.6之前,synchronized是采用重量级锁的方式实现线程同步的,  上锁时,修改锁对象的mark word指向对应的Monitor对象, 同时将Monitor对象的Owner设置为当前获得锁的线程.  如果现在有其他线程来竞争,发现Owner已经被赋值了,他就进入Monitor对象的阻塞队列EntryList中.  

释放锁则是将Owner赋值为空, 同时唤醒monitor对象中的阻塞队列EntryList的线程来竞争锁



ObjectMonitor::enter() 和 ObjectMonitor::exit() 分别是ObjectMonitor获取锁和释放锁的方法。在JVM中monitorenter和monitorexit字节码依赖于底层的操作系统的Mutex Lock来实现的，但是由于使用Mutex Lock需要将当前线程挂起并从用户态切换到内核态来执行，这种切换的代价是非常昂贵的；然而在现实中的大部分情况下，同步方法是运行在单线程环境(无锁竞争环境)如果每次都调用Mutex Lock那么将严重的影响程序的性能。不过在jdk1.6中对锁的实现引入了大量的优化，如**锁粗化(Lock Coarsening)、锁消除(Lock Elimination)、轻量级锁(Lightweight Locking)、偏向锁(Biased Locking)、适应性自旋(Adaptive Spinning)**等技术来减少锁操作的开销。

### 自旋优化

[关于synchronized的锁升级自旋问题 - 简书 (jianshu.com)](https://www.jianshu.com/p/39c4b83d078a)

**重量级锁**竞争时,  因为阻塞会发生上下文切换, 比较消耗计算机资源, 如果共享数据的锁定状态只会持续很短的一段时间，为了这段时间去挂起和回复阻塞线程并不值得，所以在如今多处理器环境下可以使用自选优化, 线程进入临界区时发现锁已经被其他线程占有, 并不直接放入Monitor对象阻塞队列而是**CAS尝试修Monitor对象Owner**，不放弃CPU时间，而是在获得CPU时间内不断尝试一定次数，我们通常把这种优化叫自旋锁

-  如果在自旋过程中, 持锁线程释放了锁, 这时当前线程就可以避免阻塞, 直接持有锁了.
-  如果自旋一定次数还是没有CAS成功, 则把自己放入Monitor的阻塞队列Entry List中

1. java6之后 自旋锁是**自适应**的, 比如对象刚刚一次自旋操作成功过, 那么认为这次自旋成功的可能性会高,就多自旋几次; 反之,少自旋甚至不自旋.
2. 自旋会占用CPU时间, 单核CPU自旋就是浪费, 多核CPU自旋才能发挥优势
3. Java7之后不能控制是否开启自旋功能



### 轻量级锁优化

这里考虑如果线程间虽然使用同一个锁, 但是在时间上是没有冲突的, 那么就不会有线程安全问题, 这个时候如果依旧使用Monitor对象, 那么计算机资源就比较浪费了. 所以就有了轻量级锁对这一情况进行优化（轻量级锁并不是替代重量级锁的，而是对在大多数情况下同步块并不会有竞争出现提出的一种优化）.

![image-20220722112332580](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202305241035186.png)

创建锁记录对象,每个线程都会包含一个锁记录对象.其中有两个属性, 其中一个值为自己这个锁记录的地址加上轻量级的状态00, 另一个Object reference记录锁对象地址. 

当加上轻量级锁时,则会将锁对象的markword 和 线程的锁记录第一个属性进行CAS替换(解锁流程则是再次CAS替换),如图

![image-20220722114100715](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202305241035192.png)

替换成功表示加锁成功, 此时锁对象的对象markword存储了`锁记录地址和状态00`, 如图:

![dd](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202305241035197.png)

如果CAS失败了,有两种情况:

- 其他线程已经持有了轻量级锁, 表示有竞争, 则需要进入锁膨胀过程, 成为重量级锁
- 自己执行了synchronized锁重入

#### 锁膨胀轻量级升级重量级

![image-20220722114749935](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202305241035749.png)

![image-20220722115157954](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202305241035767.png)

图中的情况,Thread-1尝试CAS替换加轻量级锁失败, 这时Thread-1为锁对象Object申请Monitor对象,将锁对象Onject的markword前62位修改为monitor对象地址,后两位状态10, 并将自己放入Monitor的阻塞队列中. 

Thead-0解锁时, CAS替换失败,则进入重量级解锁流程(owner= null, 唤醒EntryList)

现在就是在轻量级锁的时候发生了竞争（时间上不错开），并不是立刻升级为重量级锁，而是自旋CAS一段时间后如果还是失败才会升级成重量级锁

### 锁重入

```java
public synchronized void operation(){
    ...
    add();
}

public synchronized void add(){

}
```

像这种情况就会发生锁重入, 即同一线程又对同一对象加锁了,运行到add()方法会在线程栈中在添加一个锁记录对象, CAS替换MarkWord和锁记录的值, MarkWord状态已经是00, 那么CAS替换失败![image-20220722141337995](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202305241035785.png)

当退出synchronized代码块(解锁时)如果有取值为null的锁记录,表示有重入,这时删除一个锁记录,表示重入计数减一

![image-20220722141730907](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202305241035797.png)

当退出synchronized代码块(解锁时) 如果锁记录取值不为null,这时使用CAS将MarkWord的值恢复给对象头(此时对象头状态01)

重入部分有的资料写的是monitor计数器加减就行了

### 偏向锁优化

**为什么要引入偏向锁？**

因为经过HotSpot的作者大量的研究发现，大多数时候是不存在锁竞争的，常常是一个线程多次获得同一个锁，因此如果在同一个线程反复获取锁释放锁中会增大很多没有必要付出的代价，为了降低获取锁的代价，才引入的偏向锁。



当线程1访问代码块并获取锁对象时，会在java对象头和栈帧中记录偏向的锁的threadID，因为偏向锁不会主动释放锁，因此以后线程1再次获取锁的时候，需要比较当前线程的threadID和Java对象头中的threadID是否一致，如果一致（还是线程1获取锁对象），则无需使用CAS来加锁、解锁；如果不一致（其他线程，如线程2要竞争锁对象，而偏向锁不会主动释放因此还是存储的线程1的threadID），那么需要查看Java对象头中记录的线程1是否存活，

1. 如果没有存活，那么锁对象被重置为无锁状态，其它线程（线程2）可以竞争将其设置为偏向锁（**重偏向**）；
2. 如果存活，那么立刻查找该线程（线程1）的栈帧信息，如果还是需要继续持有这个锁对象，那么暂停当前线程1，撤销偏向锁，升级为轻量级锁，如果线程1 不再使用该锁对象，那么将锁对象状态设为无锁状态，重新偏向新的线程。



