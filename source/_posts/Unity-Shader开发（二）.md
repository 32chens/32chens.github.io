---
title: Unity-Shader开发（二）
author: chenlf
tags:
  - null
categories:
  - null
katex: true
date: 2023-12-17 14:15:57n
---

# 基础数学

## Mathf

Math是C#封装的一个类，Mathf是Unity中封装的工具结构体，不仅包含了Math中的方法，还多了一些适用于游戏开发的方法

- CeilToInt：向上取整	Mathf.CeilToInt(1.3f) == 2

- FloorToInt：向下取整      Mathf.CeilToInt(1.3f) == 1

- Clamp：钳制函数            Mathf.Clamp(10, 11, 20) == 11    Mathf.Clamp(21, 11, 20) == 20

- Pow：一个数的n次方         Mathf.Pow(2, 3) == 8

- RoundToInt：四舍五入      Mathf.RoundToInt(1.5f) == 2

- Sqrt：开平方根                  Mathf.Sqrt(4) == 2

- IsPowerOfTwo：是否是2的n次方 Mathf.IsPowerOfTwo(4) == true

- Sign：判断正负数              Mathf.Sign(10) == 1   Mathf.Sign(-3) == -1

- {% label Lerp red %}：插值运算`Mathf.Clamp(start, end, t)` 公式—— **result = start + (end-start) * t**

  - 用法一：先快后慢，无限接近
    start = Mathf.Lerp(start, 10, Time.deltaTime)
  - 用法二：匀速变化，t>=1时，得到结果
    time += Time.deltaTime
    result = Mathf.Lerp(start, 10, time)

  

## 三角函数

角度：1°

弧度：1radian

圆一周角度：360°

圆一周弧度：2Π radian

**角度和弧度转换：**

- 1 rad = (180 / Π)°  = 180 / 3.14 ≈  57.3°
- 1° = （Π / 180） =3.14 / 180  ≈ 0.01745 rad

**Unity中角度和弧度转化：**

- Mathf.Rad2Deg * rad  弧度转角度
- Mathf.Deg2Rad * angle  角度转弧度



**正弦函数、余弦函数：**

- sin:对边 / 斜边	Mathf.Sin(30 * Mathf.Deg2Rad) == 0.5
- cos:领边 / 斜边

**反三角函数：**

Mathf.Asin(0.5) * Mathf.Rad2Deg = 30

> **Mathf中的三角函数相关的函数，参数需要是弧度值**



## 坐标系

**世界坐标系、物理坐标系：**

以世界中点/自己为原点，正前方为z轴，右边为x轴，头顶为y轴

**屏幕坐标系：**

原点为屏幕左下角，向右为x轴，向上为y轴

**视口坐标系：**

与屏幕坐标系类似，只是将坐标单位化  eg:  右上角（1，1）



## 向量

有数值大小，有方向的量

三维向量的几何意义：**位置**、**方向**

向量模长：`.magnitude`

向量归一化：`.normalized`

**向量加减法几何意义：位置平移**
位置向量+-方向向量 == 新的位置向量

**向量乘除标量几何意义：缩放**



**向量点乘 Vector3.Dot(A,B)**

`A•B =（a,b,c）•（d,e,f）= ad+be+cf` 或者 `A•B=|A||B|cosß`   可以得到一个向量在自己向量方向上的投影

- 点乘结果>0：两个向量夹角为锐角
- 点乘结果=0：两个向量夹角为直角
- 点乘结果>0：两个向量夹角为钝角

所以点乘可以用来判断游戏物体间的前后关系和角度关系

**向量叉乘 Vector3.Cross(A,B)**

A(Xa, Ya, Za) X B(Xb, Yb, Zb) = (YaZb-ZaYb, ZaXb-XaZb, XaYb-YaXb)

结果是一个垂直于A,B向量的新向量, 假设A、B都是XZ平面的向量

- 新向量.y> 0 ：B在A的右侧
- 新向量.y< 0 ：B在A的左侧

所以可以用来判断游戏物体间的左右侧关系



# 线性代数

线性代数是一门研究向量和变换的数学学科

## 矩阵

矩阵是一种用来表示和处理数据的数学工具

矩阵是有m x n个标量组成的，通过方括号内的数值表来表示

程序中矩阵表示：

- 数组
- 嵌套列表
- 开发工具提供的类或结构体（Unity中的Matrix4x4、Matrix3x2结构体）

学习矩阵的目的是为了能在Shader开发中利用其进行相关数学计算



## 矩阵乘法

矩阵和标量乘法：直接让矩阵中的每一个标量乘以标量即可

**矩阵和矩阵的乘法：**

- 相乘条件：左列右行要相等	eg: (m x n)  、  (n x u) 可以相乘
- 相乘规则：左行乘右列 再相加
- 不满足交换律 AB ≠ BA



## 特殊矩阵

**方块矩阵**

简称方阵，特点是行列数相等

**对角矩阵**

是一种特殊的方阵，只有主对角线有值，其余元素全为零

**单位矩阵**

特殊的对角矩阵，主对角线元素为`1`的对角矩阵

**数量矩阵**

特殊的对角矩阵，主对角线元素为同一值

**转置矩阵**

将原始矩阵的行和列互换得到的新矩阵

- 转置矩阵的转置等于原矩阵  (M^T^)^T^ = M
- 矩阵串接的转置等于方向串接各矩阵的转置   (AB)^T^ == B^T^ A^T^

### 逆矩阵

逆矩阵必须是一个方阵，并且不是所有矩阵都有逆矩阵

如果一个矩阵存在对应的逆矩阵，则称该矩阵是可逆的（非奇异的），如果不存在对应的逆矩阵，则称该矩阵是不可逆的（奇异的）

存在逆矩阵的判断条件：MM^-1^ = M^-1^M = I(单位矩阵)
