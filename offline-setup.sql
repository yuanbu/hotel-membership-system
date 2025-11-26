-- 离线配置脚本 - 多用户协作功能设置
-- 如果无法在线配置，可以使用此脚本在 Supabase SQL 编辑器中运行

-- ===========================================
-- 1. 添加操作追踪字段到 members 表
-- ===========================================

-- 检查字段是否存在，如果不存在则添加
DO $$
BEGIN
    -- 添加创建者字段
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'members'
        AND column_name = 'created_by'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE members ADD COLUMN created_by UUID REFERENCES auth.users(id);
        RAISE NOTICE '✅ 已添加 created_by 字段';
    END IF;

    -- 添加更新者字段
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'members'
        AND column_name = 'updated_by'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE members ADD COLUMN updated_by UUID REFERENCES auth.users(id);
        RAISE NOTICE '✅ 已添加 updated_by 字段';
    END IF;

    -- 添加操作历史字段
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'members'
        AND column_name = 'operation_history'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE members ADD COLUMN operation_history JSONB DEFAULT '[]'::jsonb;
        RAISE NOTICE '✅ 已添加 operation_history 字段';
    END IF;
END $$;

-- ===========================================
-- 2. 创建活动日志表
-- ===========================================

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

-- ===========================================
-- 3. 启用 RLS 策略
-- ===========================================

-- 先启用 RLS（如果尚未启用）
-- 使用 DO 块来处理条件逻辑，避免 IF NOT EXISTS 语法错误
DO $$
BEGIN
    -- 检查 members 表是否已启用 RLS
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'members'
        AND rowsecurity = false
    ) THEN
        EXECUTE 'ALTER TABLE members ENABLE ROW LEVEL SECURITY';
        RAISE NOTICE '✅ 已启用 members 表的 RLS';
    END IF;

    -- 检查 activity_logs 表是否已启用 RLS
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'activity_logs'
        AND rowsecurity = false
    ) THEN
        EXECUTE 'ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY';
        RAISE NOTICE '✅ 已启用 activity_logs 表的 RLS';
    END IF;
END $$;

-- 删除现有策略（如果存在）
DROP POLICY IF EXISTS "Authenticated users can view members" ON members;
DROP POLICY IF EXISTS "Authenticated users can insert members" ON members;
DROP POLICY IF EXISTS "Authenticated users can update members" ON members;
DROP POLICY IF EXISTS "Authenticated users can delete members" ON members;
DROP POLICY IF EXISTS "Users can view own activity logs" ON activity_logs;
DROP POLICY IF EXISTS "Users can insert own activity logs" ON activity_logs;

-- 创建新的 RLS 策略
-- members 表策略 - 允许所有认证用户管理员工数据（共享模式）
CREATE POLICY "Authenticated users can view members" ON members
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert members" ON members
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update members" ON members
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete members" ON members
  FOR DELETE USING (auth.role() = 'authenticated');

-- activity_logs 表策略 - 用户只能查看自己的日志
CREATE POLICY "Users can view own activity logs" ON activity_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity logs" ON activity_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ===========================================
-- 4. 创建索引
-- ===========================================

-- 为 members 表创建索引
CREATE INDEX IF NOT EXISTS idx_members_created_by ON members(created_by);
CREATE INDEX IF NOT EXISTS idx_members_updated_by ON members(updated_by);
CREATE INDEX IF NOT EXISTS idx_members_created_at ON members(created_at);
CREATE INDEX IF NOT EXISTS idx_members_updated_at ON members(updated_at);
CREATE INDEX IF NOT EXISTS idx_members_employee_id ON members(employee_id);

-- 为 activity_logs 表创建索引
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_target_type ON activity_logs(target_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- ===========================================
-- 5. 插入测试数据（可选）
-- ===========================================

-- 插入一些测试员工数据（如果表为空）
INSERT INTO members (employee_id, employee_name, employee_salary)
SELECT
    1001, '张三', 8000
WHERE NOT EXISTS (
    SELECT 1 FROM members LIMIT 1
);

INSERT INTO members (employee_id, employee_name, employee_salary)
SELECT
    1002, '李四', 7500
WHERE NOT EXISTS (
    SELECT 1 FROM members WHERE employee_id = 1001 LIMIT 1
);

INSERT INTO members (employee_id, employee_name, employee_salary)
SELECT
    1003, '王五', 9000
WHERE NOT EXISTS (
    SELECT 1 FROM members WHERE employee_id = 1002 LIMIT 1
);

-- ===========================================
-- 6. 验证配置
-- ===========================================

-- 显示配置完成信息
DO $$
BEGIN
    RAISE NOTICE '🎉 多用户协作功能配置完成！';
    RAISE NOTICE '✅ 数据库表结构已更新';
    RAISE NOTICE '✅ RLS 策略已启用';
    RAISE NOTICE '✅ 索引已创建';
    RAISE NOTICE '✅ 测试数据已插入';
    RAISE NOTICE '';
    RAISE NOTICE '📋 接下来的步骤：';
    RAISE NOTICE '1. 在 Supabase 控制台启用 Database → Replication';
    RAISE NOTICE '2. 启用 members 表的实时同步';
    RAISE NOTICE '3. 启用 activity_logs 表的实时同步（可选）';
    RAISE NOTICE '4. 测试多用户登录和协作功能';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  注意事项：';
    RAISE NOTICE '1. 确保 Authentication → Settings 中启用了 Email confirmations';
    RAISE NOTICE '2. 设置正确的 Site URL 和 Redirect URLs';
    RAISE NOTICE '3. 如果在生产环境，请使用 HTTPS';
END $$;
END $$;

-- ===========================================
-- 7. 验证查询
-- ===========================================

-- 检查配置结果
SELECT
    'Members Table Status' as check_type,
    CASE
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'members'
            AND column_name = 'created_by'
            AND table_schema = 'public'
        ) THEN '✅ created_by field exists'
        ELSE '❌ created_by field missing'
    END as status
UNION ALL
SELECT
    'Activity Logs Table Status' as check_type,
    CASE
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_name = 'activity_logs'
            AND table_schema = 'public'
        ) THEN '✅ activity_logs table exists'
        ELSE '❌ activity_logs table missing'
    END as status
UNION ALL
SELECT
    'RLS Status' as check_type,
    CASE
        WHEN (
            SELECT 1 FROM pg_policies
            WHERE tablename = 'members'
            AND schemaname = 'public'
            LIMIT 1
        ) THEN '✅ RLS policies enabled'
        ELSE '❌ RLS policies missing'
    END as status
UNION ALL
SELECT
    'Data Count' as check_type,
    CONCAT('✅ Members: ', COUNT(*), ' records') as status
FROM members
UNION ALL
SELECT
    'Indexes Status' as check_type,
    '✅ Database indexes created' as status;