---
title: Unity-Collider
author: chenlf
tags:
  - Unity
  - Collider
categories:
  - Unity
katex: true
date: 2023-09-25 15:30:36
---

   Unity3D 中碰撞体（Collider）组件用于检测运动的物体之间是否发生碰撞，也可以作为触发器使用。产生碰撞的条件是：

- 2 个游戏对象都有 Collider
- 至少有一个游戏对象有 Rigidbody
- 2 个游戏对象保持相对运动（一个 Cube 放在 Plane 上，不会产生碰撞，因为没有相对运动）

​        碰撞体的边界不一定与游戏对象的边界一致，用户可以点击 Edit Collider 按钮编辑碰撞体的边界，也可以在属性面板里调整碰撞体边界。另外，**用户可以勾选 Is Trigger 选项，作为触发器使用（不勾选将作为碰撞器使用）**，作为触发器使用时，不会产生碰撞，游戏对象之间会相会穿越。

 **1）回调方法** 
    
碰撞器回调方法：

```c#
// 碰撞开始
void OnCollisionEnter(Collision other)
// 碰撞过程中，每帧调用一次
void OnCollisionStay(Collision other)
// 碰撞结束
void OnCollisionExit(Collision other)
```

触发器回调方法：

```c#
// 触发开始
void OnTriggerEnter(Collider other)
// 触发过程中，每帧调用一次
void void OnTriggerStay(Collider other)
// 触发结束
void OnTriggerExit(Collider other)
```

 说明：碰撞器和触发器对应的回调方法都是 MonoBehaviour 里的方法，用户可以在脚本组件里重写这些方法，碰撞器和触发器对应的回调方方法只能执行其一，当作为触发器使用时，就不能执行碰撞器对应的回调方法。

**2）回调参数**
    
碰撞器回调方法的 {% label Collision blue%}参数

```c#
// 碰撞对象的碰撞体组件
Collider collider = collision.collider;
// 碰撞点信息
ContactPoint[] contactPoint = collision.contacts;
Vector3 point = contactPoint[0].point;
// 碰撞点处当前物体的碰撞体组件(当前物体有多层子对象时, 可以获取具体碰撞的子对象)
Collider thisCollider = contactPoint[0].thisCollider;
// 碰撞点处对方物体的碰撞体组件
Collider otherCollider = contactPoint[0].otherCollider;
```

触发器回调方法的 {% label Collider blue%}参数

```c#
// 获取碰撞体的MeshRenderer组件
MeshRenderer meshRenderer = collider.GetComponent<MeshRenderer>();
```



------------------------------------------------
### 引用

https://blog.csdn.net/m0_37602827/article/details/125453517
