---
title: Unity-协程
author: chenlf
tags:
  - Unity
  - 协程
categories:
  - Unity
katex: true
date: 2023-09-25 15:40:59
---

### 概述

​	**1）协程概念** 

​	协同程序（Coroutine）简称协程，是伴随主线程一起运行的程序片段，是一个能够**暂停执行**的函数，用于解决程序并行问题，主要是将主线程中耗时的逻辑**分时分步**的执行，他并不是开辟一个新的线程去执行，而是用线程来承载运行

​	协程是一个能够暂停执行的函数，在收到中断指令后暂停执行，并立即返回主函数，执行主函数剩余的部分，直到中断指令完成后，从中断指令的下一行继续执行协程剩余的部分。函数体全部执行完成，协程结束。协程能保留上一次调用时的状态，每次过程重入时，就相当于进入上一次调用的状态。由于中断指令的出现，**使得可以将一个函数分割到多个帧里执行**。

​	注：Unity是支持多线程的，只是新创建的线程是无法访问Unity相关对象的内容

 **2）中断指令**

```c#
// 协程在所有脚本的FixedUpdate执行之后,等待一个fixed时间间隔之后再继续执行
yield return WaitForFixedUpdate();
// 协程将在下一帧所有脚本的Update执行之后,再继续执行
yield return null;
// 协程在延迟指定时间,且当前帧所有脚本的 Update全都执行结束后才继续执行
yield return new WaitForSeconds(seconds);
// 与WaitForSeconds类似, 但不受时间缩放影响
yield return WaitForSecondsRealtime(seconds);
// 协程在WWW下载资源完成后,再继续执行
yield return new WWW(url);
// 协程在指定协程执行结束后,再继续执行
yield return StartCoroutine();
// 当返回条件为假时才执行后续步骤
yield return WaitWhile();
// 等待帧画面渲染结束  需要截图的时候可以用这个
yield return new WaitForEndOfFrame();
```

补充：中断对象可以使用静态全局变量，避免产生过多临时对象、频繁触发 GC。 

**3）协程的执行周期**

![img](https://img-blog.csdnimg.cn/9f03a87f94a846e08c8ecfde76566b35.png)



**4）协程与线程的区别**

- 一个线程可以有多个协程；
- 线程是协程的资源，协程通过 Interceptor 来间接使用线程这个资源；
- **线程是同步机制**，必须等待方法执行完才能返回执行后续方法；协程是**异步机制**，不需要等方法执行完就可以返回继续执行后续方法；
- 线程是抢占式，进行线程切换，需要使用锁机制，多线程执行顺序具有一定随机性；**协程是非抢占式的**，多协程执行顺序由其启动顺序决定。

###  协程的使用
**1）创建协程**

```c#
private IEnumerator CorutineTest() {
    Debug.Log("CorutineTest, 1");
    yield return null;
    Debug.Log("CorutineTest, 2");
    yield return new WaitForSeconds(0.05f);
    Debug.Log("CorutineTest, 3");
    yield return new WaitForFixedUpdate();
    Debug.Log("CorutineTest, 4");
    yield return new WWW("https://mazwai.com/download_new.php?hash=b524357ef93c1e6ad0245c04c721e479");
    Debug.Log("CorutineTest, 5");
}
```

**2）启动协程**

```c#
private void Start() {
    // 形式一
    StartCoroutine(CorutineTest()); 
    StartCoroutine(CorutineTest("arg"));
    // 形式二, 此方式最多只能传1个参数
    StartCoroutine("CorutineTest"); 
    StartCoroutine("CorutineTest", "arg");
    // 形式三
    IEnumerator corutin = CorutineTest();
    StartCoroutine(corutin);
}
```

**3）停止协程**

```c#
public void StopCoroutine(Coroutine routine);
public void StopCoroutine(IEnumerator routine);
public void StopCoroutine(string methodName); // 只能停止用字符串方法启动的协程
public void StopAllCoroutines(); //关闭所有协程
yield break; // 跳出协程
```

**4）Start 协程**

```c#
private IEnumerator Start() { // 此时程序中不能再有其他Start方法
    yield return StartCoroutine(CorutineTest());
}
```



### 协程的原理

- 协程函数本体
- 协程调度器

注：协程只有在脚本失活时，不受影响，当脚本移除，游戏物体失活、销毁时都会结束



------------------------------------------------
版权声明：本文为CSDN博主「little_fat_sheep」的原创文章，遵循CC 4.0 BY-SA版权协议，转载请附上原文出处链接及本声明。
原文链接：https://blog.csdn.net/m0_37602827/article/details/126679460
