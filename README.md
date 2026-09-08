# TihuTest · 鹈鹕测试结果展示站

集中展示 AI 生成的鹈鹕测试 HTML，让不同模型的作品可以被浏览、比较和投票。

**[在线演示](https://tihutest.com)** · [快速部署](#快速部署) · [管理后台](#管理后台) · [问题反馈](https://github.com/APomke/tihutest/issues) · [参与贡献](CONTRIBUTING.md)

![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Docker Compose](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)

## 在线演示

访问 **[tihutest.com](https://tihutest.com)** 体验结果预览、全屏查看和社区投票。

项目负责展示与管理已有测试结果，测试 HTML 由管理员自行收集并上传。

## 功能特性

| 功能 | 说明 |
| --- | --- |
| 简洁结果墙 | 首页直接展示 HTML 预览卡片，适配桌面和移动端 |
| 全屏查看 | 点击卡片进入详情页，通过全屏按钮查看原始作品 |
| 点赞排名 | 按点赞数降序排列，同票数时较新的结果优先 |
| 社区投票 | 每个 IP 对每项结果只能点赞或点踩一次，不能撤回或改票 |
| 公开计数 | 所有人可查看赞踩数量；本人投票成功后立即更新并重排，其他访客的变动需刷新页面获取 |
| 内容管理 | 管理员可上传结果、修改信息、替换 HTML、删除结果 |
| 隔离展示 | 上传的 HTML 在 sandbox iframe 内运行 |
| 持久存储 | Docker 数据卷保存测试记录、投票和上传文件 |

## 快速部署

需要安装 Docker Engine 和 Docker Compose v2。下列命令以 Linux 服务器为例。

### 1. 获取项目

```bash
git clone https://github.com/APomke/tihutest.git
cd tihutest
cp .env.example .env
```

### 2. 配置环境变量

编辑 `.env`，替换管理员口令：

```env
ADMIN_PASSWORD=replace-with-a-long-random-password
HOST_PORT=3000
```

| 变量 | 必填 | 用途 |
| --- | --- | --- |
| `ADMIN_PASSWORD` | 是 | 后台上传、编辑和删除操作使用的管理员口令 |
| `HOST_PORT` | 否 | 宿主机访问端口，默认 `3000` |

### 3. 构建并启动

```bash
docker compose up -d --build
docker compose ps
```

默认访问 `http://服务器IP:3000`。修改 `HOST_PORT` 后，请使用对应端口访问，并放行服务器防火墙或安全组端口。使用自定义域名时，可通过反向代理配置 HTTPS。

本项目的 Compose 部署使用 Wrangler 本地运行时提供 D1/R2 兼容存储，数据保存在服务器的数据卷中；此流程无需配置 Cloudflare 账户或 `.openai` 目录。

## 管理后台

在**自己的部署地址**后追加隐藏路径：

```text
http://服务器IP:3000/control-room-7e3f9a
```

首页没有后台入口链接。输入 `.env` 中的 `ADMIN_PASSWORD`，点击“进入管理”即可操作。

- **发布结果**：填写标题、模型名称，可选填写介绍、选择强调色，然后上传 HTML。
- **修改结果**：编辑标题、模型名称、介绍和颜色后保存。
- **替换 HTML**：在已有结果中选择新文件并保存；现有赞踩记录保留。
- **删除结果**：确认后删除该结果、相关投票和 HTML 文件。

上传文件需为完整 HTML 页面，单个文件最大 **10MB**。建议使用内联 CSS、JavaScript 和图片，或可访问的 HTTPS 资源；只上传 HTML 不会一并上传它引用的本地文件。依赖同源存储或父页面访问的脚本可能受到沙箱限制。

## 更新与维护

拉取代码并重新构建：

```bash
cd ~/tihutest
git pull --ff-only
docker compose up -d --build
```

| 操作 | 命令 |
| --- | --- |
| 查看状态 | `docker compose ps` |
| 查看日志 | `docker compose logs -f --tail=100` |
| 重启容器 | `docker compose restart` |
| 修改环境变量后应用配置 | `docker compose up -d` |
| 停止并移除容器，保留数据卷 | `docker compose down` |

### 数据持久化

Compose 中的数据卷键为 `pelican-data`，挂载至容器的 `/data`。实际卷名通常为 `<项目名>_pelican-data`。保持相同项目名和数据卷时，更新或重建容器会继续使用原有数据。

迁移服务器时，需要同时迁移数据卷；Git 仓库中只有源码，没有已上传的测试结果。备份数据前建议先停止服务，避免备份期间发生写入。

> `docker compose down -v` 会删除项目数据卷，包括测试结果、投票和上传文件。常规更新不要添加 `-v`。

### IP 投票说明

IP 限制按网络出口地址计算，同一公网 IP 下的用户共享一次投票机会。当前接口读取 `CF-Connecting-IP` 或 `X-Forwarded-For`；部署反向代理时应正确传递并覆盖客户端 IP 头，避免不同访客被识别为同一地址。未收到这两个头时，接口使用统一的回退标识。

## 本地开发

需要 Node.js **22.13.0 或更高版本**，建议使用 Node.js 22，与 Docker 镜像保持一致。

```bash
npm ci
cp .env.example .env.local
# 编辑 .env.local，设置 ADMIN_PASSWORD
npm run dev
```

默认访问 `http://localhost:3000`。本地开发状态保存在项目的 `.wrangler` 目录，与服务器 Docker 数据卷相互独立。

| 命令 | 用途 |
| --- | --- |
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建应用 |
| `npm run start` | 通过 Wrangler 运行构建产物 |
| `npm run lint` | 检查代码 |
| `npm run format` | 格式化代码 |
| `npm run db:generate` | 根据 Drizzle schema 生成迁移文件 |

## 技术栈

- **界面**：React 19、TypeScript、Tailwind CSS、shadcn/ui
- **应用框架**：Vinext、Vite
- **运行与存储**：Wrangler、D1、R2、Drizzle ORM
- **部署**：Docker 多阶段构建、Docker Compose

## 项目结构

```text
app/
  page.tsx                   # 首页结果墙
  result/[id]/               # 结果详情与全屏查看
  control-room-7e3f9a/        # 管理后台
  api/results/               # 上传、管理、投票、HTML 接口
components/
  pelican/                   # 结果卡片、查看器、后台表单
  ui/                        # 基础 UI 组件
db/                          # 数据库 schema 与辅助代码
drizzle/                     # 数据库迁移文件
lib/                         # 数据查询和公共工具
public/                      # 静态资源
Dockerfile                   # 镜像构建配置
compose.yaml                 # 服务、端口和数据卷
docker-entrypoint.sh         # 容器启动脚本
.env.example                 # 环境变量示例
```

## 反馈与贡献

欢迎通过 [Issues](https://github.com/APomke/tihutest/issues) 提交问题或功能建议，也欢迎提交 Pull Request。请先阅读 [贡献指南](CONTRIBUTING.md)，提供复现步骤、相关日志和验证方式。
