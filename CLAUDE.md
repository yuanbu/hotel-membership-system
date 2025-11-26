# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在处理此代码库时提供指导。

## 项目概述

这是一个酒店员工管理系统，构建为纯前端 Web 应用程序，使用 HTML、CSS、JavaScript 和 Supabase 作为后端数据库。尽管在一些文档中被称为"酒店会员系统"，但实际实现是管理具有薪资信息的员工。

## 开发命令

由于这是一个静态前端应用程序，您可以使用以下任何方法运行它：

```bash
# 方法 1: 直接打开文件（用于测试）
start index.html  # Windows
open index.html   # macOS/Linux

# 方法 2: 本地服务器（推荐）
python -m http.server 8000
npx http-server
# 然后访问 http://localhost:8000

# 方法 3: Live Server (VS Code 扩展)
# 使用 Live Server 扩展
```

## 架构

### 前端结构
- **index.html**: 主应用程序入口点，具有用于 CRUD 操作的选项卡界面
- **js/app.js**: 核心 JavaScript 应用程序逻辑，集成 Supabase
- **css/style.css**: 使用现代 CSS Grid 和 Flexbox 的响应式样式
- **check-table.html**: 检查数据库表结构的实用工具
- **get-table-structure.html**: 检索现有表模式的实用工具

### 数据库模式
应用程序使用名为 `members` 的 Supabase PostgreSQL 表，结构如下：
- `employee_id` (BIGINT): 唯一员工标识符（应用程序逻辑中的主键）
- `employee_name` (VARCHAR): 员工姓名
- `employee_salary` (INTEGER): 员工薪资
- `created_at` (TIMESTAMP): 记录创建时间戳
- `updated_at` (TIMESTAMP): 最后更新时间戳

### 应用程序流程
1. **基于选项卡的界面**: 四个主要选项卡 - 添加员工、搜索员工、编辑员工、删除员工
2. **员工列表**: 显示所有员工的实时刷新功能
3. **Supabase 集成**: 通过 Supabase JavaScript 客户端进行直接数据库操作
4. **错误处理**: 具有用户友好消息的全面错误处理
5. **加载状态**: 异步操作期间的视觉反馈

## 关键配置

### Supabase 设置
Supabase 配置硬编码在 `js/app.js` 中：
- URL: `https://xlamtnjlxzulahvumafh.supabase.co`
- 项目名称: `dddd`

### 数据库连接
应用程序包含在页面加载时运行的连接测试，以验证 Supabase 连接性。

## 重要说明

### 数据模型
- 应用程序管理员工，而不是会员，尽管 README 提到会员功能
- 使用 `employee_id`、`employee_name` 和 `employee_salary` 字段
- 数据库表名为 `members`，可能会造成混淆

### 验证规则
- 员工 ID 必须为正整数且唯一
- 员工姓名为必填项（字符串）
- 薪资必须为非负整数

### UI/UX 功能
- 中文语言界面
- 桌面和移动设备的响应式设计
- 用于不同操作的基于选项卡的导航
- 实时员工列表更新
- 异步操作期间的加载动画
- 成功/错误消息系统

### 实用文件
- `check-table.html`: 用于验证表结构存在的工具
- `get-table-structure.html`: 用于检查当前数据库模式的工具
- 两个实用工具使用与主应用程序相同的 Supabase 配置

## 开发工作流程

1. **本地开发**: 使用任何静态服务器托管文件
2. **数据库设置**: 确保 Supabase 项目 `dddd` 具有正确的 `members` 表结构
3. **测试**: 使用实用 HTML 文件验证数据库连接性和模式
4. **部署**: 可以部署到任何静态托管服务（GitHub Pages、Netlify、Vercel 等）



##supabase xlamtnjlxzulahvumafh数据库的URL与API
URL:https://xlamtnjlxzulahvumafh.supabase.co
API:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsYW10bmpseHp1bGFodnVtYWZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5NjYzMTYsImV4cCI6MjA3OTU0MjMxNn0.CbHe3A7qQYbMseUVmPUD3FBzSOmCR7OgFDmAtJIkHkw