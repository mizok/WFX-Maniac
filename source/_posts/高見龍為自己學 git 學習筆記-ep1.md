---
title: 高見龍為自己學 git 學習筆記-ep1
---

###### tags: `學習筆記`


## 一些簡單的基本：終端機指令


1. 複製檔案```cp```
2. 重新命名檔案 ```mv '舊檔名' ‘新檔名‘```
3. 列出目前位置 ```pwd```
4. 移除檔案 ```rm```
5. 到根資料夾```cd ~```
6. 顯示所有包括隱藏的檔案```ls -al```

## Vim操作

![](https://i.imgur.com/mXktH1C.png)

## git 基本操作

1. 使用者基本資料設定(bt device)，設定姓名/電子郵件

```
git config --global user.name "Eddie Kao"
git config --global user.email "eddiexxxx@gmail.com"
```
- 這邊拿掉global 的話就會對專案直接做個別設定
- 存取的global使用者資料會在user根資料夾底下的.gitconfig檔案裡
```
~/.gitconfig
```


2. 列出當前使用者資料設定
```
git config --list
```

3. 其實可以把git的預設編輯器改成 VSCODE
https://stackoverflow.com/questions/30024353/how-to-use-visual-studio-code-as-default-editor-for-git

4. git 的操作指令其實也可以寫alias(縮寫)

```terminal
git config --global alias.co checkout
//把checkout指令改成co
```
```terminal
git config --global alias.l "log--oneline--graph"
//也可以把一些比較複雜的指令改成alias
```
```terminal
git config --global alias.ls 'log --graph --pretty=format:"%h <%an> %ar %s"'
//or more complicated
//把git log的格式簡化用
```

## 專案git初始化的流程

1. ```cd <folder>```
2. ```git init```
3. 

```git add --all```

```
git add -A stages all changes

git add . stages new files and modifications, without deletions

git add -u stages modifications and deletions, without new files
```

4. ```git commit -m <commit log>```



