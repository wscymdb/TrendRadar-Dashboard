# TrendRadar Dashboard (趋势雷达全栈大屏控制台)

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/shadcn%2Fui-UI%20System-black" alt="shadcn/ui" />
  <img src="https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white" alt="Python 3.12" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white" alt="Docker" />
</p>

> **TrendRadar Dashboard** 是基于优秀开源舆情工具 [TrendRadar](https://github.com/sansan0/TrendRadar) 进行全栈现代化升级重构的**全网热点舆情雷达、重点关注情报挖掘、AI 智能分析与多端机器人推送控制台**。
>
> 提供了极其现代优雅的黑白灰极客视觉大屏、全套 RESTful API 接口体系、两栏式关键词分类工作台、多渠道通知管理与一键自动化发布体系。

---

## ✨ 全新核心特性

### 1. 🖥️ 现代化极客前端大屏 (React 18 + shadcn/ui + Tailwind CSS)

- **黑白灰极客设计美学**：告别传统粗糙界面，全量采用精选微动效、卡片流与层级阴影体系；
- **双维度自由切换**：
  - **按关注主题聚合（核心原版模式）**：自动提取当批次命中的高频关注词（如 `DeepSeek`、`华为`、`中国`），动态生成带热度计数的交互标签，点击即刻秒级筛选；
  - **按平台渠道全景**：支持全览微博、知乎、头条、抖音、B站、华尔街见闻等 11 大平台实时 Top 50 榜单生态；
- **时间轴与历史秒级回溯**：支持「实时在榜模式」与「全天历史归档」，跨日期秒级穿梭检索。

### 2. 🗂️ Master-Detail 两栏关键词智能工作台

- **正向白名单与反向黑名单彻底隔离**：
  - **`🏷️ 关注词库`**：按企业、AI、科技、国家等分类管理重点关注词，命中的热搜打上高光标签并推送到群聊；
  - **`🛑 全局黑名单 ([GLOBAL_FILTER])`**：专用于拦截屏蔽标题党、广告营销与低俗八卦（如 `震惊`、`砍一刀`、`博彩`），命中词汇在抓取阶段直接原地丢弃拦截；
- **极速录入与源码双向同步**：支持逗号/空格整组粘贴分词录入，同时提供与底层 `frequency_words.txt` 100% 对应的源码直接编辑模式；
- **一键出厂重置（Reset to Default）**：支持从官方底本一键安全还原标准词库，配备精致的 `ConfirmDialog` 确认防护。

### 3. 🤖 多渠道群机器人与多 Webhook 备注管理

- **全平台多渠道支持**：钉钉、飞书、企业微信、Telegram、邮件、ntfy、Bark、Slack 等；
- **独家多 Webhook 分组与自定义备注**：支持为同一个渠道配置多个机器人群，并支持自定义备注名（如“核心监控群”、“市场推广群”），状态独立启停开关；
- **在线测试握手**：点击测试即可直接向目标群发送模拟握手测试卡片，秒级验证连通性。

### 4. ⚙️ 全可视化配置中心与自动化数据生命周期

- **可视化 Cron 调度引擎**：内置常用周期预设，清晰标注挂钟整点触发机制（如 `每 2 小时偶数整点 (08:00, 10:00, 12:00...)`），后台守护引擎自动定时抓取与广播；
- **数据容量自动淘汰修剪**：支持设置单日最大热搜容量上限与历史数据保留天数（如 7 天、30 天），超量与过期记录自动修剪，确保存储轻盈；
- **全批次抓取历史与终端日志审计**：保留最近批次的抓取耗时、命中条数、各平台成功状态与详细的多等级终端日志。

### 5. 🚀 极速一键发布体系 (`deploy.sh`)

- 独创 **本地前端自动编译 ➡️ 代码与产物直传 ➡️ 远程 Docker 独立构建启动** 闭环流程，无需服务器安装 Node.js，轻松绕开国内服务器拉取 GitHub 慢的瓶颈！

---

## 🏗️ 系统架构设计

```text
┌────────────────────────────────────────────────────────────────────────┐
│               前端展现层 (React 18 + Vite + Tailwind CSS)               │
│   • 首页大屏 (主题聚合 / 平台渠道 / 历史回溯 / 搜索过滤)              │
│   • 管理后台 (概览仪表盘 / 关键词工作台 / 配置中心 / 平台源 / 任务日志)│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ RESTful APIs (JSON)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│             服务端与调度引擎 (Python 3.12 - docker/server.py)           │
│   • RESTful 路由服务 (静态托管 web/dist + API 路由)                    │
│   • 内建 Cron 调度守护引擎 (精准时钟匹配)                             │
│   • 数据持久化与生命周期管理 (SQLite - output/news/*.db)                │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ 多线程调用
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 舆情采集与推送内核 (trendradar 核心模块)                │
│   • 11 大平台热搜实时采集 (微博、知乎、头条、抖音、B站、华尔街见闻等)   │
│   • RSS 订阅源采集 (Hacker News、雅虎财经等)                           │
│   • 规则过滤引擎 ([GLOBAL_FILTER] 黑名单 / [WORD_GROUPS] 白名单)      │
│   • 消息广播引擎 (钉钉 / 飞书 / 企微 / Telegram / 邮件等)              │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📡 RESTful API 接口规范

| 请求方法 | 接口路径              | 说明                                                                                 |
| :------- | :-------------------- | :----------------------------------------------------------------------------------- |
| `POST`   | `/api/auth/login`     | 验证管理密码并签发安全认证 Token（基于不可逆加盐 SHA-256）                           |
| `GET`    | `/api/auth/status`    | 获取系统是否启用了密码保护及当前客户端凭据的有效性                                   |
| `POST`   | `/api/auth/logout`    | 安全注销退出管理会话                                                                 |
| `GET`    | `/api/status`         | 获取系统运行状态、版本、时区、启用的平台与 RSS 统计                                  |
| `GET`    | `/api/news`           | 查询实时热搜与历史数据（支持 `scope=current/history`, `platform`, `search`, `date`） |
| `GET`    | `/api/dates`          | 获取 SQLite 数据库中所有已归档的历史日期列表                                         |
| `GET`    | `/api/keywords`       | 获取结构化分类关键词、全局黑名单列表与原始配置文本                                   |
| `POST`   | `/api/keywords`       | 保存并持久化写入 `frequency_words.txt`                                               |
| `POST`   | `/api/keywords/reset` | 一键恢复为系统官方预设默认关键词规则                                                 |
| `GET`    | `/api/config`         | 获取 AI、通知渠道、Webhook 列表、Cron 调度及存储容量配置                             |
| `POST`   | `/api/config`         | 保存全部系统配置并同步写回 `config.yaml` 与 `.env`                                   |
| `GET`    | `/api/feeds`          | 获取平台开关列表与 RSS 订阅源配置                                                    |
| `POST`   | `/api/feeds`          | 保存平台启停状态与 RSS 源                                                            |
| `POST`   | `/api/crawl`          | 手动触发一次后台爬虫任务（支持 `mode=current/history`）                              |
| `GET`    | `/api/crawl/logs`     | 获取当前批次的实时终端抓取日志                                                       |
| `GET`    | `/api/crawl/history`  | 获取历史抓取批次统计记录列表                                                         |
| `DELETE` | `/api/crawl/history`  | 清空历史批次日志                                                                     |
| `POST`   | `/api/cleanup`        | 立即手动触发一次数据库容量淘汰与过期文件清理                                         |
| `POST`   | `/api/test/webhook`   | 测试目标 Webhook 连通性并发送握手卡片                                                |

---

## 🚀 快速开始

### 方式一：本地开发调试

#### 1. 启动前端开发服务器

```bash
cd frontend
npm install
npm run dev
# 前端开发界面运行于: http://localhost:5173
```

#### 2. 启动 Python API 后端服务

```bash
# 若之前已创建过 conda 环境，可直接切换激活
conda activate trendradar  # (请替换为实际环境名称)

# 若首次运行，请使用 Python 3.12+ 环境并安装核心依赖
pip install pyyaml pytz requests litellm

# 启动后台服务 (默认监听 7773 端口)
python docker/server.py
```

---

### 方式二：生产服务器一键发布部署 (推荐 ⭐⭐⭐⭐⭐)

利用项目自带的自动化发布脚本，本地执行即可直接完成打包与远程 Docker 部署：

1. 确保本地可免密/正常 SSH 连接目标服务器（如 `xxx.com`）；
2. 在项目根目录执行：
   ```bash
   ./deploy.sh
   ```
3. 脚本将全自动完成：
   - 本地自动执行 `npm run build` 编译 React 前端；
   - 自动排除 `node_modules` 仅同步核心源码与编译产物到服务器 `/root/trendradar-dashboard`；
   - 远程自动使用独立的 `docker/Dockerfile.dashboard` 构建镜像并启动容器；
4. 部署成功后，直接在浏览器访问：
   👉 **`http://<您的服务器IP或域名>:7773/`**

---

## 🔐 控制台访问密码配置 (重要)

为防止控制台与敏感监控配置直接暴露在公网，系统支持**全站统一强制登录保护**（基于不可逆 SHA-256 签名鉴权）：

### 1. 配置位置
- **配置文件路径**：`docker/.env`（参考 [docker/.env.example](docker/.env.example)）
- **配置字段**：`ADMIN_PASSWORD`

### 2. 设置与生效步骤
1. 打开服务器上的 `docker/.env` 文件（或本地开发环境下的 `docker/.env`）；
2. 添加或修改管理员密码（建议使用 8 位以上复杂密码）：
   ```env
   ADMIN_PASSWORD=your_secure_password
   ```
3. 保存后重启容器即可生效：
   ```bash
   # 在服务器部署目录的 docker/ 下重启
   docker compose -f docker-compose.dashboard.yml restart
   ```
4. **安全保护效果**：
   - 任何访客打开网站任意页面（包括首页大屏 `/` 和管理控制台 `/admin`），均会被拦截并重定向至极简科技感登录页 `/login`；
   - 验证通过后凭据（不可逆 Hash Token）安全缓存在客户端，一次解锁长期免输；
   - 顶栏配备「安全退出」按钮，点击随时主动注销并全站重新锁定；
   - 若 `ADMIN_PASSWORD` 留空，系统将作为本地开发免密模式运行。

---

## 🛡️ 敏感凭据与数据安全

- 系统严格保护凭据安全，`docker/.env` 以及存储了真实 Webhook URL 的 `config/webhooks.json` 均已默认纳入 `.gitignore` 保护体系；
- 真实生产部署中请勿提交包含真实 Token 的配置文件至公开仓库；
- 详细项目开发规范请参阅：[AGENTS.md](AGENTS.md) 与 [.agents/rules/project_rules.md](.agents/rules/project_rules.md)。

---

## 💖 致谢与出处

本项目前端系统、大屏交互、RESTful API 服务、两栏工作台及发布体系由 **TrendRadar-Dashboard** 团队开发。

舆情爬虫抓取内核、时间线逻辑与多渠道推送基础基于上游开源项目构建，特此感谢原作者与开源社区的杰出贡献：

- **Upstream Project**: [sansan0/TrendRadar](https://github.com/sansan0/TrendRadar)
- **License**: MIT License
