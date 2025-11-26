-- 步骤4：创建 RLS 策略（修复版）

DO $$
BEGIN
    -- 删除 members 表的策略
    IF EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'members'
        AND schemaname = 'public'
    ) THEN
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can view members" ON members';
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can insert members" ON members';
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can update members" ON members';
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can delete members" ON members';
        RAISE NOTICE '✅ 已清理 members 表的现有策略';
    END IF;

    -- 删除 activity_logs 表的策略
    IF EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'activity_logs'
        AND schemaname = 'public'
    ) THEN
        EXECUTE 'DROP POLICY IF EXISTS "Users can view own activity logs" ON activity_logs';
        EXECUTE 'DROP POLICY IF EXISTS "Users can insert own activity logs" ON activity_logs';
        RAISE NOTICE '✅ 已清理 activity_logs 表的现有策略';
    END IF;
END $$;

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

DO $$
BEGIN
    RAISE NOTICE '✅ 已创建 members 表的 RLS 策略';
END $$;

-- activity_logs 表策略 - 用户只能查看自己的日志
CREATE POLICY "Users can view own activity logs" ON activity_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity logs" ON activity_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DO $$
BEGIN
    RAISE NOTICE '✅ 已创建 activity_logs 表的 RLS 策略';
END $$;