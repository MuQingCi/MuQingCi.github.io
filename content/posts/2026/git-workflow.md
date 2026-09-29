---
id: git-workflow
title: 让 Git 成为习惯：一个简单的日常工作流
description: 从查看改动到清晰提交，用几个常用命令，让每一次修改都有迹可循。
date: 2026-09-22
category: tech
tags:
  - Git
  - 工具
minutes: 5
cover: git
sample: true
---

Git 的命令很多，日常开发却往往只需要一套清晰的小流程。它的目的很简单：知道自己改了什么，让每次提交表达一个完整的想法。

## 修改前，先了解工作区

开始工作时，先看当前分支和已有修改。不要默认工作区里的所有变更都属于这次任务。

```
git status --short --branch
git diff
```

## 按目的组织一次提交

把同一个目的的修改放在一起。比如修复搜索问题，就只提交搜索相关的文件。暂存后，再检查一次即将提交的内容。

```
git add app.js
git diff --staged
git commit -m "Fix article search"
```

提交信息不需要复杂，但应该能回答：这次修改做了什么？

## 在推送前确认目标

检查远程地址和当前分支，再把修改推送到正确的位置。第一次推送某个分支时，可以设置它的上游。

```
git remote -v
git status --short --branch
git push -u origin main
```

> 一次清晰的提交，是留给未来自己的说明书。

先让这些基本动作成为习惯。等到需要更复杂的协作流程时，再逐步增加新的工具和命令。
