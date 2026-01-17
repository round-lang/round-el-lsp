# session one
> https://opncd.ai/share/SQSbSNdO

## 1
我想为我的编程语言round-el实现一个lsp server和vscode插件，都使用ts来实现，当前目录是vscode官方的demo

我的编程语言 round-el 语法类似java，这个是代码示例：@el.txt

需要实现以下功能：
- 关键字补齐：if else for while break，大中小括号，单双引号等
- 语法高亮：关键字、注释、字符串等

## 2
怎么安装到vscode，并正确运行

## 3
client和server目录的package.json还没有写scripts，无法编译和安装

## 4
< some errors

## 5
现在我想要能执行.el文件，怎么做，我希望使用本机的rel二进制来执行文件。rel已经写好了，你只需要实现vscode的运行功能

## 6
round-el 有一些内置函数需要补全和高亮，怎么实现，以下是函数名称：
- to_timestamp, to_unix_timestamp, parse_date, parse_local_datetime, date_format
- print, printf, println, printi, interpolate
- rand, randi, choose, uuid, uuid32, uuid36
- reverse(同时支持string和array)
