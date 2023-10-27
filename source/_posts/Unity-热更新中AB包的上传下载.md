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
    DirectoryInfo directoryInfo = Directory.CreateDirectory(Application.dataPath+"/ArtRes/AB/PC/");
    FileInfo[] fileInfos = directoryInfo.GetFiles();
    string abCompare = "";
    foreach (FileInfo fileInfo in fileInfos)
    {
        if (fileInfo.Extension .Equals(""))
        {
            abCompare += fileInfo.Name + " " + fileInfo.Length + " " +
                GetMD5(fileInfo.FullName) + "|";
        }
    }

    abCompare = abCompare.Substring(0, abCompare.Length - 1);
    File.WriteAllText(Application.dataPath+"/ArtRes/AB/PC/ABCompareInfo.txt", abCompare);
    AssetDatabase.Refresh();
}
```



## 搭建FTP服务器

使用Serv-U软件搭建



## 上传AB包和资源对比文件

1. 菜单栏添加触发按钮
2. 遍历AB包文件夹，获取所有AB包文件信息
3. 将文件上传到FTP服务器

```c#
[MenuItem("AB包工具/上传AB包文件")]
public static void UpdateABFiles()
{
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

private async static void FtpUpdateFile(string filepath, string filename)
{
    await Task.Run(() =>
                   {
                       try
                       {
                           FtpWebRequest req = FtpWebRequest.Create(new Uri("ftp://127.0.0.1/AB/PC/"+filename)) as FtpWebRequest;
                           req.Credentials = new NetworkCredential("chenlf", "123456");
                           req.Proxy = null;
                           req.KeepAlive = false;
                           req.Method = WebRequestMethods.Ftp.UploadFile;
                           req.UseBinary = true;
                           Stream requestStream = req.GetRequestStream();
                           using (FileStream fileStream = new FileStream(filepath, FileMode.Open))
                           {
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
2. 获取AB包信息

```c#
public class ABUpdateMgr : MonoBehaviour
{
    public static ABUpdateMgr instance;

    private Dictionary<string, ABInfo> remoteAbInfos = new Dictionary<string, ABInfo>();

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

    public void DownLoadABCompareFile()
    {
        //下载对比文件
        print(Application.persistentDataPath);
        DownLoadFile("ABCompareInfo.txt", Application.persistentDataPath+"/ABCompareInfo.txt");
        
        //获取AB包信息
        string info = File.ReadAllText(Application.persistentDataPath+"/ABCompareInfo.txt");
        string[] abInfos = info.Split('|');
        string[] infos = null;
        for (var i = 0; i < abInfos.Length; i++)
        {
            infos = abInfos[i].Split(' ');
            remoteAbInfos.Add(infos[0], new ABInfo(infos[0], infos[1], infos[2]));
        }
        
    }

    private void DownLoadFile(string filename, string localPath)
    {
        try
        {
            FtpWebRequest req = FtpWebRequest.Create(new Uri("ftp://127.0.0.1/AB/PC/"+filename)) as FtpWebRequest;
            req.Credentials = new NetworkCredential("chenlf", "123456");
            req.Proxy = null;
            req.KeepAlive = false;
            req.Method = WebRequestMethods.Ftp.DownloadFile;
            req.UseBinary = true;
            FtpWebResponse response = req.GetResponse() as FtpWebResponse;
            Stream responseStream = response.GetResponseStream();
            using (FileStream fileStream = new FileStream(localPath, FileMode.Create))
            {
                byte[] bytes = new byte[1024];
                int contentLength = responseStream.Read(bytes,0, bytes.Length);
                while (contentLength!=0)
                {
                    fileStream.Write(bytes,0,contentLength);
                    contentLength = fileStream.Read(bytes,0, bytes.Length);
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
    
}

internal class ABInfo
{
    public string name;
    public long size;
    public string md5;

    public ABInfo(string name, string size, string md5)
    {
        this.name = name;
        this.size = long.Parse(size);
        this.md5 = md5;
    }
}
```



## 下载AB包

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

        print("远端AB包对比文件 加载结束");        
    }

    /// <summary>
    /// 下载AB包文件
    /// </summary>
    /// <param name="overCallBack">结束委托 是否完成所有下载任务</param>
    /// <param name="updatePro">单个下载结束委托 更新进度</param>
    public async void DownLoadABFile(UnityAction<bool> overCallBack, UnityAction<int,int> updatePro)
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
                    updatePro(++downLoadOverNum, downLoadMaxNum);
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



# 资源更新

资源更新是需要存在本地资源对比文件，和远端的资源对比文件相比较，不同的再从远端下载下来



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



## 游戏功能--默认资源转存问题

![image-20231025110731838](https://hexo-chenlf.oss-cn-shanghai.aliyuncs.com/img/202310251107980.png)



## 游戏功能--资源更新删除

### 获取远端对比文件

两种做法：

1. 保存到临时文件中，待AB包下载完成后，再用该临时文件覆盖本地对比文件（使用）
2. 不保存文件，直接通过下载流去读取字节数据转为字符串，待AB包下载完成后再保存为本地资源对比文件

ABUpdateMgr中下载对比文件的方法修改文件名即可



### 获取本地对比文件

