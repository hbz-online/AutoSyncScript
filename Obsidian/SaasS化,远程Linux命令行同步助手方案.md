# 💬 描述

一直以来小M都是用“坚果云软件”加“简阅同步助手软件”来做自动同步。日常使用没有什么问题但如果可以的话还是希望只安装扩展端就能够实现数据的自动同步，而有一天群友贡献了[将简悦 · 同步助手部署在远程（ SaasS 化 ），方便多个扩展端共用一个同步助手 · Discussion #3898 · Kenshin/simpread · GitHub](https://github.com/Kenshin/simpread/discussions/3898)这个思路，这不就是我要的吗？But....远程Windows?我只有个其他人给的Ubuntu小鸡啊！难道就这么放弃了吗？

[同步助手 · 命令行版本 · Discussion #3704 · Kenshin/simpread · GitHub](https://github.com/Kenshin/simpread/discussions/3704)，果然置顶有好东西。如果说命令行版本+自动同步的配置文件，然后SaaS化的思路...如果本机7026端口用haproxy映射到Ubuntu小鸡的7026端口就可以自动同步，那么只要解决“Linux版本的坚果云同步”就可以了！

可惜的是，坚果云的Linux和我想像的不太一样（桌面端？)....还是失败了...

某天，在Google里面搜索坚果云同步方案，看到了一篇文章 [自动备份Linux上的博客数据到坚果云|linux,博客,备份,坚果云,WebDAV|陈一乐](https://chenyongjun.vip/articles/100)，里面的davfs2挂载坚果云同步盘，cadaver工具可以操作上传下载坚果云的文件的操作，让我又燃起了希望。

终于折腾的结果，解放了小M，把坚果云和同步助手的事都交给Ubuntu小鸡,下面分享一下怎么做的,大部分都是网路搜索的文章，虽然内容有点复杂我也是一步步学着看然后弄出来，大家也可以做参考！废话不多说，让我们..............

# 👷‍♂️ 开工

## 本地端安装haproxy

参考网址：

- [将简悦 · 同步助手部署在远程（ SaasS 化 ），方便多个扩展端共用一个同步助手 · Discussion #3898 · Kenshin/simpread · GitHub](https://github.com/Kenshin/simpread/discussions/3898)

- [haproxy入门（mac）](https://its401.com/article/anningzhu/77725354)

- [Mac开机自动运行shell脚本 - wangju003 - 博客园](https://www.cnblogs.com/kaerxifa/p/11378558.html)

1.开个终端输入命令,安装haproxy

```
brew install haproxy
```

2.创建haproxy.cfg文件,假设U小鸡端口是192.168.200.226
```
global
    daemon
    maxconn 256

defaults
    mode http
    timeout connect 5000ms
    timeout client 50000ms
    timeout server 50000ms

listen http-in
    bind *:7026
    server server1 8192.168.200.226:7026 maxconn 32
    
```    

3.创建haproxy.sh脚本加入开机启动项
```
#!/bin/bash
haproxy -f /Users/cbm/haproxy/haproxy.cfg -d
```

ps./Users/cbm/haproxy/haproxy.cfg 为haproxy.cfg的路径

4.加入haproxy.sh到开机启动项

```
这里看参考资料。然后开机会弹出终端启动haproxy，就可以关闭终端，因为haproxy cfg有后台daemon进程守护，所以不要担心服务会没有！
```

## 服务器端安装~命令行版本同步助手

参考网址：

- [同步助手 · 命令行版本 · Discussion #3704 · Kenshin/simpread · GitHub](https://github.com/Kenshin/simpread/discussions/3704)

- [simpread-sync](https://github.com/j1g5awi/simpread-sync/releases)

- [查看Linux系统架构的命令，查看linux系统是哪种架构：AMD、ARM、x86、x86_64、pcc 或 查看Ubuntu的版本号_点亮～黑夜的博客-CSDN博客_linux查看amd](https://blog.csdn.net/weixin_41010198/article/details/109166131)

- [screen linux 命令 在线中文手册](http://linux.51yip.com/search/screen)


1.根据linux系统架构下载合适的压缩档，解压以后传到U小鸡的root文件夹下面
这里我下载的是[simpread-sync_linux_amd64.tar.gz](https://github.com/j1g5awi/simpread-sync/releases/download/v0.6.5/simpread-sync_linux_amd64.tar.gz)，上传的ssh软件是 [GitHub - electerm/electerm: 📻Terminal/ssh/sftp client(linux, mac, win)](https://github.com/electerm/electerm)

2.建立config.json文件
```
{
    "port": 7026,
    "syncPath": "/root/SimpRead",
    "outputPath": "/root/SimpRead/output",
    "mailTitle": "[简悦] - {{title}}",
    "smtpHost": "smtp.qq.com",
    "smtpUsername": "123456@qq.com",
    "smtpPassword": "xzzzzzaaaazubzxxxeb",
    "receiverMail": "123456@qq.com"
}
```
这里重要的是 "syncPath": "/root/SimpRead"，在root文件夹建一个SimpRead文件夹，等下挂载坚果云会用到,里面不要有文件没关系，上面的就按着填，没有的应该去除也可以（smtpHost，smtpUsername，smtpPassword，receiverMail）

3.Screen启动命令行同步助手，输入命令:

```
screen ./simpread-sync
```

![image](https://raw.githubusercontent.com/CenBoMin/GithubSync/main/Obsidian/Pasted%20image%2020220528210652.png)

出现加载配置文件后，在当前screen窗口中键入C-a d，即Ctrl键同时按住a + 在按d键 退出窗口

ps.这个screen类似一个**守护进程**，只要不重启reboot,退出终端同步助手服务还是会运行的！简单记得两个命令,加上上面那个退出的快捷键应该够用了：

查找窗口的编号
```
screen -wipe
```
进入窗口
```
screen -r 16582
```

这时候，本机小M应该已经和小U合体7026端口了！作为测试你可以上传一个simpread_config.json到/root/SimpRead文件夹里面，然后看有没有同步...假如simpread_config.json原本是25kb加了一些稍后读档案会变大(26kb)，这样就合体成功！

接下来就是把坚果云挂到root/SimpRead文件夹，替换成我们坚果云上的simpread_config.json

## 坚果云挂载到Linux服务器

参考网址：

- [自动备份Linux上的博客数据到坚果云|linux,博客,备份,坚果云,WebDAV|陈一乐](https://chenyongjun.vip/articles/100)

- [davfs挂载与使用缺陷 - 代码先锋网](https://www.codeleading.com/article/36015194887/)

- [davfs2 无法挂载坚果云的解决方案 - 代码先锋网](https://www.codeleading.com/article/11235521160/)


1.安装davfs2
```
sudo apt install davfs2

```
2.修改_/etc/davfs2/davfs2.conf
```
nano /etc/davfs2/davfs2.conf

```
然后找到：
**ignore_dav_header 0** 改为 **ignore_dav_header 1**
**delay_upload 10** 改为 **delay_upload 1200**

![image](https://raw.githubusercontent.com/CenBoMin/GithubSync/main/Obsidian/Pasted%20image%2020220528212841.png)


ps.这里的延时上传delay_upload对坚果云来说其实是延时下载，这里是延迟下载1200秒！
ps.修改好nano操作,Ctrl键+O enter确认保存，Ctrl键+X 退出nano


2.修改/etc/davfs2/secrets

```
nano /etc/davfs2/secrets

```

如果不想输入账户密码，可在 **/etc/davfs2/secrets** 的最后面加一行：
```
https://dav.jianguoyun.com/dav/backup 坚果云账户 应用密码
```

ps.加好后nano操作,Ctrl键+O enter确认保存，Ctrl键+X 退出nano

3.挂载坚果云到root/SimpRead
```
sudo mount.davfs https://dav.jianguoyun.com/dav/SimpRead /root/SimpRead
```
然后去sftp看SimpRead文件夹会是坚果云上的文件，这样就是挂载成功了。

ps.https://dav.jianguoyun.com/dav/SimpRead 这个是挂载SimpRead这个目录的文件
![image](https://raw.githubusercontent.com/CenBoMin/GithubSync/main/Obsidian/Pasted%20image%2020220528213923.png)

挂载成功和坚果云的SimpRead一致！

![image](https://raw.githubusercontent.com/CenBoMin/GithubSync/main/Obsidian/Pasted%20image%2020220528214110.png)

如果要解除挂载，输入：
```
umount /root/SimpRead
```

到这，正常来说如果davfs2挂载坚果云是**双向同步**，那么配置已经可用了。可惜我发现davfs2挂载只能是坚果云**单向下载**....

不能上传！不能上传！不能上传！

也就是说，过一会你刚刚本地加入稍后读或者标注都会被坚果云的覆盖消失，而这个时间取决于/etc/davfs2/davfs2.conf的**delay_upload**。

因此为了不要下载覆盖那么快（10秒），我们需要延迟下载1200秒（或者你可以设置的更长，根据个人使用清况，一天86400秒也可，注意davfs2缓存），然后在这段1200秒期间，我们只要即时的把服务器的simpread_config.json上传到坚果云（因为davfs2只能下载），到时1200秒后下载覆盖也是更新后的配置文件即可！那么...

## 定时同步上传配置文件到坚果云

参考网址：

- [linux 执行定时任务几种方式 | Lenix Blog](https://blog.p2hp.com/archives/8033)

- [Linux 定时执行shell脚本命令之crontab - 申文哲 - 博客园](https://www.cnblogs.com/wenzheshen/p/8432588.html)

- [自动备份Linux上的博客数据到坚果云|linux,博客,备份,坚果云,WebDAV|陈一乐](https://chenyongjun.vip/articles/100)



1.安装cadaver
```
sudo apt install cadaver

```

2.在当前root目录创建 .netrc 文件
```
nano /root/.netrc

```
然后贴上
```
machine dav.jianguoyun.com
login 坚果云账户
password 应用密码
```

这个和davfs2一样，只是为了执行时不用输入账户密码的设定

3.创建davbak脚本，快速执行上传指令：
```
nano /root/davbak

```
然后加入,保存，退出！：
```
put simpread_config.json
bye
```

4.crontab加入上传定时任务
检查crond有没有启动服务：
```
ps -ef|grep crond
```
加入定时任务
```
crontab -e
```
然后编辑器内容加入下面这行先测试,每分钟刷新：
```
*/1 * * * * cd /root/SimpRead && cadaver https://dav.jianguoyun.com/dav/SimpRead/ < /root/davbak
```

可以打开坚果云网页版看simpread_config.json（27KB），然后加一些稍后读和标注，然后看小U的文件档案大小变大后（30KB），刷新坚果云网页版看是不是和小U的一样（30KB），这样就表示在同步刷新了！然后根据你的需求在更改cron！

```
11,22,33,44,55 * * * * cd /root/SimpRead && cadaver https://dav.jianguoyun.com/dav/SimpRead/ < /root/davbak

```

ps.正常来说定时设置的越快（一分钟上传一次），延迟下载时间越久（86400秒一次），就越不会有问题，看自己怎么设定！

### 😘 结语

至此，我的小M只要一开机打开稍后读，就能同步简阅的资料。简阅同步助手和坚果云的开机启动项已经移除，可以不用了！

感谢大佬们的贡献和Google,查查找找资料也整出来自己想要的效果了，后面附上自己的简阅稍后读。

![image](htt
://raw.githubusercontent.com/CenBoMin/GithubSync/main/Obsidian/Pasted%20image%2020220528222203.png)


这里挖一个后面是小坑，目前自己用GAS（google app scripts）结合telegram管理做了一个RSS Bot，功能是RSS订阅源更新，会发送Email Telegram 简阅的玩意，结合[GitHub - liuli-io/liuli: 一站式构建多源、干净、个性化的阅读环境](https://github.com/liuli-io/liuli) 还可以处理微信公众号！

