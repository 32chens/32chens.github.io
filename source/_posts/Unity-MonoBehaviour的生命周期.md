---
title: Unity-MonoBehaviour的生命周期
author: chenlf
tags:
  - Unity
  - Transform
categories:
  - Unity
katex: true
date: 2023-09-25 15:19:06
---

 	Unity3D 中可以给每个游戏对象添加脚本，这些脚本必须继承 MonoBehaviour，用户可以根据需要重写 MonoBehaviour 的部分生命周期函数，这些生命周期函数由系统自动调用，且调用顺序与书写顺序无关。

MonoBehaviour 的继承关系：MonoBehaviour→Behaviour→Component→Object.
    
MonoBehaviour 的生命周期函数主要有：

- OnValidate: 确认事件，脚本被加载、启用、禁用、Inspector 面板值被修改时，都会执行一次
- Awake：当脚本实例被**创建时**调用，用于初始化脚本变量和引用。可以在该函数中获取其他组件并进行初始化操作。
- OnEnable：在游戏对象或组件被启用时调用，用于处理游戏对象或组件的启用逻辑，如注册事件、开启协程等。
- Start：在脚本实例被**创建后第一帧**被渲染前调用，用于初始化游戏对象的状态，如设置初始位置、旋转和缩放等。
- FixedUpdate：在每一帧的物理模拟前调用，用于处理游戏对象的物理行为，如受力、重力、运动学等。
- Update：在每一帧更新前调用，用于处理游戏对象的状态和逻辑，如移动、旋转、碰撞检测等。
- LateUpdate：在每一帧更新后调用，用于处理游戏对象的状态和逻辑，如相机跟随、物体跟随等。
- OnGUI：在每一帧渲染前调用，用于绘制游戏对象的GUI界面，如按钮、文本、贴图等。
- OnDisable：在游戏对象或组件被禁用时调用，用于处理游戏对象或组件的禁用逻辑，如取消事件、停止协程等。
- OnDestroy：在游戏对象或组件销毁时调用，用于处理游戏对象或组件的销毁逻辑，如释放资源、取消引用等。

![img](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202311011024324.png)

![img](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202311011023699.png)

![img](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202311011025424.png)

https://zhuanlan.zhihu.com/p/551294000
