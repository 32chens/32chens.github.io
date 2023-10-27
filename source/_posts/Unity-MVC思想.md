---
title: Unity-MVC思想
author: chenlf
tags:
  - Unity
  - MVC
  - 框架
categories:
  - Unity
katex: true
date: 2023-10-24 21:30:04
---

# 主要内容

1. MVC基础
2. MVC变形--MVX概念
3. Pure MVC框架

# 基本概念

数据、界面、逻辑分离

游戏中的应用： 非必须的UI系统开发框架

![image-20231027150449035](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202310271504151.png)



# MVX

MVP: 断开model和view层的耦合

MVVM：数据双向绑定

MVE：基于事件分发

# PureMVC

基本结构：MVC+Proxy+Mediator+Command+Facade

![image-20231027222230511](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202310272222565.png)



### 导入

1. 方式一：生成dll文件直接导入
2. 方式二：导入Core、Interface、Patterns三个文件夹

### 第一步：创建一个通知名类

```c#
/// <summary>
/// 通知类
/// </summary>
public class MyNotification
{
 public const string SHOW_PANEL = "showPanel";
 public const string UPDATE_PLAYER_INFO = "updatePlayerInfo";
 public const string START_GAME = "startGame";
}
```



### 创建 Model

```c#
public class PlayerDataObj
{
 public string playerName;
 public int lev;
 public int money;
 public int gem;
 public int power;
 public int hp;
 public int atk;
 public int def;
 public int crit;
 public int miss;
 public int luck;
}
```



### Proxy

- 代理类继承`Proxy`基类
- 构造函数需要初始化属性：代理的名字`Name`、数据`Data`保存Model

```c#
/// <summary>
/// 玩家数据代理对象
/// 主要处理 玩家数据更新相关的逻辑
/// </summary>
public class PlayerProxy : Proxy
{
    public new const string NAME = "PlayerProxy";
    //1.继承Proxy父类
    //2.写我们的构造函数

    //写构造函数
    //重要点
    //1.代理的名字！！！！
    //2.代理相关的数据！！！！！

    public PlayerProxy():base(PlayerProxy.NAME)
    {
        //在构造函数中 初始化一个数据 进行关联
        PlayerDataObj data = new PlayerDataObj();

        //初始化
        data.playerName = PlayerPrefs.GetString("PlayerName", "唐老狮");
        data.lev = PlayerPrefs.GetInt("PlayerLev", 1);
        data.money = PlayerPrefs.GetInt("PlayerMoney", 9999);
        data.gem = PlayerPrefs.GetInt("PlayerGem", 8888);
        data.power = PlayerPrefs.GetInt("PlayerPower", 99);

        data.hp = PlayerPrefs.GetInt("PlayerHp", 100);
        data.atk = PlayerPrefs.GetInt("PlayerAtk", 20);
        data.def = PlayerPrefs.GetInt("PlayerDef", 10);
        data.crit = PlayerPrefs.GetInt("PlayerCrit", 20);
        data.miss = PlayerPrefs.GetInt("PlayerMiss", 10);
        data.luck = PlayerPrefs.GetInt("PlayerLuck", 40);

        //赋值给自己的Data进行关联
        Data = data;
    }

    public void LevUp()
    {
        PlayerDataObj data = Data as PlayerDataObj;

        //升级 改变内容
        data.lev += 1;

        data.hp += data.lev;
        data.atk += data.lev;
        data.def += data.lev;
        data.crit += data.lev;
        data.miss += data.lev;
        data.luck += data.lev;
    }

    public void SaveData()
    {
        PlayerDataObj data = Data as PlayerDataObj;
        //把这些数据内容 存储到本地
        PlayerPrefs.SetString("PlayerName", data.playerName);
        PlayerPrefs.SetInt("PlayerLev", data.lev);
        PlayerPrefs.SetInt("PlayerMoney", data.money);
        PlayerPrefs.SetInt("PlayerGem", data.gem);
        PlayerPrefs.SetInt("PlayerPower", data.power);

        PlayerPrefs.SetInt("PlayerHp", data.hp);
        PlayerPrefs.SetInt("PlayerAtk", data.atk);
        PlayerPrefs.SetInt("PlayerDef", data.def);
        PlayerPrefs.SetInt("PlayerCrit", data.crit);
        PlayerPrefs.SetInt("PlayerMiss", data.miss);
        PlayerPrefs.SetInt("PlayerLuck", data.luck);
    }
}
```



### View和Mediator

- 继承`Mediator`类
- 构造函数：名字（必须）、View界面脚本（可选）
- 重写监听通知的方法`ListNotificationInterests`，返回需要监听的事件名的`string`数组
- 重写处理通知的方法`HandleNotification`，参数为`INotification`对象（包含**通知名和数据信息**）
- 重写注册方法`OnRegister`（可选）

![image-20231027221501487](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202310272215543.png)

View:

```c#
public class NewMainView : MonoBehaviour
{
    //1.找控件
    public Button btnRole;
    public Button btnSill;

    public Text txtName;
    public Text txtLev;
    public Text txtMoney;
    public Text txtGem;
    public Text txtPower;


    //2.提供面板更新的相关方法给外部
    //按照MVC的思想 可以直接在这里提供 更新的方法
    //如果是用MVP的思想
    public void UpdateInfo(PlayerDataObj data)
    {
        txtName.text = data.playerName;
        txtLev.text = "LV." + data.lev;
        txtMoney.text = data.money.ToString();
        txtGem.text = data.gem.ToString();
        txtPower.text = data.power.ToString();
    }
}
```

Mediator：

```c#
public class NewMainViewMediator : Mediator
{
    public static new  string NAME = "NewMainViewMediator";
    //套路写法
    //1.继承PureMVC中的Mediator脚本 
    //2.写构造函数
    public NewMainViewMediator():base(NAME)
    {
        //这里面可以去创建界面预设体等等的逻辑
        //但是界面显示应该是触发的控制的
        //而且创建界面的代码 重复性比较高
    }

    public void SetView(NewMainView view)
    {
        ViewComponent = view;
        view.btnRole.onClick.AddListener(()=>
        {
            SendNotification(PureNotification.SHOW_PANEL, "RolePanel");
        });
    }

    //3.重写监听通知的方法
    public override string[] ListNotificationInterests()
    {
        //这是一个PureMVC的规则
        //就是你需要监听哪些通知 那就在这里把通知们通过字符串数组的形式返回出去
        //PureMVC就会帮助我们监听这些通知 
        // 类似于 通过事件名 注册事件监听
        return new string[]{
            PureNotification.UPDATE_PLAYER_INFO,
        };
    }

    //4.重写处理通知的方法
    public override void HandleNotification(INotification notification)
    {
        //INotification 对象 里面包含两个队我们来说 重要的参数
        //1.通知名 我们根据这个名字 来做对应的处理
        //2.通知包含的信息 
        switch (notification.Name)
        {
            case PureNotification.UPDATE_PLAYER_INFO:
                //收到 更新通知的时候 做处理
                if(ViewComponent != null)
                {
                    (ViewComponent as NewMainView).UpdateInfo(notification.Body as PlayerDataObj);
                }
                break;
        }
    }

    //5.可选：重写注册时的方法
    public override void OnRegister()
    {
        base.OnRegister();
        //初始化一些内容
    }
}
```





### Facade和Command执行流程

Command：

- 继承`SimpleCommand`
- 重写执行函数`Execute`，参数`INotification`

```c#
public class StartUpCommand : SimpleCommand
{
    //1.继承Command相关的脚本
    //2.重写里面的执行函数
    public override void Execute(INotification notification)
    {
        base.Execute(notification);
        //当命令被执行时 就会调用该方法
        //启动命令中 往往是做一些初始化操作

        //没有这个数据代理 才注册 有了就别注册
        if( !Facade.HasProxy(PlayerProxy.NAME) )
        {
            Facade.RegisterProxy(new PlayerProxy());
        }
    }
}
```



Facade：

- 继承`Facade`
- 为了方便使用，写一个单例模式道的属性
- 初始化控制层相关内容（注册命令）

```c#
public class GameFacade : Facade
{
    //1.继承PureMVC中Facade脚本

    //2.为了方便我们使用Facade 需要自己写一个单例模式的属性
    public static GameFacade Instance
    {
        get
        {
            if( instance == null )
            {
                instance = new GameFacade();
            }
            return instance as GameFacade;
        }
    }

    /// <summary>
    /// 3.初始化 控制层相关的内容
    /// </summary>
    protected override void InitializeController()
    {
        base.InitializeController();
        //这里面要写一些 关于 命令和通知 绑定的逻辑
        RegisterCommand(PureNotification.START_UP, () =>
        {
            return new StartUpCommand();
        });

        RegisterCommand(PureNotification.SHOW_PANEL, () =>
        {
            return new ShowPanelCommand();
        });

        RegisterCommand(PureNotification.HIDE_PANEL, () =>
        {
            return new HidePanelCommand();
        });

        RegisterCommand(PureNotification.LEV_UP, () =>
        {
            return new LevUpCommand();
        });
    }

    //4.一定是有一个启动函数的
    public void StartUp()
    {
        //发送通知
        SendNotification(PureNotification.START_UP);
        //SendNotification(PureNotification.SHOW_PANEL, "MainPanel");
    }
}
```



### 总结

Proxy、Mediator、Command都注册到Facede，Mediator主要注册通知名和界面通知处理、Command主要逻辑处理、Facede主要注册和获取其他三类以及发送通知等

1.先数据 2.再界面 3.再用命令做串联 4.Facede判断、注册和获取
