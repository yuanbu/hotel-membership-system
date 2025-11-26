# Activity Logs 表详细说明

## 📋 表结构概述

`activity_logs` 表用于记录用户在系统中的所有操作和活动历史，是系统审计和追踪的重要组成部分。

## 🗄️ 表结构详解

### 表名：`activity_logs`
```sql
CREATE TABLE activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    user_email TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT')),
    target_type TEXT NOT NULL,
    target_id TEXT,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 字段详细说明

#### 1. **id** (UUID - 主键)
- **类型**: PostgreSQL UUID
- **用途**: 每条记录的唯一标识符
- **生成**: `gen_random_uuid()` - 随机生成的唯一ID
- **特点**: 全局唯一，不可修改

#### 2. **user_id** (UUID - 外键)
- **类型**: PostgreSQL UUID
- **关联**: 引用 `auth.users(id)`
- **约束**: 外键约束，确保用户ID的有效性
- **用途**: 标识执行操作的具体用户

#### 3. **user_email** (TEXT - 用户邮箱)
- **类型**: 变长字符类型
- **用途**: 存储操作用户的邮箱地址
- **特点**: 冗余文本，允许用户邮箱长度变化
- **冗余**: 虽然有 user_id，但保留邮箱便于查询

#### 4. **action** (TEXT - 操作类型)
- **类型**: 枚举类型，限制为特定值
- **可能值**:
  - `'CREATE'` - 创建操作（如添加员工）
  - `'UPDATE'` - 更新操作（如修改薪资）
  - `'DELETE'` - 删除操作（如删除员工）
  - `'LOGIN'` - 登录操作
  - `'LOGOUT'` - 登出操作
- **用途**: 记录用户执行的具体操作类型
- **约束**: CHECK 约束确保数据完整性

#### 5. **target_type** (TEXT - 目标类型)
- **类型**: 变长字符类型
- **用途**: 标识操作对象的类型
- **常见值**:
  - `'employee'` - 员工相关操作
  - `'system'` - 系统相关操作
  - `'auth'` - 认证相关操作
- **灵活性**: 可根据业务需求扩展新的目标类型

#### 6. **target_id** (TEXT - 目标ID)
- **类型**: 变长字符类型
- **用途**: 存储操作对象的具体标识符
- **特点**: 允许 NULL 值
- **常见示例**:
  - 员工ID: `'1001'`
  - 部门编号: `'DEPT001'`
  - 订单编号: `'ORD202311'`

#### 7. **details** (JSONB - 详细信息)
- **类型**: PostgreSQL JSONB
- **用途**: 存储操作相关的详细信息
- **特点**: 灵活的数据存储格式，支持复杂的嵌套数据
- **存储格式**: JSON 字符串
- **常见内容**:
  ```json
  {
    "old_salary": 7500,
    "new_salary": 8500,
    "department": "财务部",
    "reason": "年度调薪",
    "affected_fields": ["employee_salary"],
    "timestamp": "2025-01-01T00:00:00Z"
  }
  ```
- **灵活性**: 可以存储任意结构的操作详情

#### 8. **created_at** (TIMESTAMP WITH TIME ZONE - 创建时间)
- **类型**: 带时区的时间戳
- **用途**: 记录操作发生的精确时间
- **默认值**: `now()` - PostgreSQL 当前时间
- **时区**: 支持全球时区处理
- **索引**: 通常在此字段上创建索引以提高查询性能

## 🎯 用途详解

### 1. **操作审计**
- 记录所有用户的 CRUD 操作
- 提供完整的操作历史追踪
- 支持合规性检查和审计要求

### 2. **安全监控**
- 监控用户登录和登出活动
- 追踪异常访问尝试
- 支持安全事件的及时发现和响应

### 3. **业务分析**
- 统计用户操作频率和模式
- 分析系统使用情况和热门功能
- 支持产品决策和功能优化

### 4. **故障排除**
- 记录系统错误和异常情况
- 提供详细的错误上下文
- 支持问题重现和根本原因分析

## 🔍 数据流程

### 1. **记录流程**
```javascript
// 示例：添加员工时的日志记录
await logActivity(
    'CREATE',           // action
    'employee',         // target_type
    '1001',            // target_id
    {               // details
        employee_name: '张三',
        employee_salary: 8000,
        department: '技术部'
    }
);
```

### 2. **数据关联**
- `user_id`: 关联到 `auth.users` 表
- 可以通过 JOIN 查询获取完整的用户操作历史
- 支持按用户、时间范围等多维度分析

### 3. **查询示例**
```sql
-- 查询特定用户的操作历史
SELECT
    user_email,
    action,
    target_type,
    target_id,
    details,
    created_at
FROM activity_logs
WHERE user_id = 'user-uuid-here'
ORDER BY created_at DESC;

-- 查询最近的错误操作
SELECT * FROM activity_logs
WHERE details->>'error'
ORDER BY created_at DESC
LIMIT 10;
```

## 🚀 性能优化

### 1. **索引策略**
- `user_id`: 支持快速按用户查询
- `action`: 支持按操作类型筛选
- `created_at`: 支持时间范围查询
- 复合索引支持复杂查询

### 2. **数据保留策略**
- 建议定期清理旧日志（如保留最近6个月）
- 考虑日志归档策略
- 根据业务需求设置数据保留期

## 📊 安全考虑

### 1. **数据隐私**
- 邮箱信息已哈希化存储
- 敏感信息可以加密存储
- 支持用户数据删除（GDPR合规）

### 2. **访问控制**
- 通过 RLS 策略确保用户只能访问自己的日志
- 支持基于角色的访问控制
- 提供审计日志和监控

### 3. **完整性保护**
- 外键约束确保数据完整性
- CHECK 约束确保数据有效性
- 支持事务操作保证数据一致性

## 🛠️ 最佳实践

### 1. **记录设计**
- 只记录必要的业务信息
- 避免记录敏感信息
- 保持日志格式的一致性

### 2. **查询优化**
- 使用适当的索引提高查询性能
- 避免全表扫描
- 实施数据分页策略

### 3. **维护策略**
- 定期清理过期数据
- 监控表大小和性能
- 建立数据备份和恢复流程

这个 `activity_logs` 表是系统监控和审计的核心组件，为多用户协作系统提供了完整的操作追踪能力！