# CI/CD 设置指南

## 概述

本项目使用 **EAS (Expo Application Services)** 进行构建和分发：

- **EAS Update**: 代码更新后秒级推送到已安装的应用
- **EAS Build**: 云端构建 iOS/Android 应用
- **GitHub Actions**: 自动化 CI/CD 流程

## 快速开始

### 1. 安装 EAS CLI

```bash
npm install -g eas-cli
```

### 2. 登录 Expo

```bash
eas login
```

如果没有账号，在 https://expo.dev 注册（免费）。

### 3. 初始化 EAS 项目

```bash
eas init
```

这会创建项目并返回一个 **Project ID**。

### 4. 更新 app.json

将返回的 Project ID 填入 `app.json`：

```json
{
  "expo": {
    "updates": {
      "url": "https://u.expo.dev/YOUR_PROJECT_ID"
    },
    "extra": {
      "eas": {
        "projectId": "YOUR_PROJECT_ID"
      }
    }
  }
}
```

### 5. 配置 GitHub Secrets

在 GitHub 仓库设置中添加 Secret：

1. 打开 https://github.com/pp0214/pocket-squeak/settings/secrets/actions
2. 点击 "New repository secret"
3. 添加 `EXPO_TOKEN`

获取 Token：
```bash
eas credentials
# 或在 https://expo.dev/accounts/[username]/settings/access-tokens 创建
```

---

## 工作流程

### 开发流程 (推荐)

```
代码修改 → git push → GitHub Actions → EAS Update → 手机自动更新
```

1. **首次**: 构建并安装 Development Build
2. **之后**: 每次 push 自动触发 OTA 更新

### 构建 Development Build

```bash
# iOS (需要 Apple Developer 账号)
eas build --profile development --platform ios

# Android
eas build --profile development --platform android
```

构建完成后会提供下载链接或二维码。

### 手动触发更新

```bash
# 推送更新到 development 分支
eas update --branch main --message "feat: 新功能描述"
```

---

## GitHub Actions Workflows

### 1. `eas-update.yml` - 自动更新

**触发条件**: 推送到 `main` 或 `develop` 分支

**功能**: 自动发布 OTA 更新到对应分支

### 2. `eas-build.yml` - 手动构建

**触发条件**: 手动触发 (workflow_dispatch)

**参数**:
- `platform`: ios / android / all
- `profile`: development / preview / production

**使用方法**:
1. 打开 GitHub Actions 页面
2. 选择 "EAS Build" workflow
3. 点击 "Run workflow"
4. 选择参数并执行

### 3. `lint-test.yml` - 代码检查

**触发条件**: 推送或 PR 到 `main`/`develop`

**功能**: TypeScript 类型检查 + Expo Doctor

---

## 分支策略

| 分支 | 用途 | 更新频道 |
|------|------|----------|
| `main` | 生产代码 | production |
| `develop` | 开发代码 | development |
| `feature/*` | 功能分支 | - |

---

## 测试步骤

### iOS 测试

1. **Development Build** (需要 Apple Developer 账号):
   ```bash
   eas build --profile development --platform ios
   ```
   - 下载 .ipa 通过 AltStore/Sideloadly 安装
   - 或使用 TestFlight (需要提交审核)

2. **模拟器测试**:
   ```bash
   eas build --profile development --platform ios --simulator
   ```

### Android 测试

1. **Development Build**:
   ```bash
   eas build --profile development --platform android
   ```
   - 下载 .apk 直接安装

---

## 费用说明

### Expo 免费额度

- **EAS Build**: 30 次构建/月
- **EAS Update**: 1000 次更新/月
- 对于个人开发完全够用

### Apple Developer Program

- $99/年
- 必须用于 iOS 真机测试和发布

---

## 常见问题

### Q: 更新没有生效？

1. 确认应用使用的是 Development Build 而非 Expo Go
2. 检查分支名称是否匹配
3. 重启应用

### Q: iOS 构建失败？

1. 确认 Apple Developer 账号已配置
2. 运行 `eas credentials` 检查证书

### Q: 如何回滚更新？

```bash
# 查看历史更新
eas update:list

# 回滚到指定更新
eas update:republish --group <update-group-id>
```

---

## 参考链接

- [EAS 官方文档](https://docs.expo.dev/eas/)
- [EAS Update 文档](https://docs.expo.dev/eas-update/introduction/)
- [GitHub Actions for Expo](https://github.com/expo/expo-github-action)
