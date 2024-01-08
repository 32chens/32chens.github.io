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

# 放射机制和游戏场景

GameObject类是Unity提供的作为场景中所有对象的根本，不管是图片、模型、音效、摄像机等等都是依附于GameObject对象的

利用反射，我们可以获取脚本上的变量，显示在Inspector面板上并修改，而像Transform、BoxCollider等挂载的组件本质上也是脚本，所以在Inspector面板上可以修改他们的一些属性值

游戏场景Scene的本质就是配置文件`.unity`，记录了场景上有哪些游戏物体及其相关信息。引擎本质也是读取它通过反射创建各个对象关联各个脚本对象

# Inspector面板显示

- 公共变量可以显示，用`[HideInInspector]`修饰可隐藏
- 私有变量不可显示，用`[SerializeField]`修饰可显示
- 大部分类型可以显示，要让自定义类型可显示，需要`[System.Serializable]`修饰（**字典怎样都不行**）
- `[Header("")]` 分组说明、[Space()] 间隔、[Range(0, 10)] 限制拖动范围

[SerializeField]、[HideInInspector]可以实现显示隐藏变量的效果，主要是Unity利用反射可以获取到变量上修饰的特性，根据特性再做是否显示隐藏的操作



# GameObject

**变量**：name、activeSelf(是否激活)、isStatic(是否静态)、layer(层级)

**静态方法**：`Find(“”)`、`Instantiate(obj)`、`Destroy(obj)` [**可以删除对象以及脚本、不会马上移除对象、会在下一帧移除**]、`DestroyImmediate(obj)` [立即删除]、`DontDestroyOnLoad(obj)` [过场景不移除]

**成员方法**：AddComponent、SetActive

# Time

时间缩放比例： `Time.timeScale = 0`

帧间隔时间： `Time.deltaTime`、`Time.unscaleDeltaTime`(不受scale影响)

游戏到现在的时间：`Time.time`、`Time.unscaleTime`(单机、网络游戏以服务器时间为主)

物理帧间隔时间：`Time.fixedDeltaTime`、`Time.fixedUnscaledDeltaTime`(引擎可设置)

游戏跑了多少帧：`Time.frameCount`



# 角度和旋转

相对世界角度：this.transform.eulerAngles
相对父对象角度：this.transform.localEulerAngles

自转：this.transform.Rotate(new Vector3(0, 10 * Time.deltaTime, 0),  Space.World) [第二个参数设置相对的坐标系 自己还是世界]
this.transform.Rotate(Vector3.up, 10* Time.deltaTime,  Space.World)

相对某个点旋转：this.transform.RotateAround(Vector3 point, Vector3 axis, float angle)

看向：`this.transform.LookAt(Vector3.zero);` 	`this.transform.LookAt(transform);`



# 父子关系

设置父对象，断绝父子关系

```C#
this.transform.parent = null;
```

设置父对象 `认爸爸`

```C#
this.transform.parent = GameObject.Find("Father2").transform;
```

通过API来进行父子关系的设置

```C#
this.transform.SetParent(null);//断绝父子关系
this.transform.SetParent(GameObject.Find("Father2").transform);//认爸爸
```

获取所有子对象：

```C#
this.transform.GetChild(0);

for (int i = 0; i < this.transform.childCount; i++)
{
    print("儿子的名字：" + this.transform.GetChild(i).name);
}
```

子对象操作：

```C#
if(son.IsChildOf(this.transform))
{
    print("是我的儿子");
}
print(son.GetSiblingIndex());
son.SetAsFirstSibling();
son.SetAsLastSibling();
son.SetSiblingIndex(1);
```



# 坐标转换

世界坐标系转本地坐标系：

- **transform.InverseTransformPoint**：世界坐标系的**点**，转换为相对本地坐标系的**点**（受到缩放影响）
- **transform.InverseTransformVector**：世界坐标系的**方向**，转换为相对本地坐标系的**方向** （受到缩放影响）
- **transform.InverseTransformDirection**：世界坐标系的**方向**，转换为相对本地坐标系的**方向** （不受缩放影响）

本地坐标系转世界坐标系：

- **transform.TransformPoint**：本地坐标系的**点**，转换为相对世界坐标系的**点** （受到缩放影响）
- **transform.TransformDirection**：本地坐标系的**方向**，转换为相对世界坐标系的**方向**（受到缩放影响）
- **transform.TransformVector**：本地坐标系的**方向**，转换为相对世界坐标系的方向（不受缩放影响）

# Input鼠标键盘输入

鼠标输入检测：Input.GetMouseButtonDown(0)	[参数0左键 1右键 2中键]

检测键盘输入：Input.GetKeyDown(KeyCode.W)



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
