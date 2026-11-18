# 琨哥鼓励器

[![Online](https://img.shields.io/badge/Online-GitHub%20Pages-2ea44f?logo=github)](https://luckymaomi.github.io/niuma/)
[![Stars](https://img.shields.io/github/stars/luckymaomi/niuma?style=flat)](https://github.com/luckymaomi/niuma/stargazers)
[![Last commit](https://img.shields.io/github/last-commit/luckymaomi/niuma)](https://github.com/luckymaomi/niuma/commits/main)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

按到手月薪、公积金、年终奖和班表，实时显示今天已经挣了多少钱。纯前端，设置保存在本地。

**在线使用：** [https://luckymaomi.github.io/niuma/](https://luckymaomi.github.io/niuma/)

## 能力一览

- 今日已挣实时跳动；每分钟 / 每小时 / 上班日预计
- 今日进度、本月第几个上班日
- 今天能换（瑞幸、肯德基等）
- 设置自动保存；可下载单页 HTML

## 默认值

到手月薪 `2600` · 公积金 `1000` · 年终奖 `10000` · `08:45–16:45` 周一到周五

## 本地运行

```powershell
npm.cmd install --legacy-peer-deps
npm.cmd run dev
```

导出单页：`npm.cmd run build:single`，或页面右上角「下载单页」。

## GitHub Pages

- 仓库：[luckymaomi/niuma](https://github.com/luckymaomi/niuma)
- 在线：[luckymaomi.github.io/niuma](https://luckymaomi.github.io/niuma/)

推送到 `main` 后由 GitHub Actions 自动构建并部署。首次需在仓库 **Settings → Pages → Source** 选择 **GitHub Actions**。
