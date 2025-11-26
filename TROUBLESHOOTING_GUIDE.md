# 添加员工功能故障排除指南

## 🚨 问题现象

用户报告登录后新建员工功能无法使用：
- 输入员工信息后数据库没有更新
- 员工列表没有显示新添加的员工信息
- 无法进入查询员工、编辑员工与删除员工界面
- 右上角用户邮箱显示为 "email@example.com"（不正确）

## 🔍 诊断步骤

### 第一步：打开诊断工具

在浏览器中访问：
```
http://localhost:8000/test-add-employee.html
```

### 第二步：按顺序执行诊断

1. **检查认证状态**
   - 点击"检查认证状态"按钮
   - 确认用户已正确认证
   - 记录用户ID和邮箱信息

2. **测试数据库连接**
   - 点击"测试数据库连接"
   - 确认连接正常
   - 点击"测试表访问权限"
   - 确认SELECT和INSERT权限正常

3. **模拟添加员工**
   - 输入测试员工信息
   - 点击"模拟添加员工"
   - 查看详细错误信息
   - 检查是否成功插入数据库

4. **检查现有数据**
   - 点击"查看现有员工数据"
   - 确认数据是否正确显示
   - 点击"查看活动日志"
   - 检查操作是否被记录

## 🛠️ 可能的解决方案

### 方案1：认证问题

**症状**：未认证或认证失败
**解决方案**：
1. 清理浏览器缓存和Cookie
2. 使用诊断工具中的"快速退出修复"功能
3. 重新登录系统
4. 确认邮箱已验证

### 方案2：权限问题

**症状**：RLS策略阻止操作
**解决方案**：
1. 检查RLS策略是否正确配置
2. 确认用户角色为'authenticated'
3. 验证表结构包含必要字段

### 方案3：表结构问题

**症状**：字段不存在或类型不匹配
**解决方案**：
1. 运行数据库配置脚本
2. 检查表是否包含以下字段：
   - `created_by` (UUID)
   - `updated_by` (UUID)
   - `operation_history` (JSONB)
3. 确认字段类型正确

### 方案4：网络问题

**症状**：连接超时或失败
**解决方案**：
1. 检查网络连接
2. 确认Supabase服务正常
3. 检查防火墙设置
4. 使用浏览器开发者工具查看网络请求

## 🧪 详细测试命令

### 测试1：直接访问主系统

```
1. 访问: http://localhost:8000/login.html
2. 使用已注册账户登录
3. 确认跳转到主页面
4. 检查右上角用户信息显示
5. 尝试添加员工
```

### 测试2：数据库直接查询

```sql
-- 检查表结构
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'members'
ORDER BY ordinal_position;

-- 检查RLS策略
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'members';

-- 检查现有数据
SELECT * FROM members ORDER BY created_at DESC LIMIT 5;
```

### 测试3：浏览器控制台调试

在浏览器中打开开发者工具（F12），在Console中执行：

```javascript
// 检查Supabase客户端
console.log('Supabase client:', supabase);

// 检查当前用户
supabase.auth.getUser().then(console.log);

// 测试数据库连接
supabase.from('members').select('count').then(console.log);

// 测试插入操作
supabase.from('members').insert({
    employee_id: 9999,
    employee_name: '测试',
    employee_salary: 1000
}).select().then(console.log);
```

## 📋 常见错误及解决方法

### 错误1："new row for relation "members" violates row-level security policy"

**原因**：RLS策略阻止插入
**解决**：
```sql
-- 检查并修复RLS策略
DROP POLICY IF EXISTS "Authenticated users can insert members" ON members;
CREATE POLICY "Authenticated users can insert members" ON members
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

### 错误2："column "created_by" of relation "members" does not exist"

**原因**：表结构缺少字段
**解决**：
```sql
ALTER TABLE members ADD COLUMN created_by UUID REFERENCES auth.users(id);
ALTER TABLE members ADD COLUMN updated_by UUID REFERENCES auth.users(id);
ALTER TABLE members ADD COLUMN operation_history JSONB DEFAULT '[]';
```

### 错误3："JWT expired"

**原因**：认证令牌过期
**解决**：
1. 清理本地存储
2. 重新登录
3. 确认系统时间正确

### 错误4："invalid input syntax for type integer"

**原因**：数据类型不匹配
**解决**：
1. 确保员工ID为整数
2. 确保薪资料为数字
3. 检查表单验证

## 🔧 手动修复步骤

### 步骤1：清理会话

1. 打开 `QUICK_FIX.html`
2. 执行所有4个步骤
3. 重新登录系统

### 步骤2：重新配置数据库

1. 运行 `offline-setup-fixed.sql`
2. 确认所有步骤成功
3. 检查表结构和RLS策略

### 步骤3：测试完整流程

1. 注册新测试账户
2. 验证邮箱
3. 登录系统
4. 添加测试员工
5. 检查所有功能

## 📞 需要更多信息

如果以上步骤无法解决问题，请提供：

1. **浏览器控制台错误**：
   - 打开F12开发者工具
   - 复制所有红色错误信息
   - 包括Network标签页的失败请求

2. **诊断工具结果**：
   - 运行 `test-add-employee.html`
   - 截图或复制所有测试结果
   - 特别是错误信息部分

3. **数据库状态**：
   - 当前表结构
   - RLS策略配置
   - 现有数据样例

## 🎯 快速检查清单

- [ ] 服务器正在运行 (http://localhost:8000)
- [ ] 用户已正确登录并验证邮箱
- [ ] 数据库表结构完整
- [ ] RLS策略正确配置
- [ ] 浏览器控制台无错误
- [ ] 网络连接正常
- [ ] 本地存储无异常

按照这个指南进行故障排除，应该能够解决添加员工功能不工作的问题！