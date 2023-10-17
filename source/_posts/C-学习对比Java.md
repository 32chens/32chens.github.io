---

title: C#学习对比Java
author: chenlf
tags:
  - C#
categories:
  - C#
katex: true
date: 2023-09-22 09:38:06
---

### 常量

{% tabs %}

<!-- tab C# -->

```c#
public class ConstTest
{
    public const double PI = 3.14;
    public const int a = 0;
}

class ConstTestMain
{
    public static void Main(string[] args)
    {
        Console.WriteLine(ConstTest.PI);
    }
}
```

- **const只能用来修饰基本数据类型、字符串类型、同为const的变量。**
- const修饰的变量不能再用`static`变量进行修饰，并且其只能在字段的声明中初始化, 所以**const必须初始化**，const的原理是在编译期直接对变量值进行替换的。所以虽然他没有被`static`变量修饰，但他还是一个静态变量可以被`类名.`直接调用

<!-- endtab -->

<!-- tab Java -->

```java
final int a = 1;
```

<!-- endtab -->

{% endtabs %}



### 可空类型（Nullable）

可空类型可以表示其基础值类型正常范围内的值，再加上一个 null 值

```c#
int a;	//默认值为0
int? b;	//默认值为null
```

**Null合并运算符(??)**为类型转换定义了一个预设值，以防可空类型的值为 Null

```c#
double? num1 = null;
double num3 = num1 ?? 5.34;      // num1 如果为空值则返回 5.34
```



### 二维数组

{% tabs %}

<!-- tab C# -->

```c#
int[,] arr2 = new int[3, 3];
int[,] arr3 = new int[3, 3] { { 1, 2, 3 }, 
                              { 4, 5, 6 }, 
                              { 7, 8, 9 } };
int[,] arr4 = new int[,] { { 1, 2, 3 },
                           { 4, 5, 6 },
                           { 7, 8, 9 } };


//交错数组
int[][] arr5 = new int[][] { { 1, 2, 3 },
                           { 4, 5 },
                           { 7} };
```

<!-- endtab -->

<!-- tab Java -->

```java
int[][] arr2 = new int[3][3];
int[][] arr3 = new int[3][3] { { 1, 2, 3 }, 
                              { 4, 5, 6 }, 
                              { 7, 8, 9 } };
int[][] arr4 = new int[][] { { 1, 2, 3 },
                           { 4, 5, 6 },
                           { 7, 8, 9 } };
```

<!-- endtab -->

{% endtabs %}



### 变长参数和参数默认值

{% tabs %}

<!-- tab C#变长参数和参数默认值 -->

```c#
//变长参数关键字 params
static int Sum(params int[] arr)
{
    int sum = 0;
    for (int i = 0; i < arr.Length; i++)
    {
        sum += arr[i];
    }
    return sum;
}

//调用
Sum(1,2,3,4,5,6,7,8,1,22,456,123,1);
```

```c#
//有参数默认值的参数 一般称为可选参数
static void Speak(string str = "我没什么话可说")
{
    Console.WriteLine(str);
}
//调用
Speak();
Speak("123123");
```

<!-- endtab -->

<!-- tab Java变长参数 -->

```java
public static void test(Object...objects){
    for (Object object : objects) {
        System.out.println(object);
    }
}
```

<!-- endtab -->

{% endtabs %}





### 结构体

{% tabs %}

<!-- tab 使用 -->

在 C# 中，结构体是**值类型**数据结构。它使得一个单一变量可以存储各种数据类型的相关数据，它是**数据和函数的集合**。

```c#
struct 自定义结构体名
{
    // 第一部分
    // 变量

    // 第二部分
    // 构造函数(可选)

    // 第三部分 
    // 函数
}
```
注：**结构体不允许自己申明无参构造，如果声明了构造函数，那么必须在其中对所有变量数据初始化**



```c#
using System;
using System.Text;
     
struct Books
{
   public string title;
   public string author;
   public string subject;
   public int book_id;
};  

public class testStructure
{
   public static void Main(string[] args)
   {

      Books Book1;        /* 声明 Book1，类型为 Books */
      Books Book2 = new Books();        /* 声明 Book2，类型为 Books */

      /* book 1 详述 */
      Book1.title = "C Programming";
      Book1.author = "Nuha Ali"; 
      Book1.subject = "C Programming Tutorial";
      Book1.book_id = 6495407;

      /* book 2 详述 */
      Book2.title = "Telecom Billing";
      Book2.author = "Zara Ali";
      Book2.subject =  "Telecom Billing Tutorial";
      Book2.book_id = 6495700;

      /* 打印 Book1 信息 */
      Console.WriteLine( "Book 1 title : {0}", Book1.title);
      Console.WriteLine("Book 1 author : {0}", Book1.author);
      Console.WriteLine("Book 1 subject : {0}", Book1.subject);
      Console.WriteLine("Book 1 book_id :{0}", Book1.book_id);

      /* 打印 Book2 信息 */
      Console.WriteLine("Book 2 title : {0}", Book2.title);
      Console.WriteLine("Book 2 author : {0}", Book2.author);
      Console.WriteLine("Book 2 subject : {0}", Book2.subject);
      Console.WriteLine("Book 2 book_id : {0}", Book2.book_id);       

      Console.ReadKey();

   }
}
```

结果:

```c#
Book 1 title : C Programming
Book 1 author : Nuha Ali
Book 1 subject : C Programming Tutorial
Book 1 book_id : 6495407
Book 2 title : Telecom Billing
Book 2 author : Zara Ali
Book 2 subject : Telecom Billing Tutorial
Book 2 book_id : 6495700
```

<!-- endtab -->

<!-- tab 特点 -->

- 结构可带有方法、字段、索引、属性、运算符方法和事件。
- 结构可定义构造函数，但不能定义析构函数。但是，您不能为结构体定义无参构造函数。无参构造函数(默认)是自动定义的，且不能被改变。
- 与类不同，结构不能继承其他的结构或类。
- 结构不能作为其他结构或类的基础结构。
- 结构可实现一个或多个接口。
- 结构成员不能指定为 abstract、virtual 或 protected。
- 当您使用 **New** 操作符创建一个结构对象时，会调用适当的构造函数来创建结构。与类不同，结构可以不使用 New 操作符即可被实例化。
- 如果不使用 New 操作符，只有在所有的字段都被初始化之后，字段才被赋值，对象才被使用。

<!-- endtab -->

{% endtabs %}



### 类

1、访问修饰符

- public：**同一程序集中或引用该程序集的其他程序集**都可以访问该类型或成员
- **Internal**：**同一程序集中**的任何代码都可以访问该类型或成员。 
- protected：访问仅限于包含类和派生类（**派生类可以是不同程序集**）
- **protected internal**：访问仅限于当前程序集或从包含类派生的类型（相当于internal和protected两个权限相加）
- private：访问仅限于类内
- **private protected**：访问仅限于包含类和派生类（**派生类只能是统一程序集**）

2、默认修饰符

- C#类的默认访问标识符是 **internal**，成员的默认访问标识符是 **private**。
- Java类的默认访问标识符是 **default**，成员的默认访问标识符是 **default**。

3、析构函数

- 析构函数用于在结束程序（比如关闭文件、释放内存等）、垃圾回收之前释放资源。析构函数不能继承或重载。
- 析构函数的名称是在类的名称前加上一个波浪形（~）作为前缀，它不返回值，也不带任何参数。

4、静态类

用static修饰的类，特点：只能包含静态成员，不能被实例化





### 重载

在同一语句块(class或者struct)中，函数（方法）名相同或者参数的数量相同，但参数的类型或顺序不同

**ref，out可以和其他参数作重载，但是两者不可以互相重载**

```c#
static float CalcSum(float f, int a)
{
    return f + a;
}

//ref 和 out

// ref和out 可以理解成 他们也是一种变量类型 所以可以用在重载中 但是 ref和out不能同时修饰
static float CalcSum(ref float f, int a)
{
    return f + a;
}

//ref和out不能互相作重载条件，但是可以和其他类型
//错误 上面有一个static float CalcSum(ref float f, int a)方法了
//static float CalcSum(out float f, int a)
//{
//    f = 10;
//    return f + a;
//}
```



### 重写

C#中的重写, 子类的重写方法需要加上`override`关键字, 父类被重写的方法则如果是普通方法则需要在`virtual`关键字, 如果是抽象方法则加`abstract`

{% tabs %}

<!-- tab C# -->

```c#
namespace Test
{
    public class ShapeA
    {
        // 虚方法
        public virtual void Draw()
        {
            Console.WriteLine("执行基类的画图任务");
        }
    }
    class Circle :ShapeA
    {
        public override void Draw()
        {
            Console.WriteLine("画一个圆形");
        }
    }
    
    abstract class ShapeB
    {
        abstract public void Draw();
    }
    class Rectangle:  ShapeB
    {
        public override void Draw()
        {
            Console.WriteLine("画一个长方形");
        }
    }

    class Program
    {
        static void Main(String[] args)
        {
            ShapeA circle = new Circle();
            ShapeB rect = new Rectangle();
            circle.Draw();
            rect.Draw();
        }
    }
}
```

<!-- endtab -->

{% endtabs %}



### 属性

*属性（Property）是域（Field）的扩展，且可使用相同的语法来访问。它们使用* **访问器（accessors）** *让私有域的值可被读写或操作。*

```c#
using System;
namespace runoob
{
   class Student
   {

      private string code = "N.A";
      private string name = "not known";
      private int age = 0;

      // 声明类型为 string 的 Code 属性
      public string Code
      {
         get
         {
            return code;
         }
         set
         {
            code = value;
         }
      }
   
      // 声明类型为 string 的 Name 属性
      public string Name
      {
         get
         {
            return name;
         }
         set
         {
            name = value;
         }
      }

      // 声明类型为 int 的 Age 属性
      public int Age
      {
         get
         {
            return age;
         }
         set
         {
            age = value;
         }
      }
      public override string ToString()
      {
         return "Code = " + Code +", Name = " + Name + ", Age = " + Age;
      }
    }
    class ExampleDemo
    {
      public static void Main()
      {
         // 创建一个新的 Student 对象
         Student s = new Student();
            
         // 设置 student 的 code、name 和 age
         s.Code = "001";
         s.Name = "Zara";
         s.Age = 9;
         Console.WriteLine("Student Info: {0}", s);
         // 增加年龄
         s.Age += 1;
         Console.WriteLine("Student Info: {0}", s);
         Console.ReadKey();
       }
   }
}
```



### 运算符重载

让自定义类和结构体对象可以进行运算

```c#
public static 返回类型 operator 运算符(参数列表){...}
```

```c#
public static Point operator +(Point p1, int value)
{
    Point p = new Point();
    p.x = p1.x + value;
    p.y = p1.y + value;
    return p;
}

public static Point operator +(int value, Point p1)
{
    Point p = new Point();
    p.x = p1.x + value;
    p.y = p1.y + value;
    return p;
}
```

当重载二元运算符时，参数之一必须包含本身类型，并且根据参数顺序决定左操作数和右操作数。



### 密封类

sealed密封关键字修饰的类，让类无法再被继承

```c#
sealed class Son{
    
}
```



### 显示实现接口

当一个接口中一个方法是protected时，继承的类需要显式实现接口；

当一个类继承两个接口，但是接口中存在着同名方法时，需要显式实现接口。

```c#
interface IAtk
{
    void Atk();
}

interface ISuperAtk
{
    void Atk();
}

class Player : IAtk, ISuperAtk
{
    //显示实现接口 就是用 接口名.行为名 去实现
    void IAtk.Atk()
    {

    }

    void ISuperAtk.Atk()
    {

    }

    public void Atk()
    {

    }
}
```





### 索引器

**索引器（Indexer）** 允许一个对象可以像数组一样使用下标的方式来访问。语法：

```c#
//访问修饰符 返回值 this[参数类型 参数名, 参数类型 参数名.....]{...}
element-type this[int index] 
{
   // get 访问器
   get 
   {
      // 返回 index 指定的值
   }

   // set 访问器
   set 
   {
      // 设置 index 指定的值 
   }
}
```

实例：

```c#
using System;
namespace IndexerApplication
{
   class IndexedNames
   {
      private string[] namelist = new string[size];
      static public int size = 10;
      public IndexedNames()
      {
         for (int i = 0; i < size; i++)
         namelist[i] = "N. A.";
      }
      public string this[int index]
      {
         get
         {
            string tmp;
            if( index >= 0 && index <= size-1 )
            {
               tmp = namelist[index];
            }
            else
            {
               tmp = "";
            }
            return ( tmp );
         }
         set
         {
            if( index >= 0 && index <= size-1 )
            {
               namelist[index] = value;
            }
         }
      }

      static void Main(string[] args)
      {
         IndexedNames names = new IndexedNames();
         names[0] = "Zara";
         names[1] = "Riz";
         names[2] = "Nuha";
         names[3] = "Asif";
         names[4] = "Davinder";
         names[5] = "Sunil";
         names[6] = "Rubic";
         for ( int i = 0; i < IndexedNames.size; i++ )
         {
            Console.WriteLine(names[i]);
         }
         Console.ReadKey();
      }
   }
}
```

当然，索引器（Indexer）可被**重载**。索引器声明的时候也可带有多个参数，且每个参数可以是不同的类型。没有必要让索引器必须是整型的。C# 允许索引器可以是其他类型，例如，字符串类型。

### 泛型

6种泛型约束



|              约束              |            关键字             |
| :----------------------------: | :---------------------------: |
|             值类型             |     where 泛型字母:struct     |
|            引用类型            |     where 泛型字母:class      |
|      存在无参公共构造函数      |     where 泛型字母:new()      |
|     某个类本身或者其派生类     |      where 泛型字母:类名      |
|       某个接口的派生类型       |     where 泛型字母:接口名     |
| 另一个泛型类型本身或者派生类型 | where 泛型字母:另一个泛型字母 |

泛型约束组合使用：

```c#
class Test7<T> where T: class,new()
{

}
```

多个泛型有约束：

```c#
class Test8<T,K> where T:class,new() where K:struct
{

}
```



### 特性

C#的特性类似与Java的注解，它分为*两种类型的特性：**预定义**特性和**自定义**特性。*其中预定义特性:

- AttributeUsage
- Conditional  修饰条件方法，按条件编译
- Obsolete    标记过时

AttributeUsage类似于Java的元注解, 语法：

```c#
[AttributeUsage(
   validon,
   AllowMultiple=allowmultiple,
   Inherited=inherited
)]
```

使用：

```c#
[AttributeUsage(AttributeTargets.Class |
AttributeTargets.Constructor |
AttributeTargets.Field |
AttributeTargets.Method |
AttributeTargets.Property, 
AllowMultiple = true)]
```

**自定义特性**(派生自 **System.Attribute** 类)

```c#
// 一个自定义特性 BugFix 被赋给类及其成员
[AttributeUsage(AttributeTargets.Class |
AttributeTargets.Constructor |
AttributeTargets.Field |
AttributeTargets.Method |
AttributeTargets.Property,
AllowMultiple = true)]

public class DeBugInfo : System.Attribute
{
  private int bugNo;
  private string developer;
  private string lastReview;
  public string message;

  public DeBugInfo(int bg, string dev, string d)
  {
      this.bugNo = bg;
      this.developer = dev;
      this.lastReview = d;
  }

  public int BugNo
  {
      get
      {
          return bugNo;
      }
  }
  public string Developer
  {
      get
      {
          return developer;
      }
  }
  public string LastReview
  {
      get
      {
          return lastReview;
      }
  }
  public string Message
  {
      get
      {
          return message;
      }
      set
      {
          message = value;
      }
  }
}
```



### 反射

```c#
System.Reflection.MemberInfo info = typeof(MyClass);
Type type = typeof(Rectangle);
```

**System.Reflection** 类的 **MemberInfo** 对象需要被初始化，用于发现与类相关的特性（attribute）





### 委托

委托是**函数的容器**，可以理解为表示函数的变量类型，**本质是一个类**，用来定义函数的类型（返回值和参数类型），装载的函数的声明格式必须和委托的声明格式相同（返回值和参数类型），用来 存储、传递函数(方法)

委托声明语法 ：函数声明语法前面加一个`delegate`关键字

```c#
//声明了一个用来装载 返回值为void无参的函数 的委托
delegate void MyFun();

void Fun(){
    Console.WriteLine("fun");
}
MyFun f = new MyFun(Fun);	//实例化委托变量f 装载函数Fun
f.Invoke();					//调用委托的函数

//声明了一个用来装载 返回值为int 参数为int的函数 的委托
delegate T MyFun2(T i);		//委托可以用泛型
int Fun2(int i){
    Console.WriteLine(i);
}
MyFun2 f2 = Fun2;		//装载方式二
f2(1);				//调用方式二
```

委托常用在：

1. 作为类的成员
2. 作为函数的参数

**多播委托**（存储多个函数, **多播委托只能得到封装的最后一个方法的返回值**）

```c#
//声明了一个用来装载 返回值为int无参的函数 的委托
delegate void MyFun();

void Fun(){
    Console.WriteLine("fun");
}
MyFun f = new MyFun(Fun);	//装载函数Fun
f += Fun;

f();	//Fun函数被调用两次，因为委托加了两个Fun函数

f -= Fun;	//移除指定函数
f();		//调用一次Fun函数

f = null	//委托清空
```

 `+=` 的方式为**赋值后的委托变量**添加多个方法（**实例化算赋值，将委托变量=null也算赋值**）

所以一般这样使用：

```c#
//类中声明
public delegate void MyDelegate();  
private MyDelegate1 myDelegate;

//其他地方使用
myDelegate += Func1;
myDelegate += Func2;
```

第一次给委托变量赋值要用 “=”，这里看上去没有给委托赋值，实际上类中的成员变量会被默认初始化，执行了`=null`赋值

**系统自带的委托**

- Action: 无参 **无返回值**的函数委托
- Action<T...>:  多个参数（最多16个） ，**无返回值**的函数委托
- Func<T> : 无参，**返回值为 T** 的泛型函数的委托
- Func<T..., M> : 多个参数（最多16个），**返回值为 M** 的泛型函数的委托

**Unity自带委托**

引入命名空间：using UnityEngine.Events;
定义方式类似：public UnityAction action;
和 C# 的 Action 一样，`UnityAction` 可以引用带有一个 void 返回类型的方法，但是它最多只有4个参数的重载



### 事件

事件是基于委托的存在，他让委托的使用更具有安全性

它只能作为{% label 成员变量 red %}存在于{% label 类、接口和结构体 red %}中

它与委托的区别：（委托是一种类，而事件是类里面的一个成员。）

- 不能在类外部 **赋值**（可以 +- 函数，但是不能直接赋值，可以避免 ` = null`将函数清空）
- 不能在类外部 **调用**

声明语法：

```C#
访问修饰符 event 委托类型 事件名;
```

```c#
class Test{
    //委托声明
    public Action myFun;
    //事件声明
    public event Action myEvent;
    
    public Test(){
        //委托的操作
        myFun = TestFun;
        myFun += TestFun;
        myFun -= TestFun;
        myFun();
        myFun.Invoke();
        myFun = null;
        
        //事件的操作
        myEvent = TestFun;
        myEvent += TestFun;
        myEvent -= TestFun;
        myEvent();
        myEvent.Invoke();
        myEvent = null;
    }
    
    
    public void TestFun(){
        Console.WriteLine("fun");
    }
}
```

事件的声明和使用2：

1.先声明委托：

```c#
public delegate void OnOrderEventHandler(float price);
```

​	注：**如果一个委托是为事件准备的，那么它有一个{% label 命名规范 red %}**，在事件名后加上 EventHandler 。正如刚刚声明的，事件名是 OnOrder，那么为该事件准备的委托就命名为 OnOrderEventHandler

2.然后先声明委托类型的字段，再声明事件，声明事件需使用 event 关键字：

```c#
//声明一个委托字段
private OnOrderEventHandler onOrderEventHandler;
//声明事件的完整格式。可以看出事件是委托字段的一个包装器，正如属性是字段的包装器一样
//因为要让其他类能够访问这个私有委托，所以事件声明为public
public event OnOrderEventHandler OnOrder
{
    add  //添加事件处理器
    {
        onOrderEventHandler += value; //value是关键字，指代之后传进来的事件处理器
    }
    remove  //移除事件处理器
    {
        onOrderEventHandler -= value;
    }
}
```

事件的声明是为**委托字段**提供 add 和 remove 构造器，上面的这些代码都可以浓缩成以下这句：

```c#
public event OnOrderEventHandler OnOrder;
```



### extern关键字

extern 修饰符用于声明在外部实现的方法。 extern 修饰符的常见用法是在使用 Interop 服务调入非托管代码时与 DllImport 特性一起使用。 在这种情况下，还必须将方法声明为 static，如下面的示例所示：

```c#
[DllImport("avifil32.dll")]
private static extern void AVIFileInit();
```

**示例**（https://blog.csdn.net/weixin_43945471/article/details/112473159）

1.创建以下 C 文件并将其命名为 cmdll.c：

```c#
// cmdll.c
// Compile with: -LD
int __declspec(dllexport) SampleMethod(int i)
{
  return i*10;
}
```



2.从 Visual Studio 安装目录打开 Visual Studio x64（或 x32）本机工具命令提示符窗口，并通过在命令提示符处键入“cl -LD cmdll.c”来编译 cmdll.c 文件。

3.在相同的目录中，创建以下 C# 文件并将其命名为 cm.cs：

```c#
// cm.cs
using System;
using System.Runtime.InteropServices;
public class MainClass
{
    [DllImport("Cmdll.dll")]
      public static extern int SampleMethod(int x);

    static void Main()
    {
        Console.WriteLine("SampleMethod() returns {0}.", SampleMethod(5));
    }

}
```


从 Visual Studio 安装目录打开一个 Visual Studio x64（或 x32）本机工具命令提示符窗口，并通过键入以下内容来编译 cm.cs 文件



### this拓展类

```c#
public class User
{
    public string userName;
}
public static class UserEx
{
    public static void say(this User user){
        Console.WriteLine(string.Format("嗨，大家好！大家可以叫我{0}！",  user.userName));
    }
}

class Program
{
    static void Main(string[] args)
    {
        User user = new User();
        user.userName = "userName";
        user.say();
    }
}
```

{% label 静态类静态方法 red %}`say`，会拓展为`User`类的一个**实例方法**

注意：

- 自身方法优先于拓展方法的调用。

- 不能为静态类扩展方法



### ArrayList

本质上是一个**自动扩容**的**object数组**（默认大小4，扩容为原来2倍大小），所以存储值类型的数据时会有**装箱拆箱**发生

### List

本质是一个**可变类型的泛型数组**, 其他和ArrayList一样



### HashTable

底层也是一个自动扩容的object数组（默认大小3，扩容为两倍于原先容量最小的素数：3->7）

Hashtable 采用的是 "**开放定址法**" 处理hash冲突, 具体行为是把 HashOf(k) % Array.Length 改为 (HashOf(k) + d(k)) % Array.Length , 得出另外一个位置来存储key 所对应的数据, d() 是一个增量函数. 如果仍然冲突, 则再次进行增量, 依此循环直到找到一个 Array 中的空位为止。

负载因子0.72，当元素个数超过0.72 * Capacity时，就要扩容，扩容为两倍于原先容量最小的素数：3->7

### Dictionary

可以将Dictionary理解为拥有泛型的Hashtable， 键值对类型从Hashtable的object变为了可以自己制定的泛型。



- [1] 单线程程序中推荐使用 Dictionary, 有泛型优势, 且读取速度较快, 容量利用更充分.
- [2] 多线程程序中推荐使用 Hashtable, 默认的 Hashtable 允许单线程写入, 多线程读取, 对 Hashtable 进一步调用 Synchronized() 方法可以获得完全线程安全的类型. 而 Dictionary 非线程安全, 必须人为使用 lock 语句进行保护, 效率大减.
- [3] Dictionary 有按插入顺序排列数据的特性 (注: 但当调用 Remove() 删除过节点后顺序被打乱), 因此在需要体现顺序的情境中使用 Dictionary 能获得一定方便.
- Dictionary<K,V>是泛型的，当K或V是值类型时，其速度远远超过Hashtable。(避免了装箱拆箱)

我认为应该始终使用Dictionary<K, V>，即使要用Hashtable了，也可以用Dictionary<object, object>来替代。
