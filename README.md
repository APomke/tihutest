# tihutest

鹈鹕测试结果展示与投票网站。管理员通过隐藏入口上传 AI 生成的 HTML，访客可以全屏查看结果并进行点赞或点踩。

## 本地运行

```bash
npm install
cp .env.example .env.local
npm run dev
```

请在 `.env.local` 中设置管理员口令。上传文件存储于 R2，结果与按 IP 限制的投票记录存储于 D1。

## Docker Compose 部署

1. 复制环境变量示例并设置一个足够长的管理员口令：

   ```bash
   cp .env.example .env
   ```

2. 构建并启动：

   ```bash
   docker compose up -d --build
   ```

3. 打开 `http://服务器IP:3000`。隐藏管理入口为 `/control-room-7e3f9a`。

默认使用名为 `pelican-data` 的 Docker 数据卷保存 D1 数据库和 R2 上传文件，重建容器不会丢失数据。可通过 `.env` 中的 `HOST_PORT` 修改宿主机端口。

常用维护命令：

```bash
docker compose logs -f
docker compose pull
docker compose up -d --build
docker compose down
```

`docker compose down` 不会删除数据卷；只有显式执行 `docker compose down -v` 才会删除全部测试结果、投票和上传文件。
