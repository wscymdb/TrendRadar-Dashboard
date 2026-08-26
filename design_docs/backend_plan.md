# TrendRadar 后端 API 服务架构设计方案（第二阶段）

本文档定义了 TrendRadar 控制台后端 API 服务（`docker/server.py`）的设计规范与实现计划。

> 📌 **核心隔离原则（Upstream Zero-Conflict）**  
> 1. **严禁修改 `trendradar/` 源码**：保持上游仓库的纯净性，以便未来随时无缝 `git pull/merge` 上游更新；  
> 2. **独立服务定位**：后端服务独立封装在 `docker/server.py`（以及本地开发脚本 `server.py`），向上为前端 React 控制台提供标准 REST API，向下通过文件系统（`config/`, `output/`, `.env`）和子进程（`python -m trendradar`）调度核心系统；  
> 3. **一体化统一托管**：单个 Python Web 服务同时托管前端单页应用（`web/dist/`）、原生静态报告（`output/html/`）与 REST API（`/api/*`）。

---

## 一、 配置信息与开关映射体系（AI / 通知 / 平台 / 调度）

后端 API 服务负责将前端控制台的操作，精确映射并原子写入到底层的 **`config/config.yaml`** 与 **`docker/.env`** 文件中：

### 1. AI 大模型配置映射表
| 前端字段名 | 对应后端存储位置 | 变量/键名 | 说明 |
| :--- | :--- | :--- | :--- |
| `aiEnabled` | `docker/.env` & `config.yaml` | `AI_ANALYSIS_ENABLED` / `ai.enabled` | AI 分析总开关（`true` / `false`） |
| `aiModel` | `docker/.env` | `AI_MODEL` | 模型标识（如 `deepseek/deepseek-chat`, `gpt-4o`） |
| `aiApiKey` | `docker/.env` (脱敏读写) | `AI_API_KEY` | 模型提供商 API 密钥（掩码读取 `sk-***`） |
| `aiApiBase` | `docker/.env` | `AI_BASE_URL` | 自定义中转或私有模型 API Base URL |

---

### 2. 通知推送渠道映射表
| 前端字段名 | 对应后端存储位置 | 变量/键名 | 说明 |
| :--- | :--- | :--- | :--- |
| `feishuWebhook` | `docker/.env` | `FEISHU_WEBHOOK_URL` | 飞书群机器人 Webhook |
| `dingtalkWebhook`| `docker/.env` | `DINGTALK_WEBHOOK_URL` | 钉钉群机器人 Webhook |
| `weworkWebhook`  | `docker/.env` | `WEWORK_WEBHOOK_URL` | 企业微信群机器人 Webhook |
| `weworkMsgType`  | `docker/.env` | `WEWORK_MSG_TYPE` | 企微消息格式（`markdown` / `text`） |
| `telegramToken`  | `docker/.env` | `TELEGRAM_BOT_TOKEN` | Telegram Bot Token |
| `telegramChatId` | `docker/.env` | `TELEGRAM_CHAT_ID` | Telegram 接收消息的 Chat ID |

---

### 3. 平台与 RSS 细粒度开关映射表
| 前端字段名 | 对应后端存储位置 | 节点路径 | 说明 |
| :--- | :--- | :--- | :--- |
| `platformsEnabled` | `config/config.yaml` | `platforms.enabled` | 11 大平台抓取总开关 |
| `platform[id].enabled` | `config/config.yaml` | `platforms.sources` 数组 | 每个具体平台（微博/知乎/头条等）的独立启停 |
| `rssEnabled` | `config/config.yaml` | `rss.enabled` | RSS 抓取总开关 |
| `globalMaxAgeDays` | `config/config.yaml` | `rss.max_age_days` | 全局文章新鲜度过滤天数（1~7天） |
| `rssFeeds` | `config/config.yaml` | `rss.feeds` 列表 | 自定义 RSS/Atom 订阅源列表（增删查改） |

---

### 4. 调度与运行模式映射表
| 前端字段名 | 对应后端存储位置 | 变量名 | 说明 |
| :--- | :--- | :--- | :--- |
| `cronSchedule` | `docker/.env` | `CRON_SCHEDULE` | 定时执行频率（如 `*/30 * * * *`） |
| `runMode` | `docker/.env` | `RUN_MODE` | 运行模式（`current` 实时 / `daily` 汇总 / `incremental` 增量） |
| `immediateRun` | `docker/.env` | `IMMEDIATE_RUN` | 容器启动时是否立即执行一次爬虫 |

---

## 二、 整体系统架构与数据流

```text
┌─────────────────────────────────────────────────────────────────────────┐
│              TrendRadar 前端控制台 (React 18 + shadcn/ui)                 │
│              前台主页 (/)  |  后台控制台 (/admin/*)                       │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ HTTP REST API / SSE 日志流
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│               后端 API 服务 (docker/server.py 运行于 7773 端口)           │
│                                                                         │
│  ┌───────────────────────┐  ┌────────────────────────────────────────┐  │
│  │   静态文件托管路由     │  │          REST API 业务路由             │  │
│  │  • / -> web/dist/    │  │  • /api/status    • /api/config         │  │
│  │  • /output/ -> HTML  │  │  • /api/crawl     • /api/keywords       │  │
│  └───────────────────────┘  │  • /api/news      • /api/test/*         │  │
│                             └───────────────────┬────────────────────┘  │
└─────────────────────────────────────────────────┼───────────────────────┘
                                                  │
            ┌─────────────────────────────────────┼─────────────────────────────────────┐
            ▼                                     ▼                                     ▼
┌───────────────────────┐             ┌───────────────────────┐             ┌───────────────────────┐
│     配置与环境层      │             │     爬虫调度执行层    │             │      数据输出层       │
│ • config/config.yaml  │             │ • 启动子进程:         │             │ • output/news/*.db    │
│ • config/timeline.yaml│             │   python -m trendradar│             │ • output/html/*.html  │
│ • config/frequency_words.txt        │ • 实时捕获 stdout/stderr│             │ • output/txt/*.txt    │
│ • docker/.env         │             │ • 异步进程生命周期管理 │             │ • SQLite 数据库读取   │
└───────────────────────┘             └───────────────────────┘             └───────────────────────┘
```

---

## 三、 REST API 接口详细设计

所有 API 均统一返回 JSON 格式：
```json
{
  "code": 0,
  "message": "success",
  "data": { ... }
}
```

### 1. 运行状态与概览接口 (`GET /api/status`)
* 获取系统运行概览、当前是否正在抓取、上次抓取时间、平台与订阅启停统计。

### 2. 爬虫抓取控制与日志接口 (`POST /api/crawl` & `GET /api/crawl/logs`)
* 手动触发 `python -m trendradar` 子进程，并将实时标准输出捕获到日志环形缓冲区（Ring Buffer），实时推送到前端终端抽屉。

### 3. 配置读写接口 (`GET /api/config` & `POST /api/config`)
* 读取并安全更新 `config.yaml` 与 `docker/.env`（自动备份 `config.yaml.bak`，脱敏返回密码与 Token）。

### 4. 平台与 RSS 订阅接口 (`GET /api/feeds`, `POST /api/feeds/platforms/toggle`, `POST /api/feeds/rss`)
* 实时切换 11 平台开关，增删查改 RSS 订阅源并同步写回 `config.yaml`。

### 5. 关键词词库接口 (`GET /api/keywords` & `POST /api/keywords`)
* 解析并格式化回写 `config/frequency_words.txt` 规则文件。

### 6. 热点数据查询接口 (`GET /api/news`)
* 读取 `output/news/*.db` SQLite 数据库，返回最新的聚合热榜新闻列表。

### 7. 连通性测试接口 (`POST /api/test/ai` & `POST /api/test/webhook`)
* 真实握手测试 AI 大模型响应时间，向指定 Webhook 发送测试卡片。

---

## 四、 实施步骤

- ✅ **第 1 步：实现核心后端服务 `docker/server.py`**
  - 使用 Python 内置 `http.server` 实现多功能调度器（SPA 静态文件回退、JSON REST API、CORS 跨域）；
  - 实现 YAML/TXT/ENV 文件的安全解析、备份与原子写入器；
  - 实现 SQLite（`output/news/*.db`）数据提取器；
  - 实现子进程爬虫任务调度与日志环形缓冲区。
- ✅ **第 2 步：实现全量 API 接口端点**
  - `/api/status`, `/api/crawl`, `/api/config`, `/api/feeds`, `/api/keywords`, `/api/news`, `/api/test/*`。
- ✅ **第 3 步：前端数据层无缝对接**
  - 在前端 `src/stores/` 中集成 API 请求客户端，优先请求真实后端接口，离线时优雅降级为 LocalStorage Mock。
- ✅ **第 4 步：本地与 Docker 容器联调自验**
  - 启动 `python docker/server.py`，验证数据互通、一键抓取执行、配置写入与词库修改。
- ✅ **第 5 步：更新部署脚本 `deploy.sh` 与 `docker-compose.yml`**
  - 确保远程服务器发布时自动运行全新升级的 Dashboard API 服务。

---

## 五、 验收标准

1. **绝对零修改 `trendradar/` 源码**，严格遵守上游隔离原则；
2. 运行 `python docker/server.py` 可在 `7773` 端口一站式访问前台主页、管理控制台与原生 HTML 报告；
3. 点击前端「立即抓取」可在后端真正执行 `python -m trendradar`，并在前端终端日志抽屉实时打印输出；
4. 前端修改 AI Key、平台开关、RSS 订阅与关键词后，能够真实持久化写入到 `config/` 和 `.env`。
