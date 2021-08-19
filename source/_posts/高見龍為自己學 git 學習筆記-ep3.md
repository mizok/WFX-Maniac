---
title: 高見龍為自己學 git 學習筆記-ep3
categories: 
- 前端技術學習心得
tags:
- git
---

## git clone專案的方法

說到clone專案(這邊以github為例), 一般狀況下有下面幾種比較常見的狀況

### 作法一(遠端git倉庫直接clone到本地)

  1. 首先第一步當然是直接在遠端倉庫的網頁(例如github的repo頁面)先開一個repo
  2. 再來打開自己電腦的command line(或是也可以使用Vscode等IDE自帶的終端), 利用bash指令去把當前資料夾位置移到想要存放本地repo資料夾的地方
  3. 然後就直接輸入`git clone <遠端repo位址>`
  4. 這樣就可以創建出一個和遠端倉庫關聯的本地倉庫

### 作法二(本地已經有一個裡面有檔案的資料夾, 然後在遠端也有一個裡面有東西的git倉庫,上面有master, 可能也有master以外的分支, 想要把本地的東西推到遠端)

  1. 首先第一步先把本地的資料夾做git的初始化 `git init`
  2. 再來 `git remote add <遠端資料庫的暱稱, 可以自訂> <遠端資料庫的位址>`
  3. 上面這個動作是去為本地的這個倉庫"標記", 他有關聯上哪一個遠端倉庫(所以其實一個本地倉庫可以關聯上很多個遠端倉庫，但是暱稱不能重複)
  4. 所以說如果我想要去關聯一個新的遠端倉庫(我們這邊取名為apple), 那就是`git remote add apple <apple的位址>`
  5. 接下來因為我們這邊的狀況是本地已經有檔案, 想要推到遠端, 但遠端因為也是有東西的，所以這邊我們其實會有兩種做法，我們接著描述

#### 作法二其1

  1. 直接 `git fetch <指定遠端倉庫的暱稱>` 這邊以apple為例, 也就是 `git fetch apple`
  2. 這麼做之後就可以把遠端倉庫的最新改動、所有分支與檔案下載回來, 而我們這邊因為本地倉庫是新開的，這個狀況叫做 "unborn branch", 是一個只有HEAD在本地的狀況(這部分以後再討論)。
  3. 在這邊講的"unborn branch"的狀況下去做 fetch, 以這邊來講，就會把遠端的master下載回拉本地端，這樣就會在本地端看到一個origin/master分支, 這個就是遠端master在本地的備份, 這時候我們可以直接`git checkout master`或者直接把本地本來就存在的檔案做`git add -A && git commit -m 'initial msg'`, 這樣就會發現第4步的狀況。
  4. 我們會發現本地出現了本地自己的master(關於 unborn branch的介紹可以看這一篇[stackoverflow](https://stackoverflow.com/questions/21252876/git-repository-created-without-a-master-branch) )。
  5. 如果我們在4.的時候是透過`git checkout master`產生本地master的話，會發現本地master是會自動跟遠端的備份(origin/master)同步好的, 而且遠端master也會同時被視為上游分支(上游分支的解釋可以看第7步)，這樣就可以直接跳過第6步進階到第7步。
  6. 但是如果我們在4的時候是透過`git add -A && git commit -m 'initial msg'`去走到第5步，則會發現本地master只有原本就存在本地的檔案，這時候如果用的IDE是 vscode, 如過利用左下角的分支切換功能, 去切到apple/master , 就會發現報錯 "Git: fatal: A branch named 'master' already exists."，這種狀況下我們要去執行 `git pull apple master`，然後就會發現多出了一個新的分支叫做 FETCHED_HEAD，我們接著可以進階到第7步(FETCHED_HEAD只是暫時的, 第七步結束後,FETCHED_HEAD就會消失, IDE也不會再報一樣的錯)。
  7. `git push -u <遠端倉庫的暱稱> <想要push過去的遠端倉庫分支>` , 以這邊來講就是`git push -u apple master`
  8. 這邊的 **-u** 代表的是去把apple master去定為這個分支的上游分支，這樣以後在這個分支上做的git push, 最後都會把改動push到apple master。
  9. 做完最後一步之後就會發現遠端repo的網頁上master的內容已經跟本地同步了

#### 作法二其2

  1. 直接 `git pull <指定遠端倉庫的暱稱> <指定想要pull下來的遠端倉庫分支>`，這邊以apple上的master分支為例, 也就是 `git pull apple master`
  2. 其實這種狀況會跟前面其一的`git add -A && git commit -m 'initial msg'`狀況類似，接著也是直接`git push -u <遠端倉庫的暱稱> <想要push過去的遠端倉庫分支>` 就完事了（當然，如果有改動要commit的記得要commit）。