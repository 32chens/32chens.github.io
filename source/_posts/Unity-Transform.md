---
title: Unity-Transform
author: chenlf
tags:
  - Unity
  - Transform
categories:
  - Unity
katex: true
date: 2023-09-25 14:42:30
---

​	每个游戏对象有且仅有一个 Transform 组件，Transform 组件保存了游戏对象的位置信息，用户可以通过操作 Transform 组件实现对游戏对象的平移、旋转、缩放等变换。每个 Script 组件需要继承 MonoBehaviour，MonoBehaviour 中有 Transform 属性。

1）获取当前游戏对象的 Transform 组件

```c#
this.transform;
gameObject.tramsform;
GetComponent<Transform>();
gameObject.GetComponent<Transform>();
```

 2）获取其他游戏对象的 Transform 组件

```c#
GameObject.Find("name").transform
GameObject.FindGameObjectWithTag("tag").transform
transform.FindChild("name");
```

3）Transform 中属性

```c#
// 游戏对象
gameObject
// name 和 tag
name、tag
// 游戏对象的位置
position、localPosition
// 游戏对象的旋转角
eulerAngles、localEulerAngles、rotation、localRotation
// 游戏对象的缩放比
localScale
// 游戏对象的右方、上方、前方
right、up、forward
// 层级相关
root、parent、hierarchyCount、childCount
// 相机和灯光
camera、light
// 游戏对象的其他组件
animation、audio、collider、renderer、rigidbody
```

​	说明：rotation 属性是一个四元数（Quaternion）对象，unity编辑器里显示的是欧拉角，虽然欧拉角直观易理解（ (x,y,z) 以 x,y,z 为轴旋转对应的角度），但是会有可能发生万向节死锁，所以一般都是用四元数操作旋转的，可以通过如下方式将向量转换为 Quaternion：

​	注：

- 万向节死锁：绕某一个轴旋转可能会覆盖另一个轴的旋转，从而失去某一个维度的自由度（unity中创建一个游戏物体，rotation设置为（90，0，0），此时修改y和z的效果是一样的，都是绕着z轴旋转，y上的修改被覆盖了）
- 四元数：具体由一个标量（旋转角度）加一个向量（轴）组成，四元数主要是认为旋转是可以通过绕着某一个轴，旋转一定角度实现的，这里与欧拉角的区别就是不限制轴向量只能是unity的那三个轴方向。

```c#
//以（1，0，0）为向量轴，旋转60度的四元数  [cos(β/2), sin(β/2)(x,y,z)]
Quaternion q = new Quaternion(Mathf.Sin(30 * Mathf.Deg2Rad), 0, 0, Mathf.Cos(30 * Mathf.Deg2Rad))
Quaternion q2 = Quaternion.AngleAxis(60, new Vector3(1,0,0))
//向目标方向旋转
Vector3 relativePos = target.position - transform.position;
Quaternion quaternion = Quaternion.LookRotation(relativePos); 

//欧拉角转四元数
Quaternion q3 = Quaternion.Euler(60,0,0)
//四元数转欧拉角
Vector3 v = q3.eulerAngles    
```

 4）Transform 中方法

```c#
// 平移
Translate(Vector3 translation)
// 绕eulerAngles轴自转，自转角度等于eulerAngles的模长
Rotate(Vector3 eulerAngles)
// 绕过point点的axis方向的轴公转angle度
RotateAround(Vector3 point, Vector3 axis, float angle)
// 绕过point点的axis方向的轴公转angle度（坐标系采用本地坐标系）
RotateAroundLocal(Vector3 point, Vector3 axis, float angle)
// 看向transform组件的位置
LookAt(transform)
// 获取组件类型
GetType()
// 获取子游戏对象的Transform组件（不能获取孙子组件）
FindChild("name")
// 获取子游戏对象的Transform组件（可以获取孙子组件）
Find("name")
// 通过索引获取子游戏对象的Transform组件（不能获取孙子组件）
GetChild(index)
// 获取游戏对象的子对象个数
GetChildCount()
// 获取其他组件
GetComponent<T>
// 在子游戏对象中获取组件
GetComponentsInChildren<T>()
```



### 引用

https://blog.csdn.net/m0_37602827/article/details/125326051
