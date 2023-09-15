---
title: Spring面试题
author: chenlf
tags:
  - Spring
  - SpringBoot
  - 面试题
categories:
  - Java
  - 面试题
katex: true
date: 2023-09-10 15:20:53
---

### {% hideToggle ❤️Spring AOP的实现原理和场景 %}

{% tabs %}

<!-- tab 实现原理 -->

AOP（这里的AOP指的是面向切面编程思想，而不是Spring AOP）主要的的实现技术主要有Spring AOP和AspectJ。

- AspectJ的底层技术。

  ​	AspectJ的底层技术是静态代理，即用一种AspectJ支持的特定语言编写切面，通过一个命令来编译，生成一个新的代理类，该代理类增强了业务类，这是在**编译时增强**，相对于下面说的运行时增强，编译时增强的性能更好。 

- Spring AOP

  ​	Spring AOP采用的是**动态代理**，在运行期间对业务方法进行增强，所以不会生成新类，对于动态代理技术，Spring AOP提供了对**JDK动态代理**的支持以及**CGLib**的支持。
  
	​	<u>JDK动态代理只能为接口创建动态代理实例</u>，而不能对类创建动态代理。需要获得被目标类的接口信息（应用Java的反射技术），生成一个实现了代理接口的动态代理类（字节码），再通过反射机制获得动态代理类的构造函数，利用构造函数生成动态代理类的实例对象，在调用具体方法前调用invokeHandler方法来处理。
  
	​	对类创建动态代理，CGLib动态代理需要依赖asm包，把被代理对象类的class文件加载进来，修改其字节码生成子类。
  
  ​	但是Spring AOP基于注解配置的情况下，需要依赖于AspectJ包的标准注解。

<!-- endtab -->

<!-- tab 场景 -->

事务管理、安全检查、权限控制、数据校验、缓存、对象池管理等

<!-- endtab -->

{% endtabs %}

{% endhideToggle %}

