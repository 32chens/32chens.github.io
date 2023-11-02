---
title: Unity-UGUI
author: chenlf
tags:
  - Unity
  - UGUI
categories:
  - Unity
katex: true
date: 2023-11-02 21:05:42
---



# UGUI基础

## 六大基础组件

六大基础组件在Canvas对象和Event System对象上

Canvas对象：

- Canvas：画布组件，主要用于渲染UI空间
- Canvas Scaler：画布自适应分辨率组件，主要用于分辨率自适应
- Graphic Raycaster：射线事件交互组件，用于控制射线响应相关
- RectTransform：UI对象位置锚点控制组件，主要用于控制位置和对齐方式

Event System对象（监听玩家操作）：

- EventSystem：玩家输入事件响应系统
- Standalone Input Module：玩家独立输入模块组件



### Canvas组件

#### Canvas组件用来干啥 

它是UGUI中所有UI元素能够被显示的根本 它主要负责渲染自己的所有UI子对象

如果UI控件对象不是Canvas的子对象，那么控件将不能被渲染我们可以通过修改Canvas组件上的参数修改渲染方式

#### 场景中可以有多个Canvas对象

场景中允许有多个Canvas对象 可以分别管理不同画布的渲染方式，分辨率适应方式等等参数，一般情况场景上一个Canvas即可

#### Canvas组件的3种渲染方式（笔试遇到过）

- Screen Space - Overlay：屏幕空间，覆盖模式，UI始终在前
- Screen Space - Camera：屏幕空间，摄像机模式，3D物体可以显示在UI之前
- World Space：世界空间，3D模式

##### Screen Space - Overlay

覆盖模式，UI始终显示在场景内容前方

- Pixel Perfect：是否开启无锯齿精确渲染（性能换效果）
- SortOrder：排序层编号（用于控制多个Canvas时的渲染先后顺序）
- TargetDisplay：目标设备（在哪个显示设备上显示）
- Additional Shader Channels：其他着色器通道，决定着色器可以读取哪些数据

##### Screen Space - Camera

摄像机模式，3D物体可以显示在UI之前（手游基本上这种模式，例如选角界面，人物模型在UI前面）

- RenderCamera：用于渲染UI的摄像机（如果不设置将类似于覆盖模式）
- Plane Distance：UI平面在摄像机前方的距离，类似整体Z轴的感觉
- Sorting Layer：所在排序层 
- Order in Layer：当前排序层的排序号

多个Canvas对象的渲染顺序：先按排序层`Sorting Layer`顺序，同一排序层按`Order in Layer`排序

{% hideToggle 实践  %}

{% tabs %}

<!-- tab UI相机和场景相机 -->

第一步：新建一个摄像机，设置该相机Depth only且只渲染UI层，并让Depth比主摄像机高

![image-20231102215353813](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202311022154916.png)

第二步：主摄像机不渲染UI层

![image-20231102215514267](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202311022155301.png)

第三步：选中Canvas，把渲染模式改为第二种，把第一步的UI摄像机拖给Canvas

![image-20231102215458435](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202311022154476.png)

<!-- endtab -->

<!-- tab 游戏物体显示在UI前面 -->

前面设置了UI相机和场景相机一起工作，但是还是UI始终在前面，要想游戏物体显示在UI前面，只需要将游戏物体放在Canvas对象下，这样游戏物体就被视为一个UI对象，再调整下他的缩放和z轴即可

![image-20231102220645479](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202311022206520.png)

![image-20231102220610633](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202311022206692.png)

<!-- endtab -->

{% endtabs %}

{% endhideToggle %}

##### World Space

3D模式，可以把UI对象像3D物体一样处理，常用于VR或者AR（例如让一个UI对象绕着一个游戏物体周身旋转）

- Event Camera： 用于处理UI事件的摄像机（如果不设置，不能正常注册UI事件）



### Canvas Scaler组件



