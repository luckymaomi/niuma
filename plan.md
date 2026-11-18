# 牛马 MVP Plan

`plan.md` 是当前任务的规格驱动执行合同。

## 1. 需求

用户要在浏览器里看到「今天已经挣了多少钱」实时跳动，并保存自己的到手月薪、公积金总额、年终奖与班表。

当前范围：

- 今日已挣大数字实时更新。
- 每分钟、每小时、今日预计。
- 今日工时进度条。
- 设置可保存：到手月薪、公积金总额、年终奖、周几上班、上班时间、下班时间。
- 纯前端，本地 `localStorage`，无后端。

当前不做：

- 小目标 / 心愿单。
- 午休扣除。
- 个税与社保细项。
- 趣味外观与装饰文案。

怎样算完成：打开页面能看到实时数字；改设置保存后刷新仍在；核心计薪有单测；类型检查与构建通过。

## 2. 当前事实

- 仓库目录 `niuma` 目前主要是 `ref/` 参考克隆，尚无应用源码。
- owner 确认计薪口径：每月可计 = 到手月薪 + 公积金总额 + 年终奖÷12；年终奖摊到每天；公积金填总额（个人+公司）；先不扣午休。
- 工程风格对齐 `repository/2fa`：Vite + TypeScript + Bootstrap + `core` / `storage` / `ui` / `styles` 分离。
- UI 禁令：无装饰英文 kicker/slogan、无宣传副标题、无单边强调色条。

## 3. 生产级验收保护点

- 自动测试：每月可计、本月工作日、今日预计、上班前/班中/下班后已挣与进度。
- 类型检查：`npm.cmd run typecheck`
- 构建：`npm.cmd run build`
- 页面：`index.html` → `#app`
- 存储：保存后重新加载能读回设置

## 4. 目标

- 用户路径：打开 → 看今日已挣 → 改设置保存 → 数字按新口径跳。
- 代码：`src/core` 计薪；`src/storage` 读写；`src/ui` 展示与接线。
- 文档：`AGENTS.md` / `spec.md` / `README.md` 与实现同步。
- 完成判定：测试、类型检查、构建全绿。

## 5. 边界

- 不做登录、云同步、桌面悬浮窗。
- 不做法定节假日自动识别。
- 本月应上班天数按「选中的星期」在当月日历上计数，不含调休补班。
- 跨零点班次本期不做；下班时间须晚于上班时间。

## 6. 设计

### 计薪

```text
每月可计 = 到手月薪 + 公积金总额 + 年终奖 / 12
今日预计 = 每月可计 / 本月应上班天数
每秒收入 = 今日预计 / 每日工时秒数
今日已挣 = 每秒收入 × 今日已计薪秒数
```

状态：上班前 0；班中按已过秒数；下班后等于今日预计；非工作日 0。

### 模块

```text
src/core/earn.ts      计薪纯函数
src/core/types.ts     设置与快照类型
src/storage/settingsStore.ts
src/ui/state.ts
src/ui/controller.ts
src/ui/view/*.ts
src/styles/*.css
tests/earn.test.ts
```

### UI

- 上：今日已挣 + 三档速率 + 进度条
- 下：设置表单 + 保存
- 文案只用短中文名称与字段旁必要提示

## 7. 实施任务

- [x] 写 `plan.md` / `AGENTS.md` / `spec.md`
- [x] 脚手架：`package.json` / Vite / TS / `index.html` / `start.py`
- [x] 实现 `core` + `storage` + 单测
- [x] 实现 UI 与样式
- [x] `README.md`，跑测试/类型检查/构建

## 8. 验证计划

1. `npm.cmd install`
2. `npm.cmd test`
3. `npm.cmd run typecheck`
4. `npm.cmd run build`

## 9. 收口

交付可本地 `npm.cmd start` 打开的静态工具；说明验证结果与未做项。
