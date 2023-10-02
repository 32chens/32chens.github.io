---
title: Unity数据持久化
author: chenlf
tags:
  - Unity
  - 持久化
categories:
  - Unity
katex: true
date: 2023-09-28 09:52:30
---

# Json

### JsonUtility（Unity自带）

```c#
Test t = new Test();
string jsonStr = JsonUtility.ToJson(t);	//序列化
t = JsonUtility.FromJson<Test>(jsonStr);	//反序列化
```

注：

- 不能序列化`Dictionary`
- 类中的成员有其他类对象，需要在其他类加上`[System.Serializable]`
- `private` 和 `protected` 成员需要加上`[SerializeField]`
- 无法存储`null`, 而是存储一个目标对象的默认值
- **无法直接读取数据集合**



### LitJson（第三方）

使用：将下载下来LitJson的src目录下的LitJson导入Unity即可

```c#
Test t = new Test();
string jsonStr = JsonMapper.ToJson(t);	//序列化
JsonData data = JsonMapper.ToObject(jsonStr);		//反序列化
print(data.name)
Test data = JsonMapper.ToObject<Test>(jsonStr);		//反序列化 推荐
```

注：

- 不能序列化私有成员变量
- 不需要加特性
- 支持`Dictionary`，但是当`key`为`int`类型，反序列化时会报错
- 类结构需要无参构造函数，否则反序列化时会报错
- 可以直接读取数据集合



JsonUtility和litJson都需要Json文档编码格式为UTF-8

# 二进制

各类型和字节转换

```c#
//将各类型转字节(不转string和decimal)
byte[] bytes = BitConverter.GetBytes(99);

//字节类型转各类型
int i = BitConverter.ToInt32(bytes, 0);

//将字符串以指定的编码格式转字节
byte[] bytes2 = Encoding.UTF8.GetBytes("我真帅");

//字节数组以指定编码转字符串
string s = Encoding.UTF8.GetString(bytes);
```

文件操作

```c#
//判断文件是否存在
bool isExist = File.Exists(Application.datapath+"/hello.txt");
    
//创建文件
FileStream fs = File.Create(Application.datapath+"/hello.txt");

//写入文件
//字节数组写入
byte[] bytes = BitConverter.GetBytes(99);
File.WriteAllBytes(Application.datapath+"/hello.txt", bytes);
//字符串数组写入
string[] strs = new string[]{
    "123", "234"
};
File.WriteAllLines(Application.datapath+"/hello.txt", strs);
//字符串写入
File.WriteAllText(Application.datapath+"/hello.txt", "你好\n哈哈哈");

//读取字节数据
bytes = File.ReadAllBytes(Application.datapath+"/hello.txt");
//读取字符串数组
strs = File.ReadAllLines(Application.datapath+"/hello.txt");
//读取字符串
string str = File.ReadAllText(Application.datapath+"/hello.txt");
                              
//删除文件
File.Delete(Application.datapath+"/hello.txt");

//复制文件
File.Copy(Application.datapath+"/hello.txt", Application.datapath+"/hello2.txt", true);

//文件替换
File.Replace(Application.datapath+"/替换.txt", Application.datapath+"/被替换.txt", Application.datapath+"/备份.txt");

//以流的形式 打开并写入或读取
FileStream fs = File.Open(Application.datapath+"/hello.txt", FileMode.OpenOrCreate, FileAccess.ReadWrite);
```

文件流

```c#
//打开或创建指定文件
FileStream fs = new FileStream(Application.dataPath+"/hello.txt", FileMode.Create, FileAccess.ReadWrite);

FileStream fs = File.Create(Application.datapath+"/hello.txt");

FileStream fs = File.Open(Application.datapath+"/hello.txt", FileMode.OpenOrCreate, FileAccess.ReadWrite);

//文本长度
fs.Length;
//是否可读可写
fs.CanRead fs.CanWrite;
    
//字节缓存写入文件
fs.Flush();
//关闭流
fs.Close();
//缓存清除
fs.Dispose();

//写入字节
byte[] bytes = BitConverter.GetBytes(999);
fs.Write(bytes, 0, 4);	//从0开始,写入4个字节

//读取字节
byte[] bytes =  new byte[4];
fs.Read(bytes, 0, 4);
```

文件夹操作

```c#
Directory.Exists("path");
DirectoryInfo dinfo = Directory.CreateDiretory("DirectoryName");
Directory.Delete("path", true);
string[] strs = Directory.GetDirectories("path");	//获取路径下所有文件夹名
string[] strs = Directory.GetFiles("path");	//获取路径下所有文件名

Directory.Move("path1", "path2");
```

二进制信息序列化

```c#
Person p = new Person();//需要加上[System.Serializable]
//内存流
using(MemoryStream ms = new MemoryStream()){
    //2进制格式化程序
    BinaryFormatter bf = new BinaryFormatter();
    //生成二进制字节数组并存入内存流中
    bf.Serialize(ms, p);
    //取出二进制字节数组并写入文件
	byte[] bytes = ms.GetBuffer();
    File.WriteAllBytes("path.txt", bytes);
    ms.Close();
}

//文件流
using(FileStream fs = new FileStream("path.txt", FileMode.Create, FileAccess.ReadWrite);
){
    //2进制格式化程序
    BinaryFormatter bf = new BinaryFormatter();
    //生成二进制字节数组并存入内存流中
    bf.Serialize(fs, p);
    //二进制字节数组写入文件
	fs.Flush();
    fs.Close();
}
```

反序列化

```c#
//文件流
using(FileStream fs = new FileStream("path.txt", FileMode.Create, FileAccess.ReadWrite);
){
    //2进制格式化程序
    BinaryFormatter bf = new BinaryFormatter();
    //反序列化
    Person p = bf.Deserialize(fs) as Person;
    fs.Close();
}

//反序列化网络传输的二进制数据
using(MemoryStream ms = new MemoryStream(bytes)){
    //2进制格式化程序
    BinaryFormatter bf = new BinaryFormatter();
    //反序列化
    Person p = bf.Deserialize(fs) as Person;
    ms.Close();
}
```

二进制转换对象的加密解密(异或加密)

```c#
int key = 2018;
using(MemoryStream ms = new MemoryStream()){
    //2进制格式化程序
    BinaryFormatter bf = new BinaryFormatter();
    //生成二进制字节数组并存入内存流中
    bf.Serialize(ms, p);
    //取出二进制字节数组并写入文件
	byte[] bytes = ms.GetBuffer();
    for(int i=0; i<bytes.Length; i++){
        bytes[i] ^= key;
    }
    File.WriteAllBytes("path.txt", bytes);
    ms.Close();
}

//反序列化二进制数据
for(int i=0; i<bytes.Length; i++){
      bytes[i] ^= key;
}
using(MemoryStream ms = new MemoryStream(bytes)){
    //2进制格式化程序
    BinaryFormatter bf = new BinaryFormatter();
    //反序列化
    Person p = bf.Deserialize(fs) as Person;
    ms.Close();
}
```

网络传输一般不适用`BinaryFormatter`，因为他是基于`C#`语言，而服务器的编程语言可能是其他语言，所以服务器反序列化时会有问题
