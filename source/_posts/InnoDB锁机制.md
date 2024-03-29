---
title: InnoDB锁机制
author: chenlf
tags:
  - MySQL
categories:
  - 数据库
katex: true
abbrlink: b57acb07
date: 2023-07-03 22:04:27
---

MySQL中的锁，按照锁的粒度分，分为以下三类： 

- 全局锁：锁定数据库中的所有表。 
- 表级锁：每次操作锁住整张表。 
- 行级锁：每次操作锁住对应的行数据。

# 全局锁

### 介绍

全局锁就是对整个数据库实例加锁，加锁后整个实例就处于只读状态，后续的DML的写语句，DDL语句，已经更新操作的事务提交语句都将被阻塞。 其典型的使用场景是做全库的逻辑备份，对所有的表进行锁定，从而获取一致性视图，保证数据的完整性。

假设在数据库中存在这样三张表: tb_stock 库存表，tb_order 订单表，tb_orderlog 订单日志表。

![image-20230703220814735](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202307032208847.png)

- 在进行数据备份时，先备份了tb_stock库存表。 
- 然后接下来，在业务系统中，执行了下单操作，扣减库存，生成订单（更新tb_stock表，插入tb_order表）。
- 然后再执行备份 tb_order表的逻辑。 
- 业务中执行插入订单日志操作。 
- 最后，又备份了tb_orderlog表。

此时备份出来的数据，是存在问题的。因为备份出来的数据，tb_stock表与tb_order表的数据不一 致(有最新操作的订单信息,但是库存数没减)。可以使用全局锁解决

### 语法

- 加全局锁

> ​	flush tables with read lock ;

- 数据备份（不在MySQL客户端，而在主机命令行使用，mysqldump是MySQL提供的工具）

> mysqldump [-h远程数据库主机ip] -uroot –p1234 itcast > itcast.sql

- 释放锁

> unlock tables ;

### 特点

数据库中加全局锁，是一个比较重的操作，存在以下问题：

- 如果在主库上备份，那么在备份期间都不能执行更新，业务基本上就得停摆。 
- 如果在从库上备份，那么在备份期间从库不能执行主库同步过来的二进制日志（binlog），会导致主从延迟。

在InnoDB引擎中，我们可以在备份时加上参数 **--single-transaction** 参数来完成不加锁的一致性数据备份。

> mysqldump --single-transaction -uroot –p123456 itcast > itcast.sql



# 表级锁

### 介绍

表级锁，每次操作锁住整张表。锁定粒度大，发生锁冲突的概率最高，并发度最低。应用在MyISAM、InnoDB、BDB等存储引擎中。 对于表级锁，主要分为以下三类： 

- 表锁 
- 元数据锁（meta data lock，MDL） 
- 意向锁
- 自增锁

### 表锁

对于表锁，分为两类： 

- 表共享读锁（read lock） 
- 表独占写锁（write lock）

语法： 

- 加锁：lock tables 表名... read/write。 
- 释放锁：unlock tables / 客户端断开连接 。

特点：

A. 读锁 左侧为客户端一，对指定表加了读锁，不会影响右侧客户端二的读，但是会阻塞右侧客户端的写。

![image-20230703222003032](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202307032220079.png)

B. 写锁左侧为客户端一，对指定表加了写锁，会阻塞右侧客户端的读和写。

![image-20230703222010461](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202307032220483.png)

### 元数据锁

meta data lock , 元数据锁，简写MDL。 

MDL加锁过程是系统自动控制，无需显式使用，在访问一张表的时候会自动加上。MDL锁主要作用是维护表元数据的数据一致性，在表上有活动事务的时候，不可以对元数据进行写入操作。**为了避免DML与DDL冲突，保证读写的正确性。**

这里的元数据，大家可以简单理解为就是一张表的表结构。 也就是说，某一张表涉及到未提交的事务时，是不能够修改这张表的表结构的。

在MySQL5.5中引入了MDL，当对一张表进行增删改查的时候，加MDL读锁(共享)；当对表结构进行变更操作的时候，加MDL写锁(排他)。 常见的SQL操作时，所添加的元数据锁：



|对应SQL |锁类型 |说明|
|-------------|----------|-----|
|lock tables xxx read / write |SHARED_READ_ONLY / SHARED_NO_READ_WRITE|   |
|select 、select ... lock in share mode |SHARED_READ|与SHARED_READ、SHARED_WRITE兼容，与EXCLUSIVE互斥|
|insert 、update、delete、select ... for update| SHARED_WRITE |与SHARED_READ、SHARED_WRITE兼容，与EXCLUSIVE互斥|
|alter table ... |EXCLUSIVE |与其他的MDL都互斥|

当执行SELECT、INSERT、UPDATE、DELETE等语句时，添加的是元数据共享锁（SHARED_READ /  SHARED_WRITE），之间是兼容的。

![image-20230703222839998](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202307032228157.png)

当执行SELECT语句时，添加的是元数据共享锁（SHARED_READ），会阻塞元数据排他锁 （EXCLUSIVE），之间是互斥的。

![image-20230703222907505](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202307032229662.png)

### 意向锁

`InnoDB`引擎是一种支持多粒度锁的引擎，而意向锁则是`InnoDB`中为了支持多粒度的锁，为了兼容行锁、表锁而设计的，怎么理解这句话呢？

> 假设一张表中有一千万条数据，现在事务`T1`对`ID=8888888`的这条数据加了一个行锁，此时来了一个事务`T2`，想要获取这张表的表级别写锁，经过前面的一系列讲解，大家应该知道写锁必须为排他锁，也就是在同一时刻内，只允许当前事务操作，如果表中存在其他事务已经获取了锁，目前事务就无法满足“独占性”，因此不能获取锁。

那思考一下，由于`T1`是对`ID=8888888`的数据加了行锁，那`T2`获取表锁时，是不是得先判断一下表中是否存在其他事务在操作？但因为`InnoDB`中有行锁的概念，所以表中任何一行数据上都有可能存在事务加锁操作，为了能精准的知道答案，`MySQL`就得将整张表的`1000W`条数据全部遍历一次，然后逐条查看是否有锁存在，那这个效率自然会非常的低。

##### 使用

当事务`T1`打算对`ID=8888888`这条数据加一个行锁之前，就会先加一个表级别的意向锁，比如目前`T1`要加一个行级别的读锁，就会先添加一个表级别的意向共享锁，如果`T1`要加行级别的写锁，亦是同理。

此时当事务`T2`尝试获取一个表级锁时，就会先看一下表上是否有意向锁，如果有的话再判断一下与自身是否冲突，比如表上存在一个意向共享锁，目前`T2`要获取的是表级别的读锁，那自然不冲突可以获取。但反之，如果`T2`要获取一个表记的写锁时，就会出现冲突，`T2`事务则会陷入阻塞，直至`T1`释放了锁（事务结束）为止。

##### 分类

- 意向共享锁(IS): 由语句select ... lock in share mode添加 。与表锁共享锁(read)兼容，与表锁排他锁(write)互斥。 
- 意向排他锁(IX): 由insert、update、delete、select...for update添加 。与表锁共享锁(read)及排他锁(write)都互斥，意向锁之间不会互斥。

### 自增锁（了解即可）

自增锁，这个是专门为了提升自增ID的并发插入性能而设计的，比如目前表中最大的`ID=88`，如果两个并发事务一起对表执行插入语句，由于是并发执行的原因，所以有可能会导致插入两条`ID=89`的数据。因此这里必须要加上一个排他锁，确保并发插入时的安全性，但也由于锁的原因，插入的效率也就因此降低了，毕竟将所有写操作串行化了。

> 为了改善插入数据时的性能，自增锁诞生了，自增锁也是一种特殊的表锁，但它仅为具备`AUTO_INCREMENT`自增字段的表服务，同时自增锁也分成了不同的级别，可以通过`innodb_autoinc_lock_mode`参数控制。

- `innodb_autoinc_lock_mode = 0`：传统模式。
- `innodb_autoinc_lock_mode = 1`：连续模式（`MySQL8.0`以前的默认模式）。
- `innodb_autoinc_lock_mode = 2`：交错模式（`MySQL8.0`之后的默认模式）。

当然，这三种模式又是什么含义呢？想要彻底搞清楚，那就得先弄明白`MySQL`中可能出现的三种插入类型：

- 普通插入：指通过`INSERT INTO table_name(...) VALUES(...)`这种方式插入。
- 批量插入：指通过`INSERT ... SELECT ...`这种方式批量插入查询出的数据。
- 混合插入：指通过`INSERT INTO table_name(id,...) VALUES(1,...),(NULL,...),(3,...)`这种方式插入，其中一部分指定`ID`，一部分不指定。

简单了解上述三种插入模式后，再用一句话来概述自增锁的作用：**自增锁主要负责维护并发事务下自增列的顺序**，也就是说，每当一个事务想向表中插入数据时，都要先获取自增锁先分配一个自增的顺序值，但不同模式下的自增锁也会有些许不同。



# 行级锁

行级锁，每次操作锁住对应的行数据。锁定粒度最小，发生锁冲突的概率最低，并发度最高。应用在

InnoDB存储引擎中。

InnoDB的数据是基于索引组织的，**行锁是通过对索引上的索引项加锁**来实现的，而不是对记录加的锁。对于行级锁，主要分为以下三类： 

- 行锁（Record Lock）：锁定单个行记录的锁，防止其他事务对此行进行update和delete。在RC、RR隔离级别下都支持。 
- 间隙锁（Gap Lock）：锁定索引记录间隙（不含该记录），确保索引记录间隙不变，防止其他事务在这个间隙进行insert，产生幻读。在RR隔离级别下都支持。
-  临键锁（Next-Key Lock）：行锁和间隙锁组合，同时锁住数据，并锁住数据前面的间隙Gap。 在RR隔离级别下支持。

### 行锁 

1). 介绍

InnoDB实现了以下两种类型的行锁： 

- 共享锁（S）：允许一个事务去读一行，阻止其他事务获得相同数据集的排它锁。 
- 排他锁（X）：允许获取排他锁的事务更新数据，阻止其他事务获得相同数据集的共享锁和排他锁。

两种行锁的兼容情况如下:

![image-20230703224154197](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202307032241223.png)

常见的SQL语句，在执行时，所加的行锁如下：

|SQL |行锁类型 |说明|
|-------|------|-----|
|INSERT ... |排他锁 |自动加锁|
|UPDATE ... |排他锁 |自动加锁|
|DELETE ... |排他锁 |自动加锁|
|SELECT（正常） |不加任何 锁| |
|SELECT ... LOCK IN SHARE MODE |共享锁 |需要手动在SELECT之后加LOCK IN SHARE MODE |
|SELECT ... FOR UPDATE |排他锁 |需要手动在SELECT之后加FOR UPDATE|



注意**无索引**行锁升级为表锁的情况

> 行锁是建立在索引上的，如果条件不是索引那么就会进行全表扫描，而修改操作会在扫描后给扫描过的每一行加锁，所以全表扫描会给整个表加锁影响并发度，所以一般update优化都是条件选择使用索引



### 间隙锁&临键锁

默认情况下，InnoDB在 REPEATABLE READ事务隔离级别运行，InnoDB使用 next-key 锁进行搜 索和索引扫描，以防止幻读。 

- 索引上的等值查询(唯一索引)，给不存在的记录加锁时, 优化为间隙锁 。 

  ![image-20230703225607071](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202307032256271.png)

- 索引上的等值查询(非唯一普通索引)，向右遍历时最后一个值不满足查询需求时，next-key  lock 退化为间隙锁。 

  ![](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202307032256849.png)

- 索引上的范围查询(唯一索引)--会访问到不满足条件的第一个值为止。

  ![image-20230703225648478](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202307032256702.png)

##### 介绍

```sql
SELECT * FROM `zz_users`;
+---------+-----------+----------+----------+---------------------+
| user_id | user_name | user_sex | password | register_time       |
+---------+-----------+----------+----------+---------------------+
|       1 | 熊猫      | 女       | 6666     | 2022-08-14 15:22:01 |
|       2 | 竹子      | 男       | 1234     | 2022-09-14 16:17:44 |
|       3 | 子竹      | 男       | 4321     | 2022-09-16 07:42:21 |
|       4 | 猫熊      | 女       | 8888     | 2022-09-27 17:22:59 |
|       9 | 黑竹      | 男       | 9999     | 2022-09-28 22:31:44 |
+---------+-----------+----------+----------+---------------------+
```

现在要将`ID>3`的用户密码重置为`1234`，因此事务`T1`先查到了`ID>3`的`4、9`两条数据并上锁了，然后开始更改用户密码，但此时事务`T2`过来又插入了一条`ID=6、password=7777`的数据并提交此时会被阻塞，只有等`T1`修改完了`4、9`两条数据后并提交后才能执行成功，这是因为4~9之间加了临键锁



# 相关文章

[(八)MySQL锁机制：高并发场景下该如何保证数据读写的安全性](https://juejin.cn/post/7153869469394305061)
