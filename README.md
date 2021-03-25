^_^

AutoSyncScript
此项目用于定时拉取github上各作者的脚本备份。

使用github action的用户，请善用本项目拉取原作者的脚本到自己这里，

然后引用自己仓库的脚本地址运行ac，

不要给原作者添麻烦！
使用说明
1、直接fork本项目到你自己的仓库。

2、点击自己的github设置--settings（右上角头像小三角点开下拉菜单就看到了）

3、点击developer setings

4、点击Personal access tokens

5、点击generate new token

6、note随便起个好记的名字，给“repo”和“workflow”打勾

7、拉倒页面最下，点generate token

8、复制得到的token

9、回到fork得到的仓库，点仓库名字下面一行按钮中的“settings”

10、点击secrets---再点击new repository secrets

11、上面填写 PAT 三个字母

12、下面粘贴复制得到的token

13、保存即可

14、点击仓库名字下面一行按钮中的action

15、点击右上角的star，添加一课星星

16、手动运行一次这个页面的各个sync项目。方法是点击一个项目，然后点击run workflow。

17、回到fork到的仓库的首页，编辑readme.md文件，删掉开头的^_^，再保存一次。

18、完事了

看不懂的可参考一下下面这个文。

https://mp.weixin.qq.com/s/fcI4vQHD8TNajvTML9g3AA
