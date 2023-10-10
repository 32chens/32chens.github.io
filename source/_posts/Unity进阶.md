---
title: Unity进阶
author: chenlf
tags:
  - Unity
categories:
  - Unity
katex: true
date: 2023-09-26 14:38:15
---

## 2D动画相关

## 3D动画相关

## 角色控制器

##　导航寻路系统

Unity中的导航寻路系统本质上是在A星寻路算法的基础上进行了拓展和优化

 1）导航系统使用流程

- 将地面、路障等静态对象的 Static 属性设置为 Navigation Static；
- 在 Navigation 窗口烘焙（Bake）导航网格；
- 给导航角色添加 NavMeshAgent 组件；
- 给导航角色添加脚本组件，并在脚本组件中设置导航目标位置（navMeshAgent.SetDestination）

#### 导航网格

用来生成寻路的地形数据

**Object页签**

打开Windows->AI->Navigation窗口，选中地面、路障等静态对象，Navigation中的Object页签中勾选`Navigation Static`，如果需要一个平面跳向另一个平面则需要勾选`Generate OffMeshLinks`

**Bake页签**

在 Navigation 窗口烘焙Bake页签点击`Bake`会生成生成导航网格文件`NavMesh`
Agent Radius：烘焙边缘精确度
Agent Height: 烘焙高度精确度（决定是否可以过拱桥）
Max Slope:  最大坡度
Step Height: 角色爬台阶时每步能跨的最大高度

Generated Ｏff Ｍesh Ｌinks
Drop Height: 掉落高度
Jump Distance:　跳跃距离

**Areas页签**

添加地形标签和寻路权重

**Agents页签**

代理页签



#### 导航网格寻路组件 NavMeshAgent

用来帮助我们根据地形数据计算路径, 游戏角色对象需要挂载该组件`NavMeshAgent`

**参数**

Base Offset：导航角色与网格中心的偏移量
Speed：导航过程中最大速度
Angular Speed：拐弯时角速度
Acceleration：加速度
Stopping Distance：离目标多远停下
Auto Braking：当角色快达到目标时，自动减速（巡逻移动不要开启）
Radius：导航角色半径
Height：导航角色高度
Quality：导航质量，质量越高，导航算法越优，导航路径越短，但是性能消耗越大
Priority：导航角色优先级（多个导航角色过独木桥时，谁先过）
Auto Traverse Off Mesh Link：自动跨越分离路面
Auto Repath：自动重新规划路径（点击不可走的区域会自动走到最近可走的点）
Area Mask：分层剔除，设置导航角色可以走哪些层

**属性和方法**

```c#
// 设置导航目标
public bool SetDestination(Vector3 target)
// 停止导航（过时）
public void Stop()
// 恢复导航（过时）
public void Resume()
// 计算到指定位置的导航路径，如果路径不存在，返回false，说明通过导航不能到达该位置
// 如果路径存在，path里会存储到指定位置的所有拐点信息，获取拐点：Vector3[] corners = path.corners
public bool CalculatePath(Vector3 targetPosition, NavMeshPath path)
// 完成分离路面导航，继续走剩下的路
public void CompleteOffMeshLink()
 
// 停止还是恢复
isStopped
// 期望导航速度
desiredVelocity
// 当前导航速度
velocity
// 停止距离，距离目标多远时停下来
stoppingDistance
// 导航剩余距离
remainingDistance
// 通过导航更新位置
updatePosition
// 通过导航更新旋转
updateRotation
// 分层剔除，设置导航角色可以走哪些层，int类型(32位)，-1表示全选，2^n表示只选第n层(n从0开始)
areaMask
// 角色当前是否正处于分离路面导航状态
isOnOffMeshLink
// 当前分离路面连接数据，包含startPos、endPos、activated、linkType等属性
currentOffMeshLinkData
//路径状态
pathStateus
```



#### 导航网格连接组件 OffMeshLink

用来处理地形中间有断层时，让角色从一个平面跳向另一个平面

在前面只要两个平面勾选了`Generate OffMeshLinks`并修改了`Drop Height`
和`Jump Distance`两个参数就可以实现平面间跳跃，但是如果我们只需要平面间{% label 有限条连接路径 red %}可跳跃就需要导航网格连接组件（可以{% label 运行时动态生成 red %}）

网格外连接组件（Off Mesh Link）使用：
创建两个空物体作为两个平面连接点，`Off Mesh Link`组件随便挂载到场景上的一个物体，将前面两个空物体设置成组件的`Start`和`End`。

参数：
CostOverride: 权重覆盖
BiDirectional:  开启双向（关闭后只能`Start`到`End`）
Activated: 是否启用连接点
AutoUpdatePosition:　是否随着`Start`到`End`更新位置而选择新的路径



#### 导航网格动态障碍物组件 NavMeshObstacle

地形中可以移动或动态销毁的障碍物需要挂载的组件

Carve: 是否开启雕刻功能  固定的开启 移动的不开启
Carve开启：
MoveThreshold：移动阈值（障碍物移动超过该距离，认为是移动状态，更新障碍网格）
Time To Stationary: 当静止时间超过该值认为真正静止了
CarveOnly Stationary: 只有在静止状态才会计算
