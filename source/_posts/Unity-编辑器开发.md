---
title: Unity-编辑器开发
author: chenlf
tags:
  - Unity
  - 编辑器
categories:
  - Unity
katex: true
date: 2024-03-16 19:05:49
---

# 自定义菜单栏扩展

**特殊文件夹Editor**

Editor文件夹是Unity中的特殊文件夹*，*所有Unity中编辑器相关的脚本都需要放置在其中。因为这些使用了Unity编辑器相关命名空间的脚本最终是不能被打包出去的，否则会报错



一般自定义菜单栏拓展都是使用的**MenuItem**特性，加载静态函数上面，一般该静态函数所在的类不需要继承MonoBehavior



**在Unity菜单栏中添加自定义页签:**

```C#
[MenuItem("页签/一级选项/二级选项/....")]
```



**在Hierarchy窗口中添加自定义页签:**

只需要前面多加个`GameObject`

```c#
[MenuItem("GameObject/页签/一级选项/二级选项/....")]
```



**在Project窗口中添加自定义页签：**

前面多加`Assets`

```C#
[MenuItem("Assets/页签/一级选项/二级选项/....")]
```



**在Inspector为脚本右键添加菜单:**

```c#
[MenuItem("CONTEXT/脚本名/页签/一级选项/二级选项/....")]
```



**加入快捷键：**

- 单键：路径后 *+* 空格 + 下划线 *+* 想要的按键
- 组合键：%表示Ctrl    #表示Shift    &表示Alt

```c#
[MenuItem("页签/一级选项/二级选项/.... _#R" )]	//快捷键Shift + R
```



**在菜单栏的Component菜单添加脚本:**

​	还有一种在菜单栏的Component菜单添加脚本，因为这个菜单栏的选项都是可以添加到游戏对象上的组件，本质上就是继承了MonoBehavior的类，所以**AddComponentMenu**这个特性需要添加到继承了**MonoBehaviour**的类上面

```C#
[AddComponentMenu("一级选项/二级选项/....")]
public class Test:MonoBehavior{
    //...
}
```





# 自定义窗口

文档：*https://docs.unity.cn/cn/2022.3/ScriptReference/EditorWindow.html*

​	只需要创建一个继承了`EditorWindow`的类，调用`EditorWindow`的静态方法`GetWindow()`获取实例，并调用实例的`Show()`方法就可以创建并打开一个自定义的编辑器窗口了。

​	在`OnGUI`方法中，编写绘制内容和处理逻辑即可

​	`GetWindow`方法返回的是一个单例，如果需要重复创建使用`CreateWindow`

```c#
public class Lesson2 : EditorWindow
{
    [MenuItem("Unity编辑器拓展/Lesson2/显示自定义面板")]
    private static void ShowWindow()
    {
        Lesson2 win = EditorWindow.GetWindow<Lesson2>();
        win.titleContent = new GUIContent("我的窗口");
        win.Show();
    }
    
    private void OnGUI()
    {
        GUILayout.Label("测试文本");
        if(GUILayout.Button("测试按钮"))
        {
            Debug.Log("Test");
        }
    }
}
```

**窗口类的生命周期函数：**

*OnEnable*、*OnGUI*、*OnDestroy*、*Update*

**窗口事件回调函数：**

*OnHierarchyChange*、*OnFocus*、*OnLostFocus*、*OnProjectChange*、*OnInspectorUpdate*、*OnSelectionChange*

**常用成员：**

```C#
//静态变量
//1.focusedWindow：当前已获得键盘焦点的 EditorWindow。（只读）
//2.mouseOverWindow：当前在鼠标光标下的 EditorWindow。（只读）

//静态函数
//CreateWindow: 创建窗口，如果允许一个窗口有多个可以用该API创建窗口
//GetWindow: 通过它我们可以创建一个窗口对象
//GetWindowWithRect：返回一个指定位置、大小的窗口
//HasOpenInstances：检查编辑器窗口是否打开

//成员变量
//titleContent：窗口标题名
//positon：窗口位置大小信息
//wantsMouseEnterLeaveWindow:如果设置为 true，则每当鼠标进入或离开窗口时，该窗口都会收到一次 OnGUI 调用

//成员函数
//Show: 显示面板
//Repaint：重绘窗口
//Close: 关闭窗口
```



# EditorGUI

​	EditorGUI 提供了相对 GUI 更多的控件绘制API，专门提供于编辑器拓展使用，我们一般会将他们配合使用来进行编辑器拓展开发，而加了Layout的两个公共类（GUILayout、EditorGUILayout）只是多了自动布局功能

**文本、层级和标签、颜色拾取 控件：**

```c#
//文本
EditorGUILayout.LabelField("文本标题", "文本内容");
//Layer
int变量 = EditorGUILayout.LayerField("层级选择", int变量);
//Tag
string变量 = EditorGUILayout.TagField("标签选择", string变量);
//颜色拾取
color变量 = EditorGUILayout.ColorField(new GUIContent("标题"),color变量, 是否显示拾色器, 是否显示透明度通道, 是否支持HDR)
```



**枚举、选择、按下按钮 控件:**
