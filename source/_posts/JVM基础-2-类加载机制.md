---
title: JVM基础-2-类加载机制
author: chenlf
tags:
  - JVM
categories:
  - java
katex: true
date: 2023-06-01 10:31:39
---

# JVM基础介绍

> 为什么Java是一门跨平台的语言

​	计算机不能直接运行Java代码，因为在cpu层面看来计算机中所有的操作都是一个个指令的运行汇集而成的，java是高级语言，只有人类才能理解其逻辑，计算机是无法识别的，所以一般编程语言都是需要编译器翻译成计算机可以理解的机器语言，而Java是一门跨平台语言离不开JVM虚拟机，Java源码文件首先编译成字节码文件(.class文件), 再由**不同平台的JVM**进行解析使用，**一次编译，到处运行**靠的就是不同平台的JVM解析字节码文件适配不同平台的机器指令

![image.png](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202306011046430.png)



# 类加载子系统

​	Java代码首先需要编译成字节码文件，交由JVM使用，接下来我们来了解JVM是怎么加载的

​	类加载的过程包括了`加载`、`验证`、`准备`、`解析`、`初始化`五个阶段。在这五个阶段中，`加载`、`验证`、`准备`和`初始化`这四个阶段发生的顺序是确定的，而`解析`阶段则不一定，它在某些情况下可以在初始化阶段之后开始，这是为了支持Java语言的**运行时绑定**(也成为动态绑定或晚期绑定)。另外注意这里的几个阶段是*按顺序开始，而不是按顺序进行或完成*，因为这些阶段通常都是互相交叉地混合进行的，通常在一个阶段执行的过程中调用或激活另一个阶段。

![image.png](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202306011052321.png)

## 类的加载阶段

加载时类加载过程的第一个阶段，在加载阶段，虚拟机需要完成以下三件事情:

- 通过一个类的全限定名来获取其定义的二进制字节流。
- 将这个字节流所代表的静态存储结构转化为方法区的运行时数据结构。
- 在Java堆中生成一个代表这个类的java.lang.Class对象，作为对方法区中这些数据的访问入口。

![img](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202306011057897.png)

​	相对于类加载的其他阶段而言，**加载阶段**(准确地说，是***加载阶段获取类的二进制字节流的动作***)是可控性最强的阶段，因为开发人员既可以使用系统提供的类加载器来完成加载，也可以自定义自己的类加载器来完成加载。

​	类加载器并不需要等到某个类被“首次主动使用”时再加载它，JVM规范允许类加载器在预料某个类将要被使用时就预先加载它，如果在预先加载的过程中遇到了.class文件缺失或存在错误，类加载器必须在程序首次主动使用该类时才报告错误(LinkageError错误)如果这个类一直没有被程序主动使用，那么类加载器就不会报告错误。

> 加载.class文件的方式

- 从本地系统中直接加载
- 通过网络下载.class文件
- 从zip，jar等归档文件中加载.class文件
- 从专有数据库中提取.class文件
- 将Java源文件动态编译为.class文件



## 类的链接阶段

链接阶段分为三个子阶段： 验证 - > 准备 - > 解析

### 验证：

- 目的是为了确保Class文件的字节流中包含的信息符合当前虚拟机的要求，并且不会危害虚拟机自身的安全。
- 主要包含四个阶段的检验动作：文件格式验证，元数据验证，字节码验证，符号引用验证

### 准备：

1. **为{% label 类变量 %}（static变量）分配内存并设置该类变量的{% label 默认初始值 %}**
2. 这里不包括final修饰的类变量，因为{% label 同时 %}被`static`和`final`修饰的常量，必须在声明的时候就为其显式地赋值，否则编译时不通过

举例：

```java
public static int a = 3;
public static String b = new String("b");
```

这个阶段`a`的值为0，只有在初始化阶段才会执行a=3

### 解析：

1. **将常量池内的符号引用转换为直接引用的过程**
2. 实际上，解析操作往往是在JVM执行完初始化操作之后才执行
3. 符号引用就是一组符号来描述目标，直接引用则是直接指向目标的指针、相对偏移量或者一个间接定位到目标的句柄
4. 解析动作主要针对`类`或``接口`、`字段`、`类方法`、`接口方法`、`方法类型`、`方法句柄`和`调用点`限定符7类符号引用进行，对应常量池中的CONSTANT Class info、CONSTANT Fieldref info等

## 类的初始化阶段

### 类初始化时机

只有当对类的主动使用的时候才会导致类的初始化，类的主动使用包括以下六种:

- 创建类的实例，也就是new的方式
- 访问某个类或接口的静态变量，或者对该静态变量赋值
- 调用类的静态方法
- 反射(如Class.forName("com.pdai.jvm.Test"))
- 初始化某个类的子类，则其父类也会被初始化
- Java虚拟机启动时被标明为启动类的类(Java Test)，直接使用java.exe命令来运行某个主类
- JDK7开始提供的动态语言支持： Java.lang.invoke.MethodHandle实例的解析结果REF_getStatic、REF_putStatic、REF_invokeStatic句柄对应的类没有初始化则初始化

除了以上7种情况，其他使用Java类的方法都被看做是对类的**被动使用**，都不会导致类的初始化，即不会执行初始化阶段（clinit()方法和init()方法）

### 执行类构造器<clinit>()方法的过程

- 对类的静态变量初始化为指定的值，执行静态代码块
- 初始化的时候发现其父类未初始化，则先触发父类的初始化
- 虚拟机会保证一个类的<clinit>方法在多线程环境下被正确的加锁和同步
- 当访问一个Java类的静态域时，只有真正声明这个域的类才会被初始化

## 触发类加载的时机

类加载主要分为隐式加载和显示加载

### 隐式加载

- 创建类对象
- 使用类的静态域
- 创建子类对象
- 使用子类的静态域
- 在JVM启动时，BootStrapLoader会加载一些JVM自身运行所需的class
- 在JVM启动时，ExClassLoader会加载指定目录下一些特殊的class
- 在JVM启动时，AppClassLoader会加载classpath路径下的class，以及main函数所在的类的class文件

### 显式加载

- ClassLoader.loadClass(classname):只加载和链接，不会初始化
- Class.forName(String name, boolean initialize, ClassLoader loader):使用ClassLoader进行加载和链接，根据参数initialize决定是否初始化

## 类加载后的情况

- 类加载完成主要包括**类信息**和**类Class对象**， 其中类信息保存在方法区中，类Class对象保存在堆区中。
- 类信息主要包含运行时常量池、类型信息、字段信息、方法信息、类加载器的引用、对应class实例的引用等信息
- 类加载器的引用：这个类到类加载器的引用
- 对应class实例的引用：类加载器在加载类信息放到方法区中后，会创建一个对应的class类型的对象实例放到堆中，作为开发人员访问方法区类定义的入口和切入点

> 以上类加载过程，涉及到的都是**类信息**，以及**类属性**，请勿和成员属性混淆，目前只是完成了类模板加载，而没有开始创建对象



## 类加载器

1. JVM严格来讲支持两种类型的类加载器。分别为引导类加载器（Bootstrap ClassLoader）和自定义类加载器（User-Defined ClassLoader）
2. JVM虚拟机规范将所有**派生于抽象类ClassLoader的类加载器都划分为了自定义类加载器**

![img](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202306011514611.png)

### 启动类加载器

1. 这个类加载使用**C/C++语言**实现的，嵌套在JVM内部
2. 它用来加载Java的核心库(JAVA_HOME/jire/lib/rt.jar、resources.jar或sun.boot.class.path容)，用于提供JVM自身需要的类
3. 并不继承自java.lang.ClassLoader，没有父加载器
4. 加载扩展类和应用程序类加载器，并作为他们的父类加载器
5. 出于安全考虑，Bootstrap启动类加载器只加载包名为java、javax、sun等开头的类

### 扩展类加载器

1. Java语言编写，由sun.misc.Launcher$ExtClassLoader实现
2. 派生于ClassLoader类
3. 父类加载器为启动类加载器
4. 从java.ext.dirs系统属性所指定的目录中加载类库，或从JDK的安装目录的jre/lib/ext子目录(扩展目录)下加载类库。如果用户创建的JAR放在此目录下，也会自动由扩展类加载器加载

### 应用程序类加载器

1. Java语言编写，由sun.misc.LaunchersAppClassLoader实现
2. 派生于ClassLoader类
3. 父类加载器为扩展类加载器
4. 它负责加载环境变量classpath或系统属性java.class.path指定路径下的类库
5. 该类加载器是**程序中默认的类加载器**，一般来说，Java应用的类都是由它来完成加载
6. 通过classLoader.getSystemclassLoader)方法可以获取到该类加载器

### 用户自定义类加载器

​	在Java的日常应用程序开发中，类的加载几乎是由上述3种类加载器相互配合执行的，在必要时，我们还可以自定义类加载器，来定制类的加载方式。那为什么还需要自定义类加载器?

1.  **隔离加载类**(比如说我假设现在Spring框架，和RocketMQ有包名路径完全一样的类，类名也一样，这个时候类就冲突了。不过一般的主流框架和中间件都会自定义类加载器，实现不同的框架，中间件之间是隔离的)，比如tomcat中可以部署两个相同的war包，比如需要用到热部署
2. 改类加载的方式
3. **扩展加载源** (还可以考虑从数据库中加载类，路由器等等不同的地方)

4. **防止源码泄漏**(对字节码文件进行解密，自己用的时候通过自定义类加载器来对其进行解密)



> 如何实现我们的自定义加载器呢?

   继承我们的ClassLoader类

```java
public class MyClassLoader extends ClassLoader {

    private String root;

    protected Class<?> findClass(String name) throws ClassNotFoundException {
        byte[] classData = loadClassData(name);
        if (classData == null) {
            throw new ClassNotFoundException();
        } else {
            return defineClass(name, classData, 0, classData.length);
        }
    }

    private byte[] loadClassData(String className) {
        String fileName = root + File.separatorChar
                + className.replace('.', File.separatorChar) + ".class";
        try {
            InputStream ins = new FileInputStream(fileName);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            int bufferSize = 1024;
            byte[] buffer = new byte[bufferSize];
            int length = 0;
            while ((length = ins.read(buffer)) != -1) {
                baos.write(buffer, 0, length);
            }
            return baos.toByteArray();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }

    public String getRoot() {
        return root;
    }

    public void setRoot(String root) {
        this.root = root;
    }

    public static void main(String[] args)  {

        MyClassLoader classLoader = new MyClassLoader();
        classLoader.setRoot("D:\\temp");

        Class<?> testClass = null;
        try {
            testClass = classLoader.loadClass("com.pdai.jvm.classloader.Test2");
            Object object = testClass.newInstance();
            System.out.println(object.getClass().getClassLoader());
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        } catch (InstantiationException e) {
            e.printStackTrace();
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        }
    }
}
```

自定义类加载器的核心在于对字节码文件的获取，如果是加密的字节码则需要在该类中对文件进行解密。由于这里只是演示，我并未对class文件进行加密，因此没有解密的过程。

**这里有几点需要注意** :

1、这里传递的文件名需要是类的全限定性名称，即`com.pdai.jvm.classloader.Test2`格式的，因为 defineClass 方法是按这种格式进行处理的。

2、最好不要重写loadClass方法，因为这样容易破坏双亲委托模式。

3、这类Test 类本身可以被 AppClassLoader 类加载，因此我们不能把com/pdai/jvm/classloader/Test2.class 放在类路径下。否则，由于双亲委托机制的存在，会直接导致该类由 AppClassLoader 加载，而不会通过我们自定义类加载器来加载。



## 类加载机制

- `全盘负责`，当一个类加载器负责加载某个Class时，该Class所依赖的和引用的其他Class也将由该类加载器负责载入，除非显示使用另外一个类加载器来载入

- `父类委托`，先让父类加载器试图加载该类，只有在父类加载器无法加载该类时才尝试从自己的类路径中加载该类

- `缓存机制`，缓存机制将会保证所有加载过的Class都会被缓存，当程序中需要使用某个Class时，类加载器先从缓存区寻找该Class，只有缓存区不存在，系统才会读取该类对应的二进制数据，并将其转换成Class对象，存入缓存区。这就是为什么修改了Class后，必须重启JVM，程序的修改才会生效

- `双亲委派机制`, 如果一个类加载器收到了类加载的请求，它首先不会自己去尝试加载这个类，而是把请求委托给父加载器去完成，依次向上，因此，所有的类加载请求最终都应该被传递到顶层的启动类加载器中，只有当父加载器在它的搜索范围中没有找到所需的类时，即无法完成该加载，子加载器才会尝试自己去加载该类。

![image.png](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202306011540302.png)

通过上面的例子，我们可以知道，双亲机制优点

1. 避免类的重复加载
2. 保护程序安全，防止核心API被随意簋改

### 打破双亲委派机制

#### tomcat打破双亲委派机制

​	同一个Tomcat中，可以部署多个web项目，多个web项目中，会用到相同的类但是可能版本不同，为此Tomcat采用了用户自定义classloader，不同的web包采用不同的classloader，打破了双亲委派机制。

#### spi打破双亲委派机制

​	spi依赖`java.util.ServiceLoader`来加载扩展类，但是该包是在java下的，采用引导类加载器。而需要的实现类都是用户实现的，需要使用系统类加载器。违背了双亲委派原则。为此， java采用了线程上下文类加载器的方式`Thread.currentThread( ).getContextClassLoader(Q)`，来获取系统类加载器，加载实现类，打破双亲委派



## 类加载器的使用

1．源代码加密，解密。
2．热加载原理:我们知道类只会加载一次，如何做到热更新?  检测到代码变动，直接替换新的类加载器，这样所有类就会重新加载最新的。



## 参考文章

------

[JVM 基础 - Java 类加载机制 | Java 全栈知识体系 (pdai.tech)](https://www.pdai.tech/md/java/jvm/java-jvm-classload.html)

[JVM加载与内存 (yuque.com)](https://www.yuque.com/snab/java/vc16a0)

