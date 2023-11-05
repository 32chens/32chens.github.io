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

CanvasScaler意思是画布缩放控制器，它是用于分辨率自适应的组件

它主要负责在不同分辨率下UI控件大小自适应 它并不负责位置，位置由之后的RectTransform组件负责

它主要提供了三种用于分辨率自适应的模式

![image-20231103110029142](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202311031100195.png)



#### CanvasScaler学前准备

屏幕分辨率： Game窗口中的Stats统计数据窗口 看到的当前“屏幕”分辨率 会参与分辨率自适应的计算

![image-20231103105244583](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202311031052701.png)

画布大小和缩放系数：**宽高*缩放系数 = 屏幕分辨率**

![image-20231103105336115](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202311031053155.png)

RectTransfrom中缩放系数的意义：将Canvas中的UI对象缩放，所以分辨率大小自适应主要就是通过不同的算法计算出一个缩放系数，用该系数去缩放所有UI控件，又因为画布大小和缩放系数的关系，在分辨率自适应模式下，画布大小会随着缩放系数改变，就会造成裁剪或者黑边的情况




#### Constant Pixel Size（恒定像素模式）：

**无论屏幕大小如何，UI始终保持相同像素大小**

![image-20231103110050488](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202311031100524.png)

- Scale Factor：缩放系数，按此系数缩放画布中的所有UI元素 
- Reference Pixels Per Unit： 单位参考像素，多少像素对应Unity中的一个单位（默认一个单位为100像素） 图片设置中的Pixels Per Unit设置，会和该参数一起参与计算UI对象的尺寸[ UI尺寸 =  图片资源大小（像素）/ (Pixels Per Unit / Reference Pixels Per Unit)]



#### Scale With Screen Size（缩放模式）：

**根据屏幕尺寸进行缩放，随着屏幕尺寸放大缩小**

![image-20231103110323064](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202311031103102.png)

- Reference Resolution：参考分辨率（美术同学出图的标准分辨率）。 缩放模式下的所有匹配模式都会基于参考分辨率进行自适应计算 
- Screen Match Mode：屏幕匹配模式，当前屏幕分辨率宽高比不适应参考分辨率时，用于分辨率大小自适应的匹配模式

{% hideToggle ❤️三种屏幕匹配模式 %}

{% tabs %}

<!-- tab Extend -->

将Canvas Size进行宽或高扩大，让他高于参考分辨率

计算公式：

缩放系数 = Mathf.Min(屏幕宽/参考分辨率宽，屏幕高/参考分辨率高); 
画布尺寸 = 屏幕尺寸 / 缩放系数

不同设备的屏幕尺寸是物理意义上的无法改变的，所以缩放系数会改变，画布尺寸也会改变，因此画布尺寸可能不会与参考分辨率相同就会造成裁剪或者黑边的情况，这里是取最小的缩放系数，所以他是**最大程度的缩小UI元素，保留UI控件所有细节，可能会留黑边**



例子：屏幕（800，600） 参考分辨率（1920，1080）

缩放系数 = Mathf.Min(800/1920，600/1080)  = Mathf.Min(0.41667，0.5555) ≈ 0.41667
画布尺寸 =（800,600） / 0.41667 ≈（1920，1440）
可以看到画布的高比参考分辨率的高要大，那么按参考分辨率出的图就不能完全占满整个画布，上下会有黑边

<!-- endtab -->

<!-- tab Shrink -->

将Canvas Size进行宽或高收缩，让他低于参考分辨率，与Extend模式相反

计算公式：

缩放系数 = Mathf.Max(屏幕宽/参考分辨率宽，屏幕高/参考分辨率高); 画布尺寸 = 屏幕尺寸 / 缩放系数

**最大程度的放大UI元素，让UI元素能够填满画面，可能会出现裁剪**

<!-- endtab -->

<!-- tab ❤️Match Width Or Height -->

以宽高或者二者的某种平均值作为参考来缩放画布 

![image-20231103112818865](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202311031128900.png)

Match：确定用于计算的宽高匹配值

主要用于只有横屏模式或者竖屏模式的游戏

竖屏游戏：Match = 0 将画布宽度设置为参考分辨率的宽度 并保持比例不变，屏幕越高可能会有黑边 
横屏游戏：Match = 1 将画布高度设置为参考分辨率的高度 并保持比例不变，屏幕越长可能会有黑边

<!-- endtab -->

{% endtabs %}

{% endhideToggle %}



#### Constant Physical Size（恒定物理模式）：

**无论屏幕大小和分辨率如何，UI元素始终保持相 同物理大小**

与恒定像素模式相同，只是根据DPI算出新的  Reference Pixels Per Unit （单位参考像素）

![image-20231103114020016](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202311031140052.png)

DPI：（Dots Per Inch，每英寸点数）图像每英寸长度内的像素点数

- Physical Unit：物理单位，使用的物理单位种类
- Fallback Screen DPI：备用DPI，当找不到设备DPI时，使用此值
- Default Sprite DPI：默认图片DPI

> 恒定像素模式：
>
> ​	UI尺寸 =  图片资源大小（像素）/ (Pixels Per Unit / Reference Pixels Per Unit)
>
> 恒定物理模式：
>
> ​	新单位参考像素 =  单位参考像素 * Physical Unit / Default Sprite DPI
> ​	UI尺寸 =  图片资源大小（像素）/ (Pixels Per Unit / 新单位参考像素)

所以与恒定像素模式不同的是：他在不同屏幕设备上图片的视觉大小是一样的，游戏开发基本不使用



### Graphic Raycaster组件

Graphic Raycaster意思是图形射线投射器，它是用于**检测UI输入事件的射线发射器**

![image-20231103141701858](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202311031417942.png)

- Ignore Reversed Graphics：是否忽略反转图形（勾选，反转的UI点击无效）
- Blocking Objects：射线被哪些类型的碰撞器阻挡（在覆盖渲染模式下无效）
- Blocking Mask：射线被哪些层级的碰撞器阻挡（在覆盖渲染模式下无效）

`Blocking Objects`和`Blocking Mask`都是用来处理UI对象前有3D模型或者其他UI对象时，能否穿透并点击（覆盖渲染模式下UI对象始终在前所以无效）



### EventSystem和Standalone Input Module组件

所有的UI事件都通过EventSystem组件中轮询检测并做相应的执行，它类似一个中转站，和许多模块一起共同协作

![image-20231103143207621](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202311031432714.png)

- First Selected：首先选择的游戏对象，可以设置游戏一开始的默认处于点击选择状态的UI对象
- Send Navigation Events：是否允许导航事件（WASD移动/Enter按下/取消）
- Drag Threshold：拖拽操作的阈值（移动多少像素算拖拽）

Standalone Input Module组件用于处理鼠标/键盘/控制器/触屏（新版Unity）的输入，输入的事件通过EventSystem进行分发

![image-20231103143402089](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202311031434159.png)

- Horizontal Axis：水平轴按钮对应的热键名（该名字对应Input管理器）
- Vertical Axis：垂直轴按钮对应的热键名（该名字对应Input管理器）
- Submit Button：提交（确定）按钮对应的热建名（该名字对应Input管理器）
- Cancel Button：取消按钮对应的热建名（该名字对应Input管理器）
- Input Actions Per Second：每秒允许键盘/控制器输入的数量
- Repeat Delay：每秒输入操作重复率生效前的延迟时间
- ForceModule Active：是否强制模块处于激活状态



### RectTransform组件

继承于Transform，是专门用于处理UI元素位置大小相关的组件

![image-20231103151601967](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202311031516037.png)

- Pivot：轴心(中心)点，取值范围0~1
- Anchors(相对父矩形锚点)：
  - Min是矩形锚点范围X和Y的最小值 
  - Max是矩形锚点范围X和Y的最大值 取值范围都是0~1

- Pos(X,Y,Z)：轴心点(中心点)相对锚点的位置
- Width/Height：矩形的宽高
- Left/Top/Right/Bottom：矩形边缘相对于锚点的位置；当锚点分离时会出现这些内容
- Rotation：围绕轴心点旋转的角度
- Scale：缩放大小
- Blueprint Mode（蓝图模式），启用后，编辑旋转和缩放不会影响矩形，只会影响显示内容 ：
- Raw Edit Mode（原始编辑模式），启用后，改变轴心和锚点值不会改变矩形位置

4个锚点组成一个点时，图形的轴心点与父矩形相对位置固定（自适应位置），4个锚点各自分散，图形的边与父矩形的边相对距离固定（自适应宽高）

![自适应位置](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202311031536806.gif)

![自适应宽高](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202311031537271.gif)



## 三大基础控件

### Image

![image-20231103160057219](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202311031600289.png)

![image-20231103155516779](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202311031555845.png)

- Source Image：图片来源
- Color：图片附加颜色
- Material：材质（一般不改，会使用UI默认材质）
- Raycast Target：是否作为射线检测的目标（图片在按钮前，想要点击到按钮需要取消勾选）
- **Maskable**：是否能被遮罩
- **Image Type**：图片类型
  - **Simple**：图片适配控件大小自由拉伸，勾选 Preserve Aspect 保持图片宽高比不变，Set Native Size 设置控件宽高为图片原始宽高；
  - **Sliced**：图片适配控件大小自由拉伸，需要设置边界，4 个角的边界始终不变形
    - Pixels Per UnitMultiplier：每单位像素乘数
    - Fill Center 绘制中心
  - **Tiled**：当控件比较大、图片比较小时，图片从下往上、从左往右重复平铺，铺满整个控件空间；
  - **Filled**：只显示图片的一部分，可以用于技能 CD
    - Fill Method：填充方式
    - Fill Origin : 填充远点
    - Fill Amount: 填充量
    - Clockwise：顺时针方向
- Use Sprite Mesh ：使用精灵网格
- Preserve Aspect：保持现有尺寸
- Set Native Size：设置为图片资源的原始大小



### Text文本控件

- Line Spacing：行之间的垂直间距
- Rich Text：是否开启富文本
- Alignment：对齐方式
- Best Fit：内容自适应

富文本：

```
<b>Hello</b> <color=green>World</color>
```

![img](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202311031654868.png)

可以给 Text 控件添加阴影（Shadow）组件和描边（Outline）组件：

![img](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202311031654306.png)

显示效果如下：

![img](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202311031654766.png)



### RawImage

与Image区别是一般RawImage用于显示大图且对图片类型没有要求（背景图，不需要打入图集的图片，网络下载的图等）



## 组合控件

### Button按钮控件

由父对象（挂载Image组件，背景）和子对象（Text组件）组成

- Interactable：是否接收输入
- Transition：响应用户输入的过度效果
- Navigation用于设置可交互 UI 的导航方式（eg: WASD选择周围控件）

**注册事件**

- 点击 OnClick 下面的 “+” 号，可以为按钮添加响应事件，拖拽可以添加多个事件。
- 代码里添加事件 `button.onClick.AddListener(OnClickFunc);`



### Toggle开关控件

开关组件，是处理单选框和多选框的关键组件，默认是多选框，可以配合`Toggle Group`制作单选框

 创建 Toggle 控件时，系统会自动为其创建 2 个 Image 子控件和 1 个 Text 控件，如下：

![img](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202311031729626.png)

- Background：Image 控件，选择框背景；
- Checkmark：Image 控件，勾选图标；
- Label：Text 控件，选择框右边的文字说明。

**关键属性：**

Group： 用于指定分组，可以应用于单选框。 关联有`Toggle Group`组件的游戏物体

**注册事件**

- 点击 OnValueChanged 下面的 “+” 号，可以为选择框添加响应事件，可以添加多个事件。
- 代码添加：`toggle.onValueChanged.AddListener(OnValueChanged);`



### InputField文本输入控件

创建 InputField 控件时，系统会自动为其创建 2 个 Text 子控件，如下：

![img](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202311031741218.png)

- Placeholder：Text 控件，当用户未输入时，提示用户输入的文本
- Text：Text 控件，用户显示的文本

**关键属性：**

- Character Limit：文本长度限长，0 表示不受限；
- Content Type：文本类型，主要有：Standard（标准）、Integer Number（整数）、Decimal Number（浮点数）、Name（姓名格式，每个单词手写字母大写，其后字母小写）、Email Address（邮件格式）、Password（密码）、Pin（Pin 码）
- ![image-20231103174604935](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202311031746981.png)

![Content Type](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202311031743879.png)



### Slider滑动条控件

![img](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202311032250003.png)

   创建 Slider 控件时，系统会自动为其创建 3 个 Image 子控件和 2 个 Empty 控件，如下：

![img](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202311032252486.png)

- Background：Image 控件，滑动条最底层的背景
- Fill Area：Empty 控件，用于限制圆圈左边的填充部分区域
- Fill：Image 控件，圆圈左边区域的背景
- Handle Slide Area：Empty 控件，用于限制圆圈的区域
- Handle：Image 控件，圆圈的背景

![image-20231103175504487](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202311031755520.png)

- Direction：滑动条朝向，取值有：Left To Right、Right To Left、Bottom To Top、Top To Bottom
- Min Value：滑动条取值最小值
- Max Value：滑动条取值最大值
- Whole Numbers：是否取整数
- Value：滑动条当前取值



### ScrollBar滚动条控件

创建Scrollbar控件，系统会自动为其创建2个Image控件：

![image-20231103225450238](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202311032254267.png)

- Scrollbar：Image控件，背景
- Sliding Area：Empty控件
- Handle：Image控件，滚动块背景

属性：

![image-20231103230011074](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202311032300115.png)

- Direction：滑动块朝向，取值有：Left To Right、Right To Left、Bottom To Top、Top To Bottom
- Value：滚动块初始位置值
- Size：滚动块的显示大小
- Number of Steps：可滑动次数，为0则可以随便滑动



### ScrollView组件

![image-20231104111130248](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202311041111394.png)

习题：动态创建n个图标 作为滚动视图中显示的内容

```c#
public class BagPanel : MonoBehaviour
{
    public static BagPanel panel;

    public Button btnClose;

    public ScrollRect svItems;

    private void Awake()
    {
        panel = this;
    }

    // Start is called before the first frame update
    void Start()
    {
        //第一步 动态创建格子 设置格子的位置
        //动态创建n个图标 作为滚动视图中显示的内容
        for (int i = 0; i < 30; i++)
        {
            GameObject item = Instantiate(Resources.Load<GameObject>("Item"));
            item.transform.SetParent(svItems.content, false);
            //设置格子的位置
            item.transform.localPosition = new Vector3(10, -10, 0) + new Vector3(i % 4 * 160, -i / 4 * 160, 0);
        }

        //第二步 设置 Content的高
        svItems.content.sizeDelta = new Vector2(0, Mathf.CeilToInt(30 / 4f) * 160);

        btnClose.onClick.AddListener(() => {
            gameObject.SetActive(false);
        });

        //一开始隐藏自己
        this.gameObject.SetActive(false);
    }
}
```



### Dropdown控件

![image-20231104113116170](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202311041131210.png)

![image-20231104113320891](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202311041133936.png)

Options 中可以增删选项，并且可以给每个选项添加不同背景图片，也可以通过如下方式增删选项：

```c#
Dropdown dropdown = GetComponent<Dropdown>();
// 增加选项
dropdown.options.Add(new Dropdown.OptionData("Four"));
// 删除选项
dropdown.options.Remove(dropdown.options[2]);
```



## 图集制作

NGUI使用前需要先打图集，UGUI可以之后再打图集

#### 打开图集功能

1. 在工程设置面板中打开功能Edit——>Project Setting——>Editor
2. 选择Sprite Packer选项(精灵包装器，可以通过Unity自带图集工具生成图集)
   - Disabled：默认设置，不会打包图集
   - Enabled For Builds（Legacy Sprite Packer）：Unity仅在构建时打包图集，在编辑模式下不会打包图集
   - Always Enabled（Legacy Sprite Packer）：Unity在构建时打包图集，在编辑模式下运行前会打包图集
   - Enabled For Build：Unity进在构建时打包图集，在编辑器模式下不会打包
   - Always Enabled：Unity在构建时打包图集，在编辑模式下运行前会打包图集

Legacy Sprite Packer代表着传统打包模式， 相对下面两种模式来说， 多了一个设置图片之间的间隔距离Padding Power

Padding Power: 选择打包算法在计算打包的精灵之间以及精灵与生成的图集边缘之间的间隔距离（这里的数字 代表2的n次方）



#### 图集参数

![image-20231104115015594](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202311041150634.png)

- Allow Rotation：是否允许图集旋转小图，使得图集更紧凑（UI最好取消勾选）
- Tight Packing：是否允许忽略小图的透明处，使得图集更紧凑（UI最好取消勾选）

#### 代码加载

```c#
//加载图集 注意：需要引用命名空间
SpriteAtlas sa = Resources.Load<SpriteAtlas>("MyAlas");
//从图集中加载指定名字的小图
sa.GetSprite("bk");
```



# UGUI进阶

