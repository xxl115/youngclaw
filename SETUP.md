# SwarmClaw 安装配置记录

## 安装

```bash
# 克隆项目
git clone https://github.com/swarmclawai/swarmclaw.git /home/young/code/swarmclaw

# 安装依赖
cd /home/young/code/swarmclaw
npm install

# 快速启动 (安装 + 初始化 + 启动)
npm run quickstart
```

## 访问

- 地址: http://100.91.104.58:3456
- 访问密钥: 0634f30abfaaa0e6562a2ec886da5641

## 开机自启 (systemd user) - 生产模式

创建服务文件:
```bash
mkdir -p ~/.config/systemd/user
```

写入 `~/.config/systemd/user/swarmclaw.service`:
```ini
[Unit]
Description=SwarmClaw AI Agent Orchestration
After=network.target

[Service]
Type=simple
WorkingDirectory=/home/young/code/swarmclaw
ExecStart=/usr/bin/npm run start -- -p 3456
Restart=always
RestartSec=10
Environment=PATH=/usr/local/bin:/usr/bin:/bin
Environment=NODE_ENV=production

[Install]
WantedBy=default.target
```

先构建生产版本:
```bash
npm run build
```

启用服务:
```bash
systemctl --user daemon-reload
systemctl --user enable swarmclaw.service
loginctl enable-linger young
systemctl --user start swarmclaw
```

## 管理命令

```bash
systemctl --user start swarmclaw   # 启动
systemctl --user stop swarmclaw    # 停止
systemctl --user status swarmclaw  # 状态
journalctl --user -u swarmclaw     # 日志
```

## 常用命令

```bash
npm run dev          # 开发模式
npm run build        # 生产构建
npm run start        # 生产运行
npm run update:easy  # 更新
```
