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

- Awake：唤醒事件，只执行 1 次，游戏一开始运行就执行。
- OnEnable：启用事件，只执行 1 次，当脚本组件被启用的时候执行一次。
- Start：开始事件，只执行 1 次。
- FixedUpdate：固定更新事件，每隔 0.02 秒执行一次，所有物理组件相关的更新都在这个事件中处理。
- Update：更新事件，每帧执行 1 次。
- LateUpdate：稍后更新事件，每帧执行 1 次，在 Update 事件执行完毕后再执行。
- OnGUI：GUI渲染事件，每帧执行 2 次。
- OnDisable：禁用事件，只执行1 次，在 OnDestroy 事件前执行，或者当该脚本组件被禁用后，也会触发该事件。
- OnDestroy：销毁事件，只执行 1 次，当脚本所挂载的游戏物体被销毁时执行。

