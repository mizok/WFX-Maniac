---
title: 高見龍為自己學 git 學習筆記-ep2
---

###### tags: `學習筆記`




## 關於git add的一些常識

當我git add 一個檔案之後, 我如果再去修改他, 接著再commit。
其實在這個commit，git 並不會去紀錄該檔案的改動, 因為這個檔案只是被加到暫存區而已，git沒有辦法去refer到他的歷史改動狀況。

所以建議如果要git add檔案, 一律add完之後commit一次再做改動

> 要commit之前一定要先add --all, 或者可以直接使用 git commit -a

> 想要add 一個資料夾, 包括底下的所有child folder, 可以使用git add ., 如果是想要 add 整個專案的內容，則可以用git add --all

> git commit --allowed-empty -m "" 這樣寫就可以不用寫commit 
log

> git 可以分成 工作目錄/暫存區/儲存區
> 用git add 把檔案從工作目錄記錄到暫存區, 用git commit 把檔案從暫存區記錄到儲存區



## git log 內容有些什麼

可以看到每一個commit點

1. commit 的人是誰?
2. 時間點
3. commit log

> 可以搭配 --oneline 或 --graph 來做不同模式的log顯示
> 可以用 --author 查詢特定開發者的commit內容
> --author="" 的使用, 如果開發者有兩位以上, 可以使用 userA \| userB
> --grep="" 的使用, 可以尋找commit log裡面有特定字串的commit點
> -S"" 的使用, 可以尋找commit 點之中，改動內容含有特定字串的commit 點
> --since="" & --until="" & --after="2019-01"  可以顯示特定時間點區間的commit點
> 


## git rm 是幹嘛用的? 跟一般的rm 差在哪裡?

git rm 等於 先使用一般的rm , 然後再把這個rm 的改動 用add 加到暫存區

> 可以使用 --cached ，這樣會變成單純的把檔案與git 斷聯，但是不會實際刪除檔案, 這樣該檔案在做完這個動作之後就會變成 untracked了


## git mv 改變檔名

例如
```

git mv aa.html bb.html
```


