# 酒店员工管理系统 - 认证设置指南

本指南将帮助您在Supabase中配置完整的用户认证系统。

## 🔧 Supabase认证配置

### 1. 登录Supabase控制台

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择您的项目 `xlamtnjlxzulahvumafh`
3. 进入 **Authentication** 设置

### 2. 配置认证设置

#### 基本设置
在 **Authentication** → **Settings** 中：

1. **Site URL**: 设置为您的网站域名
   ```
   https://yourdomain.com
   ```

2. **Redirect URLs**: 添加重定向URL
   ```
   https://yourdomain.com/**
   http://localhost:8000/**
   http://127.0.0.1:5500/**
   ```

#### 邮箱设置
1. 在 **Authentication** → **Settings** → **Auth Providers** 中
2. 启用 **Email/Password** 认证
3. 配置以下设置：
   - **Confirm email**: ✅ 启用
   - **Enable email confirmations**: ✅ 启用
   - **Site URL**: 您的网站域名
   - **Enable custom email templates**: 可选

#### 邮件模板配置（可选）
您可以自定义邮件模板：
- **Confirmation email**: 注册确认邮件
- **Recovery email**: 密码重置邮件
- **Magic Link email**: 魔法链接邮件

### 3. 行级安全策略（RLS）配置

为了支持多用户协作，需要配置以下RLS策略：

```sql
-- 启用RLS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- 创建策略：允许所有认证用户管理员工数据（共享模式）
CREATE POLICY "Authenticated users can view members" ON members
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert members" ON members
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update members" ON members
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete members" ON members
  FOR DELETE USING (auth.role() = 'authenticated');
```

### 4. 多用户协作配置

#### 实时功能配置
在 **Database** → **Replication** 中启用以下表的实时同步：
- ✅ 启用 `members` 表
- ✅ 启用 `activity_logs` 表（可选，用于活动跟踪）

#### 数据库迁移
运行以下迁移来添加协作功能：

```sql
-- 添加操作追踪字段
ALTER TABLE members ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE members ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);
ALTER TABLE members ADD COLUMN IF NOT EXISTS operation_history JSONB DEFAULT '[]';

-- 创建活动日志表
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    user_email TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT')),
    target_type TEXT NOT NULL,
    target_id TEXT,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用活动日志RLS
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own activity logs" ON activity_logs
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activity logs" ON activity_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 4. 用户元数据表（可选）

如果需要存储更多用户信息，可以创建用户配置文件表：

```sql
-- 创建用户配置文件表
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  department TEXT,
  position TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 用户只能查看和编辑自己的配置文件
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

## 🚀 使用指南

### 注册新账户

1. 访问 `login.html`
2. 点击"立即注册"
3. 填写：
   - 姓名
   - 邮箱地址
   - 密码（至少6位）
   - 确认密码
   - 同意服务条款
4. 点击"注册账户"
5. 检查邮箱并点击验证链接
6. 验证完成后可登录

### 登录系统

1. 在登录页面输入邮箱和密码
2. 点击"登录"
3. 登录成功后自动跳转到主页面
4. 页面右上角显示用户信息和退出登录按钮

### 忘记密码

1. 点击"忘记密码？"
2. 输入注册邮箱
3. 检查邮箱中的重置链接
4. 点击链接进入密码重置页面
5. 设置新密码

### 安全特性

- ✅ 邮箱验证要求
- ✅ 密码强度验证（最少6位）
- ✅ 会话管理
- ✅ 自动登录状态检查
- ✅ 安全登出
- ✅ 防止未授权访问

## 🛠️ 故障排除

### 常见问题

1. **"无效的重置链接"**
   - 链接可能已过期（24小时有效）
   - 请重新申请密码重置

2. **"邮箱验证失败"**
   - 检查垃圾邮件文件夹
   - 确认Supabase邮件配置正确
   - 重新发送验证邮件

3. **"登录失败"**
   - 检查邮箱和密码是否正确
   - 确认邮箱已通过验证
   - 清除浏览器缓存

4. **"认证状态丢失"**
   - 会话已过期（通常24小时）
   - 重新登录即可

### 调试方法

1. 打开浏览器开发者工具
2. 查看Console标签页的错误信息
3. 检查Network标签页的API请求
4. 验证Supabase项目配置

## 📁 文件结构

```
hotel-membership-system/
├── login.html              # 登录/注册页面
├── reset-password.html      # 密码重置页面
├── index.html              # 主应用页面
├── js/
│   ├── auth.js            # 认证相关JavaScript
│   └── app.js             # 主应用JavaScript（已集成认证）
├── css/
│   ├── auth.css           # 认证页面样式
│   └── style.css          # 主应用样式（已更新）
└── AUTH_SETUP.md          # 本设置指南
```

## 🔗 相关链接

- [Supabase认证文档](https://supabase.com/docs/guides/auth)
- [Supabase RLS文档](https://supabase.com/docs/guides/auth/row-level-security)
- [本系统演示](./login.html)

---

**注意**: 确保在生产环境中：
1. 使用HTTPS
2. 配置适当的重定向URL
3. 启用邮箱验证
4. 设置适当的会话过期时间
5. 监控认证日志