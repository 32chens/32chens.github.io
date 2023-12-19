---
title: Unity-UGUI实践小项目
author: chenlf
tags:
  - Unity
  - UGUI
  - 实践
categories:
  - Unity
katex: true
date: 2023-11-06 15:51:00
---

# 需求分析

![image-20231106160124982](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202311061601066.png)



# 游戏准备

1. 导入资源和Json脚本
2. 设置UI相机和Canvas



# 面板基类

1. 整体显示隐藏
2. 淡入淡出

```c#
public abstract class BasePanel : MonoBehaviour
{
    private CanvasGroup _canvasGroup;
    
    //淡入淡出的速度
    private float alphaSpeed = 10;

    private bool isShow;

    private UnityAction hideCallBack;
    
    private void Awake()
    {
        _canvasGroup = GetComponent<CanvasGroup>();
        if (_canvasGroup == null)
        {
            _canvasGroup = this.gameObject.AddComponent<CanvasGroup>();
        }
    }

    // Start is called before the first frame update
    protected virtual void Start()
    {
        Init();
    }

    public abstract void Init();


    public virtual void ShowMe()
    {
        isShow = true;
        _canvasGroup.alpha = 0;
    }

    public virtual void HideMe(UnityAction hideCallBack)
    {
        isShow = false;
        _canvasGroup.alpha = 1;
        this.hideCallBack = this.hideCallBack;
    }
    
    void Update()
    {
        //淡入
        if (!isShow && _canvasGroup.alpha !=1)
        {
            _canvasGroup.alpha += alphaSpeed * Time.deltaTime;
            if (_canvasGroup.alpha >= 1)
            {
                _canvasGroup.alpha = 1;
            }
        }
        //淡出
        else if (isShow)
        {
            _canvasGroup.alpha -= alphaSpeed * Time.deltaTime;
            if (_canvasGroup.alpha <=0)
            {
                _canvasGroup.alpha = 0;
                hideCallBack?.Invoke();
            }
        }
    }
}
```



# UI管理器

1. 单例模式
2. 面板字典
3. 显示面板
4. 删除面板
5. 获取面板

```c#
public class UIMgr
{
    private static UIMgr instance = new UIMgr();

    public static UIMgr Instance => instance;

    private Transform canvasTransform;

    //字典 存储面板
    public Dictionary<string, BasePanel> panelDic = new Dictionary<string, BasePanel>();

    private UIMgr()
    {
        canvasTransform = GameObject.Find("Canvas").transform;
        GameObject.DontDestroyOnLoad(canvasTransform.gameObject);
    }
    
    //显示面板
    public T ShowPanel<T>() where T : BasePanel
    {
        string panelName = typeof(T).Name;
        if (panelDic.ContainsKey(panelName))
        {
            return panelDic[panelName] as T;
        }

        GameObject panel = GameObject.Instantiate(Resources.Load<GameObject>("UI/" + panelName));
        panel.transform.SetParent(canvasTransform, false);
        
        panelDic.Add(panelName, panel.GetComponent<T>());
        panelDic[panelName].ShowMe();
        return panelDic[panelName] as T;
    }
    
    
    /// <summary>
    /// 隐藏、删除面板
    /// </summary>
    /// <param name="isFade">是否淡出</param>
    /// <typeparam name="T"></typeparam>
    public void HidePanel<T>(bool isFade = true) where T : BasePanel
    {
        string panelName = typeof(T).Name;
        if (isFade)
        {
            if (panelDic.ContainsKey(panelName))
            {
                panelDic[panelName].HideMe(() =>
                {
                    GameObject.Destroy(panelDic[panelName].gameObject);
                    panelDic.Remove(panelName);
                });
            }
        }
        else
        {
            if (panelDic.ContainsKey(panelName))
            {
                GameObject.Destroy(panelDic[panelName].gameObject); 
                panelDic.Remove(panelName);
            }
        }
    }
    
    //获取面板
    public T GetPanel<T>() where T : BasePanel
    {
        string panelName = typeof(T).Name;
        if (panelDic.ContainsKey(panelName))
        {
            return panelDic[panelName] as T;
        }
        return null;
    }
}
```

# 提示面板

拼接面板

![image-20231106190238598](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202311061902672.png)

面板逻辑

```c#
public class TipPanel : BasePanel
{
    public Button btnSure;
    public Text txtInfo;
    public override void Init()
    {
        btnSure.onClick.AddListener(() =>
        {
            UIMgr.Instance.HidePanel<TipPanel>();
        });
    }

    public void ChangeInfo(string info)
    {
        txtInfo.text = info;
    }
}
```



# 登录面板

面板拼接

![image-20231106200700202](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202311062007259.png)

面板逻辑

登录数据

```c#
public class LoginData
{
    public string userName;
    public string passWord;
    public bool isPW;
    public bool isAuto;
}
```

登录管理器--获取和保存登录数据

```c#
public class LoginMgr
{
    private static LoginMgr instance = new LoginMgr();
    public static LoginMgr Instance => instance;

    private LoginData _loginData;

    public LoginData LoginData => _loginData;

    private LoginMgr()
    {
        //直接通过json管理器 来读取对应数据
        _loginData = JsonMgr.Instance.LoadData<LoginData>("LoginData");
    }
    
    #region 登录数据
    //存储登录数据相关
    public void SaveLoginData()
    {
        JsonMgr.Instance.SaveData(_loginData, "LoginData");
    }
    #endregion
    
}
```

登录面板（逻辑待补充）

```c#
public class LoginPanel : BasePanel
{
    public InputField inputUN;
    public InputField inputPW;

    public Toggle togPW;
    public Toggle togAuto;

    public Button btnRegister;
    public Button btnSure;
    
    public override void Init()
    {
        btnRegister.onClick.AddListener(() =>
        {
            
        });
        
        btnSure.onClick.AddListener(() =>
        {
            
        });
        
        togPW.onValueChanged.AddListener((isOn) =>
        {
            if (!isOn)
            {
                togAuto.isOn = false;
            }
        });
        
        togAuto.onValueChanged.AddListener((isOn) =>
        {
            if (isOn)
            {
                togPW.isOn = true;
            }
        });
    }

    public override void ShowMe()
    {
        base.ShowMe();
        LoginData loginData = LoginMgr.Instance.LoginData;

        togPW.isOn = loginData.isPW;
        togAuto.isOn = loginData.isAuto;
        
        inputUN.text = loginData.userName;
        if (loginData.isPW)
        {
            inputPW.text = loginData.passWord;
        }

        if (loginData.isAuto)
        {
            
        }
    }
}
```



# 注册面板

拼接面板

![image-20231106202053362](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202311062020575.png)

面板逻辑

注册数据

```c#
public class RegisterData
{
    public Dictionary<string, string> registerDic = new Dictionary<string, string>();
}
```

登录管理器--获取和保存注册数据

```c#
public RegisterData RegisterData => _registerData;

private LoginMgr()
{
    //直接通过json管理器 来读取对应数据
    _loginData = JsonMgr.Instance.LoadData<LoginData>("LoginData");
    _registerData = JsonMgr.Instance.LoadData<RegisterData>("RegisterData");
}

public void SaveRegisterData()
{
    JsonMgr.Instance.SaveData(_registerData, "RegisterData");
}


public bool RegisterUser(string userName, string passWord)
{
    //判断是否已经存在用户
    if(_registerData.registerDic.ContainsKey(userName))
    {
        return false;
    }

    //如果不存在 证明可以注册
    //存储新用户名和密码
    _registerData.registerDic.Add(userName, passWord);
    //本地存储
    SaveRegisterData();

    //注册成功
    return true;
}

//验证用户名密码是否合法
public bool CheckInfo(string userName, string passWord)
{
    //判断是否有该用户
    if( _registerData.registerDic.ContainsKey(userName) )
    {
        //密码相同 证明 登录成功
        if( _registerData.registerDic[userName] == passWord )
        {
            return true;
        }
    }

    //用户名和密码不合法
    return false;
}
```

注册面板

```c#
public class RegisterPanel : BasePanel
{
    public InputField inputUN;
    public InputField inputPW;
    public Button btnSure;
    public Button btnCancel;
    
    public override void Init()
    {
        btnCancel.onClick.AddListener(() =>
        {
            UIMgr.Instance.HidePanel<RegisterPanel>();
            UIMgr.Instance.ShowPanel<LoginPanel>();
        });
        
        btnSure.onClick.AddListener(() =>
        {
            if (inputUN.text.Length <= 6 || inputPW.text.Length <= 6)
            {
                TipPanel tipPanel = UIMgr.Instance.ShowPanel<TipPanel>();
                tipPanel.ChangeInfo("用户或密码长度不能小于等于6");
                return;
            }

            bool isSuccess = LoginMgr.Instance.RegisterUser(inputUN.text, inputPW.text);
            if (isSuccess)
            {
                //注册成功
                //显示 登录面板
                LoginPanel loginPanel = UIMgr.Instance.ShowPanel<LoginPanel>();
                //更新登录面板上的 用户名和密码
                loginPanel.SetInfo(inputUN.text, inputPW.text);

                //隐藏自己
                UIMgr.Instance.HidePanel<RegisterPanel>();
            }
            else
            {
                TipPanel tipPanel = UIMgr.Instance.ShowPanel<TipPanel>();
                tipPanel.ChangeInfo("用户名已存在");
                inputUN.text = "";
                inputPW.text = "";
            }
        });
    }
    
}
```

