---
title: Lua学习
author: chenlf
tags:
  - Lua
categories:
  - Lua
katex: true
date: 2023-09-25 17:10:30
---



### __index元方法

Lua 查找一个表元素时的规则，其实就是如下 3 个步骤:

- 1.在表中查找，如果找到，返回该元素，找不到则继续
- 2.判断该表是否有元表，如果没有元表，返回 nil，有元表则继续。
- 3.判断元表有没有 index 方法，如果 index 方法为 nil，则返回 nil；**如果 index 方法是一个表，则重复 1、2、3；如果 index 方法是一个函数，则返回该函数的返回值。**

注：查找一个子表不存在的元素，**不会在元表中查找，而是在元表的__index元方法中找**

```lua
son = {
    name = "son name",
}

parent = {
    age = 101,
    __index = {
        name = "parent name",
        age = 23,
    }
}

parentIndexTbl = {
    sex = "female",
    __index={
        sex = "man"
    }
}

setmetatable(son, parent)
print(son.name) --son name
print(son.age) --23

setmetatable(parent.__index, parentIndexTbl)
print(son.sex)  --man 元表的__index找不到，继续从元表__index的元表__index找
```





###  __newindex 元方法

在修改子表的属性时，若子表里不存在，就在元表的 `__newindex` 表里添加该属性。如果元表的 `__newindex`是一个函数则执行

```lua
mymetatable = {}
mytable = setmetatable({key1 = "value1"}, { __newindex = mymetatable })

print(mytable.key1)  --value1

mytable.newkey = "新值2"
print(mytable.newkey,mymetatable.newkey)  --nil    新值2

mytable.key1 = "新值1"
print(mytable.key1,mymetatable.key1)	  --新值1    nil
```

注：修改一个子表不存在的元素，**不会在元表中查找，而是在元表的__nexindex元方法中修改**



### lua面向对象

```lua
-- 元类
Shape = {area = 0}

-- 基础类方法 new
function Shape:new (o,side)
  o = o or {}
  setmetatable(o, self) --将子表的元表设为基表
  self.__index = self --将基表的__index表设为自己
  side = side or 0
  self.area = side*side;
  return o
end

-- 基础类方法 printArea
function Shape:printArea ()
  print("面积为 ",self.area)
end

-- 创建对象
myshape = Shape:new(nil,10)
myshape:printArea()
```

​	`setmetatable(o, self)    self.__index = self`    这两步将基表设置为元表并将基表的__index表设为自己，这样子表不存在的元素都会从这个基表查询，这样基表定义了的函数和属性都可以被查询访问到，就好像是自己继承过来一样，虽然自己没有声明过但是可以访问，而重写只需要在自己内部声明跟基表同名的变量和函数就可以了



### 协同程序

协程的本质是一个线程对象

1）创建

```lua
fun = function()
	print(123)
end

co = coroutine.create(fun)	--线程
co2 = coroutine.wrap(fun)	--函数
```

2）运行

```lua
coroutine.resume(co)	--对应create方式创建
co2()				   --对应wrap方式
```

3）挂起

```lua
fun2 = function()
    local i=1
	while true do
    	print(i)
        i=i+1
        coroutine.yield(i)	--协程的挂起函数
    end
end
co3 = coroutine.create(fun2)
isOk, tempI = coroutine.resume(co3)	--print 1, 返回值isOk = true, tempI = 1
isOk, tempI = coroutine.resume(co3)	--print 2, 返回值isOk = true, tempI = 2
```

4）状态

- dead	结束（协程函数执行完毕）
- suspended 暂停 （调用了coroutine.yield()）
- running   运行中（协程函数内部可以获取）

```lua
coroutine.status(co)
coroutine.running()	--返回当前正在运行的协程的线程号（协程函数内部可以获取）
```



### 自带库

1）string

```lua
string.len(arg) --计算字符串长度
string.upper(str) --字符串全部转为大写字母
string.lower(str) --字符串全部转为小写字母
string.reverse(arg) --字符串反转
string.char(arg) --将整型数字转成字符并连接
string.byte(arg[,int]) --转换字符为整数值(可以指定某个字符，默认第一个字符)
--截取字符串, str: 待截取的字符串, i: 截取开始位置, j: 截取结束位置, 默认为-1, 表示最后一个位置
string.sub(str, i [, j])
--字符串替换, mainStr: 要操作的字符串, findStr: 要匹配的字符串, replaceStr: 替换的字符串, num: 替换次数(可以忽略，忽略后表示全部替换), return: 替换后的字符串和替换次数
string.gsub(mainStr, findStr, replaceStr, num)
--在str中查找subStr的, 如果找到了返回匹配的起点和终点索引, 否则返回nil
string.find (str, subStr, [init, [end]])
string.rep(string, n) --返回字符串string的n个拷贝
--字符串格式转换
string.format(...)
```



2）table

```lua
#tab --获取数组长度
--连接数组, 返回连接后的字符串, tab: 待连接的table, sep: 连接符(可省, 默认nil), start: 连接的起点位置(可省, 默认0), end: 连接的结束位置(可省, 默认最后一个元素位置)
table.concat(tab, sep,  start, end)
--插入元素, tab: 待插入的table, pos: 待插入的位置(可省, 默认最后位置), value: 插入的元素
table.insert(tab, pos, value)
--删除元素, tab: 待删除的table, pos: 待删除的位置
table.remove(tab, pos)
--待排序的table, comp: 比较函数(可省, 默认升序)
table.sort(tab, comp)
```



3）时间

```lua
--获取时间戳
os.time()	--当前时间的时间戳
os.time({year = 2014, month = 8, day = 14})	--获取指定时间的时间戳

--获取时间表
os.date("*t") --返回一个描述当前时间的表
```

4）math

```lua
math.abs(-11)
math.deg(math.pi)	--弧度转角度
math.cos(math.pi)	--三角函数

--幂函数
sqrt、pow
--指数与对数函数
exp、log、log10
ldexp --如: math.ldexp(10, 3), 值为10*2^3=80
--三角函数
sin、cos、tan、acos、asin、atan
--取整函数
ceil、floor
--最值函数
min、max
--双曲线函数
cosh、sinh、tanh
--角度与弧度转换函数
deg、rad
--随机函数
random --如: math.random(1, 100), 获取1-100的随机数
randomseed --设置随机数种子, 如: math.randomseed(os.time())
--其他函数
abs
modf --把数分为整数和小数, 如: math.modf(10.12), 返回10 12
--常量
pi --3.1415926535898
```

5）路径

```lua
package.path	--lua脚本加载路径
```





### 垃圾回收

```lua
--获取当前lua占用内存的字节数
collectgarbage("count")

--进行垃圾回收, 回收设置为nil后的空间
collectgarbage("collect")
```



### toLearn

- 文件io
- 错误处理
- 数据库访问

https://blog.csdn.net/zzulp/article/details/22797233
