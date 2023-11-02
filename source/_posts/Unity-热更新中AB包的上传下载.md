---
title: Unity-热更新中AB包的上传下载
author: chenlf
tags:
  - Unity
  - AB包
  - 热更新
categories:
  - Unity
katex: true
date: 2023-10-24 10:58:06
---

![image-20231024110317178](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202310241103272.png)

# 主要内容

1. AB包更新列表文件的生成
2. AB包上传
3. 本地远端资源对比
4. AB包下载
5. 功能拓展

# 上传相关

## 准备AB资源

![image-20231024112139493](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202310241121602.png)

![image-20231024112306262](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202310241123301.png)



## 获取AB包文件的MD5码

1. 根据文件路径获取文件流信息
2. 利用`MD5`对象根据文件流对象，生成16字节的MD5码
3. 将字节数据形式的MD5码转换成16进制字符串（减少MD5码长度）

```c#
public string GetMD5(string filepath)
{
    using (FileStream fs = new FileStream(filepath, FileMode.Open))
    {
        //md5对象生成MD5码
        MD5 md5 = new MD5CryptoServiceProvider();
        byte[] md5Info = md5.ComputeHash(fs);
        fs.Close();

        //将字节数组形式的MD5码转成 16进制字符串
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < md5Info.Length; i++)
        {
            sb.Append(md5Info[i].ToString("x2"));
        }

        return sb.ToString();
    }
}
```



## 生成AB包资源对比文件

1. 菜单栏添加触发按钮
2. 遍历AB包文件夹，获取所有AB包文件信息
3. 将AB包的文件名、大小、MD5码存入资源对比文件中

```c#
[MenuItem("AB包工具/生成对比文件")]
public static void CreateABCompareFile()
{
    //从资源文件夹获取文件信息
    DirectoryInfo directoryInfo = Directory.CreateDirectory(Application.dataPath+"/ArtRes/AB/PC/");
    FileInfo[] fileInfos = directoryInfo.GetFiles();
    string abCompare = "";
    foreach (FileInfo fileInfo in fileInfos)
    {
        //过滤非AB包文件
        if (fileInfo.Extension .Equals(""))
        {
            abCompare += fileInfo.Name + " " + fileInfo.Length + " " +
                GetMD5(fileInfo.FullName) + "|";
        }
    }

    //删除最后一个|符号
    abCompare = abCompare.Substring(0, abCompare.Length - 1);
    //字符串写入资源对比文件
    File.WriteAllText(Application.dataPath+"/ArtRes/AB/PC/ABCompareInfo.txt", abCompare);
    //刷新目录
    AssetDatabase.Refresh();
}
```



## 搭建FTP服务器

使用Serv-U软件搭建

1. 创建域 直接不停下一步即可

2. 使用单向加密
3. 创建用于上传的FTP 账号密码
4. 创建用于下载的FTP 匿名账号 

## 上传AB包和资源对比文件

1. 菜单栏添加触发按钮
2. 遍历AB包文件夹，获取所有AB包文件信息
3. 将文件上传到FTP服务器

```c#
[MenuItem("AB包工具/上传AB包文件")]
public static void UpdateABFiles()
{
    //从资源文件夹获取文件信息
    DirectoryInfo directory = Directory.CreateDirectory(Application.dataPath+"/ArtRes/AB/PC");
    FileInfo[] infos = directory.GetFiles();
    foreach (FileInfo info in infos)
    {
        //上传文件
        if (info.Extension.Equals("")||info.Extension.Equals(".txt"))
        {
            FtpUpdateFile(info.FullName, info.Name);  
        }
    }
}

///
//上传文件
///
private async static void FtpUpdateFile(string filepath, string filename)
{
    await Task.Run(() =>
                   {
                       try
                       {
                           //创建FTP请求
                           FtpWebRequest req = FtpWebRequest.Create(new Uri("ftp://127.0.0.1/AB/PC/"+filename)) as FtpWebRequest;
                           //请求设置
                           req.Credentials = new NetworkCredential("chenlf", "123456");
                           req.Proxy = null;
                           req.KeepAlive = false;
                           req.Method = WebRequestMethods.Ftp.UploadFile;
                           req.UseBinary = true;
                           //获取请求流
                           Stream requestStream = req.GetRequestStream();
                           using (FileStream fileStream = new FileStream(filepath, FileMode.Open))
                           {
                               //从文件流读取到请求流
                               byte[] bytes = new byte[1024];
                               int contentLength = fileStream.Read(bytes,0, bytes.Length);
                               while (contentLength!=0)
                               {
                                   requestStream.Write(bytes,0,contentLength);
                                   contentLength = fileStream.Read(bytes,0, bytes.Length);
                               }
                               fileStream.Close();
                               requestStream.Close();
                           }
                           Debug.Log(filename+" 上传成功");
                       }
                       catch (Exception e)
                       {
                           Debug.Log(filename + " 上传失败：" + e.Message);
                       }
                   });
}
```



# 下载相关

## 创建AB包下载管理器

```c#
public class ABUpdateMgr : MonoBehaviour
{
    public static ABUpdateMgr instance;

    //单例模式创建AB包下载管理器
    public static ABUpdateMgr Instance
    {
        get
        {
            if (instance == null)
            {
                GameObject obj = new GameObject("ABUpdateMgr");
                instance = obj.AddComponent<ABUpdateMgr>();
            }
            return instance;
        }
    }

    private void OnDestroy()
    {
        instance = null;
    }
}
```



## 下载资源对比文件

1. 下载资源对比文件
2. 解析AB包文件信息并保存

```c#
public class ABUpdateMgr : MonoBehaviour
{
    public static ABUpdateMgr instance;

    public static ABUpdateMgr Instance
    {
        get
        {
            if (instance == null)
            {
                GameObject obj = new GameObject("ABUpdateMgr");
                instance = obj.AddComponent<ABUpdateMgr>();
            }
            return instance;
        }
    }
    
    //用于存储远端AB包信息的字典 之后 和本地进行对比即可完成 更新 下载相关逻辑
    private Dictionary<string, ABInfo> remoteABInfo = new Dictionary<string, ABInfo>();

    /// <summary>
    /// 下载资源比较文件
    /// </summary>
    public void DownLoadABCompareFile()
    {
        //从FTP服务器下载对比文件
        print(Application.persistentDataPath);
        DownLoadFile("ABCompareInfo.txt", Application.persistentDataPath+"/ABCompareInfo.txt");
        
        //获取AB包信息
        string info = File.ReadAllText(Application.persistentDataPath+"/ABCompareInfo.txt");
        string[] abInfos = info.Split('|');
        string[] infos = null;
        for (var i = 0; i < abInfos.Length; i++)
        {
            infos = abInfos[i].Split(' ');
            //保存AB包文件信息
            remoteAbInfos.Add(infos[0], new ABInfo(infos[0], infos[1], infos[2]));
        }
        
    }

    /// <summary>
    /// 从FTP服务器下载文件
    /// </summary>
    private void DownLoadFile(string filename, string localPath)
    {
        try
        {
            //创建FTP请求
            FtpWebRequest req = FtpWebRequest.Create(new Uri("ftp://127.0.0.1/AB/PC/"+filename)) as FtpWebRequest;
            //设置FTP请求
            req.Credentials = new NetworkCredential("chenlf", "123456");
            req.Proxy = null;
            req.KeepAlive = false;
            req.Method = WebRequestMethods.Ftp.DownloadFile;
            req.UseBinary = true;
            //获取FTP返回
            FtpWebResponse response = req.GetResponse() as FtpWebResponse;
            //获取返回流
            Stream responseStream = response.GetResponseStream();
            using (FileStream fileStream = new FileStream(localPath, FileMode.Create))
            {
                //从返回流读取到文件流
                byte[] bytes = new byte[1024];
                int contentLength = responseStream.Read(bytes,0, bytes.Length);
                while (contentLength!=0)
                {
                    fileStream.Write(bytes,0,contentLength);
                    contentLength = responseStream.Read(bytes,0, bytes.Length);
                }
                responseStream.Close();
                fileStream.Close();
            }
            Debug.Log(filename+" 下载完成");
        }
        catch (Exception e)
        {
            Debug.Log(filename+" 下载失败："+e.Message);
        }
    }

    private void OnDestroy()
    {
        instance = null;
    }
    
    //AB包信息类
    private class ABInfo
    {
        public string name;//AB包名字
        public long size;//AB包大小
        public string md5;//AB包md5码

        public ABInfo(string name, string size, string md5)
        {
            this.name = name;
            this.size = long.Parse(size);
            this.md5 = md5;
        }
    }
    
}
```



## 下载AB包

根据保存的AB文件信息下载AB包文件

```c#
using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Threading.Tasks;
using UnityEngine;
using UnityEngine.Events;
using UnityEngine.Networking;

public class ABUpdateMgr : MonoBehaviour
{
    private static ABUpdateMgr instance;

    public static ABUpdateMgr Instance
    {
        get
        {
            if(instance == null)
            {
                GameObject obj = new GameObject("ABUpdateMgr");
                instance = obj.AddComponent<ABUpdateMgr>();
            }
            return instance;
        }
    }

    //用于存储远端AB包信息的字典 之后 和本地进行对比即可完成 更新 下载相关逻辑
    private Dictionary<string, ABInfo> remoteABInfo = new Dictionary<string, ABInfo>();

    //这个是待下载的AB包列表文件 存储AB包的名字
    private List<string> downLoadList = new List<string>();

    //下载了多少个文件
    private int downLoadOverNum = 0;
    
    /// <summary>
    /// 下载资源比较文件
    /// </summary>
    public void DownLoadABCompareFile()
    {
        //1.从资源服务器下载资源对比文件
        // www UnityWebRequest ftp相关api
        print(Application.persistentDataPath);
        DownLoadFile("ABCompareInfo.txt", Application.persistentDataPath + "/ABCompareInfo.txt");

        //2.就是获取资源对比文件中的 字符串信息 进行拆分
        string info = File.ReadAllText(Application.persistentDataPath + "/ABCompareInfo.txt");
        string[] strs = info.Split('|');//通过|拆分字符串 把一个个AB包信息拆分出来
        string[] infos = null;
        for (int i = 0; i < strs.Length; i++)
        {
            infos = strs[i].Split(' ');//又把一个AB的详细信息拆分出来
            //记录每一个远端AB包的信息 之后 好用来对比
            remoteABInfo.Add(infos[0], new ABInfo(infos[0], infos[1], infos[2]));
        }
        print("远端AB包对比文件 内容获取结束");        
    }

    /// <summary>
    /// 下载AB包文件
    /// </summary>
    /// <param name="overCallBack">结束委托 是否完成所有下载任务</param>
    /// <param name="updatePro">单个下载结束委托 更新进度</param>
    public async void DownLoadABFile(UnityAction<bool> overCallBack, UnityAction<string> updatePro)
    {
        //1.遍历字典的键 根据文件名 去下载AB包到本地
        foreach (string name in remoteABInfo.Keys)
        {
            //直接放入 待下载列表中
            downLoadList.Add(name);
        }
        //本地存储的路径 由于多线程不能访问Unity相关的一些内容比如Application 所以声明再外部
        string localPath = Application.persistentDataPath + "/";
        //是否下载成功
        bool isOver = false;
        //下载成功的列表 之后用于移除下载成功的内容
        List<string> tempList = new List<string>();
        //重新下载的最大次数
        int reDownLoadMaxNum = 5;
        //下载成功的资源数
        int downLoadOverNum = 0;
        //这一次下载需要下载多少个资源
        int downLoadMaxNum = downLoadList.Count;
        //while循环的目的 是进行n次重新下载 避免网络异常时 下载失败
        while (downLoadList.Count > 0 && reDownLoadMaxNum > 0)
        {
            for (int i = 0; i < downLoadList.Count; i++)
            {
                isOver = false;
                await Task.Run(() => {
                    isOver = DownLoadFile(downLoadList[i], localPath + downLoadList[i]);
                });
                if (isOver)
                {
                    //2.要知道现在下载了多少 结束与否
                    updatePro(++downLoadOverNum + "/" +downLoadMaxNum);
                    tempList.Add(downLoadList[i]);//下载成功记录下来
                }
            }
            //把下载成功的文件名 从待下载列表中移除
            for (int i = 0; i < tempList.Count; i++)
                downLoadList.Remove(tempList[i]);

            --reDownLoadMaxNum;
        }

        //所有内容都下载完了 告诉外部是否下载完成
        overCallBack(downLoadList.Count == 0);
    }

    /// <summary>
    /// 下载文件
    /// </summary>
    private bool DownLoadFile(string fileName, string localPath)
    {
        try
        {
            //1.创建一个FTP连接 用于下载
            FtpWebRequest req = FtpWebRequest.Create(new Uri("ftp://192.168.50.49/AB/PC/" + fileName)) as FtpWebRequest;
            //2.设置一个通信凭证 这样才能下载（如果有匿名账号 可以不设置凭证 但是实际开发中 建议 还是不要设置匿名账号）
            NetworkCredential n = new NetworkCredential("MrTang", "MrTang123");
            req.Credentials = n;
            //3.其它设置
            //  设置代理为null
            req.Proxy = null;
            //  请求完毕后 是否关闭控制连接
            req.KeepAlive = false;
            //  操作命令-下载
            req.Method = WebRequestMethods.Ftp.DownloadFile;
            //  指定传输的类型 2进制
            req.UseBinary = true;
            //4.下载文件
            //  ftp的流对象
            FtpWebResponse res = req.GetResponse() as FtpWebResponse;
            Stream downLoadStream = res.GetResponseStream();
            using (FileStream file = File.Create(localPath))
            {
                //一点一点的下载内容
                byte[] bytes = new byte[2048];
                //返回值 代表读取了多少个字节
                int contentLength = downLoadStream.Read(bytes, 0, bytes.Length);

                //循环下载数据
                while (contentLength != 0)
                {
                    //写入到本地文件流中
                    file.Write(bytes, 0, contentLength);
                    //写完再读
                    contentLength = downLoadStream.Read(bytes, 0, bytes.Length);
                }

                //循环完毕后 证明下载结束
                file.Close();
                downLoadStream.Close();

                return true;
            }
        }
        catch (Exception ex)
        {
            print(fileName + "下载失败" + ex.Message);
            return false;
        }

    }

    private void OnDestroy()
    {
        instance = null;
    }

    //AB包信息类
    private class ABInfo
    {
        public string name;//AB包名字
        public long size;//AB包大小
        public string md5;//AB包md5码

        public ABInfo(string name, string size, string md5)
        {
            this.name = name;
            this.size = long.Parse(size);
            this.md5 = md5;
        }
    }
}
```



## 测试

```c#
public class Test : MonoBehaviour
{
    // Start is called before the first frame update
    void Start()
    {
        ABUpdateMgr.Instance.DownLoadABCompareFile((isCompareOver) =>
        {
            if (isCompareOver)
            {
                //解析AB包对比文件
                ABUpdateMgr.Instance.GetRemoteABCompareFileInfo();
                //下载AB包
                ABUpdateMgr.Instance.DownLoadABFile((isOver)=>
                {
                    if (isOver)
                    {
                        print("所有AB包下载完成，继续其他逻辑");
                    }
                    else
                    {
                        print("AB包下载失败，自行处理");
                    }
                }, (nowNum, maxNum) =>
                {
                    print("下载进度："+nowNum+"/"+maxNum);
                });
            }
            else
            {
                print("对比文件下载失败，自行处理");
            }
        });
    }
}
```

![image-20231031104846705](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202310311048831.png)

![image-20231031104932802](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202310311049850.png)

# 资源更新

在完成了上传和下载的功能之后，进行资源更新的功能开发，资源更新是需要存在本地资源对比文件，和远端的资源对比文件相比较，不同的再从远端下载下来



## 编辑器功能—设置默认资源

选择默认资源保存到StreamingAssets文件夹并为他们生成资源对比文件

1. 菜单栏添加触发按钮（MenuItem）
2. 获取Project窗口选择的资源信息（Selection）
3. 将选择到的文件复制到StreamingAssets文件夹中（AssetDatabase）
4. 为StreamingAssets文件夹中的AB包文件信息写入资源对比文件中（文件写入）

```c#
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEditor;
using UnityEngine;

public class MoveABToSA
{
    [MenuItem("AB包工具/移动资源到StreamingAssets")]
    public static void MoveABToStreamingAssets()
    {
        //获取Project窗口选择的资源信息（Selection）
        Object[] objs = Selection.GetFiltered(typeof(Object), SelectionMode.DeepAssets);
        if (objs.Length == 0)
        {
            return;
        }
        
        if (!Directory.Exists(Application.streamingAssetsPath))
        {
            Directory.CreateDirectory(Application.streamingAssetsPath);
        }

        string abCompareInfo = "";
        //遍历选中的资源
        foreach (Object obj in objs)
        {
            string assetPath = AssetDatabase.GetAssetPath(obj);
            string fileName = assetPath.Substring(assetPath.LastIndexOf('/'));
            FileInfo fileInfo = new FileInfo(Application.streamingAssetsPath + fileName);
            if (!fileInfo.Extension.Equals("") && !fileInfo.Extension.Equals("txt"))
            {
                continue;
            }
            //将选择到的文件复制到StreamingAssets文件夹中（AssetDatabase）
            AssetDatabase.CopyAsset(assetPath, "Assets/StreamingAssets" + fileName);
            
            //拼接资源对比文件内容
            abCompareInfo += fileInfo.Name + " " + fileInfo.Length + " " +
                             CreateABCompare.GetMD5(Application.streamingAssetsPath + fileName);
            abCompareInfo += '/';
        }
        //为StreamingAssets文件夹中的AB包文件信息写入资源对比文件中（文件写入）
        abCompareInfo = abCompareInfo.Substring(0, abCompareInfo.Length - 1);
        File.WriteAllText(Application.streamingAssetsPath + "/ABCompareInfo.txt", abCompareInfo);
        AssetDatabase.Refresh();
    }
}
```

测试：

![image-20231031105405382](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202310311054421.png)



## 游戏功能--默认资源转存问题

![image-20231025110731838](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202310251107980.png)



## 游戏功能--资源更新删除

### 获取远端对比文件

两种做法：

1. 保存到临时文件中，待AB包下载完成后，再用该临时文件覆盖本地对比文件（使用）
2. 不保存文件，直接通过下载流去读取字节数据转为字符串，待AB包下载完成后再保存为本地资源对比文件

因为使用临时文件的方式，来和本地资源文件做对比所以只要修改上面代码中的文件名当成临时文件就行
这里将**下载文件**和**解析信息**并保存拆分成了两个函数

```c#
/// <summary>
/// 下载AB包对比文件
/// </summary>
/// <param name="overCallBack"></param>
public async void DownLoadABCompareFile(UnityAction<bool> overCallBack)
{
    //1.从资源服务器下载资源对比文件
    // www UnityWebRequest ftp相关api
    print(Application.persistentDataPath);
    bool isOver = false;
    int reDownLoadMaxNum = 5;
    //不能在子线程中访问Unity主线程的 Application 所以 在外面声明
    string localPath = Application.persistentDataPath;
    while (!isOver && reDownLoadMaxNum > 0)
    {
        await Task.Run(() => {
            isOver = DownLoadFile("ABCompareInfo.txt", localPath + "/ABCompareInfo_TMP.txt");
        });
        --reDownLoadMaxNum;
    }

    //告诉外部成功与否
    overCallBack?.Invoke(isOver);
}

/// <summary>
/// 获取下载下来的AB包中的信息
/// </summary>
public void GetRemoteABCompareFileInfo()
{
    //2.就是获取资源对比文件中的 字符串信息 进行拆分
    string info = File.ReadAllText(Application.persistentDataPath + "/ABCompareInfo_TMP.txt");
    string[] strs = info.Split('|');//通过|拆分字符串 把一个个AB包信息拆分出来
    string[] infos = null;
    for (int i = 0; i < strs.Length; i++)
    {
        infos = strs[i].Split(' ');//又把一个AB的详细信息拆分出来
        //记录每一个远端AB包的信息 之后 好用来对比
        remoteABInfo.Add(infos[0], new ABInfo(infos[0], infos[1], infos[2]));
    }

    print("远端AB包对比文件 内容获取结束");
}
```



### 获取本地对比文件

因为和获取远程资源对比文件类解析信息并保存类似，所以修改`GetRemoteABCompareFileInfo`函数改为`GetABCompareFileInfo`函数

```c#
/// <summary>
/// 获取对应路径中的AB包中的信息
/// </summary>
public void GetABCompareFileInfo(string info, Dictionary<string, ABInfo> abInfoDictionary)
{
    //2.就是获取资源对比文件中的 字符串信息 进行拆分
    //string info = File.ReadAllText(Application.persistentDataPath + "/ABCompareInfo_TMP.txt");
    string[] strs = info.Split('|');//通过|拆分字符串 把一个个AB包信息拆分出来
    string[] infos = null;
    for (int i = 0; i < strs.Length; i++)
    {
        infos = strs[i].Split(' ');//又把一个AB的详细信息拆分出来
        //记录每一个远端AB包的信息 之后 好用来对比
        abInfoDictionary.Add(infos[0], new ABInfo(infos[0], infos[1], infos[2]));
    }
}
```

为了读取本地资源对比文件内容并解析，使用`UnityWebRequest`并配合协程（主要是为了多平台读取）

```c#
/// <summary>
/// 本地资源对比文件 解析保存
/// <param name="overCallBack"></param>
/// </summary>
public void GetLocalABCompareFileInfo(UnityAction<bool> overCallBack)
{
    //首先从可读写文件夹查看是否存在资源对比文件 存在代表着之前有更新过
    if (File.Exists(Application.persistentDataPath+"/ABCompareInfo.txt"))
    {
        StartCoroutine(GetLocalABCompareFileInfoWithUnityWebRequest(Application.persistentDataPath+"/ABCompareInfo.txt", overCallBack));
    }
    //再从可读文件夹查看是否存在资源对比文件 代表着有默认资源 之前没更新过 
    else if (File.Exists(Application.streamingAssetsPath+"/ABCompareInfo.txt"))
    {
        StartCoroutine(GetLocalABCompareFileInfoWithUnityWebRequest("file://"+Application.streamingAssetsPath+"/ABCompareInfo.txt", overCallBack));
    }
    //没有本地文件
    else
    {
        overCallBack(true);
    }
}

/// <summary>
/// 使用UnityWebRequest读取本地资源对比文件，配合协程使用
/// </summary>
/// <param name="filePath">本地文件路径</param>
/// <param name="overCallBack"></param>
/// <returns></returns>
public IEnumerator GetLocalABCompareFileInfoWithUnityWebRequest(string filePath, UnityAction<bool> overCallBack)
{
    UnityWebRequest req = UnityWebRequest.Get(filePath);
    yield return req.SendWebRequest();
    //2020以上版本用这个： if (req.result == UnityWebRequest.Result.Success)
    if (!string.IsNullOrWhiteSpace(req.error))
    {
        GetABCompareFileInfo(req.downloadHandler.text, localABInfo);
        overCallBack?.Invoke(true);
    }
    else
    {
        overCallBack?.Invoke(false);
    }
}
```



### 资源更新删除

在获取远程和本地的资源对比文件后就可以进行文件内容对比、资源的更新删除了

1. 本地没有的 远程有的要下载
2. 本地远程都有的，判断MD5值，相等不需要更新，不相等需要更新
3. 本地有的 远程没有需要删除

```c#
/// <summary>
/// 游戏开始 进行对比、资源更新
/// </summary>
/// <param name="overCallBack"></param>
/// <param name="updateInfoCallBack"></param>
public void CheckUpdate(UnityAction<bool> overCallBack, UnityAction<string> updateInfoCallBack)
{
    //为了避免由于上一次报错 而残留信息 所以我们清空它
    remoteABInfo.Clear();
    localABInfo.Clear();
    downLoadList.Clear();
    
    //1.加载远程对比文件
    DownLoadABCompareFile((isOver) =>
                          {
                              updateInfoCallBack("加载远程对比文件结束");
                              if (isOver)
                              {
                                  updateInfoCallBack("开始解析远程对比文件");
                                  //解析文件信息并保存
                                  string remoteInfo = File.ReadAllText(Application.persistentDataPath + "/ABCompareInfo_TMP.txt");
                                  GetABCompareFileInfo(remoteInfo, remoteABInfo);
                                  updateInfoCallBack("解析远程对比文件完成");

                                  //2.加载本地对比文件
                                  GetLocalABCompareFileInfo((isLocalOver) =>
                                                            {
                                                                if (isLocalOver)
                                                                {
                                                                    updateInfoCallBack("解析本地对比文件完成");
                                                                    //3.对比文件 进行AB包下载
                                                                    UpdateABFiles(overCallBack, updateInfoCallBack, remoteInfo);
                                                                }
                                                                else
                                                                {
                                                                    updateInfoCallBack("解析本地对比文件失败");
                                                                    overCallBack(false);
                                                                }
                                                            });
                              }
                              else
                              {
                                  overCallBack(false);
                              }
                          });
}


/// <summary>
/// 更新删除资源
/// </summary>
/// <param name="overCallBack"></param>
/// <param name="updateInfoCallBack"></param>
/// <param name="remoteInfo"></param>
public void UpdateABFiles(UnityAction<bool> overCallBack, UnityAction<string> updateInfoCallBack, string remoteInfo)
{
    foreach (string abName in remoteABInfo.Keys)
    {
        //1.判断 哪些资源时新的 然后记录 之后用于下载
        //这由于本地对比信息中没有叫这个名字的AB包 所以我们记录下载它
        if (!localABInfo.ContainsKey(abName))
            downLoadList.Add(abName);
        //发现本地有同名AB包 然后继续处理
        else
        {
            //2.判断 哪些资源是需要更新的 然后记录 之后用于下载
            //对比md5码 判断是否需要更新
            if (localABInfo[abName].md5 != remoteABInfo[abName].md5)
                downLoadList.Add(abName);
            //如果md5码相等 证明是同一个资源 不需要更新

            //3.判断 哪些资源需要删除
            //每次检测完一个名字的AB包 就移除本地的信息 那么本地剩下来的信息 就是远端没有的内容
            //我们就可以把他们删除了
            localABInfo.Remove(abName);
        }
    }
    updateInfoCallBack("对比完成");
    updateInfoCallBack("删除无用的AB包文件");
    //上面对比完了 那么我们就先删除没用的内容 再下载AB包
    //删除无用的AB包
    foreach (string abName in localABInfo.Keys)
    {
        //如果可读写文件夹中有内容 我们就删除它 
        //默认资源中的 信息 我们没办法删除
        if (File.Exists(Application.persistentDataPath + "/" + abName))
            File.Delete(Application.persistentDataPath + "/" + abName);
    }
    updateInfoCallBack("下载和更新AB包文件");
    //下载待更新列表中的所有AB包
    //下载
    DownLoadABFile((isOver) =>
                   {
                       if (isOver)
                       {
                           //下载完所有AB包文件后
                           //把本地的AB包对比文件 更新为最新
                           //把之前读取出来的 远端对比文件信息 存储到 本地 
                           updateInfoCallBack("更新本地AB包对比文件为最新");
                           File.WriteAllText(Application.persistentDataPath + "/ABCompareInfo.txt", remoteInfo);
                       }
                       overCallBack(isOver);
                   }, updateInfoCallBack);
}
```

`DownLoadABFile`函数修改一下:

```c#
/// <summary>
/// 下载待下载列表中的AB包文件
/// </summary>
/// <param name="overCallBack"></param>
/// <param name="updatePro"></param>
public async void DownLoadABFile(UnityAction<bool> overCallBack, UnityAction<string> updatePro)
{
    // //1.遍历字典的键 根据文件名 去下载AB包到本地
    // foreach (string name in remoteABInfo.Keys)
    // {
    //     //直接放入 待下载列表中
    //     downLoadList.Add(name);
    // }
    //本地存储的路径 由于多线程不能访问Unity相关的一些内容比如Application 所以声明再外部
    string localPath = Application.persistentDataPath + "/";
    //是否下载成功
    bool isOver = false;
    //下载成功的列表 之后用于移除下载成功的内容
    List<string> tempList = new List<string>();
    //重新下载的最大次数
    int reDownLoadMaxNum = 5;
    //下载成功的资源数
    int downLoadOverNum = 0;
    //这一次下载需要下载多少个资源
    int downLoadMaxNum = downLoadList.Count;
    //while循环的目的 是进行n次重新下载 避免网络异常时 下载失败
    while (downLoadList.Count > 0 && reDownLoadMaxNum > 0)
    {
        for (int i = 0; i < downLoadList.Count; i++)
        {
            isOver = false;
            await Task.Run(() => {
                isOver = DownLoadFile(downLoadList[i], localPath + downLoadList[i]);
            });
            if (isOver)
            {
                //2.要知道现在下载了多少 结束与否
                //updatePro(++downLoadOverNum, downLoadMaxNum);
                updatePro(++downLoadOverNum + "/" +downLoadMaxNum);
                tempList.Add(downLoadList[i]);//下载成功记录下来
            }
        }
        //把下载成功的文件名 从待下载列表中移除
        for (int i = 0; i < tempList.Count; i++)
            downLoadList.Remove(tempList[i]);

        --reDownLoadMaxNum;
    }

    //所有内容都下载完了 告诉外部是否下载完成
    overCallBack(downLoadList.Count == 0);
}
```





测试：

![image-20231031170735746](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202310311707823.png)

![image-20231031170752514](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202310311707567.png)



# 上传自定资源服务器

将之前的编辑器功能整合到一个窗口，并且添加IP地址输入框和平台选择页签

```c#
using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using UnityEditor;
using UnityEngine;

public class ABTools : EditorWindow
{
    private int nowSelIndex = 0;
    private string[] targetStrings = new string[] { "PC", "IOS", "Android" };
    //资源服务器默认IP地址
    private string serverIP = "ftp://127.0.0.1";

    [MenuItem("AB包工具/打开工具窗口")]
    private static void OpenWindow()
    {
        //获取一个ABTools 编辑器窗口对象
        ABTools windown = EditorWindow.GetWindowWithRect(typeof(ABTools), new Rect(0, 0, 350, 220)) as ABTools;
        windown.Show();
    }

    private void OnGUI()
    {
        GUI.Label(new Rect(10, 10, 150, 15), "平台选择");
        //页签显示 是从数组中取出字符串内容来显示 所以 需要改变当前选中的索引
        nowSelIndex = GUI.Toolbar(new Rect(10, 30, 250, 20), nowSelIndex, targetStrings);
        //资源服务器IP地址设置
        GUI.Label(new Rect(10, 60, 150, 15), "资源服务器地址");
        serverIP = GUI.TextField(new Rect(10, 80, 150, 20), serverIP);
        //创建对比文件 按钮
        if(GUI.Button(new Rect(10, 110, 100, 40), "创建对比文件"))
            CreateABCompareFile();
        //保存默认资源到StreamingAssets 按钮
        if (GUI.Button(new Rect(115, 110, 225, 40), "保存默认资源到StreamingAssets"))
            MoveABToStreamingAssets();
        //上传AB包和对比文件 按钮
        if (GUI.Button(new Rect(10, 160, 330, 40), "上传AB包和对比文件"))
            UploadAllABFile();
    }

    //生成AB包对比文件
    private void CreateABCompareFile()
    {
        //获取文件夹信息
        //要根据选择的平台读取对应平台文件夹下的内容 来进行对比文件的生成
        DirectoryInfo directory = Directory.CreateDirectory(Application.dataPath + "/ArtRes/AB/" + targetStrings[nowSelIndex]);
        //获取该目录下的所有文件信息
        FileInfo[] fileInfos = directory.GetFiles();

        if (fileInfos.Length == 0)
        {
            Debug.Log(directory.FullName+" 没有文件需要生成对比文件");
            return;
        }

        //用于存储信息的 字符串
        string abCompareInfo = "";

        foreach (FileInfo info in fileInfos)
        {
            //没有后缀的 才是AB包 我们只想要AB包的信息
            if (info.Extension == "")
            {
                //Debug.Log("文件名：" + info.Name);
                //拼接一个AB包的信息
                abCompareInfo += info.Name + " " + info.Length + " " + GetMD5(info.FullName);
                //用一个分隔符分开不同文件之间的信息
                abCompareInfo += '|';
            }
            //Debug.Log("**********************");
            //Debug.Log("文件名：" + info.Name);
            //Debug.Log("文件路径：" + info.FullName);
            //Debug.Log("文件后缀：" + info.Extension);
            //Debug.Log("文件大小：" + info.Length);
        }
        //因为循环完毕后 会在最后由一个 | 符号 所以 把它去掉
        abCompareInfo = abCompareInfo.Substring(0, abCompareInfo.Length - 1);

        //Debug.Log(abCompareInfo);

        //存储拼接好的 AB包资源信息
        File.WriteAllText(Application.dataPath + "/ArtRes/AB/" + targetStrings[nowSelIndex] + "/ABCompareInfo.txt", abCompareInfo);
        //刷新编辑器
        AssetDatabase.Refresh();

        Debug.Log("AB包对比文件生成成功");
    }
    //获取文件MD5码
    private string GetMD5(string filePath)
    {
        //将文件以流的形式打开
        using (FileStream file = new FileStream(filePath, FileMode.Open))
        {
            //声明一个MD5对象 用于生成MD5码
            MD5 md5 = new MD5CryptoServiceProvider();
            //利用API 得到数据的MD5码 16个字节 数组
            byte[] md5Info = md5.ComputeHash(file);

            //关闭文件流
            file.Close();

            //把16个字节转换为 16进制 拼接成字符串 为了减小md5码的长度
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < md5Info.Length; i++)
                sb.Append(md5Info[i].ToString("x2"));

            return sb.ToString();
        }
    }

    //将选中资源移动到StreamingAssets文件夹中
    private void MoveABToStreamingAssets()
    {
        //通过编辑器Selection类中的方法 获取再Project窗口中选中的资源 
        UnityEngine.Object[] selectedAsset = Selection.GetFiltered(typeof(UnityEngine.Object), SelectionMode.DeepAssets);
        //如果一个资源都没有选择 就没有必要处理后面的逻辑了
        if (selectedAsset.Length == 0)
            return;
        //用于拼接本地默认AB包资源信息的字符串
        string abCompareInfo = "";
        //遍历选中的资源对象
        foreach (UnityEngine.Object asset in selectedAsset)
        {
            //通过Assetdatabase类 获取 资源的路径
            string assetPath = AssetDatabase.GetAssetPath(asset);
            //截取路径当中的文件名 用于作为 StreamingAssets中的文件名
            string fileName = assetPath.Substring(assetPath.LastIndexOf('/'));

            //判断是否有.符号 如果有 证明有后缀 不处理
            if (fileName.IndexOf('.') != -1)
                continue;
            //你还可以在拷贝之前 去获取全路径 然后通过FIleInfo去获取后缀来判断 这样更加的准确

            //利用AssetDatabase中的API 将选中文件 复制到目标路径
            AssetDatabase.CopyAsset(assetPath, "Assets/StreamingAssets" + fileName);

            //获取拷贝到StreamingAssets文件夹中的文件的全部信息
            FileInfo fileInfo = new FileInfo(Application.streamingAssetsPath + fileName);
            //拼接AB包信息到字符串中
            abCompareInfo += fileInfo.Name + " " + fileInfo.Length + " " + CreateABCompare.GetMD5(fileInfo.FullName);
            //用一个符号隔开多个AB包信息
            abCompareInfo += "|";
        }
        //去掉最后一个|符号 为了之后拆分字符串方便
        abCompareInfo = abCompareInfo.Substring(0, abCompareInfo.Length - 1);
        //将本地默认资源的对比信息 存入文件
        File.WriteAllText(Application.streamingAssetsPath + "/ABCompareInfo.txt", abCompareInfo);
        //刷新窗口
        AssetDatabase.Refresh();
    }

    //上传AB包文件到服务器
    private void UploadAllABFile()
    {
        //获取文件夹信息
        DirectoryInfo directory = Directory.CreateDirectory(Application.dataPath + "/ArtRes/AB/" + targetStrings[nowSelIndex] + "/");
        //获取该目录下的所有文件信息
        FileInfo[] fileInfos = directory.GetFiles();

        if (fileInfos.Length == 0)
        {
            Debug.Log(directory.FullName+" 没有文件需要上传");
            return;
        }

        foreach (FileInfo info in fileInfos)
        {
            //没有后缀的 才是AB包 我们只想要AB包的信息
            //还有需要获取 资源对比文件 格式是txt（该文件夹中 只有对比文件的格式才是txt 所以可以这样判断）
            if (info.Extension == "" ||
                info.Extension == ".txt")
            {
                //上传该文件
                FtpUploadFile(info.FullName, info.Name);
            }
        }
    }
    //异步上传文件
    private async void FtpUploadFile(string filePath, string fileName)
    {
        await Task.Run(() =>
        {
            try
            {
                //1.创建一个FTP连接 用于上传
                FtpWebRequest req = FtpWebRequest.Create(new Uri( serverIP + "/AB/" + targetStrings[nowSelIndex] + "/" + fileName)) as FtpWebRequest;
                //2.设置一个通信凭证 这样才能上传
                req.Credentials = new NetworkCredential("chenlf", "123456");
                //3.其它设置
                //  设置代理为null
                req.Proxy = null;
                //  请求完毕后 是否关闭控制连接
                req.KeepAlive = false;
                //  操作命令-上传
                req.Method = WebRequestMethods.Ftp.UploadFile;
                //  指定传输的类型 2进制
                req.UseBinary = true;
                //4.上传文件
                //  ftp的流对象
                Stream upLoadStream = req.GetRequestStream();
                //  读取文件信息 写入该流对象
                using (FileStream file = File.OpenRead(filePath))
                {
                    //一点一点的上传内容
                    byte[] bytes = new byte[2048];
                    //返回值 代表读取了多少个字节
                    int contentLength = file.Read(bytes, 0, bytes.Length);

                    //循环上传文件中的数据
                    while (contentLength != 0)
                    {

                        //写入到上传流中
                        upLoadStream.Write(bytes, 0, contentLength);
                        //写完再读
                        contentLength = file.Read(bytes, 0, bytes.Length);
                    }

                    //循环完毕后 证明上传结束
                    file.Close();
                    upLoadStream.Close();
                }

                Debug.Log(fileName + "上传成功");
            }
            catch (Exception ex)
            {
                Debug.Log(fileName + "上传失败" + ex.Message);
            }
        });

    }
}
```



# 路径优化

![image-20231031180055362](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202310311800409.png)

```c#
/// <summary>
/// 下载文件
/// </summary>
/// <param name="fileName"></param>
/// <param name="localPath"></param>
/// <returns></returns>
private bool DownLoadFile(string fileName, string localPath)
{
    try
    {
        string pInfo =
        #if UNITY_IOS
            "IOS";
        #elif UNITY_ANDROID
            "Android";
        #else
            "PC";
        #endif
            //1.创建一个FTP连接 用于下载
            FtpWebRequest req = FtpWebRequest.Create(new Uri(serverIP + "/AB/" + pInfo + "/" + fileName)) as FtpWebRequest;
        //2.设置一个通信凭证 这样才能下载（如果有匿名账号 可以不设置凭证 但是实际开发中 建议 还是不要设置匿名账号）
        NetworkCredential n = new NetworkCredential("MrTang", "MrTang123");
        req.Credentials = n;
        //3.其它设置
        //  设置代理为null
        req.Proxy = null;
        //  请求完毕后 是否关闭控制连接
        req.KeepAlive = false;
        //  操作命令-下载
        req.Method = WebRequestMethods.Ftp.DownloadFile;
        //  指定传输的类型 2进制
        req.UseBinary = true;
        //4.下载文件
        //  ftp的流对象
        FtpWebResponse res = req.GetResponse() as FtpWebResponse;
        Stream downLoadStream = res.GetResponseStream();
        using (FileStream file = File.Create(localPath))
        {
            //一点一点的下载内容
            byte[] bytes = new byte[2048];
            //返回值 代表读取了多少个字节
            int contentLength = downLoadStream.Read(bytes, 0, bytes.Length);

            //循环下载数据
            while (contentLength != 0)
            {
                //写入到本地文件流中
                file.Write(bytes, 0, contentLength);
                //写完再读
                contentLength = downLoadStream.Read(bytes, 0, bytes.Length);
            }

            //循环完毕后 证明下载结束
            file.Close();
            downLoadStream.Close();

            return true;
        }
    }
    catch (Exception ex)
    {
        print(fileName + "下载失败" + ex.Message);
        return false;
    }

}
```

```c#
 public void GetLocalABCompareFileInfo(UnityAction<bool> overCallBack)
 {
     //首先从可读写文件夹查看是否存在资源对比文件 存在代表着之前有更新过
     if (File.Exists(Application.persistentDataPath+"/ABCompareInfo.txt"))
     {
         StartCoroutine(GetLocalABCompareFileInfoWithUnityWebRequest(Application.persistentDataPath+"/ABCompareInfo.txt", overCallBack));
     }
     //再从可读文件夹查看是否存在资源对比文件 代表着有默认资源 之前没更新过 
     else if (File.Exists(Application.streamingAssetsPath+"/ABCompareInfo.txt"))
     {
         string path =
             #if UNITY_ANDROID
             Application.streamingAssetsPath;
         #else
             "file:///" + Application.streamingAssetsPath;
         #endif
             StartCoroutine(GetLocalABCompareFileInfoWithUnityWebRequest(path + "/ABCompareInfo.txt", overCallBack));
     }
     //没有本地文件
     else
     {
         overCallBack(true);
     }
 }
```



# 拓展

1. 可以制作基于HTTP协议的AB包上传下载
2. 资源服务器创建文件夹，将IP地址输入改为IP地址选择



# 项目资源地址

https://github.com/32chens/HotUpdate
