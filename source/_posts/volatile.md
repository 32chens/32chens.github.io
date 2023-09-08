---
title: volatile
author: chenlf
tags:
  - Java并发
categories:
  - Java
katex: true
date: 2023-09-08 20:17:45
---

### 可见性

底层是内存屏障，jdk1.5后才生效。

- 对volatile变量写，会在volatile变量的修改操作之后加上写屏障，写屏障**之前**所有变量的修改操作都回刷新到主内存中。
- 读，会在volatile变量的读取操作之前加上读屏障，读屏障**之后**所有变量的读取操作都会从主内存中去读。

### 有序性

- 保证写屏障**之前**的变量不会指令重排

- 保证读屏障**之后**的变量不会指令重排

  

### 为什么volatile不能保证原子性

对于i=1这个赋值操作，由于其本身是原子操作，因此在多线程程序中不会出现不一致问题，但是对于i++这种复合操作，即使使用volatile关键字修饰也不能保证操作的原子性，可能会引发数据不一致问题。

```
 private volatile int i = 0;
 i++;
```

如果启了500条线程并发地去执行i++这个操作 最后的结果i是小于500的

```
 i++操作可以被拆分为三步：

      1，线程读取i的值

      2、i进行自增计算

      3、刷新回i的值
```

**网上一些博客的解释是：**

假设某一时刻i=5，此时有两个线程同时从主存中读取了i的值，那么此时两个线程保存的i的值都是5， 此时A线程对i进行了自增计算，然后B也对i进行自增计算，此时两条线程最后刷新回主存的i的值都是6（本来两条线程计算完应当是7）所以说volatile保证不了原子性。

**我的不解之处在于：**

既然i是被volatile修饰的变量，那么对于i的操作应该是线程之间是可见的啊，就算A.,B两个线程都同时读到i的值是5，但是如果A线程执行完i的操作以后应该会把B线程读到的i的值置为无效并强制B重新读入i的新值也就是6然后才会进行自增操作才对啊。

后来参照其他博客终于想通了：

```
1、线程读取i

2、temp = i + 1

3、i = temp
```

当 i=5 的时候A,B两个线程同时读入了 i 的值， 然后A线程执行了 temp = i + 1的操作， 要注意，此时的 i 的值还没有变化，然后B线程也执行了 temp = i + 1的操作，注意，此时A，B两个线程保存的 i 的值都是5，temp 的值都是6， 然后A线程执行了 i = temp （6）的操作，此时i的值会立即刷新到主存并通知其他线程保存的 i 值失效， 此时B线程需要重新读取 i 的值那么此时B线程保存的 i 就是6，同时B线程保存的 temp 还仍然是6， 然后B线程执行 i=temp （6），所以导致了计算结果比预期少了1。



### volatile的使用场景

根据上面的例子可以发现，只有像`i=1`这种赋值的原子性操作才能保证volatile变量的原子性，所以volatile的使用场景有以下两种：

**1.状态标记量**

使用volatile来修饰状态标记量，使得状态标记量对所有线程是实时**可见**的，从而保证所有线程都能实时获取到最新的状态标记量，进一步决定是否进行操作。例如常见的促销活动“秒杀”，可以用volatile来修饰“是否售罄”字段，从而保证在并发下，能正确的处理商品是否罄。

```java
volatile boolean flag = false;
while (!flag) {
    doSomething();
}
public void setFlag() {
    flag = true;
}
```

**2.双重检测机制实现单例**

普通的双重检测机制在极端情况，由于指令重排序会出现问题（new Singleton()不是原子性操作，会发生重排序），通过使用volatile来修饰instance，禁止指令重排序，从而可以正确的实现单例。
```java
class Singleton{
    private volatile static Singleton instance = null;
     
    private Singleton() {   
    }
     
    public static Singleton getInstance() {
        if(instance==null) {
            synchronized (Singleton.class) {
                if(instance==null)
                    instance = new Singleton();
            }
        }
        return instance;
    }
}
```





### 引用

[为什么volatile能保证有序性不能保证原子性](https://www.cnblogs.com/simpleDi/p/11517150.html)

