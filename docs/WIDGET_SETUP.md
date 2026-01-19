# iOS Widget 设置指南

## 概述

本指南说明如何在 Pocket Squeak 应用中添加 iOS 桌面小组件。

## 前置条件

- macOS 系统
- Xcode 15+
- Apple Developer 账号

## 步骤 1: 生成原生项目

```bash
# 在项目根目录执行
npx expo prebuild --platform ios
```

这会在 `ios/` 目录生成原生 Xcode 项目。

## 步骤 2: 打开 Xcode 项目

```bash
open ios/pocketsqueak.xcworkspace
```

**注意**: 使用 `.xcworkspace` 而不是 `.xcodeproj`

## 步骤 3: 添加 Widget Extension

1. 在 Xcode 菜单中: **File → New → Target**
2. 选择 **iOS → Widget Extension**
3. 填写信息:
   - Product Name: `PocketSqueakWidget`
   - Team: 选择你的开发团队
   - Include Configuration App Intent: **不勾选**
   - Include Live Activity: **不勾选**
4. 点击 **Finish**
5. 弹出提示 "Activate scheme?" 选择 **Activate**

## 步骤 4: 配置 App Groups

Widget 和主 App 需要通过 App Groups 共享数据。

### 4.1 为主 App 配置

1. 在左侧 Project Navigator 选择项目
2. 选择 **pocketsqueak** target (主 App)
3. 选择 **Signing & Capabilities** 标签
4. 点击 **+ Capability**
5. 搜索并添加 **App Groups**
6. 点击 **+** 添加组: `group.com.pocketsqueak.shared`

### 4.2 为 Widget 配置

1. 选择 **PocketSqueakWidgetExtension** target
2. 重复上述步骤添加相同的 App Group

## 步骤 5: 替换 Widget 代码

1. 在 Project Navigator 中展开 `PocketSqueakWidget` 文件夹
2. 删除自动生成的 Swift 文件
3. 将 `ios-widget/PocketSqueakWidget.swift` 的内容复制到新文件

或者直接:
1. 右键 `PocketSqueakWidget` 文件夹
2. **Add Files to "pocketsqueak"**
3. 选择 `ios-widget/PocketSqueakWidget.swift`

## 步骤 6: 配置 Bundle Identifier

确保 Widget 的 Bundle ID 格式正确:

1. 选择 **PocketSqueakWidgetExtension** target
2. 在 **General** 标签中
3. Bundle Identifier 应为: `com.yourteam.pocketsqueak.widget`

## 步骤 7: 构建和运行

1. 选择真机或模拟器
2. 选择 **pocketsqueak** scheme (主 App)
3. 点击运行 (⌘R)

## 步骤 8: 添加 Widget 到主屏幕

1. 在模拟器/设备上长按主屏幕
2. 点击左上角 **+** 按钮
3. 搜索 "Pocket Squeak"
4. 选择 Widget 尺寸并添加

## 数据同步

Widget 通过读取 App Groups 共享容器中的 `widget_data.json` 文件获取数据。

主 App 在以下时机更新数据:
- 加载宠物列表时
- 保存健康记录时
- 添加/删除宠物时

## 故障排除

### Widget 显示 "No pets"

1. 确保 App Groups 配置正确
2. 检查两个 target 的 App Group ID 是否一致
3. 在主 App 中添加至少一只宠物
4. 强制刷新 Widget (长按 → Edit Widget)

### Widget 不更新

Widget 默认每 30 分钟刷新一次。可以通过以下方式强制刷新:
- 打开主 App
- 编辑 Widget (长按 → Edit Widget)

### 构建错误

如果遇到签名错误:
1. 确保两个 target 使用相同的 Team
2. 检查 Provisioning Profile 是否包含 App Groups capability

## 自定义

### 修改刷新频率

在 `PocketSqueakWidget.swift` 中修改:

```swift
let nextUpdate = Calendar.current.date(byAdding: .minute, value: 30, to: Date())!
```

### 修改显示的宠物数量

在各个 View 中修改 `prefix()` 的值:

```swift
ForEach(entry.pets.prefix(3), id: \.id) { pet in  // 显示前3只
```

## 参考资源

- [Apple WidgetKit Documentation](https://developer.apple.com/documentation/widgetkit)
- [App Groups Documentation](https://developer.apple.com/documentation/bundleresources/entitlements/com_apple_security_application-groups)
