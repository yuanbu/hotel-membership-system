# SQL 执行指南 - 多用户协作配置

由于网络连接问题，这里提供多种配置方法。

## 🗄️ 方法1：分步执行（推荐）

### 在 Supabase SQL 编辑器中执行

#### 步骤1：添加操作追踪字段
1. 访问 Supabase 控制台：https://supabase.com/dashboard
2. 选择项目：`xlamtnjlxzulahvumafh`
3. 进入 Database → SQL Editor
4. 选择 `step1-add-fields.sql` 文件内容
5. 点击 "Run" 执行

#### 步骤2：创建活动日志表
1. 在同一 SQL 编辑器中
2. 选择 `step2-create-activity-logs.sql` 文件内容
3. 点击 "Run" 执行

#### 步骤3：启用 RLS
1. 在同一 SQL 编辑器中
2. 选择 `step3-enable-rls.sql` 文件内容
3. 点击 "Run" 执行

#### 步骤4：创建 RLS 策略
1. 在同一 SQL 编辑器中
2. 选择 `step4-create-policies-fixed.sql` 文件内容
3. 点击 "Run" 执行

#### 步骤5：创建索引
1. 在同一 SQL 编辑器中
2. 选择 `step5-create-indexes-fixed.sql` 文件内容
3. 点击 "Run" 执行

#### 步骤6：插入测试数据
1. 在同一 SQL 编辑器中
2. 选择 `step6-insert-test-data.sql` 文件内容
3. 点击 "Run" 执行

## 🗄️ 方法2：完整脚本执行

如果需要一次性执行所有配置：

1. 选择 `offline-setup-fixed.sql` 文件内容
2. 点击 "Run" 执行

## 🗄️ 方法2：完整脚本执行

如果需要一次性执行所有配置：

1. 选择 `offline-setup-fixed.sql` 文件内容
2. 点击 "Run" 执行

## ⚠️ 注意事项

### 执行顺序
严格按照 1-2-3-4-5-6 的顺序执行
如果前一步失败，不要继续执行后续步骤

### 错误处理
如果遇到语法错误：
- 检查对应步骤的语法
- 使用分步执行方法
- 查看错误消息的具体行号

### 验证方法
每个步骤执行后，可以运行以下验证查询：

```sql
-- 验证字段是否添加成功
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'members'
AND column_name IN ('created_by', 'updated_by', 'operation_history');

-- 验证表是否创建成功
SELECT table_name
FROM information_schema.tables
WHERE table_name = 'activity_logs';

-- 验证 RLS 是否启用
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('members', 'activity_logs');
```

## 🔧 完成配置后的设置

### 在 Supabase 控制台
1. 进入 **Authentication** → **Settings**
2. 启用 **Email confirmations**
3. 设置正确的 **Site URL** 和 **Redirect URLs**
4. 进入 **Database** → **Replication**
5. 启用 `members` 表的实时同步
6. 可选择启用 `activity_logs` 表的实时同步

### 本地配置
1. 确认 js/auth.js 中的配置正确
2. 重启本地服务器
3. 清除浏览器缓存

## 🎯 配置验证标准

配置完成后，应该看到以下结果：
- ✅ members 表包含 created_by、updated_by、operation_history 字段
- ✅ activity_logs 表创建成功
- ✅ RLS 策略正确设置
- ✅ 索引创建完成
- ✅ 测试数据插入成功

## 📞 技术支持

如果遇到问题：
1. **查看执行日志**：Supabase SQL 编辑器显示执行结果
2. **检查错误消息**：每个步骤的 NOTICE 消息显示执行状态
3. **验证表结构**：在 Database → Table Editor 中检查表结构
4. **联系支持**：Supabase 提供技术支持

## 🔄 下一步

配置完成后：
1. 访问：`http://localhost:8000/login.html`
2. 注册多个测试账户
3. 测试多用户协作功能
4. 验证实时同步和操作追踪

使用这种分步方法可以确保每个步骤都正确执行，避免复杂的语法错误！