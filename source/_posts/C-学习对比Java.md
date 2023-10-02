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
- const修饰的变量不能再用`static`变量进行修饰，并且其只能在字段的声明中初始化，const的原理是在编译期直接对变量值进行替换的。所以虽然他没有被`static`变量修饰，但他还是一个静态变量可以被`类名.`直接调用

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

在 C# 中，结构体是**值类型**数据结构。它使得一个单一变量可以存储各种数据类型的相关数据。

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

- public：访问不受限制; 
- **Internal：修饰符号是internal表明在当前命名空间内可以实现对类的调用。** 类似Java的default，命名空间类似Java的包的概念
- protected：访问仅限于包含类或从包含类派生的类型，只有包含该成员的类以及继承的类可以存取 protected internal：访问仅限于当前程序集或从包含类派生的类型;
- private：访问仅限于包含类型。只有包含该成员的类可以存取。

2、默认修饰符

- C#类的默认访问标识符是 **internal**，成员的默认访问标识符是 **private**。
- Java类的默认访问标识符是 **default**，成员的默认访问标识符是 **default**。

3、析构函数

- 析构函数用于在结束程序（比如关闭文件、释放内存等）之前释放资源。析构函数不能继承或重载。
- 析构函数的名称是在类的名称前加上一个波浪形（~）作为前缀，它不返回值，也不带任何参数。



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



### 索引器

**索引器（Indexer）** 允许一个对象可以像数组一样使用下标的方式来访问。语法：

```c#
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



### 委托

委托是**函数的容器**，可以理解为表示函数的变量类型，**本质是一个类**，用来定义函数的类型（返回值和参数类型），装载的函数的声明格式必须和委托的声明格式相同（返回值和参数类型）

委托声明语法 ：函数声明语法前面加一个`delegate`关键字

```c#
//声明了一个用来装载 返回值为int无参的函数 的委托
delegate void MyFun();

void Fun(){
    Console.WriteLine("fun");
}
MyFun f = new MyFun(Fun);	//装载函数Fun
f.Invoke();					//调用委托的函数

//声明了一个用来装载 返回值为int无参的函数 的委托
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

**多播委托**（存储多个函数）

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

**系统自带的委托**

- Action: 无参 **无返回值**的函数委托
- Action<T...>:  多个参数 ，**无返回值**的函数委托
- Func<T> : 无参，**返回值为 T** 的泛型函数的委托
- Func<T..., M> : 多个参数，**返回值为 M** 的泛型函数的委托



### 事件

事件是基于委托的存在，他让委托的使用更具有安全性

它只能作为成员变量存在于{% label 类、接口和结构体 red %}中

它与委托的区别：

- 不能在类外部 **赋值**（可以 +- 函数，但是不能直接赋值，可以避免 ` = null`将函数清空）
- 不能在类外部 **调用**

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
