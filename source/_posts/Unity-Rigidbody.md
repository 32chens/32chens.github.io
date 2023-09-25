---
title: Unity-Rigidbody
author: chenlf
tags:
  - Unity
  - Rigidbody
categories:
  - Unity
katex: true
date: 2023-09-25 15:26:17
---

​	刚体（Rigidbody）是运动学（Kinematic）中的一个概念，指在运动中和受力作用后，形状和大小不变，而且内部各点的相对位置不变的物体。在 Unity3D 中，刚体组件赋予了游戏对象一些运动学上的属性，主要包括 Mass（质量）、Drag（阻力）、Angular Drag（角阻力）、Use Gravity（是否使用重力）、Is Kinematic（是否受物理影响）、Collision Detection（碰撞检测）、 Velocity（速度）、Force（受力）、Explosion Force（爆炸力）。没有刚体（RigidBody）组件，游戏对象之间可以相互穿透，不会产生碰撞。

1）获取刚体组件

```
Rigidbody rig = GetComponent<Rigidbody>();
```



2）刚体组件面板属性

- Mass：物体的质量（默认以千克为单位）
- Drag：物体受到的空气阻力大小
- Angular Drag：物体旋转时，受到的旋转阻力大小转
- Use Gravity：如果启用，物体将受到重力的影响
- Is Kinematic：如果启用，物体将不会由物理引擎驱动，只能由其 Transform 组件操作
- Interpolate：物体运动位置的插值器
- Collision Detection：碰撞检测类型，当看到物体由于运动太快而穿墙时，可以增强碰撞检测频率，选择 Continuous 选项
- Constraints：对刚体运动和旋转的限制，限制物体运动时在某个坐标轴上的分量保持不变
- velocity：物体运动矢量速度
- angularVelocity：物体运动角速度



3）刚体组件方法

```c#
// 刚体受到的推力
public void AddForce(Vector3 force)
// 刚体受到的爆炸力，explosionForce：爆炸力大小，explosionPosition：爆炸点，explosionRadius：爆炸半径
public void AddExplosionForce(float explosionForce, Vector3 explosionPosition, float explosionRadius)
```



### 引用

https://zhyan8.blog.csdn.net/article/details/125401013
