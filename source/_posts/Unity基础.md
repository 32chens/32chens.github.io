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

# 反射机制和游戏场景

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
  Camera.onPoseCull -= (c)
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

触发器：两个物体碰撞没有碰撞效果，只做碰撞处理



### 物理材质

一般商业项目不会使用，了解即可

在碰撞器中有物理材质这个成员，主要用来在碰撞时使用物理材质的内容做计算，达到不同的碰撞效果

![image-20240408203025654](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202404082030757.png)

物理材质的创建：

​	Project面板右键 `Physic Material` 或者`Physic Material 2D`

物理材质的参数：

![image-20240408203336444](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202404082033513.png)

主要是动静摩擦力和碰撞反弹时能量损耗，以及两个不同物理材质的碰撞体接触的计算方式



### 碰撞检测函数

注意：碰撞和触发响应函数属于特殊的生命周期函数，也是通过反射调用的，他们是发生在`FixedUpdate`物理帧更新之后、`Update`逻辑帧更新之前的。且执行频率跟`FixedUpdate`相同

**碰撞响应函数：**

```c#
//碰撞开始
void OnCollisionEnter(Collision collisiono){
   //... 
}
//碰撞结束
void OnCollisionExit(Collision collisiono){
   //...
}
//碰撞接触中
void OnCollisionStay(Collision collisiono){
   //...  
}
```

其中`OnCollisionEnter`、`OnCollisionExit`分别在碰撞开始和结束时只执行一次，`OnCollisionStay`在碰撞接触时执行，但不是两个物体一直接触就一直执行，物体碰撞接触后静止下来就不再执行了。例如立方体掉落到平面可能执行二十几次后就不再执行。

这三个函数的参数`Collision`主要记录了碰撞发生的一些信息：(可以得到他的所有信息，GetComponent方法)

- collision.collider:	碰撞的对象的碰撞器信息
- collision.gameObject:    碰撞的对象依附的游戏对象（GameObject）
- collision.transform:    碰撞的对象的位置信息
- 接触点相关：collision.contactCount、collision.contacts

**触发器响应函数：**

```c#
void OnTriggerEnter(Collider other){}
void OnTriggerExit(Collider other){}
void OnTriggerStay(Collider other){}
```

跟碰撞响应函数类似，只是方法参数变成了`Collider`碰撞器组件，且`OnTriggerStay`在两个物体空间上接触时调用

Collider组件可以得到游戏对象的所有信息：`other.gameObject.GetComponent<T>()`

>如果一个异形物体，刚体在父物体上，如果在子物体上的脚本写碰撞检测响应函数是不行的， 必须在挂载了刚体的父物体上才可以



### 刚体加力

**添加力（参数方向向量）：**

- 相对世界坐标：rigidBody.AddForce(Vector3.forward * 10)
- 相对本地坐标：rigidBody.AddRelativeForce(Vector3.forward * 10)

**添加扭矩力（参数旋转轴）：**

- 相对世界坐标：rigidBody.AddTorque(Vector3.up* 10)
- 相对本地坐标：rigidBody.AddRelativeTorque(Vector3.up * 10)

**直接改变移动速度：**

rigidBody.velocity = Vector3.forward * 10
一般不使用这种方式

**模拟爆炸效果：**

rigidBody.AddExplosionForce(100, Vector.zero, 5)
相对世界坐标，参数分别代表力的大小、爆炸中心点，爆炸半径



**力的模式：**

以上添加力的方法还有第二个参数的重载版本rigidBody.AddForce(Vector3.forward * 10， ForceMode.Acceleration)

主要是计算方式的不同，最终速度不同

动量定理：Ft = mv 即 v = Ft/m	(F:力、t:时间、m:质量、v:速度)

- Acceleration: 忽略质量
- Force:啥也不忽略
- Impulse: 忽略时间
- VelocityChange：忽略时间和质量

以上忽略都是代入默认值1进行计算，一般Force比较符合现实物理情况



**力场脚本：**
Constant Force组件：设置一个持续的力。
了解即可



**刚体失眠：**

Unity为了节约性能，有时会让刚体失眠，造成一些奇怪的情况，例如：平面上的立方体放置一段时间后，旋转平面，立方体浮空
解决方法：

```c#
if(rigidBody.IsSleeping()){
    rigidBody.WakeUp()
}
```



# 音频系统



### 音频文件导入

**unity支持的音频文件格式:**

​	wav、mp3、ogg、aiff

**音频文件参数：**

​	![image-20240410211746183](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202404102117305.png)

![image-20240410212338336](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202404102123383.png)



### 音频源和音频组件

​	**AudioSource:**

![image-20240410214853237](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202404102148278.png)

![image-20240410214900602](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202404102149662.png)![image-20240410214904561](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202404102149616.png)

混音器属于高级功能，一般音乐游戏会使用
2D音效声音一直一样大，3D音效符合现实近大远小

​	**Audio Listener：**
收声组件，场景中要有这个组件才能听到声音，一般摄像机上有这个组件



### 代码控制音频源

播放停止暂停：

```c#
audioSource.Play();
audioSource.PlayDelay(5);//延迟播放
audioSource.Stop();
audioSource.Pause();
audioSource.UnPause();//停止暂停，效果跟Play一样继续播放
```

检测音效是否播放完毕：

```c#
audioSource.isPlaying//属性
```

动态控制音效播放：
	设置`AudioSource`的**clip**（`AudioClip`）



### 麦克风输入

获取麦克风信息：

```c#
string[] names = Microphone.deivices;//获取麦克风设备名
```

开始录制：

```c#
//参数一：设备名 null使用默认设备
//参数二：超过录制长度 是否重新录制
//参数三：录制长度限制 单位秒
//参数四：采样率
AudioClip clip = Microphone.Start(null, false, 10, 44100);
```

结束录制：

```c#
//参数：设备名 null默认设备
Microphone.End(null);
```

音频数据存储或传输：

```c#
//声明float数组 长度规则：声道数 * 剪辑长度
float[] f = new float[clip.channels * clip.simples];
//音频数据存储到float数组 网络传输中可以将float数组转成byte数组传输
clip.GetData(f, 0);	
```



# 3D数学

### 坐标转换

**世界坐标系**

 原点：世界的中心点

 轴向：世界坐标系的三个轴向是固定的

**物体坐标系**

 原点：物体的中心点（建模时决定）

 轴向：
 物体右方为 x 轴正方向
 物体上方为 y 轴正方向
 物体前方为 z 轴正方向

**屏幕坐标系**

 原点：屏幕左下角

 轴向：
 向右为 x 轴正方向
 向上为 y 轴正方向

**视口坐标系**

 原点：屏幕左下角

 轴向：
 向右为 x 轴正方向
 向上为 y 轴正方向

 特点：
 左下角为（0, 0）
 右上角为（1, 1）
 和屏幕坐标类似，将坐标单位化

**坐标转换：**

```c#
// 世界转本地
this.transform.InverseTransformDirection
this.transform.InverseTransformPoint
this.transform.InverseTransformVector
// 本地转世界
this.transform.TransformDirection
this.transform.TransformPoint  
this.transform.TransformVector

// 世界转屏幕
Camera.main.WorldToScreenPoint
// 屏幕转世界
Camera.main.ScreenToWorldPoint

// 世界转视口
Camera.main.WorldToViewportPoint
// 视口转世界
Camera.main.ViewportToWorldPoint

// 视口转屏幕
Camera.main.ViewportToScreenPoint
// 屏幕转视口
Camera.main.ScreenToViewportPoint;
```



### 插值运算

```c#
// 第一种  先快后慢的形式
pos.x = Mathf.Lerp(pos.x, target.transform.position.x, Time.deltaTime * moveSpeed);
// 第二种  匀速运动
startPos = transform.position;
targetPos = target.transform.position;
time += Time.deltaTime;
pos.x =  Mathf.Lerp(startPos.x, targetPos.x, time)
```

### 点乘

https://blog.csdn.net/qq_40780420/article/details/107776300

### 叉乘

```c#
// 假设向量 A和B 都在 XZ平面上
// 向量A 叉乘 向量 B
// y大于0 证明 B在A右侧
// y小于0 证明 B在A左侧

Vector3 C = Vector3.Cross(B.position, A.position);
if (C.y > 0) print("A在B的右侧");
else         print("A在B的左侧");
```



### Vector3插值运算

1. 线性插值

```c#
public Transform target;    // 目标物体位置
public Transform A;         // 先快后慢移动到 Target
public Transform B;         // 匀速运动到 Target

private Vector3 nowTarget;  // 当前 B 的位置

private Vector3 startPos;   // 每次运行时 B 的起始位置
private float   time;

// Start is called before the first frame update
private void Start() {
    startPos = B.position;
}

// Update is called once per frame
private void Update() {
    // result = start + (end - start) * t

    // 1.先快后慢 每帧改变start位置 位置无限接近 但不会得到end位置
    A.position = Vector3.Lerp(A.position, target.position, Time.deltaTime);

    // 2.匀速 每帧改变时间  当t>=1时 得到结果
    // 这种匀速移动 当time>=1时  我改变了 目标位置后  它会直接瞬移到我们的目标位置
    if (nowTarget != target.position) {
        nowTarget = target.position;
        time      = 0;
        startPos  = B.position;
    }
    time       += Time.deltaTime;
    B.position =  Vector3.Lerp(startPos, nowTarget, time);
}
```

2. 球形插值

![img](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202404112207366.png)

```c#
position = Vector3.Slerp(Vector3.right * 10, Vector3.left * 10 + Vector3.up * 0.1f, time * 0.01f);
```



# 四元数

虽然欧拉角简单易理解，但是他的旋转表示不唯一，而且有万向节死锁问题，所以在计算机中一般使用四元数来表示三维空间旋转信息

> 万向节死锁：欧拉角是基于x,y,z轴旋转的，x,y,z旋转轴有顺序层级，假设y>x>z,即给定的欧拉角先绕y轴、再按x轴、最后绕z轴旋转得到最终的旋转。但是绕y轴旋转可以影响其他两个也随之旋转，而绕z轴只作用于箭头，当y轴向和x轴向转到同一个平面就会造成万向节死锁，即绕y轴和绕z轴的旋转是一样的了
> ![image-20240411204448116](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202404112044225.png)

**四元数组成：**
	因为欧拉角给定三个轴，且需要按顺序层级旋转最终造成万向节死锁，而四元数之所以没有万向节死锁，就是因为他是基于一个我们自定义的旋转轴（**相对自身坐标系**）只旋转一次我们定义的角度。所以四元数有一个标量（角度）和一个向量（旋转轴）组成

​	在数学上四元数是一个简单的超辅舒，由一个实数和三个虚数组成，他的原理包含大量数学知识，因此只介绍基本构成和公式

> 假设绕n轴（x,y,z），旋转β度:
> 	Q = [ cos(β/2)， sin(β/2)n]		即 Q = [ cos(β/2)， sin(β/2)x, sin(β/2)y, sin(β/2)z]

**Unity中的四元数初始化方法：**

```c#
Quaternion q = new Quaternion(sin(β/2)x, sin(β/2)y, sin(β/2)z, cos(β/2));	//一般不用，谁没事找事用这个
Quaternion q = Quaternion.AngleAxis(β,Vector3.right);
```



**四元数和欧拉角转换：**

```c#
q.eulerAngles;//转欧拉角
Quaternion.Euler(x,y,z);//转四元数
```

注：四元数相乘代表旋转四元数

**单位四元数：**

表示没有旋转，[1,(0,0,0)]和[-1,(0,0,0)]都是单位四元数，一般用来初始化对象

```c#
Instantiate(obj, Vector3.zero, Quaternion.identity);
```

**插值运算：**

四元数提供如同Vector3的插值运算Lerp、Slerp,但是Vector3的Slerp表示球形插值，而四元数的Slerp和Lerp差不多，只是Lerp的速度更快但是如果旋转范围较大效果较差，所以建议使用Slerp进行运算。同样的也是用匀速和先快后慢两种用法

**LookRotation:**

给定目标在本地坐标系的方向向量，返回一个可以转向该目标方向的旋转量

```c#
transform.position = Quaternion.LookRotation(target.position - transform.position);
```



**四元数计算：**

- 四元数相乘：两个四元数相乘得到一个新的四元数，代表两个旋转量的叠加相当于旋转
- 四元数乘向量：返回一个旧向量旋转对应四元数旋转量的一个新的向量

```C#
//四元数相乘, 绕Y轴旋转45度
transform.rotation = transform.rotation * Quaternion.AngleAxis(45,Vector3.up);
//四元数乘向量, 有顺序，必须是四元数在前否则报错
Vector3 v = Vector3.forward;
v = Quaternion.AngleAxis(90,Vector3.up) * v;
print(v); //(1,0,0)

v = v * Quaternion.AngleAxis(90,Vector3.up);//报错
```




# MonoBehavior重要内容

### 延迟函数

```c#
// 1.延迟函数
// Invoke
// 参数一：函数名 字符串
// 参数二：延迟时间 秒为单位
Invoke(nameof(DelayDoSomething), 1);

private void DelayDoSomething() {
    print("延时执行的函数");
}

// 2.延迟重复执行函数
// InvokeRepeating
// 参数一：函数名字符串
// 参数二：第一次执行的延迟时间
// 参数三：之后每次执行的间隔时间
InvokeRepeating(nameof(DelayRe), 5, 1);

private void DelayRe() {
    print("重复执行");
}

// 3.取消延迟函数
// 3-1取消该脚本上的所有延时函数执行
CancelInvoke();

// 3-2指定函数名取消
// 只要取消了指定延迟 不管之前该函数开启了多少次 延迟执行 都会统一取消
CancelInvoke(nameof(DelayDoSomething));

// 4.判断是否有延迟函数
if (IsInvoking()) print("存在延迟函数");
if (IsInvoking(nameof(DelayDoSomething))) print("存在延迟函数DelayDoSomething");
```

 注意：

1. [延时函数](https://so.csdn.net/so/search?q=延时函数&spm=1001.2101.3001.7020)第一个参数传入的是函数名字符串

2. 延时函数没办法传入参数，只有包裹一层

   例如，调用 TestFun 时，将参数传在 DelayDoSomething 中

   调用其他对象 t 的方法时，也需要包裹一层

3. 函数名必须是该脚本上申明的函数

   ```c#
   private void DelayDoSomething() {
       TestFun(2);
       
       t.TestFun();
   }
   
   private void TestFun(int i) {
       print("传入参数" + i);
   }
   
   private void TestFun() {
       print("无参重载");
   }
   
   ```

   

### 协同程序

 Unity 支持多线程，但是新开线程无法访问 Unity 相关对象的内容

 注意：Unity 中的多线程，要记住关闭

协同程序简称[协程](https://so.csdn.net/so/search?q=协程&spm=1001.2101.3001.7020)，它是“假”的多线程，它不是多线程

 它的主要作用是将代码分时执行，不卡主线程

 简单理解，是把可能会让主线程卡顿的耗时的逻辑分时分步执行, 而不是一直在此等待

 主要使用场景：

- 异步加载文件
- 异步下载文件
- 场景异步加载
- 批量创建时防止卡顿

 区别：

- 新开一个线程是独立的一个管道，和主线程并行执行
- 新开一个协程是在原线程之上开启，进行逻辑分时分步执行

协程的使用：

```c#
// 继承MonoBehavior的类 都可以开启 协程函数
// 第一步：申明协程函数
//   协程函数2个关键点
//   1-1返回值为IEnumerator类型及其子类
//   1-2函数中通过 yield return 返回值; 进行返回

// 第二步：开启协程函数
// 协程函数 是不能够 直接这样去执行的！！！！！！！
// 这样执行没有任何效果
// MyCoroutine(1, "123");

// 常用开启方式
// IEnumerator ie = MyCoroutine(1, "123");
// StartCoroutine(ie);
Coroutine c1 = StartCoroutine(MyCoroutine(1, "123"));
Coroutine c2 = StartCoroutine(MyCoroutine(1, "123"));
Coroutine c3 = StartCoroutine(MyCoroutine(1, "123"));

// 第三步：关闭协程
// 关闭所有协程
StopAllCoroutines();

// 关闭指定协程
StopCoroutine(c1);

// 关键点一： 协同程序（协程）函数 返回值 必须是 IEnumerator或者继承它的类型 
private IEnumerator MyCoroutine(int i, string str) {
    print(i);
    // 关键点二： 协程函数当中 必须使用 yield return 进行返回
    yield return null;
    print(str);
    yield return new WaitForSeconds(1f);
    print("2");
    yield return new WaitForFixedUpdate();
    print("3");
    // 主要会用来 截图时 会使用
    yield return new WaitForEndOfFrame();

    while (true) {
        print("5");
        yield return new WaitForSeconds(5f);
    }
}
```

**yield return 不同内容的含义:**

```c#
// 1.下一帧执行
yield return 数字;
yield return null;
// 在Update和LateUpdate之间执行

// 2.等待指定秒后执行
yield return new WaitForSeconds(秒);
// 在Update和LateUpdate之间执行

// 3.等待下一个固定物理帧更新时执行
yield return new WaitForFixedUpdate();
// 在FixedUpdate和碰撞检测相关函数之后执行

// 4.等待摄像机和GUI渲染完成后执行
yield return new WaitForEndOfFrame();
// 在LateUpdate之后的渲染相关处理完毕后之后

// 5.一些特殊类型的对象 比如异步加载相关函数返回的对象
// 之后讲解 异步加载资源 异步加载场景 网络加载时再讲解
// 一般在Update和LateUpdate之间执行

// 6.跳出协程
yield break;
```

**协程受对象和组件失活销毁的影响**

协程开启后
 组件和物体销毁，协程不执行
 物体失活协程不执行，组件失活协程执行




# Resources资源动态加载

### 特殊文件夹

**（一）工程路径获取**

```c#
print(Application.dataPath);
```

注意：该方式获取到的路径 一般情况下只在编辑模式下使用，我们不会在实际发布游戏后还使用该路径，游戏发布过后 该路径就不存在了 

**（二）Resources 资源文件夹**

```c#
print(Application.dataPath + "/Resources");
```

注意：需要我们自己创建， 一般不获取，只能使用Resources相关API进行加载，如果硬要获取可以用工程路径拼接

作用：资源文件夹

1. 需要通过 Resources 相关 API 动态加载的资源需要放在其中
2. 该文件夹下所有文件都会被打包出去
3. 打包时 Unity 会对其压缩加密
4. 该文件夹打包后只读, 只能通过 Resources 相关 API 加载

**（三）StreamingAssets 流动资源文件夹**

```c#
print(Application.streamingAssetsPath);
```

注意：需要我们自己将创建
​作用：流文件夹

1. 打包出去不会被压缩加密，可以任由我们摆布
2. **移动平台只读，PC 平台可读可写**
3. 可以放入一些需要自定义动态加载的初始资源

**（四）PersistentDataPath 持久数据文件夹**

```c#
print(Application.persistentDataPath);
```

注意：不需要我们自己将创建
​作用：固定数据文件夹

1. 所有平台都可读可写
2. 一般用于放置动态下载或者动态创建的文件，游戏中创建或者获取的文件都放在其中

**（五）Plugins 插件文件夹**

 路径获取：一般不获取

 注意：需要我们自己将创建
​ 作用：插件文件夹
​ 不同平台的插件相关文件放在其中，比如 IOS 和 Android 平台

**（六）Editor 编辑器文件夹**

```c#
// 路径获取：
// 一般不获取
// 如果硬要获取 可以用工程路径拼接
print(Application.dataPath + "/Editor");
```

注意：需要我们自己将创建
​作用：编辑器文件夹

1. 开发 Unity 编辑器时，编辑器相关脚本放在该文件夹中
2. 该文件夹中内容不会被打包出去

**（七）默认资源文件夹 Standard Assets**

 路径获取：一般不获取

 注意：需要我们自己将创建
​ 作用：默认资源文件夹
​ 一般 Unity 自带资源都放在这个文件夹下，代码和资源优先被编译



### Resources资源同步加载

Resources 资源动态加载的作用：

- 通过代码动态加载 Resources 文件夹下指定路径资源
- 避免繁琐的拖曳操作

**（一）常用资源类型**

1. 预设体对象——GameObject
2. 音效文件——AudioClip
3. 文本文件——TextAsset
4. 图片文件——Texture
5. 其它类型——需要什么用什么类型

注意：预设体对象加载需要实例化，其它资源加载一般直接用

**（二）资源同步加载——普通方法**

 在一个工程当中 Resources 文件夹可以有多个，通过 API 加载时，它会自己去这些同名的 Resources 文件夹中去找资源，
 打包时 这些Resources 文件夹 里的内容 都会打包在一起

1. 加载预设体

   ```c#
   // 1.预设体对象 想要创建在场景上 记住实例化
   // 第一步：要去加载预设体的资源文件(本质上 就是加载 配置数据 在内存中)
   Object obj = Resources.Load("Cube");
   // 第二步：如果想要在场景上 创建预设体 一定是加载配置文件过后 然后实例化
   Instantiate(obj);
   ```

2. 加载音效资源

   ```c#
   public AudioSource audioS;
   
   // 2.音效资源
   // 第一步：就是加载数据
   Object obj3 = Resources.Load("Music/BKMusic");
   // 第二步：使用数据 我们不需要实例化 音效切片 我们只需要把数据 赋值到正确的脚本上即可
   audioS.clip = obj3 as AudioClip;
   audioS.Play();
   ```

3. 加载文本资源

   ```c#
   // 3.文本资源
   // 文本资源支持的格式
   // .txt
   // .xml
   // .bytes
   // .json
   // .html
   // .csv
   // .....
   TextAsset ta = Resources.Load("Txt/Test") as TextAsset;
   
   // 文本内容
   print(ta.text);
   
   // 字节数据组
   print(ta.bytes);
   ```

4. 加载图片

   ```c#
   Texture tex = Resources.Load("Tex/TestJPG") as Texture;
   ```

**（三）资源同名的解决方法**

 Resources.Load 加载同名资源时:

```c#
private Texture tex;

// 6-1加载指定类型的资源
tex = Resources.Load("Tex/TestJPG", typeof(Texture)) as Texture;

ta = Resources.Load("Tex/TestJPG", typeof(TextAsset)) as TextAsset;
print(ta.text);

// 6-2加载指定名字的所有资源
Object[] objs = Resources.LoadAll("Tex/TestJPG");
foreach (Object item in objs) {
    if (item is Texture) { ... }
    else if (item is TextAsset) { ... }
}

```

**（四）资源同步加载——泛型方法**

```c#
TextAsset ta2 = Resources.Load<TextAsset>("Tex/TestJPG");
print(ta2.text);

tex = Resources.Load<Texture>("Tex/TestJPG");
```



### Resources资源异步加载

异步加载可以帮助我们加载过大的资源不会造成程序卡顿，但是异步加载不能马上得到加载的资源，至少要等一帧

**（一）事件监听实现异步加载**

```c#
// 1.通过异步加载中的完成事件监听 使用加载的资源
ResourceRequest rq = Resources.LoadAsync<Texture>("Tex/TestJPG");
// 马上进行一个 资源下载结束 的一个事件函数监听
rq.completed += LoadOver;

private void LoadOver(AsyncOperation rq) {
    print("加载结束");
    // asset 是资源对象 加载完毕过后 就能够得到它
    tex = (rq as ResourceRequest)?.asset as Texture;
}
```

注意：加载完成的回调函数参数是`AsyncOperation`类型

**（二）协程实现异步加载**

```c#
// 2.通过协程 使用加载的资源
StartCoroutine(Load());

private IEnumerator Load() {
    // 迭代器函数 当遇到yield return时  就会 停止执行之后的代码
    // 然后 协程协调器 通过得到 返回的值 去判断 下一次执行后面的步骤 将会是何时
    ResourceRequest rq = Resources.LoadAsync<Texture>("Tex/TestJPG");
    
    // Unity 会自己判断,加载完毕过后,才会继续执行后面的代码
    yield return rq;
    

    // 判断资源是否加载结束
    while (!rq.isDone) {
        // 打印当前的 加载进度 
        // 该进度 不会特别准确 过渡也不是特别明显
        print(rq.progress);
        yield return null;//每帧判断一次是否加载完毕
    }
    tex = rq.asset as Texture;
}
```



### Resources资源卸载

**（一）重复加载同一资源**

Resources 加载一次资源过后，该资源就一直存放在内存中作为缓存，第二次加载时发现缓存中存在该资源，会直接取出来进行使用
所以多次重复加载不会浪费内存，但是会浪费性能（每次加载都会去查找取出，始终伴随一些性能消耗）

**（二）手动释放缓存中的资源**

1. 卸载指定资源

   ```c#
   GameObject obj = Resources.Load<GameObject>("Cube");
   Texture te = Resources.Load<Texture>("Tex/TestJPG");
   // 即使是没有实例化的 GameObject对象也不能进行卸载
   //Resources.UnloadAsset(obj);
   Resources.UnloadAsset(te);
   ```

   注意：
   该方法不能释放 GameObject对象，因为它会用于实例化对象，**只能用于一些不需要实例化的内容**， 比如 图片 和 音效 文本等等，一般情况下， 我们很少单独使用它。

2. 卸载未使用的资源

   ```c#
   Resources.UnloadUnusedAssets();
   GC.Collect();
   ```

   注意：一般在过场景时和GC一起使用

# 场景异步加载事件回调

同步加载场景

```c#
SceneManager.LoadScene("Name");
```

**异步场景切换**

```c#
SceneManager.LoadSceneAsync("scene1")
```

 场景异步加载和资源异步加载几乎一致，有两种方式：

1. 事件回调
	```c#
    // 1.通过事件回调函数 异步加载
    AsyncOperation ao = SceneManager.LoadSceneAsync("Name");
    // 当场景异步加载结束后 就会自动调用该事件函数 我们如果希望在加载结束后 做一些事情 那么久可以在该函数中
    // 写处理逻辑
    ao.completed += (a) => print("加载结束");
	
    ao.completed += LoadOver;
	
    private void LoadOver(AsyncOperation ao) {
        print("LoadOver");
    }
	```

2. 协程

   ```c#
   // 2.通过协程异步加载
   // 需要注意的是 加载场景会把当前场景上 没有特别处理的对象 都删除了
   // 所以 协程中的部分逻辑 可能是执行不了的 
   // 解决思路
   // 让处理场景加载的脚本依附的对象 过场景时 不被移除
   
   // 该脚本依附的对象 过场景时 不会被 移除
   DontDestroyOnLoad(gameObject);
   
   StartCoroutine(LoadScene("Name"));
   
   private IEnumerator LoadScene(string name) {
       // 第一步
       // 异步加载场景
       AsyncOperation ao = SceneManager.LoadSceneAsync(name);
       // Unity内部的 协程协调器 发现是异步加载类型的返回对象 那么就会等待
       // 等待异步加载结束后 才会继续执行 迭代器函数中后面的步骤
       print("异步加载过程中 打印的信息");
       // 协程的好处 是异步加载场景时 我可以在加载的同时 做一些别的逻辑
       // yield return ao;
       // 第二步
       print("异步加载结束后 打印的信息");
   
       // 比如 我们可以在异步加载过程中 去更新进度条
       // 第一种 就是利用 场景异步加载 的进度 去更新 但是 不是特别准确 一般也不会直接用
       // while(!ao.isDone)
       // {
       //     print(ao.progress);
       //     yield return null;
       // }
   
       // 离开循环后 就会认为场景加载结束
       // 可以把进度条顶满 然后 隐藏进度条
   
       // 第二种 就是根据你游戏的规则 自己定义 进度条变化的条件
       yield return ao;
       // 场景加载结束 更新20%进度
       // 接着去加载场景中 的其它信息
       // 比如
       // 动态加载怪物
       // 这时 进度条 再更新20%
       // 动态加载 场景模型
       // 这时 就认为 加载结束了 进度条顶满 
       // 隐藏进度条
   }
   ```

   

切换场景会默认销毁当前场景中的所有游戏对象，如果使用协程那么yield后的代码可能就因为游戏物体被销毁了而无法执行，可以调用 MonoBehaviour 的 DontDestroyOnLoad 方法，如下：

```cs
DontDestroyOnLoad(this.gameObject);
```



# LineRenderer组件





# 范围检测



# 射线检测

