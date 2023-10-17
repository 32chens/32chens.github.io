---
title: Unity-Lua热更新
author: chenlf
tags:
  - Unity
  - 热更新
  - Lua
categories:
  - Unity
katex: true
date: 2023-10-17 09:50:03
---

# xLua热更新

## 学习目标

1. 导入xLua框架
2. C#调用Lua
3. Lua调用C#
4. xLua热补丁

## C#调用lua（相对较少）

### 准备工作

- 导入xLua
- 导入AssetBundleBrower
- 导入AB包管理器ABMgr
- 导入BaseManager

### LuaEnv

Lua解析器能够让我们在Unity中执行Lua

一般情况下，保持它的唯一性

```C#
LuaEnv env = new LuaEnv();
```

使用 `DoString`直接执行Lua语言

```C#
env.DoString("print('你好世界')");
```

执行一个Lua脚本 Lua知识点 ：多脚本执行 require

注意：默认寻找脚本的路径是在 `Resources`下，并且因为在这里，可能是通过 `Resources.Load`去加载Lua脚本,  它只能加载`txt bytes`等等后缀的文件无法加载`.lua`后缀文件。所以Lua脚本后缀要加一个`.txt`

```C#
env.DoString("require('Main')");
```

```c#
 env.Tick();
```

帮助我们清除Lua中我们没有手动释放的对象 （垃圾回收）
帧更新中定时执行或者切场景时执行

 

```c#
env.Dispose();
```

销毁Lua解析器 



### 文件重定向

由于直接使用DoString，默认是从`Resources`下加载Lua文件，当我们需要在其他文件目录加载，LuaEnv提供了一个{% label AddLoader red %}方法，可以让我们自定义文件加载目录。

`AddLoader`方法参数是一个委托类型：`delegate byte[] CustomLoader(ref strin filepath)`

具体使用添加自定义加载器

```c#
public byte[] MyAddLoader(ref string path)
{
    //拼接文件路径
    string filepath = Application.dataPath + "/Lua/" + path + ".lua";
    if (File.Exists(filepath))
    {
        return File.ReadAllBytes(filepath);
    }
    else
    {
        Debug.LogError("env加载lua文件 文件重定向失败，文件名为："+path);
    }
    return null;
}
```

注册加载器

```c#
LuaEnv env = new LuaEnv();
env.AddLoader(MyAddLoader);
```

LuaEnv解析器在执行`require（"filename"）`的**执行流程**是：

- 首先从加载器委托中依次从自定义加载器中获取文件内容的byte[]，所有自定义加载器都返回`null`，则默认从Resources文件夹下加载。
- 如果自定义加载器返回不为空，则后面的自定义加载器和默认加载不执行

注：因为自定义加载器使用字节流加载lua文件，所以**不需要在lua文件后添加`.txt`后缀**

**局限**：

本节实现的加载器只能从一个目录当中加载lua文件，不是从AB包加载文件，下一小节将实现一个从AB包当中加载lua文件的自定义加载器。



### Lua解析器管理器

从AB包加载文件的方法是，主要是用`LoadAsset`方法从AB包中加载成对应的`TextAsset`资源，再返回`byte[]`，因为`LoadAsset`方法和`Resources.Load`一样不支持`.lua`文件，所以需要添加`.txt`后缀

一般来说，只有在最后打包时，才会将文件后缀改为`.txt`，平时只需要正常加载就好了。后面会实现一键将某个目录下的lua文件，全部添加`.txt`后缀，并设置AssetBundle后打包

```c#
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using XLua;

/// <summary>
/// Lua管理器
/// 提供 lua解析器
/// 保证解析器的唯一性
/// </summary>
public class LuaMgr : BaseManager<LuaMgr>
{
    //执行Lua语言的函数
    //释放垃圾
    //销毁
    //重定向
    private LuaEnv luaEnv;


    /// <summary>
    /// 得到Lua中的_G
    /// </summary>
    public LuaTable Global
    {
        get
        {
            return luaEnv.Global;
        }
    }


    /// <summary>
    /// 初始化解析器
    /// </summary>
    public void Init()
    {
        //已经初始化了 别初始化 直接返回
        if (luaEnv != null)
            return;
        //初始化
        luaEnv = new LuaEnv();
        //加载lua脚本 重定向
        luaEnv.AddLoader(MyCustomLoader);
        luaEnv.AddLoader(MyCustomABLoader);
    }

    //自动执行
    private byte[] MyCustomLoader(ref string filePath)
    {
        //通过函数中的逻辑 去加载 Lua文件 
        //传入的参数 是 require执行的lua脚本文件名
        //拼接一个Lua文件所在路径
        string path = Application.dataPath + "/Lua/" + filePath + ".lua";

        //有路径 就去加载文件 
        //File知识点 C#提供的文件读写的类
        //判断文件是否存在
        if (File.Exists(path))
        {
            return File.ReadAllBytes(path);
        }
        else
        {
            Debug.Log("MyCustomLoader重定向失败，文件名为" + filePath);
        }


        return null;
    }


    //Lua脚本会放在AB包 
    //最终我们会通过加载AB包再加载其中的Lua脚本资源 来执行它
    //重定向加载AB包中的LUa脚本
    private byte[] MyCustomABLoader(ref string filePath)
    {
        //Debug.Log("进入AB包加载 重定向函数");
        ////从AB包中加载lua文件
        ////加载AB包
        //string path = Application.streamingAssetsPath + "/lua";
        //AssetBundle ab = AssetBundle.LoadFromFile(path);

        ////加载Lua文件 返回
        //TextAsset tx = ab.LoadAsset<TextAsset>(filePath + ".lua");
        ////加载Lua文件 byte数组
        //return tx.bytes;

        //通过我们的AB包管理器 加载的lua脚本资源
        TextAsset lua = ABMgr.GetInstance().LoadRes<TextAsset>("lua", filePath + ".lua");
        if (lua != null)
            return lua.bytes;
        else
            Debug.Log("MyCustomABLoader重定向失败，文件名为：" + filePath);

        return null;
    }


    /// <summary>
    /// 传入lua文件名 执行lua脚本
    /// </summary>
    /// <param name="fileName"></param>
    public void DoLuaFile(string fileName)
    {
        string str = string.Format("require('{0}')", fileName);
        DoString(str);
    }

    /// <summary>
    /// 执行Lua语言
    /// </summary>
    /// <param name="str"></param>
    public void DoString(string str)
    {
        if(luaEnv == null)
        {
            Debug.Log("解析器为初始化");
            return;
        }
        luaEnv.DoString(str);
    }

    /// <summary>
    /// 释放lua 垃圾
    /// </summary>
    public void Tick()
    {
        if (luaEnv == null)
        {
            Debug.Log("解析器为初始化");
            return;
        }
        luaEnv.Tick();
    }

    /// <summary>
    /// 销毁解析器
    /// </summary>
    public void Dispose()
    {
        if (luaEnv == null)
        {
            Debug.Log("解析器为初始化");
            return;
        }
        luaEnv.Dispose();
        luaEnv = null;
    }
}
```



### 全局变量的获取和设置

LuaEnv的Global属性是LuaTable，对应lua的`_G`表，他有Get和Set方法用来对lua的全局变量获取和设置，**无法获取局部变量**

Test.lua

```lua
testNum = 1
testBool = true
testFloat = 0.1
testString = "123"
```

Unity C#

```c#
LuaEnv luaEnv = new LuaEnv();
//获取
print(luaEnv.Global.Get<int>("testNum"));
print(luaEnv.Global.Get<bool>("testBool"));
print(luaEnv.Global.Get<string>("testString"));

//设置 泛型可写可不写
luaEnv.Global.Set<string,int>("testNum", 100);
luaEnv.Global.Set("testNum", 10);
```



### 全局函数的获取

与全局变量的获取类似，也是通过LuaEnv.Global.Get<T>()获取，泛型T是一种委托用来存储获取的函数

Lua全局函数类型分四种

- 无返回值
- 有参有返回值
- 多返回
- 变长参数

Test.lua

```lua
testFun = function()
    print("无参无返回")
end

testFun2 = function(a)
    print("有参有返回")
    return a+1
end

testFun3 = function(a)
    print("多返回值")
    return 1, 2, false, "123", a
end

testFun = function(a, ...)
    print("变长参数")
    arg = {...}
    print(a)
    for k,v in pairs(arg) do
        print(k,v)
    end
end
```

##### 无返回值

可以自己声明委托，也可使用现成的委托如Unity的`UnityAction`、C#的`Action`，还有xLua提供的`LuaFunction`接收

自定义委托声明

```c#
public delegate void CustomCall();
```

接受函数

```c#
CustomCall call = LuaMgr.GetInstance().Global.Get<CustomCall>("testFun");
call();
//Unity自带委托
UnityAction ua = LuaMgr.GetInstance().Global.Get<UnityAction>("testFun");
ua();
//C#提供的委托
Action ac = LuaMgr.GetInstance().Global.Get<Action>("testFun");
ac();
//Xlua提供的一种 获取函数的方式 少用
LuaFunction lf = LuaMgr.GetInstance().Global.Get<LuaFunction>("testFun");
lf.Call();
```

##### 有参有返回

与无返回值的委托不同，xLua默认是可以识别无返回值的委托的，所以另外三种类型的委托，如果需要自定义的话需要加上`[CSharpCallLua]`特性，同时需要重新生成Wrap代码

自定义委托声明：

```c#
[CSharpCallLua]
public delegate int CustomCall2(int a);
```



接收函数：

```c#
//有参有返回
CustomCall2 call2 = LuaMgr.GetInstance().Global.Get<CustomCall2>("testFun2");
Debug.Log("有参有返回：" + call2(10));
//C#自带的泛型委托 方便我们使用
Func<int, int> sFun = LuaMgr.GetInstance().Global.Get<Func<int, int>>("testFun2");
Debug.Log("有参有返回：" + sFun(20));
//Xlua提供的
LuaFunction lf2 = LuaMgr.GetInstance().Global.Get<LuaFunction>("testFun2");
Debug.Log("有参有返回：" + lf2.Call(30)[0]);
```



##### 多返回值

多返回值，因为在C#中函数只能返回一个值，所以多返回可以通过ref或out参数或者变长参数来接收，将参数作为返回值。

自定义委托

```c#
[CSharpCallLua]
public delegate int CustomCall3(int a, out int b, out bool c, out string d, out int e);
[CSharpCallLua]
public delegate int CustomCall4(int a, ref int b, ref bool c, ref string d, ref int e);
```

函数接收：

```c#
//使用 out 来接收
CustomCall3 call3 = LuaMgr.GetInstance().Global.Get<CustomCall3>("testFun3");
int b;
bool c;
string d;
int e;
Debug.Log("第一个返回值：" + call3(100, out b, out c, out d, out e));
Debug.Log(b + "_" + c + "_" + d + "_" + e);

//使用 ref 来接收
CustomCall4 call4 = LuaMgr.GetInstance().Global.Get<CustomCall4>("testFun3");
int b1 = 0;
bool c1 = true;
string d1 = "";
int e1 = 0;
Debug.Log("第一个返回值：" + call4(200, ref b1, ref c1, ref d1, ref e1));
Debug.Log(b1 + "_" + c1 + "_" + d1 + "_" + e1);

//Xlua
LuaFunction lf3 = LuaMgr.GetInstance().Global.Get<LuaFunction>("testFun3");
object[] objs = lf3.Call(1000);
for( int i = 0; i < objs.Length; ++i )
{
    Debug.Log("第" + i + "个返回值是：" + objs[i]);
}
```



##### 变长参数

自定义委托

```c#
[CSharpCallLua]
public delegate void CustomCall5(string a, params int[] args);//变长参数的类型 是根据实际情况来定的
```

函数接收：

```C#
CustomCall5 call5 = LuaMgr.GetInstance().Global.Get<CustomCall5>("testFun4");
call5("123", 1, 2, 3, 4, 5, 566, 7, 7, 8, 9, 99);

LuaFunction lf4 = LuaMgr.GetInstance().Global.Get<LuaFunction>("testFun4");
lf4.Call("456", 6, 7, 8, 99, 1);
```



##### 总结：

C#用委托来接收lua函数，根据函数声明结构可以使用自定义委托、Unity的UnityAction、C#的Action、Func或者xLua的LuaFunction，虽然这几种函数都可以用LuaFunciton接收，但是LuaFunciton定义的返回值是byte[]，所以有可能产生垃圾，官方也不推荐。

自定义委托需要注意除无返回值的函数都需要加上`[CSharpCallLua]`特性，并生成Wrap代码



### List和Dictionary映射table

#### List

 **获取指定类型**

```C#
//lua
testList = {1,2,3,4,5,6}

//C#
List<int> list = LuaMgr.GetInstance().Global.Get<List<int>>("testList");
```

 **获取不同类型**

使用object

```C#
//lua
testList2 = {"123", "123", true, 1, 1.2}

//C#
List<object> list3 = LuaMgr.GetInstance().Global.Get<List<object>>("testList2");
```

#### Dictionary

**获取指定类型**

```C#
//lua
testDic = {
	["1"] = 1,
	["2"] = 2,
	["3"] = 3,
	["4"] = 4
}

//C#
Dictionary<string, int> dic = LuaMgr.GetInstance().Global.Get<Dictionary<string, int>>("testDic");
```

**获取不同类型**

使用object

```C#
//lua
testDic2 = {
	["1"] = 1,
	[true] = 1,
	[false] = true,
	["123"] = false
}

//C#
Dictionary<object, object> dic3 = LuaMgr.GetInstance().Global.Get<Dictionary<object, object>>("testDic2");
```

### 类映射table

lua文件

```lua
testClas = {
	testInt = 2,
	testBool = true,
	testFloat = 1.2,
	testString = "123",
	testFun = function()
		print("123123123")
	end
    testInClass = {
        testInInt = 10;
    }
}
```

#### 类映射table

- 在C#声明一个类，**成员变量的名字和类型一定要和lua方一致**
- 要映射的只能是public，private和protected无法赋值
- 如果变量比lua中的少，就会忽略它
- 如果变量比lua中的多，不会赋值，也会忽略
- 类成员，和上述要求一致就会赋值

```C#
public class CallLuaInClass
{
    public int testInInt;
}

public class CallLuaClass
{
    public int testInt;
    public bool testBool;
    //public float testFloat;
    public float testString;
    public UnityAction testFun;

    public CallLuaInClass testInClass;

    public int i;

    public void Test()
    {
        Debug.Log(testInt);
    }
}
```

映射接收table

```c#
CallLuaClass obj = LuaMgr.GetInstance().Global.Get<CallLuaClass>("testClas");
```

可以看出接受的table有嵌套table



### 接口映射table

与类映射table类似只有以下需要注意的地方：

- 但是需要使用**属性**与table的元素对应，而不是成员变量
- 需要在接口声明上添加`[CSharpCallLua]`特性并生成Wrap代码，并且用来接收的**接口对象修改属性值可以改变lua table 中的值**

接口声明：

```c#
[CSharpCallLua]
public interface ICSharpCallInterface
{
    int testInt
    {
        get;
        set;
    }

    bool testBool
    {
        get;
        set;
    }

    ////float testFloat
    ////{
    ////    get;
    ////    set;
    ////}

    string testString
    {
        get;
        set;
    }

    UnityAction testFun
    {
        get;
        set;
    }

    float testFloat222
    {
        get;
        set;
    }
}
```

用接口接收table:

```c#
ICSharpCallInterface obj = LuaMgr.GetInstance().Global.Get<ICSharpCallInterface>("testClas");
Debug.Log(obj.testInt);		//2

obj.testInt = 10000;
ICSharpCallInterface obj2 = LuaMgr.GetInstance().Global.Get<ICSharpCallInterface>("testClas");
Debug.Log(obj2.testInt);	//10000
```



### LuaTable映射table

LuaEnv.Global是LuaTble类型，也可以用LuaTable来接收table，那么他的使用就和之前一样使用Get和Set获取和修改table中的值

```c#
LuaTable table = LuaMgr.GetInstance().Global.Get<LuaTable>("testClas");
Debug.Log(table.Get<int>("testInt")); 	//2

table.Set("testInt", 55);
Debug.Log(table.Get<int>("testInt"));	//55
LuaTable table2 = LuaMgr.GetInstance().Global.Get<LuaTable>("testClas");
Debug.Log(table2.Get<int>("testInt"));	//55
```

LuaTable使用完需要释放

```c#
table.Dispose();
```

注：不建议使用LuaTable和LuaFunction 效率低



### 总结

总的来说，不管是全局变量、全局函数和table都是使用LuaEnv对象的Global属性的Get<T>()方法来获取的，获取的lua对象选择合适的接收对象，比如全局变量那就是int、string这种基础类型接收，全局函数就是用委托类型对象来接受，table则可以使用类、接口、List、Dictionary、LuaTable来接受。

需要注意的是`[CSharpCallLua]`特性可能需要加在自定义委托和接口上，在C#层面的修改在lua层面也被修改，那么只有接口和LuaTable对象可以实现



## Lua调用C#

### 类

lua中使用C#的类非常简单 {% label CS.命名空间.类名 red %}
```lua
-- Unity的类 比如 GameObject Transform等等 —— CS.UnityEngine.类名
--为了方便使用 并且节约性能 定义全局变量存储 C#中的类
--相当于取了一个别名
GameObject = CS.UnityEngine.GameObject
```

**实例化：**

```lua
GameObject = CS.UnityEngine.GameObject
local obj = GameObject("游戏物体")
```

**成员变量和成员方法:**

成员方法必须要用{% label : red %}，成员方法第一个参数为自己的对象

```lua
--成员变量  直接对象 . 即可
print(obj.transform.position)

--如果使用对象中的 成员方法！！！！一定要加":"
Vector3 = CS.UnityEngine.Vector3
obj.transform:Translate(Vector3.right)
```

**静态方法:**

```lua
--类中的静态对象 可以直接使用.来调用
local obj = GameObject.Find("游戏物体")
```



**继承了MonoBehaviour的类:**

因为继承了MonoBehaviour的类，不能直接`new`，他是在游戏物体初始化的时候实例化的，所以我们需要在游戏物体上挂载该脚本

通过GameObject的 AddComponent添加脚本
xlua提供了一个重要方法 typeof 可以得到类的Type
xlua中不支持无参泛型函数`AddComponent<T>()`  所以我们要使用另一个重载:

```lua
obj:AddComponent(typeof(CS.MyMonoCLass))
```



**游戏开始：**

因为游戏开始是执行的C#代码，所以我们一般是写一个Main类在游戏开始时执行调用lua文件的代码，之后才可以使用lua来调用C#



### 枚举

枚举和类的使用一摸一样，只不过不存在实例化，{% label CS.命名空间.枚举名.枚举成员 red %}

```lua
CS.UnityEngine.PermitiveType.Cube
```



### 数组、List、字典

C#

```c#
public class Test{
    public int[] array = new int[5]{1,2,3,4,5};
    public List<int> list = new List<int>();
    public Dictionary<int, string> dic = new Dictonary<int, string>();
}
```

因为lua调用C#代码，实际上使用的userdata来存储，所以使用方式跟C#一样，例如数组长度使用`.Length`获取, 而不是使用`#`获取长度

**数组:**

```lua
--获取数组
local array = CS.Test().array
print(array.Length)
--访问数组
print(array[0])
--遍历数组
for i=0, array.Length-1 do
    print(array[i])
end

--创建 int类型长度为10的数组
local newArray = CS.System.Array.CreateInstance(System.Int32, 10)
```

虽然lua中数组的遍历，索引是从1开始的，但是这里还是按照C#的规则

数组的本质是`CS.System.Array`，所以调用他的`CreateInstance`静态方法创建

**List:**

```lua
--获取
local list = CS.Test().list
print(list.Count)
--调用 访问
list:Add(100)
print(list[0])
--遍历
for i=0, list.Count-1 do
    print(list[i])
end

--创建
--xlua老版本
local list2 = CS.System.Generic["List`[System.Int32]"]()
--xlua新版本 >2.1.12
local List_Int = CS.System.Generic.List(Cs.System.Int32)	--类似于类，需要实例化
local list3 = List_Int()
```

主要注意新老版本的创建方式



**Dictionary**

```lua
--获取
local dic = CS.Test().dic
dic:Add(1,"123")
--遍历
for k,v in pair(dic) do
    print(k,v)
end

--访问修改
print(dic[1])		--nil
dic.get_Item(1)		--123
dic.set_Item(1, "321")

--创建
local _Dic = CS.System.Generic.Dictionary(CS.System.String, CS.UnityEngine.Vector3)
local dic2 = _Dic()
dic2:Add("111", CS.UnityEngine.Vector3.right)
```

字典的获取比较特殊必须，必须使用`get_Item`固定方法

字典的创建跟List一样有新老版本





### 函数--拓展方法

C#代码：

```c#
[LuaCallCSharp]
public static class Tool{
    public static void Move(this User user){
        Debug.Log(obj.name+ "在移动");
    }
}
public class User{
    public string name = "达文西"
}
```

Lua使用:

```lua
local user = CS.User()
user:Move()
```

lua中使用拓展方法跟其他成员方法没什么不同，重点是需要在工具类上添加`[LuaCallCSharp]`特性，并生成对应Wrap文件

**建议所以lua中要使用到的C#类都加上`[LuaCallCSharp]`这个特性**，虽然之前其他类没有加上该特性也可以使用，这是因为没有加上该特性xLua依旧可以通过反射来访问到C#类，但是反射的效率比较低，而使用该特性并生成Wrap文件，相当于访问Wrap文件效率较高



### 函数--ref和out

之前在C#调用lua中调用lua的多返回值时，是使用了ref或out来接收除第一个返回值的其他返回值，所以这一小节没啥好说的，只是从lua的角度来看，使用利用了lua可以返回多个值来保存C#中的返回值和ref和out修饰的值

```C#
[LuaCallCSharp]
public class Test {
    public int RefFunc(int a, ref int b, ref int c, int d){
        b=a+d
        c=a-d
        return 100;
	}
    public int OutFunc(int a, out int b, out int c, int d){
        b=a;
        c=d;
        return 200;
    }
}
```

lua使用:

```lua
local obj = CS.Test()
--除了返回值外,还有两个ref 所以需要返回三个值
local a,b,c = obj.RefFunc(1,0,0,1)	-- 2,0,100

--out修饰的可以省略
local a,b,c =  obj.OutFunc(20, 30)	--20,30,200
```

注意: ref修饰的不可以省略，可以使用默认值在参数列表中占位，out修饰的可以省略



### 函数--重载

lua支持调用C#中的重载函数，但是lua本身不支持重载函数

```C#
[LuaCallCSharp]
public class Test{
    public int Calc(){
        return 100;
    }
   	public int Calc(int a){
        return a;
    }
    public float Calc(float a){
        return a;
    }
}
```

lua调用C#:

```lua
local obj = CS.Test()
print(obj:Calc())	--100
print(obj:Calc(10))	--10
print(obj:Calc(10.2))	--0
```

虽然lua支持C#函数的重载，但是因为lua中的数值类型只有Number，所以对C#中的多精度重载函数支持不好，可能会发生意想不到的问题，所以如果要在lua中使用C#类中的重载，**尽量避免这种多精度重载。**

如果必须要使用多精度重载有办法解决吗？
可以，xLua提供了解决方案(`xlua.tofunction`)，但是还是**尽量别用**，因为他是使用了反射机制，效率较低

```lua
--获取C#函数相关信息
local m1=typeof(CS.Test):GetMethod("Calc",{typeof(CS.System.Int32)})
local m2=typeof(CS.Test):GetMethod("Calc",{typeof(CS.System.Single)})	--float对应的是Single

--把获取的相关信息转成一个lua函数
local f1 = xlua.tofunction(m1)
local f2 = xlua.tofunction(m2)

print(f1(obj, 10))
print(f1(obj, 10.2))
```



### 委托和事件

C#代码：

```C#
public class Test7{
    //申明委托和事件
    public UnityAction del;
    public event UnityAction eventAction;
    
    public void DoEvent(){
        if(eventAction != null)
            eventAction();
    }
}
```

lua代码--委托:

```lua
local obj = CS.Test7()
local fun = function()
    print("Lua函数")    
end

--第一次往C#委托中加函数 因为是nil,所以直接+会报错
-- obj.del = obj.del + fun 报错
obj.del = fun
obj.del = obj.del + fun
obj.del = obj.del - fun
obj.del()
obj.del = nil	--清空
obj.del = fun	--清空后,还是要先赋值操作
```

lua代码--事件:

```lua
local fun2 = function()
    print("事件加函数")
end

--事件加减 和 委托非常不一样
obj:eventAction("+", fun2)
obj:eventAction("+", fun2)
obj:eventAction("-", fun2)
obj:DoEvent()	--调用（C#函数包裹）

--事件不能直接清空
--obj.eventAction = nil --error
```

注意：

- 事件加减 和 委托非常不一样
- 事件不能直接清空，只能在C#代码中添加一个清空函数，然后lua中调用该函数



### 特殊问题--二维数组遍历

