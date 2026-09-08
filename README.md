# 鹈鹕测试结果展示站

一个简洁的 AI 鹈鹕测试结果展示与社区投票网站。管理员上传其他 AI 生成的完整 HTML 页面，访客可以在卡片中预览、全屏查看并点赞或点踩。

## 功能

- 首页直接展示管理员上传的 HTML 测试结果
- 点击卡片进入全屏查看页面
- 卡片按照点赞数从高到低排序；点赞数相同时，较新的结果优先
- 每个 IP 对每个结果只能点赞或点踩一次
- 所有访客都能看到实时赞踩数量
- 隐藏的管理员入口，使用环境变量中的口令验证
- 管理员可以上传、修改、替换 HTML 或删除已有结果
- D1 数据库与 R2 文件存储均通过 Docker 数据卷持久化

## Docker Compose 部署

### 1. 获取代码

```bash
git clone https://github.com/APomke/tihutest.git
cd tihutest
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env`：

```env
ADMIN_PASSWORD=请替换为足够长的管理员口令
HOST_PORT=3000
```

### 3. 启动服务

```bash
docker compose up -d --build
```

网站地址：

```text
http://服务器IP:3000
```

隐藏管理员入口：

```text
http://服务器IP:3000/control-room-7e3f9a
```

进入后台后可以发布新结果，以及修改、替换或删除已有结果。

## 更新部署

```bash
cd ~/tihutest
git pull
docker compose up -d --build
```

## 常用命令

```bash
# 查看运行状态
docker compose ps

# 查看实时日志
docker compose logs -f

# 重启服务
docker compose restart

# 停止并移除容器，保留数据
docker compose down
```

## 数据持久化

Compose 默认创建 `pelican-data` 数据卷，用于保存数据库、赞踩记录和上传的 HTML。正常更新、重建容器或执行 `docker compose down` 不会丢失数据。

> 注意：执行 `docker compose down -v` 会删除数据卷，包括全部测试结果、投票和上传文件。

## 本地开发

```bash
npm install
cp .env.example .env.local
npm run dev
```

默认访问地址为 `http://localhost:3000`。
