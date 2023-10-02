---
title: Unity基础
author: chenlf
tags:
  - Unity
categories:
  - Unity
katex: true
date: 2023-09-26 09:36:56
---

### Resources资源动态加载

**特殊文件夹**

**Resources资源同步加载**

**Resources资源异步加载**

**Resources资源卸载**



### 异步加载资源和异步加载场景事件回调

```c#
Resource.LoadAsync<Texture>("Txt/TestJPG")
SceneManager.LoadSceneAsync("scene1")
```

可以使用异步加载的返回值的**事件**存储一个回调函数，也可以使用协程，在协程函数中异步加载，结束条件为`yield return [异步加载的返回值]`，这样在yield和异步加载操作之间我们还可以执行一些其他操作。这两种方法都要到下一帧才会执行回调函数.

切换场景会默认销毁当前场景中的所有游戏对象，如果使用协程那么yield后的代码可能就因为游戏物体被销毁了而无法执行，可以调用 MonoBehaviour 的 DontDestroyOnLoad 方法，如下：

```cs
DontDestroyOnLoad(this.gameObject);
```
