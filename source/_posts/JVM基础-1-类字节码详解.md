---
title: JVM基础-1-类字节码详解
tags: JVM
categories:
  - Java
abbrlink: eb343e98
author: chenlf
date: 2023-05-25 14:41:45
---

## Java字节码文件

class文件本质上是一个以8位字节为基础单位的二进制流，各个数据项目严格按照**顺序**紧凑的排列在class文件中。jvm根据其特定的**规则**解析该二进制数据，从而得到相关信息。

Class文件采用一种伪结构来存储数据，它有两种类型：无符号数和表

| 数据类型 | 定义                                                         | 说明                                                         |
| -------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 无符号数 | 无符号数可以用来描述数字、索引引用、数量值或按照utf-8编码构成的字符串值。 | 其中无符号数属于基本的数据类型。 以u1、u2、u4、u8来分别代表1个字节、2个字节、4个字节和8个字节 |
| 表       | 表是由多个无符号数或其他表构成的复合数据结构。               | 所有的表都以“**_info**”结尾。 由于表没有固定长度，所以通常会在其前面加上**两个字节作为个数说明**。 |

## Class文件的结构属性

从字节码文件中我们可以看到一堆的16进制字节，要想解读它就需要了解它排列的规则：

| 类型 | 名称 | 说明 | 长度 |
| ---- | ---- | ---- | ---- |
|u4|	magic|	魔数，识别Class文件格式|	4个字节|
|u2|	minor_version|	副版本号|	2个字节|
|u2|	major_version|	主版本号|	2个字节|
|u2|	constant_pool_count|	常量池计算器|	2个字节|
|cp_info|	constant_pool|	常量池|	n个字节|
|u2|	access_flags|	访问标志|	2个字节|
|u2|	this_class|	类索引|	2个字节|
|u2|	super_class|	父类索引|	2个字节|
|u2|	interfaces_count|	接口计数器|	2个字节|
|u2|	interfaces|	接口索引集合|	2个字节|
|u2|	fields_count|	字段个数|	2个字节|
|field_info|	fields|	字段集合|	n个字节|
|u2|	methods_count|	方法计数器|	2个字节|
|method_info|	methods|	方法集合|	n个字节|
|u2|	attributes_count|	附加属性计数器|	2个字节|
|attribute_info|	attributes|	附加属性集合|	n个字节|

从整体看下java字节码文件包含了哪些类型的数据：

![img](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202305251510478.png)

##　从一个例子开始

```java
//Main.java
public class Main {
    
    private int m;
    
    public int inc() {
        return m + 1;
    }
}
```

通过以下命令, 可以在当前所在路径下生成一个Main.class文件。

```sh
javac Main.java
```

以文本的形式打开生成的class文件，内容如下:

```sh
cafe babe 0000 0037 0013 0a00 0400 0f09
0003 0010 0700 1107 0012 0100 016d 0100
0149 0100 063c 696e 6974 3e01 0003 2829
5601 0004 436f 6465 0100 0f4c 696e 654e
756d 6265 7254 6162 6c65 0100 0369 6e63
0100 0328 2949 0100 0a53 6f75 7263 6546
696c 6501 0009 4d61 696e 2e6a 6176 610c
0007 0008 0c00 0500 0601 0004 4d61 696e
0100 106a 6176 612f 6c61 6e67 2f4f 626a
6563 7400 2100 0300 0400 0000 0100 0200
0500 0600 0000 0200 0100 0700 0800 0100
0900 0000 1d00 0100 0100 0000 052a b700
01b1 0000 0001 000a 0000 0006 0001 0000
0002 0001 000b 000c 0001 0009 0000 001f
0002 0001 0000 0007 2ab4 0002 0460 ac00
0000 0100 0a00 0000 0600 0100 0000 0700
0100 0d00 0000 0200 0e
```

> 使用到java内置的一个反编译工具javap可以反编译字节码文件, 用法: `javap <options> <classes>`

其中`<options>`选项包括:

```sh
  -help  --help  -?        输出此用法消息
  -version                 版本信息
  -v  -verbose             输出附加信息
  -l                       输出行号和本地变量表
  -public                  仅显示公共类和成员
  -protected               显示受保护的/公共类和成员
  -package                 显示程序包/受保护的/公共类
                           和成员 (默认)
  -p  -private             显示所有类和成员
  -c                       对代码进行反汇编
  -s                       输出内部类型签名
  -sysinfo                 显示正在处理的类的
                           系统信息 (路径, 大小, 日期, MD5 散列)
  -constants               显示最终常量
  -classpath <path>        指定查找用户类文件的位置
  -cp <path>               指定查找用户类文件的位置
  -bootclasspath <path>    覆盖引导类文件的位置
```

输入命令`javap -verbose -p Main.class`查看输出内容:

```java
Classfile /C:/Users/admin/Desktop/新建文件夹/Main.class
  Last modified 2023年5月25日; size 265 bytes
  MD5 checksum dff0ded3158a1465a00d50702c4b25d3
  Compiled from "Main.java"
public class Main
  minor version: 0
  major version: 55
  flags: (0x0021) ACC_PUBLIC, ACC_SUPER
  this_class: #3                          // Main
  super_class: #4                         // java/lang/Object
  interfaces: 0, fields: 1, methods: 2, attributes: 1
Constant pool:
   #1 = Methodref          #4.#15         // java/lang/Object."<init>":()V
   #2 = Fieldref           #3.#16         // Main.m:I
   #3 = Class              #17            // Main
   #4 = Class              #18            // java/lang/Object
   #5 = Utf8               m
   #6 = Utf8               I
   #7 = Utf8               <init>
   #8 = Utf8               ()V
   #9 = Utf8               Code
  #10 = Utf8               LineNumberTable
  #11 = Utf8               inc
  #12 = Utf8               ()I
  #13 = Utf8               SourceFile
  #14 = Utf8               Main.java
  #15 = NameAndType        #7:#8          // "<init>":()V
  #16 = NameAndType        #5:#6          // m:I
  #17 = Utf8               Main
  #18 = Utf8               java/lang/Object
{
  private int m;
    descriptor: I
    flags: (0x0002) ACC_PRIVATE

  public Main();
    descriptor: ()V
    flags: (0x0001) ACC_PUBLIC
    Code:
      stack=1, locals=1, args_size=1
         0: aload_0
         1: invokespecial #1                  // Method java/lang/Object."<init>":()V
         4: return
      LineNumberTable:
        line 2: 0

  public int inc();
    descriptor: ()I
    flags: (0x0001) ACC_PUBLIC
    Code:
      stack=2, locals=1, args_size=1
         0: aload_0
         1: getfield      #2                  // Field m:I
         4: iconst_1
         5: iadd
         6: ireturn
      LineNumberTable:
        line 7: 0
}
SourceFile: "Main.java"
```

反编译的内容不是按照字节码内容的顺序显示的, 接下来我们字节码文件的内容, 对应着反编译的内容

### 字节码分析

#### 魔数和版本号

> cafe babe

字节码文件开头的4个字节("cafe babe")称之为 `魔数`，唯有以"cafe babe"开头的class文件方可被虚拟机所接受，这4个字节就是字节码文件的身份识别。

> 0000 0037

0000是编译器jdk版本的次版本号0，0034转化为十进制是52,是主版本号，java的版本号从45开始，除1.0和1.1都是使用45.x外,以后每升一个大版本，版本号加一。也就是说，编译生成该class文件的jdk版本为1.8.0。

#### 常量池

> ​                                       0013 0a00 0400 0f09
> 0003 0010 0700 1107 0012 0100 016d 0100
> 0149 0100 063c 696e 6974 3e01 0003 2829
> 5601 0004 436f 6465 0100 0f4c 696e 654e
> 756d 6265 7254 6162 6c65 0100 0369 6e63
> 0100 0328 2949 0100 0a53 6f75 7263 6546
> 696c 6501 0009 4d61 696e 2e6a 6176 610c
> 0007 0008 0c00 0500 0601 0004 4d61 696e
> 0100 106a 6176 612f 6c61 6e67 2f4f 626a
> 6563 74

按照上面提供的顺序，现在到了常量池部分，因为常量池是`表`结构，所以前两个字节用来表示数量，其值为`0x0013`,掐指一算，也就是19。需要注意的是，经过javap编译文件可以发现实际上只有18项常量。为什么呢？

> 通常我们写代码时都是从0开始的，但是这里的常量池却是从1开始，因为它把第0项常量空出来了。这是为了在于满足后面某些指向常量池的索引值的数据在特定情况下需要表达“**不引用任何一个常量池项目**”的含义，这种情况可用索引值0来表示。
>
> Class文件中**只有常量池的容量计数是从1开始的**，对于其他集合类型，包括接口索引集合、字段表集合、方法表集合等的容量计数都与一般习惯相同，是从0开始的。

##### 常量池解读前置知识

###### 字面量和符号引用

常量池主要存放两大类常量：`字面量`和`符号引用`。如下表：

| 常量     | 符号引用                                                     |
| -------- | ------------------------------------------------------------ |
| 字面量   | 文本字符串、声明为final的常量值                              |
| 符号引用 | 类和接口的全限定名(Fully Qualified Name) 、字段的名称、描述符号(Descriptor) 方法的名称和描述符 |

###### 描述符

描述符的作用是用来描述字段的数据类型、方法的参数列表（包括数量、类型以及顺序）和返回值。描述符规则如下:

| 标志符 |             含义             |
| :----: | :--------------------------: |
|   B    |       基本数据类型byte       |
|   C    |       基本数据类型char       |
|   D    |      基本数据类型double      |
|   F    |      基本数据类型float       |
|   I    |       基本数据类型int        |
|   J    |       基本数据类型long       |
|   S    |      基本数据类型short       |
|   Z    |     基本数据类型boolean      |
|   V    |       基本数据类型void       |
|   L    | 对象类型,如Ljava/lang/Object |

对于数组类型，每一维度将使用一个前置的`[`字符来描述，如一个定义为`java.lang.String[][]` 类型的二维数组，将被记录为：`[[Ljava/lang/String`;，，一个整型数组`int[]`被记录为`[I`。

用描述符来描述方法时，按照先参数列表，后返回值的顺序描述，参数列表按照参数的严格顺序放在一组小括号“( )”之内。如方法`java.lang.String toString()`的描述符为`( ) LJava/lang/String`;，方法`int abc(int[] x, int y)`的描述符为`([II) I`。

###### 常量类型

常量池中的每一项都是一个表，其项目类型共有14种，如下表格所示：

|               类型               | 标志 |          描述          |
| :------------------------------: | :--: | :--------------------: |
|        CONSTANT_utf8_info        |  1   |   UTF-8编码的字符串    |
|      CONSTANT_Integer_info       |  3   |       整形字面量       |
|       CONSTANT_Float_info        |  4   |      浮点型字面量      |
|        CONSTANT_Long_info        |  5   |      长整型字面量      |
|       CONSTANT_Double_info       |  6   |   双精度浮点型字面量   |
|       CONSTANT_Class_info        |  7   |   类或接口的符号引用   |
|       CONSTANT_String_info       |  8   |    字符串类型字面量    |
|      CONSTANT_Fieldref_info      |  9   |     字段的符号引用     |
|     CONSTANT_Methodref_info      |  10  |   类中方法的符号引用   |
| CONSTANT_InterfaceMethodref_info |  11  |  接口中方法的符号引用  |
|    CONSTANT_NameAndType_info     |  12  |  字段或方法的符号引用  |
|    CONSTANT_MethodHandle_info    |  15  |      表示方法句柄      |
|     CONSTANT_MothodType_info     |  16  |      标志方法类型      |
|   CONSTANT_InvokeDynamic_info    |  18  | 表示一个动态方法调用点 |

###### 常量结构

这14种类型的结构各不相同，如下表格所示：

![常量池中常量项的结构总表.png](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202305251658814.png)

从上表可以看出标志最大只有18, 所以常量池中的每一项只要前一个字节作为标志位就可以来表示常量的类型了

##### 常量解读

> 第一个常量`0a00 0400 0f`

首先标志位`0a`表示`10`, 对应的类型为`CONSTANT_Methodref_info`,即类中方法的符号引用,  其结构为:

![CONSTANT_Methodref_info的结构.png](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202305251700869.png)

即后面4个字节为他的内容, 分别是两个***索引项***:

其中前两位的值为`0x0004`,即4，指向常量池第4项的索引；
后两位的值为`0x000f`,即15，指向常量池第15项的索引。

> 第二个常量 `09 0003 00`

其标志位的值为0x09，即9，查上面的表格可知，其对应的项目类型为CONSTANT_Fieldref_info，即字段的符号引用。其结构为：

![CONSTANT_Fieldref_info的结构.png](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202305251704570.png)

同样也是4个字节，前后都是两个索引。分别指向第4项的索引和第10项的索引。

后面还有16项常量就不一一去解读了



#### 访问标志

常量池后面就是访问标志，用两个字节来表示，其标识了类或者接口的访问信息，比如：该Class文件是类还是接口，是否被定义成`public`，是否是`abstract`，如果是类，是否被声明成`final`等等。各种访问标志如下所示：

| 标志名称       | 标志值 | 含义                                                         |
| -------------- | ------ | ------------------------------------------------------------ |
| ACC_PUBLIC     | 0x0001 | 是否为Public类型                                             |
| ACC_FINAL      | 0x0010 | 是否被声明为final，只有类可以设置                            |
| ACC_SUPER      | 0x0020 | 是否允许使用invokespecial字节码指令的新语义．                |
| ACC_INTERFACE  | 0x0200 | 标志这是一个接口                                             |
| ACC_ABSTRACT   | 0x0400 | 是否为abstract类型，对于接口或者抽象类来说，次标志值为真，其他类型为假 |
| ACC_SYNTHETIC  | 0x1000 | 标志这个类并非由用户代码产生                                 |
| ACC_ANNOTATION | 0x2000 | 标志这是一个注解                                             |
| ACC_ENUM       | 0x4000 | 标志这是一个枚举                                             |

> 00 21

0021 其值是 0020 和0001的并集 , 所以该类的访问标志是ACC_PUBLIC, ACC_SUPER

其他需要字节码结构就不一一分析了, 有兴趣具体可以看这篇[字节码文件详解]([(80条消息) 字节码文件详解_字节码详解_xlshi1996的博客-CSDN博客](https://blog.csdn.net/qq_47902348/article/details/109253735))

### 反编译文件内容

#### 常量池

```java
	#1 = Methodref          #4.#15         // java/lang/Object."<init>":()V
    #4 = Class              #18            // java/lang/Object
    #7 = Utf8               <init>
   	#8 = Utf8               ()V
    #15 = NameAndType        #7:#8          // "<init>":()V
    #18 = Utf8               java/lang/Object
```

**第一个常量**是一个方法定义，指向了第4和第15个常量。以此类推查看第4和第15个常量。最后可以拼接成第一个常量右侧的注释内容:

```java
java/lang/Object."<init>":()V
```

这段可以理解为该类的实例构造器的声明，由于Main类没有重写构造方法，所以调用的是父类的构造方法。此处也说明了Main类的直接父类是Object。 该方法默认返回值是V, 也就是void，无返回值。

**第二个常量**同理可得:

```java
    #2 = Fieldref           #3.#16         // Main.m:I
    #3 = Class              #17            // Main
    #5 = Utf8               m
    #6 = Utf8               I
    #16 = NameAndType       #5:#6          // m:I
    #17 = Utf8              Main
```

#### 方法表集合

在常量池之后的是对类内部的方法描述，在字节码中以表的集合形式表现，暂且不管字节码文件的16进制文件内容如何，我们直接看反编译后的内容。

```java
private int m;
    descriptor: I
    flags: (0x0002) ACC_PRIVATE
```

此处声明了一个私有变量m，类型为int，返回值为int

```java
 public Main();
    descriptor: ()V
    flags: (0x0001) ACC_PUBLIC
    Code:
      stack=1, locals=1, args_size=1
         0: aload_0
         1: invokespecial #1                  // Method java/lang/Object."<init>":()V
         4: return
      LineNumberTable:
        line 2: 0
```

这里是构造方法：Main()，返回值为void, 公开方法。

code内的主要属性为:

- **stack**: 最大操作数栈，JVM运行时会根据这个值来分配栈帧(Frame)中的操作栈深度,此处为1
- **locals**: 局部变量所需的存储空间，单位为Slot, Slot是虚拟机为局部变量分配内存时所使用的最小单位，为4个字节大小。方法参数(包括实例方法中的隐藏参数this)，显示异常处理器的参数(try catch中的catch块所定义的异常)，方法体中定义的局部变量都需要使用局部变量表来存放。值得一提的是，locals的大小并不一定等于所有局部变量所占的Slot之和，因为局部变量中的Slot是可以重用的。
- **args_size**: 方法参数的个数，这里是1，因为每个实例方法都会有一个隐藏参数this
- **attribute_info**: 方法体内容，0,1,4为字节码"行号"，该段代码的意思是将第一个引用类型本地变量推送至栈顶，然后执行该类型的实例方法，也就是常量池存放的第一个变量，也就是注释里的`java/lang/Object."":()V`, 然后执行返回语句，结束方法。
- **LineNumberTable**: 该属性的作用是描述源码行号与字节码行号(字节码偏移量)之间的对应关系。可以使用 -g:none 或-g:lines选项来取消或要求生成这项信息，如果选择不生成LineNumberTable，当程序运行异常时将无法获取到发生异常的源码行号，也无法按照源码的行数来调试程序。
- **LocalVariableTable**: 该属性的作用是描述帧栈中局部变量与源码中定义的变量之间的关系。可以使用 -g:none 或 -g:vars来取消或生成这项信息，如果没有生成这项信息，那么当别人引用这个方法时，将无法获取到参数名称，取而代之的是arg0, arg1这样的占位符。 start 表示该局部变量在哪一行开始可见，length表示可见行数，Slot代表所在帧栈位置，Name是变量名称，然后是类型签名。

同理可以分析Main类中的另一个方法"inc()":

方法体内的内容是：将this入栈，获取字段#2并置于栈顶, 将int类型的1入栈，将栈内顶部的两个数值相加，返回一个int类型的值。

#### 类名

最后很显然是源码文件：

```java
SourceFile: "Main.java"
```





## 参考文章

https://www.pdai.tech/md/java/jvm/java-jvm-class.html

[字节码文件详解_字节码详解_xlshi1996的博客-CSDN博客](https://blog.csdn.net/qq_47902348/article/details/109253735)
