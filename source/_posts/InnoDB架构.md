---
title: InnoDB架构
author: chenlf
tags:
  - MySQL
categories:
  - 数据库
katex: true
abbrlink: d84018d6
date: 2023-06-04 10:17:38
---

# 逻辑存储结构

![image-20230604155723066](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202306041609008.png)

### 表空间

表空间是InnoDB存储引擎逻辑结构的最高层， 如果用户启用了参数 innodb_file_per_table(在
8.0版本中默认开启) ，则每张表都会有一个表空间（**.ibd文件**），一个mysql实例可以对应多个表空 间，用于存储**记录、索引等**数据。

### 段

段，分为**数据段**（Leaf node segment）、**索引段**（Non-leaf node segment）、**回滚段** （Rollback segment），InnoDB是索引组织表，数据段就是B+树的叶子节点， 索引段即为B+树的 非叶子节点。段用来管理多个Extent（区）。

### 区

区，表空间的单元结构，每个区的大小为1M。 默认情况下， InnoDB存储引擎页大小为16K， 即一 个区中一共有64个连续的页。

### 页

页，是InnoDB 存储引擎**磁盘管理的最小单元**，每个页的大小默认为 16KB。为了保证页的连续性，

InnoDB 存储引擎每次从磁盘申请 4-5 个**区**。

### 行

行，InnoDB 存储引擎数据是按行进行存放的。 

在行中，默认有两个隐藏字段： 

- Trx_id：每次对某条记录进行改动时，都会把对应的事务id赋值给trx_id隐藏列。
- Roll_pointer：每次对某条引记录进行改动时，都会把旧的版本写入到undo日志中，然后这个 隐藏列就相当于一个指针，可以通过它来找到该记录修改前的信息。



# 架构

下面是InnoDB架构图，左侧为内存结构，右侧为磁盘结构。

![image-20230604160755179](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202306041609017.png)

## 内存结构

主要分为这么四大块儿： Buffer Pool、Change Buffer、Adaptive  Hash Index、Log Buffer。

### Buffer Pool

InnoDB存储引擎基于磁盘文件存储，访问物理硬盘和在内存中进行访问，速度相差很大，为了尽可能 弥补这两者之间的I/O效率的差值，就需要把经常使用的数据加载到缓冲池中，避免每次访问都进行磁 盘I/O。 

在InnoDB的缓冲池中不仅缓存了索引页和数据页，还包含了undo页、插入缓存、自适应哈希索引以及InnoDB的锁信息等等。

缓冲池 Buffer Pool，是主内存中的一个区域，里面可以缓存磁盘上经常操作的真实数据，在执行增 删改查操作时，先操作缓冲池中的数据（若缓冲池没有数据，则从磁盘加载并缓存），然后再以**一定频率**刷新到磁盘，从而减少磁盘IO，加快处理速度。

缓冲池以Page页为单位，底层采用链表数据结构管理Page。根据状态，将Page分为三种类型：
• free page：空闲page，未被使用。
• clean page：被使用page，数据没有被修改过。
• dirty page：脏页，被使用page，数据被修改过，也中数据与磁盘的数据产生了不一致。

> 如果大部分需要修改的数据页不存在Buffer Pool中，那么从磁盘读取进缓存的IO是无法避免的，但是如果每一个修改都立刻写回那么将会有许多磁盘IO、降低MySQL的性能，所以Buffer Pool的数据页是按一定频率刷磁盘的。



- [ ] 预读和**LRU**管理缓存页[(84条消息) MySql 缓冲池(buffer pool) 和 写缓存(change buffer)_buffer pool和change buffer_松myth的博客-CSDN博客](https://blog.csdn.net/song_myth/article/details/119764563?spm=1001.2014.3001.5502)




### Change Buffer

**更改缓冲区**（针对于**非唯一二级索引页**），在执行DML语句时，如果这些数据Page**不在Buffer Pool中**，不会直接操作磁盘，而会将数据变更存在更改缓冲区 Change Buffer 中，在未来数据**被读取时，再将数据合并恢复到Buffer Pool中**，再定期刷磁盘，而不是每次刷磁盘，能够降低磁盘IO，提升MySQL的性能。（合并写操作，如果更新频繁且没有changebuffer,  那么基本上每次刷盘都要将修改的数据刷回磁盘，这样大量的离散IO将影响性能，而有了changebuffer,只有在读取时才合并到bufferpool再定期刷盘）



> 如果要修改的数据页已经在Buffer Pool中了就直接在Buffer Pool操作，只有一次内存操作。添加Change Buffer主要是为了解决在**写多读少**的情况下，Change Buffer将修改了的数据页缓存，如果数据页一直没有被取，那么就可以继续在ChangeBuffer 中执行修改操作，也就是将多次修改的操作在Change Buffer合并了，只有需要被查询的时候再把多次修改的有效结果合并到Buffer Pool。



### Adaptive Hash Index

自适应hash索引，用于优化对Buffer Pool数据的查询。MySQL的innoDB引擎中虽然没有直接支持hash索引，但是给我们提供了一个功能就是这个自适应hash索引。
因为前面我们讲到过，hash索引在进行**等值匹配**时，一般性能是要高于B+树的，因为hash索引一般只需要一次IO即可，而B+树，可能需 要几次匹配，所以hash索引的效率要高，但是hash索引又不适合做范围查询、模糊匹配等。
InnoDB存储引擎会监控对表上各索引页的查询，如果观察到在特定的条件下hash索引可以提升速度，则建立hash索引，称之为自适应hash索引。
**自适应哈希索引，无需人工干预，是系统根据情况自动完成。**



### Log Buffer
日志缓冲区，用来保存要写入到磁盘中的log日志数据（redo log 、undo log），默认大小为 16MB，日志缓冲区的日志会定期刷新到磁盘中。如果需要更新、插入或删除许多行的事务，增加日志缓冲区的大小可以节省磁盘 I/O。

innodb_log_buffer_size：缓冲区大小
innodb_flush_log_at_trx_commit：日志刷新到磁盘时机，取值主要包含以下三个：
- 1: 日志在每次事务提交时写入并刷新到磁盘，默认值。
- 0: 每秒将日志写入并刷新到磁盘一次。
- 2: 日志在每次事务提交后写入，并每秒刷新到磁盘一次。




## 磁盘结构

### 系统表空间 （System Tablespace）

系统表空间是更改缓冲区的存储区域。如果表是在系统表空间而不是每个表文件或通用表空间中创建 的，它也可能包含表和索引数据。(在MySQL5.x版本中还包含InnoDB数据字典、undolog等)



### File-Per-Table Tablespaces

如果开启了innodb_file_per_table开关 ，则每个表的文件表空间包含单个InnoDB表的数据和索 引 ，并存储在文件系统上的单个数据文件中。



### 通用表空间 （General Tablespaces）

通用表空间，需要通过 CREATE TABLESPACE 语法创建通用表空间，在创建表时，可以指定该表空 间。



### 撤销表空间 （Undo Tablespaces）

MySQL实例在初始化时会自动创建两个默认的undo表空间（初始大小16M），用于存储undo log日志。



### 临时表空间 （Temporary Tablespaces）

InnoDB 使用会话临时表空间和全局临时表空间。存储用户创建的临时表等数据。



### 双写缓冲区（Doublewrite Buffer Files）

innoDB引擎将数据页从Buffer Pool刷新到磁盘前，先将数据页写入双写缓冲区文件中，便于系统异常时恢复数据。主要内容看这个[double write](https://www.cnblogs.com/geaozhang/p/7241744.html )

![image-20230604170715099](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202306041707122.png)



### Redo Log

重做日志，是用来实现事务的持久性。该日志文件由两部分组成：重做日志缓冲（redo log buffer）以及重做日志文件（redo log）,前者是在内存中，后者在磁盘中。当事务提交之后会把所有修改信息都会存到该日志中, 用于在刷新脏页到磁盘时,发生错误时, 进行数据恢复使用。

![image-20230604171037102](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202306041710123.png)





# 后台线程

前面我们介绍了InnoDB的内存结构，以及磁盘结构，那么内存中我们所更新的数据，又是如何到磁盘中的呢？ 此时，就涉及到一组后台线程，接下来，就来介绍一些InnoDB中涉及到的后台线程。



### Master Thread

核心后台线程，负责调度其他线程，还负责将缓冲池中的数据异步刷新到磁盘中, 保持数据的一致性， 还包括脏页的刷新、合并插入缓存、undo页的回收 。



### IO Thread

在InnoDB存储引擎中大量使用了AIO来处理IO请求, 这样可以极大地提高数据库的性能，而IO Thread主要负责这些IO请求的回调。

![image-20230604171315278](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202306041713307.png)



### Purge Thead

主要用于回收事务已经提交了的undo log，在事务提交之后，undo log可能不用了，就用它来回收。



### Page Cleaner Thead

协助 Master Thread 刷新脏页到磁盘的线程，它可以减轻 Master Thread 的工作压力，减少阻 塞。
