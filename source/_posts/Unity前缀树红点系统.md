---
title: Unity前缀树红点系统
author: chenlf
tags:
  - 红点
categories:
  - Unity
katex: true
date: 2024-01-07 11:32:25
---

# 红点系统设计

- RedDotSystem: 红点系统管理类，提供初始化红点逻辑、更新红i的那状态、注册、移除、红点事件改变
- RedDotDefine: 红点定义，主要用来作为红点的前缀唯一标识(key值定义)
- RedDotNode: 红点节点，主要用来处理单个红点的具体逻辑
- RedDotItem: 红点UI节点，主要用来监听红点的改变，是否隐藏显示红点以及红点数量

工作流程：

![image-20240107173430645](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202401071734849.png)

1. 界面显示时，他的红点预制体上的脚本在激活时去调用红点系统`RedDotSystem`的`UpdateRedDotState(redKey)` 更新对应Key的红点状态
2. 这个方法会调用当前红点对象`RedDotNode`的`RefreshRedDotState()`，这个方法会先获取子节点的红点显示数量，并执行自己的红点逻辑（比如：自己的红点是否显示由子节点红点数量决定或者从服务端缓存的数据决定）
3. 之后执行UI层注册的事件（比如：点击后设置红点状态）
4. 上面的结束之后，再按相同的步骤更新对应父节点Key的红点状态

# RedDotSystem

```c#
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using UnityEditor;
using UnityEngine;

namespace CLF.RedDotSystem
{
    public enum RedDotType
    {
        Normal, //普通红点
        RedDotNodeNum,//子节点红点个数红点
        RedDotDataNum,//数据个数红点
    }
    
    public class RedDotSystem
    {
        
        public static RedDotSystem instance;

        public static RedDotSystem Instance
        {
            get
            {
                if (instance == null)
                {
                    instance = new RedDotSystem();
                }

                return instance;
            }
        }

        /// <summary>
        /// 红点字典
        /// </summary>
        private Dictionary<RedDotDefine, RedDotNode> mRedDotLogicDic = new Dictionary<RedDotDefine, RedDotNode>();

        /// <summary>
        /// 初始化红点树
        /// </summary>
        /// <param name="nodeList"></param>
        public void InitlizateRedDotTree(List<RedDotNode> nodeList)
        {
            foreach (RedDotNode item in nodeList)
            {
                mRedDotLogicDic.Add(item.node, item);
            }
        }



        /// <summary>
        /// 更新红点以及父节点状态 
        /// </summary>
        /// <param name="redKey"></param>
        public void UpdateRedDotState(RedDotDefine redKey)
        {
            if (redKey == RedDotDefine.None)
            {
                return;
            }
            RedDotNode redDotNode = null;
            if (mRedDotLogicDic.TryGetValue(redKey, out redDotNode))
            {
                redDotNode.RefreshRedDotState();
                UpdateRedDotState(redDotNode.parentNode);
            }
        }

        /// <summary>
        /// 注册红点状态改变事件
        /// </summary>
        /// <param name="key"></param>
        /// <param name="changeEvent"></param>
        public void RegisterRedDotChangeEvent(RedDotDefine redKey, EventHandler<RedDotNode.OnRedDotActiveChangeArgs> changeEvent)
        {
            RedDotNode redDotNode = null;
            if (mRedDotLogicDic.TryGetValue(redKey, out redDotNode))
            {
                redDotNode.OnRedDotActiveChange += changeEvent;
            }
            else
            {
                Debug.LogError($"key:{redKey} not exits, please check key define");
            }
        }
        
        /// <summary>
        /// 移除册红点状态改变事件
        /// </summary>
        /// <param name="key"></param>
        /// <param name="changeEvent"></param>
        public void UnRegisterRedDotChangeEvent(RedDotDefine redKey, EventHandler<RedDotNode.OnRedDotActiveChangeArgs> changeEvent)
        {
            RedDotNode redDotNode = null;
            if (mRedDotLogicDic.TryGetValue(redKey, out redDotNode))
            {
                redDotNode.OnRedDotActiveChange -= changeEvent;
            }
            else
            {
                Debug.LogError($"key:{redKey} not exits, please check key define");
            }
        }

        /// <summary>
        /// 注册子节点
        /// </summary>
        /// <param name="father"></param>
        /// <param name="son"></param>
        public void RegisterSonNode(RedDotDefine father, RedDotDefine son)
        {
            RedDotNode fatherNode = null;
            if (mRedDotLogicDic.TryGetValue(father, out fatherNode))
            {
                if (fatherNode.children.Contains(son))
                {
                    return;
                }
                fatherNode.children.Add(son);
            }
            else
            {
                Debug.LogError($"key:{father} not exits, please check key define");
            }
        }


        /// <summary>
        /// 获取子节点数量
        /// </summary>
        /// <param name="redDot"></param>
        /// <returns></returns>
        public int GetChildNodeRedDotCount(RedDotNode redDot)
        {
            int childRedDotCount = 0;
            ComputeChildRedDotCount(redDot, ref childRedDotCount);
            return childRedDotCount;
        }

        /// <summary>
        /// 计算子节点数量
        /// </summary>
        /// <param name="redDot"></param>
        /// <param name="childRedDotCount"></param>
        public void ComputeChildRedDotCount(RedDotNode redDot, ref int childRedDotCount)
        {
            foreach (RedDotDefine child in redDot.children)
            {
                RedDotNode redDotNode;
                if (mRedDotLogicDic.TryGetValue(child, out redDotNode))
                {
                    redDotNode.RefreshRedDotState();
                    childRedDotCount += redDotNode.redDotCount;
                }
                else
                {
                    Debug.LogError($"key:{child} not exits, please check key define");
                }
            }
        }
    }
}
```

# RedDotNode

```c#
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace CLF.RedDotSystem
{
    public class RedDotNode
    {
        /// <summary>
        /// 红点类型
        /// </summary>
        public RedDotType redDotType;
        
        /// <summary>
        /// 父节点
        /// </summary>
        public RedDotDefine parentNode;
        
        /// <summary>
        /// 当前节点
        /// </summary>
        public RedDotDefine node;

        /// <summary>
        /// 子节点list
        /// </summary>
        public List<RedDotDefine> children;

        /// <summary>
        /// 是否显示
        /// </summary>
        public bool isActive;

        /// <summary>
        /// 红点数量
        /// </summary>
        public int redDotCount;


        /// <summary>
        /// 红点显示逻辑
        /// </summary>
        public event EventHandler OnLogicHandler;

        /// <summary>
        /// 红点状态改变事件 UI层注册
        /// </summary>
        public event EventHandler<OnRedDotActiveChangeArgs> OnRedDotActiveChange;

        public class OnRedDotActiveChangeArgs : EventArgs
        {
            public RedDotType redDotType;
            public bool isActive;
            public int redDotCount;
        }
        
        
        /// <summary>
        /// 刷新红点显示状态
        /// </summary>
        /// <returns></returns>
        public virtual bool RefreshRedDotState()
        {
            redDotCount = 0;
            if (redDotType == RedDotType.RedDotNodeNum)
            {
                //获取子节点数量
                redDotCount = RedDotSystem.Instance.GetChildNodeRedDotCount(this);
                isActive = redDotCount > 0;
            }
            else
            {
                redDotCount = RefreshRedDotCount();
            }
            OnLogicHandler?.Invoke(this, EventArgs.Empty);

            if (redDotType == RedDotType.RedDotNodeNum)
            {
                isActive = redDotCount > 0;
            }
            
            OnRedDotActiveChange?.Invoke(this, new OnRedDotActiveChangeArgs()
            {
                redDotType = redDotType,
                isActive = isActive,
                redDotCount = redDotCount
            });
            
            return isActive;
        }

        /// <summary>
        /// 刷新红点数量
        /// </summary>
        /// <returns></returns>
        public virtual int RefreshRedDotCount()
        {
            return 1;
        }
        
    }
}
```

# RedDotDefine

```c#
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace CLF.RedDotSystem
{
    public enum RedDotDefine 
    {
        None,
        Shop,
        Shop_Gold,
        Shop_Diamond,
    }
}
```



# RedDotItem红点预制体脚本

```c#
using System;
using System.Collections;
using System.Collections.Generic;
using CLF.RedDotSystem;
using UnityEngine;
using UnityEngine.UI;

public class RedDotItem : MonoBehaviour
{
    public RedDotDefine redKey;
    public GameObject redDotObj;
    public Text countText;
    
    // Start is called before the first frame update
    void Start()
    {
        RedDotSystem.Instance.RegisterRedDotChangeEvent(redKey, OnOnRedDotActiveChange);
        RedDotSystem.Instance.UpdateRedDotState(redKey);
    }

    private void OnEnable()
    {
        RedDotSystem.Instance.UpdateRedDotState(redKey);
    }

    /// <summary>
    /// 红点状态改变事件
    /// </summary>
    /// <param name="o"></param>
    /// <param name="e"></param>
    private void OnOnRedDotActiveChange(object o, RedDotNode.OnRedDotActiveChangeArgs e)
    {
        redDotObj.SetActive(e.isActive);
        if (e.redDotType != RedDotType.Normal)
        {
            countText.text = e.redDotCount.ToString();
        }
        countText.gameObject.SetActive(e.redDotType != RedDotType.Normal);
    }
    
    // Update is called once per frame
    void Update()
    {
        
    }

    private void OnDestroy()
    {
        RedDotSystem.Instance.UnRegisterRedDotChangeEvent(redKey, OnOnRedDotActiveChange);
    }
}
```



# 使用

```c#
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using ZM.RedDotSystem;
public class RedDotNormalStoreDemo : MonoBehaviour
{
    public GameObject storeWindow;
    public Button storeButton;

    public Button goldTabButton;
    public Button diamondTabButton;
    public Button closeButton;

    void Awake()
    {
        storeButton.onClick.AddListener(OnStoreButtonClick);
        goldTabButton.onClick.AddListener(OnGoldTabButtonClick);
        diamondTabButton.onClick.AddListener(OnDiamondTabButtonClick);
        closeButton.onClick.AddListener(OnStoreCloseButtonClick);

        //自定义红点逻辑使用演示，以非继承的形式演示红点的使用方式
        RedDotTreeNode storeMainRoot = new RedDotTreeNode { node = RedDotDefine.StoreRoot, logicHander = OnStoreRedDotLogicHandler, children = new List<RedDotDefine>(){RedDotDefine.StoreRoot,RedDotDefine.StoreRoot}};
        RedDotTreeNode store_Gold_Node = new RedDotTreeNode { parentNode=RedDotDefine.StoreRoot, node = RedDotDefine.Store_Gold, logicHander = OnStoreGoldRedDotLogicHandler };
        RedDotTreeNode store_Diamond_Node = new RedDotTreeNode { parentNode = RedDotDefine.StoreRoot, node=RedDotDefine.Store_Diamond,logicHander = OnStoreDiamondRedDotLogicHandler };
        RedDotSystem.Instance.InitlizateRedDotTree(new List<RedDotTreeNode> { storeMainRoot, store_Gold_Node, store_Diamond_Node });
    }

    public void OnStoreRedDotLogicHandler(RedDotTreeNode redNode)
    {
        if (RedDotDataMgr.Store_Gold_isRead&&RedDotDataMgr.Store_Diamond_isRead)
        {
            redNode.redDotActive = false;
        }
        else
        {
            redNode.redDotActive = true;
        }
        Debug.Log("OnStoreRedDotLogicHandler:" + redNode.redDotActive);
    }
    public void OnStoreGoldRedDotLogicHandler(RedDotTreeNode redNode)
    {
        redNode.redDotActive = RedDotDataMgr.Store_Gold_isRead == false;
        Debug.Log("OnStoreGoldRedDotLogicHandler:"+ redNode.redDotActive);
    }
    public void OnStoreDiamondRedDotLogicHandler(RedDotTreeNode redNode)
    {
        redNode.redDotActive = RedDotDataMgr.Store_Diamond_isRead == false;
        Debug.Log("OnStoreDiamondRedDotLogicHandler:" + redNode.redDotActive);
    }


    #region 按钮事件
    public void OnStoreButtonClick()
    {
        storeWindow.SetActive(true);
    }
    public void OnGoldTabButtonClick()
    {
        RedDotDataMgr.Store_Gold_isRead = true;
        RedDotSystem.Instance.UpdateRedDotState( RedDotDefine.Store_Gold);
    }
    public void OnDiamondTabButtonClick()
    {
        RedDotDataMgr.Store_Diamond_isRead = true;
        RedDotSystem.Instance.UpdateRedDotState(RedDotDefine.Store_Diamond);
    }
    public void OnStoreCloseButtonClick()
    {
        storeWindow.SetActive(false);
    }
    #endregion
}
```

