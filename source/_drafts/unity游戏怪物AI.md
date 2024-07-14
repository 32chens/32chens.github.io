---
title: unity游戏怪物AI
author: chenlf
tags:
  - unity
  - AI
categories:
  - unity
katex: true
date: 2023-10-13 19:50:28
---



**常见的游戏AI实现方式**

- {% label 有限状态机 red %}
- {% label 行为树 red %}
- 机器学习
- 其他

## 有限状态机实现AI

#### 基本套路

- 状态机类（统一管理各种状态）
- 状态基类（各个状态的共有内容）
- 各种状态类（对应各种行为状态，继承于状态基类）

![image-20231013203434627](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202310132034723.png)

#### 状态基类

在这个基类中 可以去实现所有状态共有的 进入、离开、处于状态的行为（函数、方法）

```c#
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

/// <summary>
/// 状态基类 所有状态类都会继承它
/// </summary>
public abstract class BaseState
{
    //管理自己的有限状态机对象
    protected StateMachine stateMachine;


    /// <summary>
    /// 初始化状态类时  将管理者传入 进行记录
    /// </summary>
    /// <param name="machine"></param>
    public BaseState(StateMachine machine)
    {
        stateMachine = machine;
    }

    //当前状态的类型
    public virtual E_AI_State AIState
    {
        get;
    }


    // 1.离开状态时 做什么
    public abstract void QuitState();

    // 2.进入状态时 做什么
    public abstract void EnterState();

    // 3.处于状态时 做什么（核心逻辑处理）
    public abstract void UpdateState();
}

```





#### 状态机类

有限状态机类 它主要用于管理各个状态之间的切换

```c#
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

/// <summary>
/// 有限状态机类 它主要用于管理各个状态之间的切换
/// </summary>
public class StateMachine
{
    //key —— 状态类型(是有限的状态类型，那么就可以是一开始定死的，
    //value —— 代表的是处理状态的逻辑对象
    private Dictionary<E_AI_State, BaseState> stateDic = new Dictionary<E_AI_State, BaseState>();

    //表示当前有限状态 处于的状态（也就是对应的怪物或玩家当前处于的AI状态)
    private BaseState nowState;

    //这个就是ai有限状态机 管理的 ai对象(里氏替换接口装实现类) 会去通过ai状态命令该对象 执行对应的行为
    public IAIObj aiObj;

    //回归的判断临界距离 现在我们写死 以后可能是从AI表中读取
    public float backDis = 15;


    /// <summary>
    /// 初始化有限状态机类 
    /// </summary>
    /// <param name="aiObj">传入 ai对象 用于之后的行为控制</param>
    public void Init(IAIObj aiObj)
    {
        this.aiObj = aiObj;
    }

    /// <summary>
    /// 添加AI状态
    /// </summary>
    public void AddState(E_AI_State state)
    {
        switch (state)
        {
            case E_AI_State.Patrol:
                stateDic.Add(state, new PatrolState(this));
                break;
            case E_AI_State.Run:
                stateDic.Add(state, new RunState(this));
                break;
            case E_AI_State.Chase:
                stateDic.Add(state, new ChaseState(this));
                break;
            case E_AI_State.Atk:
                stateDic.Add(state, new AtkState(this));
                break;
        }
    }

    /// <summary>
    /// 改变状态
    /// </summary>
    public void ChangeState(E_AI_State state)
    {
        //如果当前处于另一个状态 就退出该状态
        if (nowState != null)
            nowState.QuitState();

        //如果存在该状态的逻辑出来对象 那么就进入该状态
        if(stateDic.ContainsKey(state))
        {
            nowState = stateDic[state];
            nowState.EnterState();
        }
    }

    /// <summary>
    /// 更新当前状态逻辑处理
    /// </summary>
    public void UpdateState()
    {
        if (nowState != null)
            nowState.UpdateState();
    }

    /// <summary>
    /// 检测是否切换到回归状态
    /// </summary>
    public void CheckChangeRun()
    {
        //在追逐过程中 发现超出了 我们的最大距离 就应该切换到回归的状态
        //目前我们处理的是利用ai对象和自己的出生点距离 进行最大距离判断
        //达到的效果是 ai对象一定要跑到边界 才甘心

        //其实还可以利用 目标对象和自己的出生点距离 + 自己攻击距离 来进行距离判断
        //达到的效果就是 目标达不到了 就没有必要追了
        if (Vector3.Distance(this.aiObj.nowPos, this.aiObj.bornPos) >= this.backDis)
        {
            ChangeState(E_AI_State.Run);
        }
    }
}

```



#### 各种状态类

状态类  具体处理进入、处于、退出该状态的逻辑

```c#
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

/// <summary>
/// 回归状态处理
/// </summary>
public class RunState : BaseState
{
    public override E_AI_State AIState => E_AI_State.Run;

    public RunState(StateMachine machine) : base(machine)
    {

    }

    public override void EnterState()
    {
        Debug.Log("进入回归状态");
        //进入回归状态时 命令ai对象 回到自己的出生点即可
        stateMachine.aiObj.Move(stateMachine.aiObj.bornPos);
    }

    public override void QuitState()
    {

    }

    public override void UpdateState()
    {
        //判断是否回到了出生点
        //到达出生点后 进入到 巡逻状态即可
        if(Vector3.Distance(stateMachine.aiObj.nowPos, stateMachine.aiObj.bornPos) <= 0.5f)
        {
            stateMachine.ChangeState(E_AI_State.Patrol);
        }
    }
}

```

#### 行为接口

```c#
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

/// <summary>
/// AI对象接口 用于规范 需要使用AI的对象的 行为
/// </summary>
public interface IAIObj 
{
    //所有AI对象都应该可以获取到它的Transform信息
    public Transform objTransform
    {
        get;
    }

    //所有AI对象都应该有一个当前的位置
    public Vector3 nowPos
    {
        get;
    }

    //AI对象的目标对象所在的位置
    public Vector3 targetObjPos
    {
        get;
    }

    //所有AI对象都应该有一个攻击范围的概念
    //好用于判断 什么时候开始攻击玩家
    public float atkRange
    {
        get;
    }

    //出生位置 需要继承它的AI对象提供
    public Vector3 bornPos {
        get;
        set;
    }

    //AI对象中 应该有 移动相关的方法
    public void Move(Vector3 dirOrPos);
    //AI对象中 应该有 停止移动相关的方法
    public void StopMove();
    //AI对象中 应该有 攻击相关的方法
    public void Atk();
    //AI对象中 可能想要单独 切换指定动作
    //切换动作 应该传递一些相关参数 才能够指定切换哪个动作吧
    public void ChangeAction(E_Action action);

    //我们应该根据AI不同的状态 去提取出他们的行为合集
}
```



#### 挂载状态机

```c#
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.AI;

public class Monster : MonoBehaviour, IAIObj
{
    public GameObject bullet;

    //网格寻路组件
    private NavMeshAgent navMeshAgent;

    //在需要使用AI模块的对象当中 声明一个 AI状态机对象 用于开启AI功能
    private StateMachine aiStateMachine;

    private Vector3 nowObjPos;
    //对象当前的位置
    public Vector3 nowPos {
        get
        {
            nowObjPos = this.transform.position;
            //为了和我们AI模块的定位规则相同 没有考虑 Y上的位置 主要是在xz平面进行位移
            nowObjPos.y = 0;
            return nowObjPos;
        }
    }

    //出生位置
    public Vector3 bornPos
    {
        get;
        set;
    }

    //AI对象必须能够被AI模块获取到Transform 方便我们进行相关处理
    public Transform objTransform => this.transform;

    //自己的攻击范围（目前我们可以写死，以后 一般是通过配置表进行数据初始化
    //如果还有其他规则，自己实现对应的攻击范围规则即可）
    public float atkRange => 2;

    //用于测试用的目标对象
    //正常情况下，应该通过代码动态的再场景中寻找满足条件的目标 我们这里仅仅是测试
    //所以直接通过拖拽进行关联
    public Transform targetTransform;

    //由于我们现在还不用去考虑 目标 所以随便给一个目标位置
    public Vector3 targetObjPos
    {
        get
        {
            //注意：这里减去y方向的0.5 是因为我们用立方体举例子，它的y往上升了0.5
            //为了贴合地面 所以我们减去0.5
            return targetTransform.position - Vector3.up * 0.5f;
        }
    }

    private void Start()
    {
        navMeshAgent = this.GetComponent<NavMeshAgent>();

        //之所以把AI的重要初始化 放到对象类当中 主要原因
        //是因为不同对象 可能会存在不同的AI状态，不同的起始状态
        //这些往往在游戏中 都是配置表当中配置的 所以一般写在怪物创建处

        //注意：
        //大多数情况下 会放在 怪物管理器中的创建怪物的方法中，但是我们目前没有设计怪物管理器
        //因此，我们把这一块代码 放在了 怪物出生的生命周期函数中 也就是Start中（也可以放在Awake)

        //初始化AI模块的有限状态机对象
        aiStateMachine = new StateMachine();
        //把ai对象自己 传入其中进行初始化
        aiStateMachine.Init(this);

        //你需要什么AI状态 就动态添加（以后一般情况下 是通过配置表的配置去添加）
        //为AI添加巡逻状态
        aiStateMachine.AddState(E_AI_State.Patrol);
        aiStateMachine.AddState(E_AI_State.Chase);
        aiStateMachine.AddState(E_AI_State.Atk);
        aiStateMachine.AddState(E_AI_State.Run);

        //初始化完所有AI状态后 那就需要一个当前的AI状态
        //目前一开始就让对象时一个巡逻状态
        aiStateMachine.ChangeState(E_AI_State.Patrol);

        //出生位置 就是对象一开始所在的位置
        bornPos = this.transform.position;
    }

    private void Update()
    {
        //ai相关的更新 是由 ai对象的 帧更新函数 发起的 
        aiStateMachine.UpdateState();
    }


    public void Atk()
    {
        //暂时不写 之后写到攻击AI时 再去写它
        print("攻击");

        //动态创建自动 发射即可
        GameObject obj = Instantiate(bullet, this.transform.position + this.transform.forward + Vector3.up * 0.5f, this.transform.rotation);
        Destroy(obj, 5f);
    }

    public void ChangeAction(E_Action action)
    {
        print(action);
    }

    public void Move(Vector3 dirOrPos)
    {
        navMeshAgent.isStopped = false;
        navMeshAgent.SetDestination(dirOrPos);
    }

    public void StopMove()
    {
        navMeshAgent.isStopped = true;
    }
}

```



## 行为树实现AI

