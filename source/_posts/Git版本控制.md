---
title: Git版本控制
author: chenlf
tags:
  - null
categories:
  - null
katex: true
date: 2023-10-09 10:57:40
---

##　工作区和暂存区

在一个目录下我们，我们使用命令

```sh
git init
```


则会在此目录下创建一个`.git`的隐藏文件夹，这就是Git的{% label 版本库 red %}，而当前目录就是我们的{% label 工作区 red %}，Git的版本库里存了很多东西，其中最重要的就是称为stage（或者叫index）的{% label 暂存区 red %}，还有Git为我们自动创建的第一个分支`master`，以及指向`master`的一个指针叫`HEAD`。

工作区、暂存区和版本库的关系：

![git-repo](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202310091104071.jpeg)

注：Git不是保存多版本的文件，而是保存文件的修改



## Git常见操作

**1.添加到暂存区：**

```sh
git add filename
```

**2.提交到版本库：**

```sh
git commit -m “commit description”
```

**3.查看状态：**

```shell
git status
```

**4.查看提交日志**

详细日志
```sh
git log
```

只显示一行的日志（主要查看commit id）
```sh
git log --pretty=oneline
```

**5.版本回滚**

```sh
git reset --hard commitID
```

commitID可以通过`git log --pretty=oneline`或者`git reflog`查找出来

**6.操作日志**

```sh
git reflog
```

因为使用`git reset --hard commitID`版本回滚后，`git log` 和 `git log --pretty=oneline`就找不到回滚后版本之后的commitID，想要再次回到原来的最新版本，就需要通过`git reflog`这个命令查询到所有的版本的commitID和操作，再次执行版本回滚命令就好了

**7.撤销修改**

```sh
git checkout -- filename
git reset HEAD filename
```

1. 情况一：如果没有提交到暂存区或者版本库，执行`git checkout -- filename`可以让本地修改撤销（注意`--`和`filename`之间有空格）
2. 情况二：如果已经提交到了暂存区，则执行`git reset HEAD filename`（**注意这个命令跟版本回滚命令缺少了--hard**）可以把丢弃暂存区的修改，再执行情况一的命令就可以完全撤销修改了
3. 情况三：如果已经提交到版本库了，那么只能版本回滚了，前提是没有提交到远程仓库

**8.删除文件**

```sh
git rm filename
```

执行后还要执行`git commit`提交删除操作到版本库

## 远程仓库

**1.关联远程仓库**

```sh
 git remote add origin https://github.com/chenlf/cangku.git
```

**2.本地仓库内容推送到远程仓库**

```sh
git push -u origin main
git push origin main
```

​	注意第一次推送时会要求你输入用户名和密码。由于远程库是空的，我们第一次推送main分支时，加上了`-u`参数，Git不但会把本地的main分支内容推送的远程新的main分支，还会把本地的main分支和远程的main分支关联起来，在以后的推送或者拉取时就可以简化命令。之后就不需要加上`-u`.(这里是推送到main分支)

**3.克隆远程仓库**

```sh
git clone https://github.com/chenlf/cangku.git
```

**4.拉取代码**

```sh
git pull
git pull origin dev:dev
```

`git pull`其实是分了两步，一是拉取代码到本地，和git fetch命令效果一致。二是将拉取下来的代码与本地仓库的当前分支的代码进行合并。`git pull`就是已经有连接的拉取，`git pull origin dev:dev`是将远程仓库的dev分支拉取到本地的dev分支。如果只想用`git pull`拉取就需要将远程仓库的dev和本地仓库的dev连接：

```sh
git branch --set-upstream-to=origin/dev dev
```



**5.查看远程仓库**

```sh
git remote -v
```

**6.拉取远程仓库的其他分支**

```sh
git checkout -b dev origin/dev  
```

**7.创建远程分支（要先创建好本地分支）**

```sh
git push --set-upstream  origin dev-xx
```





## 分支管理

**新建分支**

```sh
git branch dev
```

**切换分支**

```sh
git checkout dev
```

**创建并切换分支**

```sh
git checkout -b dev
```

**查看分支**

```sh
git branch
```

**快速合并分支**

```sh
git merge dev
```

**删除分支**

```sh
git branch -d dev
```



**合并分支有冲突**

当两个分支有同一文件有不同内容时，合并会产生冲突，这是文件会Git用<<<<<<<，=======，>>>>>>>标记出不同分支的内容，我们需要手动修改后保存（把冲突的内容手动解决，移除<<<<<<<，=======，>>>>>>>等标记）

```
Git tracks changes of files.
<<<<<<< HEAD
Creating a new branch is quick & simple.
=======
Creating a new branch is quick AND simple.
>>>>>>> feature1
```

手动修改

```sh
Git tracks changes of files.
Creating a new branch is quick and simple.
```

再提交

```sh
$ git add readme.txt 
$ git commit -m "conflict fixed"
[master eacfb2d] conflict fixed
```

现在，master分支和feature1分支变成了下图所示（在master分支上合并feature1分支）：

![img](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202310091419800.png)

用带参数的git log也可以看到分支的合并情况：

```sh
$ git log --graph --pretty=oneline --abbrev-commit
*   eacfb2d conflict fixed
|\
| * fae0655 AND simple
* | 47e116b & simple
|/
* 2553526 new branch
* 458a2d1 udpate readme
* 30318a5 remove test.txt
* 7ecbcf7 add test.txt
* f720fd3 git tracks changes
* 399dad7 understand how stage works
* 0767556 add distributed
* b41a002 wrote a readme file
```



**stash工作现场“储藏”**

主要为了解决在dev分支开发到一半，但是有一个紧急BUG需要解决，此时不好提交dev的内容。

保存现场：

```sh
git stash
```

查看现场存储

```sh
git stash list
```

恢复现场：

一是用git stash apply恢复，但是恢复后，stash内容并不删除，你需要用git stash drop来删除；

另一种方式是用git stash pop，恢复的同时把stash内容也删了：

```sh
git stash pop
```



## 分支管理策略

通常，合并分支时，如果可能，Git会用Fast forward快速合并模式，但这种模式下，删除分支后，会丢掉分支信息。

如果要强制禁用Fast forward模式，Git就会在merge时生成一个新的commit，这样，从分支历史上就可以看出分支信息。

禁用Fast forward模式合并：

```sh
git merge --no-ff -m "merge with no-ff" dev
```

此时可以在历史中看到分支历史和commit描述

```sh
git log --graph --pretty=oneline --abbrev-commit
* c41754b merge with no-ff
|\
| * 523b901 add merge
|/
```

如果是快速合并：

```sh
git log --graph --pretty=oneline --abbrev-commit
* 523b901 add merge
```

