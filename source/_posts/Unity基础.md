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

设置父子关系，可以将游戏物体挂载到另一个游戏物体下，成为他的子对象

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

- **transform.InverseTransformPoint(Vector3.forward)**：世界坐标系的**点**，转换为相对本地transform坐标系的**点**（受到缩放影响）
- **transform.InverseTransformVector**：世界坐标系的**方向**，转换为相对本地坐标系的**方向** （受到缩放影响）
- **transform.InverseTransformDirection**：世界坐标系的**方向**，转换为相对本地坐标系的**方向** （不受缩放影响）

本地坐标系转世界坐标系：

- **transform.TransformPoint(Vector3.forward)**：本地坐标系的**点**，转换为相对世界坐标系的**点** （受到缩放影响）
- **transform.TransformDirection**：本地坐标系的**方向**，转换为相对世界坐标系的**方向**（受到缩放影响）
- **transform.TransformVector**：本地坐标系的**方向**，转换为相对世界坐标系的方向（不受缩放影响）

# Input鼠标键盘输入

鼠标输入检测：Input.GetMouseButtonDown(0)	[参数0左键 1右键 2中键]

检测键盘输入：Input.GetKeyDown(KeyCode.W)

# Screen

**静态属性：**

当前屏幕设备分辨率：

```C#
Resolution r = Screen.currentResolution;
print("当前屏幕分辨率的宽" + r.width + "高" + r.height);
```

屏幕窗口当前宽高：

```C#
print(Screen.width);
print(Screen.height);
```

屏幕休眠模式：

```C#
Screen.sleepTimeout = SleepTimeout.NeverSleep;	//永不息屏
Screen.sleepTimeout = SleepTimeout.SystemSetting;//系统设置
```

运行时是否全屏模式：

```C#
Screen.fullScreen = true;
```

窗口模式：

- 独占全屏：FullScreenMode.ExclusiveFullScreen

- 全屏窗口：FullScreenMode.FullScreenWindow

- 最大化窗口：FullScreenMode.MaximizedWindow

- 窗口模式：FullScreenMode.Windowed

```C#
Screen.fullScreenMode = FullScreenMode.ExclusiveFullScreen;
```

移动设备屏幕转向相关 (发布时有设置，这个了解即可)

```C#
//移动设备屏幕转向相关
//允许自动旋转为左横向 Home键在左
Screen.autorotateToLandscapeLeft = true;
//允许自动旋转为右横向 Home键在右
Screen.autorotateToLandscapeRight = true;
//允许自动旋转到纵向 Home键在下
Screen.autorotateToPortrait = true;
//允许自动旋转到纵向倒着看 Home键在上
Screen.autorotateToPortraitUpsideDown = true;

//指定屏幕显示方向
Screen.orientation = ScreenOrientation.Landscape;
```

**静态方法：**

```C#
Screen.SetResolution(1920,1080,false)	//设置分辨率 移动设备一般不使用
```

# Camera

**可编辑参数：**

Clear Flags：

- SkyBox：天空盒，主要用于3D游戏。
- SolidColor：颜色填充，一般用于2D游戏。
- **Depth only**：叠加渲染，只渲染当前Depth上的物体，配合Depth使用。
- Dont't clear：不移除上一帧的渲染，一般不使用。

Culling Mask：确定需要渲染的层级。

Projection（切换摄像机模拟透视的功能）：

- Perspective：透视模式，摄像机将以完整透视角度渲染对象。

- Orthographic：正交模式，摄像机将均匀渲染对象，没有透视感。

透视模式参数：

- FOV Axis：摄像机视口轴，与Field of view配合，一般不改。

- Field of view：视口大小

- Clipping Planes

  裁剪屏幕距离，在near-far区间内，才能被看到，如果不在这个区间，将被裁剪。
  Near：最近距离

  Far：最远距离

正交模式参数：

- Size：正交视口大小。


Depth：渲染顺序上的深度。
	数字越小越先被渲染，越大越后被渲染。

TargetTexture：渲染纹理，可以把摄像机画面渲染到RenderTexture上，主要用于制作小地图

Occlusion Culling：是否启用剔除遮挡，一般默认勾选。是否渲染看不到的物体（比如一个物体在另一个物体后面，看不到）

了解即可参数：

- Viewport Rect：视口范围，屏幕上将绘制该摄像机视图的位置。主要用于双摄像机游戏，0~1相当于宽高百分比。比如双人成行
- Rendering Path：渲染路径
- HDR：是否允许高动态范围渲染
- MSAA ：是否允许抗锯齿
- Dynamic Resolution ：是否允许动态分辨率呈现
- Target Display：用于哪个显示器，主要用来开发有多个屏幕的平台游戏。



**代码相关：**

静态成员：

- 如果有多个主摄像机，则获取第一个。一般来说，只有一个主摄像机（tag为MainCamera）。

  ```C#
  //主摄像机的获取
  print(Camera.main.name);
  ```

  获取摄像机的数量

  ```C#
  print(Camera.allCamerasCount);
  ```

  得到所有摄像机

  ```C#
  Camera[] allCamera = Camera.allCameras;
  print(allCamera.Length);
  ```

- 渲染相关委托：

  摄像机剔除前处理的委托函数

  ```C#
  //参数是一个Camera
  Camera.onPreCull += (c) =>
  {
  	...
  };
  ```

  摄像机渲染后处理的委托

  ```C#
  //参数是一个Camera
  Camera.onPoseCull _= (c)
  {
  
  };
  ```

  成员：

  - 界面上的参数 都可以在Camera中获取到

  - 世界坐标转**屏幕坐标**

    ```c#
    Vector3 v = Camera.main.WorldToScreenPoint(this.transform.position);
    //v.z是游戏物体离摄像机的距离
    ```

  - 屏幕坐标转世界坐标

    ```c#
    Vector3 v = Camera.main.ScreenToWorldPoint(Input.mousePosition);
    //因为摄像机的范围是一个锥形 当z轴==0时,他的横截面就只是一个点,所以v的结果就是摄像机的世界坐标
    
    //这样再转化前设置z轴,才能得到对应的横截面上的点的坐标
    Vector3 v = Input.mousePosition;
    v.z = 5;
    obj.position = Camera.main.ScreenToWorldPoint(v);
    ```

    

# 光源组件

参数面板:

![image-20240110205704940](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202401102057061.png)

![image-20240110205830621](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202401102058660.png)

Cookie:设置投影遮罩, 例如筒灯投射在地上的logo

Flare需要摄像机添加FlareLayer组件才能在Game窗口渲染出来



光照面板设置:

Window-> Rendering  ->  Lighting Settings

![image-20240110211754762](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202401102117818.png)

![image-20240110211829783](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202401102118843.png)



# 碰撞检测

### 刚体-RigidBody

碰撞产生的必要条件:

- 两个物体都要有碰撞器Collider（表示体积）
- 至少一个物体要有刚体（**受力的作用**） 

![image-20240110212407083](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202401102124127.png)

![image-20240110212833827](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202401102128864.png)

因为物体运动受帧率影响，所以如果一个物体运动太快了，可能造成碰撞效果不发生，以下参数可以解决：

![image-20240110213123996](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202401102131057.png)



### 碰撞器

![image-20240110214717171](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202401102147225.png)

![image-20240110214725003](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202401102147044.png)

异形物体各个子物体添加自己的碰撞器，只需要在父物体上添加一个刚体就可以参与碰撞了

网格碰撞器加上刚体必须勾选Convex



### 物理材质











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
