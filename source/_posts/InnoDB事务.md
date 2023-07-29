---
title: InnoDB事务
author: chenlf
tags:
  - MySQL
categories:
  - 数据库
katex: true
abbrlink: c464ad2e
date: 2023-06-04 10:50:19
---

### 事务基础
##### 事务

事务是一组操作的集合，它是一个不可分割的工作单位，事务会把所有的操作作为一个整体一起向系统提交或撤销操作请求，即这些操作要么同时成功，要么同时失败。
##### 特性
- 原子性（Atomicity):事务是不可分割的最小操作单元，要么全部成功，要么全部失败。
- 一致性（Consistency):事务完成时，必须使所有的数据都保持一致状态。
- 隔离性（lsolation):数据库系统提供的隔离机制，保证事务在不受外部并发操作影响的独立环境下运行。
- 持久性（Durability):事务t旦提交或回滚，它对数据库中的数据的改变就是永久的。

![image-20230604105354328](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202306041054443.png)



其中隔离性的保证：

- 写-写操作：锁
- 写读操作：MVCC



### redo log

##### 作用

重做日志，记录的是事务提交时数据页的**物理修改**，是用来实现事务的**持久性**。
该日志文件由两部分组成:重做日志缓冲（redo log buffer)以及重做日志文件（redo log file) ,前者是在内存中，后者在磁盘中。

当对缓冲区的数据进行增删改之后，会首先将操作的数据页的变化，记录在redo  log buffer中。在事务提交时，会将redo log buffer中的数据刷新到redo log磁盘文件中，在刷新脏页到磁盘, 发生错误时，进行数据恢复使用，这样就保证了事务的持久性（这 种先写日志的方式，称之为 WAL（Write-Ahead Logging））

![image-20230604111836176](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202306041118219.png)

##### 内部细节

InnoDB 的 redo log 是固定大小的，比如可以配置为一组 4 个文件，每个文件的大小是 1GB，那么redo log总共就可以记录 4GB 的操作。

![image-20230604112512967](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202306041125023.png)

write pos 是当前记录的位置，一边写一边后移，写到第 3 号文件末尾后就回到 0 号文件开头。checkpoint 是当前要擦除的位置，也是往后推移并且循环的，擦除记录前要把记录更新到数据文件。

write pos 和 checkpoint 之间的是“粉板”上还空着的部分，可以用来记录新的操作。如果 write pos 追上 checkpoint，表示“粉板”满了，这时候不能再执行新的更新，得停下来先擦掉一些记录，把 checkpoint 推进一下。



innodb_flush_log_at_trx__commit参数，可以设置事务提交时的刷盘方式

 - 0：间隔一段时间，然后再刷写一次日志到磁盘（性能最佳）。
  - 1：每次提交事务时，都刷写一次日志到磁盘（性能最差，最安全，默认策略）。
  - 2：有事务提交的情况下，每间隔一秒时间刷写一次日志到磁盘。



> 那为什么每一次提交事务，要刷新redo log 到磁盘中呢，而不是直接将buffer pool中的脏页刷新 到磁盘呢 ?

因为在业务操作中，我们操作数据一般都是随机读写磁盘的，而不是顺序读写磁盘。 而redo log在 往磁盘文件中追加写入数据，由于是日志文件，所以都是顺序写的。顺序写的效率，要远大于随机写。 而且Buffer Pool写入磁盘是以数据页（16k）为单位的, redo log只需要写入真正要修改的部分就可以了



### undo log

用于记录数据被修改前的信息 , 作用包含两个 : 提供**回滚**(保证事务的原子性) 和 **MVCC(多版本并发控制)** 。

他是**逻辑日志**。可以认为当delete一条记录时，undo  log中会记录一条对应的insert记录，反之亦然，当update一条记录时，它记录一条对应相反的update记录。当执行rollback时，就可以从undo log中的逻辑记录读取到相应的内容并进行回滚。

Undo log销毁：undo log在事务执行时产生，事务提交时，并不会立即删除undo log，因为这些日志可能还用于MVCC。

Undo log存储：undo log采用段的方式进行管理和记录，存放在前面介绍的 rollback segment 回滚段中，内部包含1024个undo log segment。
